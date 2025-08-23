// lib/database.ts - VERSIÓN CORREGIDA PARA FRONTEND
import type { NotionPage, Comment, ActivityLog, SharedPage } from "./types";
export interface WorkspaceData {
  pages: NotionPage[];
  comments: Comment[];
  activityLog: ActivityLog[];
  sharedPages: SharedPage[];
}
export class LocalDatabase {
  private static instance: LocalDatabase;

  private constructor() {}

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("notion-clone-auth");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private async apiCall(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `API call failed: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  }

  async getAllPages(): Promise<NotionPage[]> {
    try {
      const data = await this.apiCall("/api/pages");
      return data.pages || [];
    } catch (error) {
      console.error("Error getting pages:", error);
      return [];
    }
  }

  async getPage(id: string): Promise<NotionPage | undefined> {
    try {
      if (!id || id === "undefined") return undefined;
      const data = await this.apiCall(`/api/pages/${id}`);
      return data.page;
    } catch (error) {
      console.error("Error getting page:", error);
      return undefined;
    }
  }

  async getCurrentPage(): Promise<NotionPage | undefined> {
    // Para el cliente, mantenemos la página actual en localStorage temporalmente
    const currentPageId = localStorage.getItem("current-page-id");
    if (!currentPageId || currentPageId === "undefined") return undefined;
    return this.getPage(currentPageId);
  }

  setCurrentPage(id: string): void {
    if (id && id !== "undefined") {
      localStorage.setItem("current-page-id", id);
    }
  }

  async createPage(
    title: string,
    parentId?: string,
    userId?: string,
    userName?: string
  ): Promise<NotionPage> {
    try {
      const data = await this.apiCall("/api/pages", {
        method: "POST",
        body: JSON.stringify({
          title: title || "Nueva página",
          parentId: parentId || undefined,
        }),
      });

      // Establecer como página actual
      if (data.page?.id) {
        this.setCurrentPage(data.page.id);
      }

      return data.page;
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  }

  async updatePage(
    id: string,
    updates: Partial<NotionPage>,
    userId?: string,
    userName?: string
  ): Promise<void> {
    try {
      if (!id || id === "undefined") {
        throw new Error("ID de página inválido");
      }

      // Limpiar el objeto de actualizaciones
      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.createdAt;

      await this.apiCall(`/api/pages/${id}`, {
        method: "PUT",
        body: JSON.stringify(cleanUpdates),
      });
    } catch (error) {
      console.error("Error updating page:", error);
      throw error;
    }
  }

  async deletePage(
    id: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    try {
      if (!id || id === "undefined") {
        throw new Error("ID de página inválido");
      }

      await this.apiCall(`/api/pages/${id}`, {
        method: "DELETE",
      });

      // Limpiar página actual si fue eliminada
      const currentPageId = localStorage.getItem("current-page-id");
      if (currentPageId === id) {
        localStorage.removeItem("current-page-id");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  }

  async duplicatePage(id: string): Promise<NotionPage | undefined> {
    try {
      if (!id || id === "undefined") return undefined;

      const data = await this.apiCall(`/api/pages/${id}/duplicate`, {
        method: "POST",
      });
      return data.page;
    } catch (error) {
      console.error("Error duplicating page:", error);
      return undefined;
    }
  }

  async movePageToParent(pageId: string, newParentId?: string): Promise<void> {
    try {
      if (!pageId || pageId === "undefined") {
        throw new Error("ID de página inválido");
      }

      await this.apiCall(`/api/pages/${pageId}/move`, {
        method: "PUT",
        body: JSON.stringify({
          parentId: newParentId || undefined,
        }),
      });
    } catch (error) {
      console.error("Error moving page:", error);
      throw error;
    }
  }

  async addComment(
    blockId: string,
    pageId: string,
    userId: string,
    userName: string,
    content: string
  ): Promise<Comment> {
    try {
      if (!pageId || pageId === "undefined") {
        throw new Error("ID de página inválido");
      }

      const data = await this.apiCall("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          blockId,
          pageId,
          content: content.trim(),
        }),
      });
      return data.comment;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  async getComments(): Promise<Comment[]> {
    try {
      const data = await this.apiCall("/api/comments");
      return data.comments || [];
    } catch (error) {
      console.error("Error getting comments:", error);
      return [];
    }
  }

  async resolveComment(commentId: string): Promise<void> {
    try {
      if (!commentId || commentId === "undefined") {
        throw new Error("ID de comentario inválido");
      }

      await this.apiCall(`/api/comments/${commentId}/resolve`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Error resolving comment:", error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      if (!commentId || commentId === "undefined") {
        throw new Error("ID de comentario inválido");
      }

      await this.apiCall(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  async sharePage(
    pageId: string,
    permissions: "read" | "write",
    userId: string,
    userName: string
  ): Promise<SharedPage> {
    try {
      if (!pageId || pageId === "undefined") {
        throw new Error("ID de página inválido");
      }

      const data = await this.apiCall("/api/share", {
        method: "POST",
        body: JSON.stringify({ pageId, permissions }),
      });
      return data.sharedPage;
    } catch (error) {
      console.error("Error sharing page:", error);
      throw error;
    }
  }

  async getSharedPages(): Promise<SharedPage[]> {
    try {
      const data = await this.apiCall("/api/share");
      return data.sharedPages || [];
    } catch (error) {
      console.error("Error getting shared pages:", error);
      return [];
    }
  }

  async revokeShare(shareId: string): Promise<void> {
    try {
      if (!shareId) {
        throw new Error("ID de compartición inválido");
      }

      await this.apiCall(`/api/share/${shareId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error revoking share:", error);
      throw error;
    }
  }

  async getActivityLog(): Promise<ActivityLog[]> {
    try {
      const data = await this.apiCall("/api/activity");
      return data.activities || [];
    } catch (error) {
      console.error("Error getting activity log:", error);
      return [];
    }
  }

  async getChildPages(parentId: string): Promise<NotionPage[]> {
    try {
      if (!parentId || parentId === "undefined") return [];

      const data = await this.apiCall(`/api/pages?parentId=${parentId}`);
      return data.pages || [];
    } catch (error) {
      console.error("Error getting child pages:", error);
      return [];
    }
  }

  async getRootPages(): Promise<NotionPage[]> {
    try {
      const data = await this.apiCall("/api/pages?root=true");
      return data.pages || [];
    } catch (error) {
      console.error("Error getting root pages:", error);
      return [];
    }
  }

  async searchPages(query: string): Promise<NotionPage[]> {
    try {
      if (!query || query.trim().length === 0) return [];

      const data = await this.apiCall(
        `/api/pages/search?q=${encodeURIComponent(query.trim())}`
      );
      return data.pages || [];
    } catch (error) {
      console.error("Error searching pages:", error);
      return [];
    }
  }

  // Métodos de compatibilidad que no están implementados en el backend
  // pero que pueden ser necesarios para el frontend existente

  async getWorkspace(): Promise<WorkspaceData> {
    // Implementación simplificada usando localStorage para compatibilidad
    return {
      pages: await this.getAllPages(),
      comments: await this.getComments(),
      activityLog: await this.getActivityLog(),
      sharedPages: await this.getSharedPages(),
    };
  }
}
