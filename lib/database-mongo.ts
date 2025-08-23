// lib/database-mongo.ts - VERSIÓN CORREGIDA
import dbConnect from "./mongodb";
import {
  User,
  Page,
  Comment,
  ActivityLog,
  SharedPage,
  Workspace,
} from "./models";
import type {
  NotionPage,
  NotionBlock,
  Comment as CommentType,
  ActivityLog as ActivityLogType,
  SharedPage as SharedPageType,
} from "./types";

export class MongoDatabase {
  private static instance: MongoDatabase;

  private constructor() {}

  static getInstance(): MongoDatabase {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase();
    }
    return MongoDatabase.instance;
  }

  private async connect() {
    try {
      await dbConnect();
    } catch (error) {
      console.error("Database connection error:", error);
      throw new Error("Failed to connect to database");
    }
  }

  private transformPage(page: any): NotionPage {
    if (!page) return null;

    return {
      id: page._id.toString(),
      title: page.title || "Sin título",
      content: page.content || [],
      parentId: page.parentId?.toString(),
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt),
      emoji: page.emoji,
    };
  }

  private async logActivity(
    userId: string,
    userName: string,
    action: ActivityLogType["action"],
    pageId: string,
    pageTitle: string,
    details?: string
  ): Promise<void> {
    try {
      await this.connect();
      const activity = new ActivityLog({
        userId,
        userName,
        action,
        pageId,
        pageTitle,
        details,
        timestamp: new Date(),
      });
      await activity.save();
    } catch (error) {
      console.error("Error logging activity:", error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  async getAllPages(userId: string): Promise<NotionPage[]> {
    try {
      await this.connect();
      const pages = await Page.find({ userId }).sort({ createdAt: -1 }).lean();
      return pages.map(this.transformPage).filter(Boolean);
    } catch (error) {
      console.error("Error getting pages:", error);
      return [];
    }
  }

  async getPage(id: string, userId: string): Promise<NotionPage | undefined> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return undefined;
      }

      const page = await Page.findOne({ _id: id, userId }).lean();
      return page ? this.transformPage(page) : undefined;
    } catch (error) {
      console.error("Error getting page:", error);
      return undefined;
    }
  }

  async getCurrentPage(userId: string): Promise<NotionPage | undefined> {
    try {
      await this.connect();

      const workspace = await Workspace.findOne({ userId }).lean<{
        currentPageId?: string;
      }>();
      if (!workspace?.currentPageId) return undefined;

      const page = await Page.findOne({
        _id: workspace.currentPageId,
        userId,
      }).lean<{
        _id: string;
        title: string;
        content: NotionBlock[]; // ⬅️ acá en lugar de any[]
        createdAt: Date;
        updatedAt: Date;
        emoji?: string;
      }>();

      return page ? this.transformPage(page) : undefined;
    } catch (error) {
      console.error("Error getting current page:", error);
      return undefined;
    }
  }

  async setCurrentPage(pageId: string, userId: string): Promise<void> {
    try {
      await this.connect();
      await Workspace.findOneAndUpdate(
        { userId },
        {
          currentPageId: pageId,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error setting current page:", error);
    }
  }

  async createPage(
    title: string,
    userId: string,
    userName: string,
    parentId?: string
  ): Promise<NotionPage> {
    try {
      await this.connect();

      const newPage = new Page({
        title: title || "Sin título",
        content: [
          {
            id: `block-${Date.now()}`,
            type: "paragraph",
            content: "",
          },
        ],
        parentId: parentId || undefined,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedPage = await newPage.save();

      // Set as current page
      await this.setCurrentPage(savedPage._id.toString(), userId);

      // Log activity
      await this.logActivity(
        userId,
        userName,
        "created",
        savedPage._id.toString(),
        savedPage.title
      );

      return this.transformPage(savedPage.toObject());
    } catch (error) {
      console.error("Error creating page:", error);
      throw new Error("Failed to create page");
    }
  }

  async updatePage(
    id: string,
    updates: Partial<NotionPage>,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid page ID");
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      // Remover campos que no deben actualizarse
      delete updateData.id;
      delete updateData.createdAt;

      const page = await Page.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true }
      );

      if (page) {
        await this.logActivity(
          userId,
          userName,
          "updated",
          id,
          updates.title || page.title
        );
      }
    } catch (error) {
      console.error("Error updating page:", error);
      throw new Error("Failed to update page");
    }
  }

  async deletePage(
    id: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid page ID");
      }

      const page = await Page.findOne({ _id: id, userId });
      if (!page) return;

      // Delete child pages recursively
      const childPages = await Page.find({ parentId: id, userId });
      for (const child of childPages) {
        await this.deletePage(child._id.toString(), userId, userName);
      }

      // Delete the page
      await Page.findByIdAndDelete(id);

      // Delete related comments
      await Comment.deleteMany({ pageId: id });

      // Delete shared page entries
      await SharedPage.deleteMany({ pageId: id });

      // Update current page if it was deleted
      const workspace = await Workspace.findOne({ userId });
      if (workspace?.currentPageId?.toString() === id) {
        const firstPage = await Page.findOne({ userId }).lean<{
          _id: string;
        }>();
        await this.setCurrentPage(firstPage?._id?.toString() || "", userId);
      }

      // Log activity
      await this.logActivity(userId, userName, "deleted", id, page.title);
    } catch (error) {
      console.error("Error deleting page:", error);
      throw new Error("Failed to delete page");
    }
  }

  async duplicatePage(
    id: string,
    userId: string
  ): Promise<NotionPage | undefined> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return undefined;
      }

      const originalPage = await Page.findOne({ _id: id, userId });
      if (!originalPage) return undefined;

      const duplicatedPage = new Page({
        title: `${originalPage.title} (Copia)`,
        content: originalPage.content.map((block: NotionBlock) => ({
          ...block,
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
        parentId: originalPage.parentId,
        userId,
        emoji: originalPage.emoji,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedPage = await duplicatedPage.save();
      return this.transformPage(savedPage.toObject());
    } catch (error) {
      console.error("Error duplicating page:", error);
      return undefined;
    }
  }

  async movePageToParent(
    pageId: string,
    newParentId: string | undefined,
    userId: string
  ): Promise<void> {
    try {
      await this.connect();

      // Validar ObjectIds
      if (!pageId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid page ID");
      }

      if (newParentId && !newParentId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid parent ID");
      }

      await Page.findOneAndUpdate(
        { _id: pageId, userId },
        {
          parentId: newParentId || undefined,
          updatedAt: new Date(),
        }
      );
    } catch (error) {
      console.error("Error moving page:", error);
      throw new Error("Failed to move page");
    }
  }

  async addComment(
    blockId: string,
    pageId: string,
    userId: string,
    userName: string,
    content: string
  ): Promise<CommentType> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!pageId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid page ID");
      }

      const comment = new Comment({
        blockId,
        pageId,
        userId,
        userName,
        content: content.trim(),
        createdAt: new Date(),
        resolved: false,
      });

      const savedComment = await comment.save();

      // Log activity
      const page = await Page.findById(pageId);
      if (page) {
        await this.logActivity(
          userId,
          userName,
          "commented",
          pageId,
          page.title
        );
      }

      return {
        id: savedComment._id.toString(),
        blockId: savedComment.blockId,
        pageId: savedComment.pageId.toString(),
        userId: savedComment.userId.toString(),
        userName: savedComment.userName,
        content: savedComment.content,
        createdAt: new Date(savedComment.createdAt),
        resolved: savedComment.resolved,
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      throw new Error("Failed to add comment");
    }
  }

  async getComments(userId: string): Promise<CommentType[]> {
    try {
      await this.connect();

      // Get all comments for pages owned by the user
      const userPages = await Page.find({ userId }, "_id").lean();
      const pageIds = userPages.map((page) => page._id);

      const comments = await Comment.find({ pageId: { $in: pageIds } })
        .sort({ createdAt: -1 })
        .lean();

      return comments.map((comment) => ({
        id: comment._id.toString(),
        blockId: comment.blockId,
        pageId: comment.pageId.toString(),
        userId: comment.userId.toString(),
        userName: comment.userName,
        content: comment.content,
        createdAt: new Date(comment.createdAt),
        resolved: comment.resolved,
      }));
    } catch (error) {
      console.error("Error getting comments:", error);
      return [];
    }
  }

  async resolveComment(commentId: string): Promise<void> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid comment ID");
      }

      await Comment.findByIdAndUpdate(commentId, { resolved: true });
    } catch (error) {
      console.error("Error resolving comment:", error);
      throw new Error("Failed to resolve comment");
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid comment ID");
      }

      await Comment.findByIdAndDelete(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw new Error("Failed to delete comment");
    }
  }

  async sharePage(
    pageId: string,
    permissions: "read" | "write",
    userId: string,
    userName: string
  ): Promise<SharedPageType> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!pageId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid page ID");
      }

      const shareId = `share-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const sharedPage = new SharedPage({
        pageId,
        shareId,
        permissions,
        createdBy: userId,
        createdAt: new Date(),
      });

      const savedShare = await sharedPage.save();

      // Log activity
      const page = await Page.findById(pageId);
      if (page) {
        await this.logActivity(
          userId,
          userName,
          "shared",
          pageId,
          page.title,
          `Permisos: ${permissions}`
        );
      }

      return {
        id: savedShare._id.toString(),
        pageId: savedShare.pageId.toString(),
        shareId: savedShare.shareId,
        permissions: savedShare.permissions,
        createdBy: savedShare.createdBy.toString(),
        createdAt: new Date(savedShare.createdAt),
        expiresAt: savedShare.expiresAt
          ? new Date(savedShare.expiresAt)
          : undefined,
      };
    } catch (error) {
      console.error("Error sharing page:", error);
      throw new Error("Failed to share page");
    }
  }

  async getSharedPages(userId: string): Promise<SharedPageType[]> {
    try {
      await this.connect();

      // Get shared pages for user's pages
      const userPages = await Page.find({ userId }, "_id").lean();
      const pageIds = userPages.map((page) => page._id);

      const sharedPages = await SharedPage.find({ pageId: { $in: pageIds } })
        .sort({ createdAt: -1 })
        .lean();

      return sharedPages.map((share) => ({
        id: share._id.toString(),
        pageId: share.pageId.toString(),
        shareId: share.shareId,
        permissions: share.permissions,
        createdBy: share.createdBy.toString(),
        createdAt: new Date(share.createdAt),
        expiresAt: share.expiresAt ? new Date(share.expiresAt) : undefined,
      }));
    } catch (error) {
      console.error("Error getting shared pages:", error);
      return [];
    }
  }

  async revokeShare(shareId: string): Promise<void> {
    try {
      await this.connect();
      await SharedPage.findOneAndDelete({ shareId });
    } catch (error) {
      console.error("Error revoking share:", error);
      throw new Error("Failed to revoke share");
    }
  }

  async getActivityLog(userId: string): Promise<ActivityLogType[]> {
    try {
      await this.connect();

      const activities = await ActivityLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();

      return activities.map((activity) => ({
        id: activity._id.toString(),
        userId: activity.userId.toString(),
        userName: activity.userName,
        action: activity.action,
        pageId: activity.pageId.toString(),
        pageTitle: activity.pageTitle,
        timestamp: new Date(activity.timestamp),
        details: activity.details,
      }));
    } catch (error) {
      console.error("Error getting activity log:", error);
      return [];
    }
  }

  async getChildPages(parentId: string, userId: string): Promise<NotionPage[]> {
    try {
      await this.connect();

      // Validar ObjectId
      if (!parentId.match(/^[0-9a-fA-F]{24}$/)) {
        return [];
      }

      const pages = await Page.find({ parentId, userId })
        .sort({ createdAt: -1 })
        .lean();
      return pages.map(this.transformPage).filter(Boolean);
    } catch (error) {
      console.error("Error getting child pages:", error);
      return [];
    }
  }

  async getRootPages(userId: string): Promise<NotionPage[]> {
    try {
      await this.connect();
      const pages = await Page.find({
        userId,
        $or: [{ parentId: { $exists: false } }, { parentId: null }],
      })
        .sort({ createdAt: -1 })
        .lean();
      return pages.map(this.transformPage).filter(Boolean);
    } catch (error) {
      console.error("Error getting root pages:", error);
      return [];
    }
  }

  async searchPages(query: string, userId: string): Promise<NotionPage[]> {
    try {
      await this.connect();

      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchRegex = new RegExp(query.trim(), "i");

      const pages = await Page.find({
        userId,
        $or: [
          { title: { $regex: searchRegex } },
          { "content.content": { $regex: searchRegex } },
        ],
      })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();

      return pages.map(this.transformPage).filter(Boolean);
    } catch (error) {
      console.error("Error searching pages:", error);
      return [];
    }
  }

  // Método adicional para inicializar usuario con página de bienvenida
  async initializeUserWorkspace(
    userId: string,
    userName: string
  ): Promise<NotionPage | null> {
    try {
      await this.connect();

      // Verificar si el usuario ya tiene páginas
      const existingPages = await Page.countDocuments({ userId });
      if (existingPages > 0) {
        return null; // Usuario ya tiene páginas
      }

      // Crear página de bienvenida
      const welcomePage = new Page({
        title: `¡Bienvenido, ${userName}!`,
        content: [
          {
            id: `block-${Date.now()}-1`,
            type: "heading1",
            content: "¡Bienvenido a tu espacio de trabajo!",
          },
          {
            id: `block-${Date.now()}-2`,
            type: "paragraph",
            content:
              "Esta es tu primera página. Puedes editarla, crear nuevas páginas y organizar tu contenido como desees.",
          },
          {
            id: `block-${Date.now()}-3`,
            type: "paragraph",
            content:
              "Comienza explorando las funciones o crea una nueva página desde el sidebar.",
          },
        ],
        userId,
        emoji: "👋",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedPage = await welcomePage.save();

      // Establecer como página actual
      await this.setCurrentPage(savedPage._id.toString(), userId);

      // Log de actividad
      await this.logActivity(
        userId,
        userName,
        "created",
        savedPage._id.toString(),
        savedPage.title
      );

      return this.transformPage(savedPage.toObject());
    } catch (error) {
      console.error("Error initializing user workspace:", error);
      return null;
    }
  }
}
