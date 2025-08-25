"use client"

import { useState, useEffect } from "react"
import { LocalDatabase } from "@/lib/database"
import type { NotionPage, Comment, ActivityLog, SharedPage } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"
import { PageEditor } from "@/components/page-editor"
import { CommentsPanel } from "@/components/collaboration/comments-panel"
import { ShareDialog } from "@/components/collaboration/share-dialog"
import { ActivityPanel } from "@/components/collaboration/activity-panel"
import { ThemeSelector } from "@/components/theme-selector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  PlusIcon,
  MenuIcon,
  LogOutIcon,
  MessageCircleIcon,
  ActivityIcon,
  Sparkles,
  Zap,
  Users,
  FileText,
  Palette,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function NotionClone() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const [pages, setPages] = useState<NotionPage[]>([])
  const [currentPage, setCurrentPage] = useState<NotionPage | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [sharedPages, setSharedPages] = useState<SharedPage[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const db = LocalDatabase.getInstance()

  // Refrescar data del workspace
  const refreshData = async () => {
    if (!user || authLoading) return

    try {
      setIsLoading(true)

      const [pagesData, commentsData, activityData, sharedData] = await Promise.all([
        db.getAllPages(),
        db.getComments(),
        db.getActivityLog(),
        db.getSharedPages(),
      ])

      setPages(pagesData)
      setComments(commentsData)
      setActivities(activityData)
      setSharedPages(sharedData)

      const storedCurrentPage = await db.getCurrentPage()
      if (storedCurrentPage) {
        setCurrentPage(storedCurrentPage)
        setShowWelcome(false)
      } else {
        setShowWelcome(pagesData.length === 0)
        setCurrentPage(undefined)
      }
    } catch (err) {
      console.error("Error refreshing data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      refreshData()
    } else if (!authLoading && !user) {
      // limpiar si no hay sesión
      setPages([])
      setCurrentPage(undefined)
      setComments([])
      setActivities([])
      setSharedPages([])
      setShowWelcome(false)
      setIsLoading(false)
    }
  }, [user, authLoading])

  // === Handlers ===
  const handleCreatePage = async (parentId?: string) => {
    if (!user) return
    try {
      const newPage = await db.createPage("Nueva página", parentId, user.id, user.name)
      await refreshData()
      setCurrentPage(newPage)
    } catch (err) {
      console.error("Error creating page:", err)
    }
  }

  const handleSelectPage = async (pageId: string) => {
    try {
      const page = await db.getPage(pageId)
      if (page) {
        setCurrentPage(page)
        db.setCurrentPage(pageId)
      }
    } catch (err) {
      console.error("Error selecting page:", err)
    }
  }

  const handleUpdatePage = async (pageId: string, updates: Partial<NotionPage>) => {
    if (!user) return
    try {
      await db.updatePage(pageId, updates, user.id, user.name)
      await refreshData()
      if (currentPage?.id === pageId) {
        const updated = await db.getPage(pageId)
        if (updated) setCurrentPage(updated)
      }
    } catch (err) {
      console.error("Error updating page:", err)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!user) return
    try {
      await db.deletePage(pageId, user.id, user.name)
      await refreshData()
    } catch (err) {
      console.error("Error deleting page:", err)
    }
  }

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const duplicated = await db.duplicatePage(pageId)
      if (duplicated) {
        await refreshData()
        setCurrentPage(duplicated)
      }
    } catch (err) {
      console.error("Error duplicating page:", err)
    }
  }

  const handleMovePageToParent = async (pageId: string, newParentId?: string) => {
    try {
      await db.movePageToParent(pageId, newParentId)
      await refreshData()
    } catch (err) {
      console.error("Error moving page:", err)
    }
  }

  const handleAddComment = async (blockId: string, content: string) => {
    if (!user || !currentPage) return
    await db.addComment(blockId, currentPage.id, user.id, user.name, content)
    await refreshData()
  }

  const handleResolveComment = async (commentId: string) => {
    await db.resolveComment(commentId)
    await refreshData()
  }

  const handleDeleteComment = async (commentId: string) => {
    await db.deleteComment(commentId)
    await refreshData()
  }

  const handleSharePage = async (permissions: "read" | "write") => {
    if (!user || !currentPage) return
    await db.sharePage(currentPage.id, permissions, user.id, user.name)
    await refreshData()
  }

  const handleRevokeShare = async (shareId: string) => {
    await db.revokeShare(shareId)
    await refreshData()
  }

  // Pantalla de bienvenida
  const WelcomeScreen = () => {
    const features = [
      { icon: <FileText className="w-6 h-6" />, title: "Editor Rico", description: "Crea contenido con bloques dinámicos" },
      { icon: <Users className="w-6 h-6" />, title: "Colaboración", description: "Trabaja en equipo con comentarios" },
      { icon: <Palette className="w-6 h-6" />, title: "Temas Personalizables", description: "Múltiples paletas púrpura" },
      { icon: <Zap className="w-6 h-6" />, title: "Rápido y Fluido", description: "Experiencia optimizada" },
    ]

    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              ¡Bienvenido, {user?.name}!
            </h1>
          </div>
          <p className="text-muted-foreground">Comienza creando tu primera página para descubrir todas las funcionalidades</p>
          <Button onClick={() => handleCreatePage()}>
            <PlusIcon className="h-4 w-4 mr-2" /> Crear mi primera página <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {features.map((f, i) => (
              <Card key={i} className="p-4">
                <div className="text-purple-600 mb-2">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden border-r`}>
          <Sidebar
            pages={pages}
            currentPageId={currentPage?.id}
            onSelectPage={handleSelectPage}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onDuplicatePage={handleDuplicatePage}
            onMovePageToParent={handleMovePageToParent}
          />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <header className="h-12 border-b flex items-center px-4 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon className="h-4 w-4" />
            </Button>

            <div className="flex-1" />
            <ThemeSelector />

            {currentPage && (
              <>
                <ShareDialog
                  pageId={currentPage.id}
                  pageTitle={currentPage.title}
                  sharedPages={sharedPages}
                  onSharePage={handleSharePage}
                  onRevokeShare={handleRevokeShare}
                />
                <Button variant="ghost" size="sm" onClick={() => setCommentsOpen(!commentsOpen)} className={commentsOpen ? "bg-accent" : ""}>
                  <MessageCircleIcon className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" onClick={() => setActivityOpen(!activityOpen)} className={activityOpen ? "bg-accent" : ""}>
              <ActivityIcon className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground mr-4">Hola, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => handleCreatePage()}>
              <PlusIcon className="h-4 w-4 mr-2" /> Nueva página
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : showWelcome ? (
                <WelcomeScreen />
              ) : currentPage ? (
                <PageEditor page={currentPage} onUpdatePage={(updates) => handleUpdatePage(currentPage.id, updates)} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">No hay páginas seleccionadas</h2>
                    <p className="mb-4">Selecciona una página del sidebar o crea una nueva</p>
                    <Button onClick={() => handleCreatePage()}>
                      <PlusIcon className="h-4 w-4 mr-2" /> Crear nueva página
                    </Button>
                  </div>
                </div>
              )}
            </main>

            {/* Comments Panel */}
            {commentsOpen && currentPage && (
              <CommentsPanel
                comments={comments}
                pageId={currentPage.id}
                onAddComment={handleAddComment}
                onResolveComment={handleResolveComment}
                onDeleteComment={handleDeleteComment}
              />
            )}

            {/* Activity Panel */}
            {activityOpen && (
              <div className="w-80 border-l p-4 overflow-auto">
                <ActivityPanel activities={activities} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
