import type { NotionPage, NotionWorkspace, Comment, ActivityLog, SharedPage } from "./types"

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY ?? "default_key"

export class LocalDatabase {
  private static instance: LocalDatabase
  private workspace: NotionWorkspace

  private constructor() { 
    this.workspace = this.loadWorkspace()
  }

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase()
    }
    return LocalDatabase.instance
  }

  private loadWorkspace(): NotionWorkspace {
    if (typeof window === "undefined") {
      return { pages: [], comments: [], activityLog: [], sharedPages: [] }
    }

     const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed: NotionWorkspace = JSON.parse(stored)

        // Rehidratar fechas con tipado fuerte
        parsed.pages = (parsed.pages || []).map((page: NotionPage) => ({
          ...page,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt),
        }))

        parsed.comments = (parsed.comments || []).map((comment: Comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        }))

        parsed.activityLog = (parsed.activityLog || []).map((activity: ActivityLog) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        }))

        parsed.sharedPages = (parsed.sharedPages || []).map((share: SharedPage) => ({
          ...share,
          createdAt: new Date(share.createdAt),
          expiresAt: share.expiresAt ? new Date(share.expiresAt) : undefined,
        }))

        return parsed
      } catch (err) {
        console.error("Error al parsear localStorage:", err)
        return { pages: [], comments: [], activityLog: [], sharedPages: [] }
      }
    }

    // Create default workspace with welcome page
    const welcomePage: NotionPage = {
      id: "welcome",
      title: "Bienvenido a tu Notion Clone",
      content: [
        {
          id: "block-1",
          type: "heading1",
          content: "¡Bienvenido a tu espacio de trabajo!",
        },
        {
          id: "block-2",
          type: "paragraph",
          content: "Esta es tu primera página. Puedes editarla, crear nuevas páginas y organizar tu contenido.",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      emoji: "👋",
    }

    return {
      pages: [welcomePage],
      currentPageId: "welcome",
      comments: [],
      activityLog: [],
      sharedPages: [],
    }
  }

  private saveWorkspace(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workspace))
    }
  }

  private logActivity(
    userId: string,
    userName: string,
    action: ActivityLog["action"],
    pageId: string,
    pageTitle: string,
    details?: string,
  ): void {
    const activity: ActivityLog = {
      id: `activity-${Date.now()}`,
      userId,
      userName,
      action,
      pageId,
      pageTitle,
      timestamp: new Date(),
      details,
    }
    this.workspace.activityLog.push(activity)
  }

  getAllPages(): NotionPage[] {
    return this.workspace.pages
  }

  getPage(id: string): NotionPage | undefined {
    return this.workspace.pages.find((page) => page.id === id)
  }

  getCurrentPage(): NotionPage | undefined {
    if (!this.workspace.currentPageId) return undefined
    return this.getPage(this.workspace.currentPageId)
  }

  setCurrentPage(id: string): void {
    this.workspace.currentPageId = id
    this.saveWorkspace()
  }

  createPage(title: string, parentId?: string, userId?: string, userName?: string): NotionPage {
    const newPage: NotionPage = {
      id: `page-${Date.now()}`,
      title: title || "Sin título",
      content: [
        {
          id: `block-${Date.now()}`,
          type: "paragraph",
          content: "",
        },
      ],
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.workspace.pages.push(newPage)
    this.workspace.currentPageId = newPage.id

    if (userId && userName) {
      this.logActivity(userId, userName, "created", newPage.id, newPage.title)
    }

    this.saveWorkspace()
    return newPage
  }

  updatePage(id: string, updates: Partial<NotionPage>, userId?: string, userName?: string): void {
    const pageIndex = this.workspace.pages.findIndex((page) => page.id === id)
    if (pageIndex !== -1) {
      const oldTitle = this.workspace.pages[pageIndex].title
      this.workspace.pages[pageIndex] = {
        ...this.workspace.pages[pageIndex],
        ...updates,
        updatedAt: new Date(),
      }

      if (userId && userName) {
        this.logActivity(userId, userName, "updated", id, updates.title || oldTitle)
      }

      this.saveWorkspace()
    }
  }

  deletePage(id: string, userId?: string, userName?: string): void {
    const page = this.getPage(id)
    const childPages = this.workspace.pages.filter((page) => page.parentId === id)
    childPages.forEach((child) => this.deletePage(child.id, userId, userName))

    this.workspace.pages = this.workspace.pages.filter((page) => page.id !== id)
    if (this.workspace.currentPageId === id) {
      this.workspace.currentPageId = this.workspace.pages[0]?.id
    }

    if (page && userId && userName) {
      this.logActivity(userId, userName, "deleted", id, page.title)
    }

    this.saveWorkspace()
  }

  addComment(blockId: string, pageId: string, userId: string, userName: string, content: string): Comment {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      blockId,
      pageId,
      userId,
      userName,
      content,
      createdAt: new Date(),
      resolved: false,
    }

    this.workspace.comments.push(comment)

    const page = this.getPage(pageId)
    if (page) {
      this.logActivity(userId, userName, "commented", pageId, page.title)
    }

    this.saveWorkspace()
    return comment
  }

  getComments(): Comment[] {
    return this.workspace.comments
  }

  resolveComment(commentId: string): void {
    const commentIndex = this.workspace.comments.findIndex((comment) => comment.id === commentId)
    if (commentIndex !== -1) {
      this.workspace.comments[commentIndex].resolved = true
      this.saveWorkspace()
    }
  }

  deleteComment(commentId: string): void {
    this.workspace.comments = this.workspace.comments.filter((comment) => comment.id !== commentId)
    this.saveWorkspace()
  }

  sharePage(pageId: string, permissions: "read" | "write", userId: string, userName: string): SharedPage {
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const sharedPage: SharedPage = {
      id: `shared-${Date.now()}`,
      pageId,
      shareId,
      permissions,
      createdBy: userId,
      createdAt: new Date(),
    }

    this.workspace.sharedPages.push(sharedPage)

    const page = this.getPage(pageId)
    if (page) {
      this.logActivity(userId, userName, "shared", pageId, page.title, `Permisos: ${permissions}`)
    }

    this.saveWorkspace()
    return sharedPage
  }

  getSharedPages(): SharedPage[] {
    return this.workspace.sharedPages
  }

  revokeShare(shareId: string): void {
    this.workspace.sharedPages = this.workspace.sharedPages.filter((share) => share.shareId !== shareId)
    this.saveWorkspace()
  }

  getActivityLog(): ActivityLog[] {
    return this.workspace.activityLog
  }

  duplicatePage(id: string): NotionPage | undefined {
    const originalPage = this.getPage(id)
    if (!originalPage) return undefined

    const duplicatedPage: NotionPage = {
      ...originalPage,
      id: `page-${Date.now()}`,
      title: `${originalPage.title} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      content: originalPage.content.map((block) => ({
        ...block,
        id: `block-${Date.now()}-${Math.random()}`,
      })),
    }

    this.workspace.pages.push(duplicatedPage)
    this.saveWorkspace()
    return duplicatedPage
  }

  movePageToParent(pageId: string, newParentId?: string): void {
    const pageIndex = this.workspace.pages.findIndex((page) => page.id === pageId)
    if (pageIndex !== -1) {
      this.workspace.pages[pageIndex] = {
        ...this.workspace.pages[pageIndex],
        parentId: newParentId,
        updatedAt: new Date(),
      }
      this.saveWorkspace()
    }
  }

  getChildPages(parentId: string): NotionPage[] {
    return this.workspace.pages.filter((page) => page.parentId === parentId)
  }

  getRootPages(): NotionPage[] {
    return this.workspace.pages.filter((page) => !page.parentId)
  }

  searchPages(query: string): NotionPage[] {
    const lowercaseQuery = query.toLowerCase()
    return this.workspace.pages.filter(
      (page) =>
        page.title.toLowerCase().includes(lowercaseQuery) ||
        page.content.some((block) => block.content.toLowerCase().includes(lowercaseQuery)),
    )
  }
}
