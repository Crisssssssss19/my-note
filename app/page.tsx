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
} from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function NotionClone() {
  const [pages, setPages] = useState<NotionPage[]>([])
  const [currentPage, setCurrentPage] = useState<NotionPage | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [sharedPages, setSharedPages] = useState<SharedPage[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [db] = useState(() => LocalDatabase.getInstance())
  const { user, logout } = useAuth()

  useEffect(() => {
    refreshData()
    const allPages = db.getAllPages()
    setShowWelcome(allPages.length === 0)
  }, [db])

  const refreshData = () => {
    setPages(db.getAllPages())
    setComments(db.getComments())
    setActivities(db.getActivityLog())
    setSharedPages(db.getSharedPages())
  }

  const handleCreatePage = (parentId?: string) => {
    if (!user) return
    const newPage = db.createPage("Nueva página", parentId, user.id, user.name)
    refreshData()
    setCurrentPage(newPage)
    setShowWelcome(false)
  }

  const handleSelectPage = (pageId: string) => {
    db.setCurrentPage(pageId)
    const page = db.getPage(pageId)
    setCurrentPage(page)
  }

  const handleUpdatePage = (pageId: string, updates: Partial<NotionPage>) => {
    if (!user) return
    db.updatePage(pageId, updates, user.id, user.name)
    refreshData()
    if (currentPage?.id === pageId) {
      setCurrentPage(db.getPage(pageId))
    }
  }

  const handleDeletePage = (pageId: string) => {
    if (!user) return
    db.deletePage(pageId, user.id, user.name)
    refreshData()
    setCurrentPage(db.getCurrentPage())
  }

  const handleDuplicatePage = (pageId: string) => {
    const duplicatedPage = db.duplicatePage(pageId)
    if (duplicatedPage) {
      refreshData()
      setCurrentPage(duplicatedPage)
    }
  }

  const handleMovePageToParent = (pageId: string, newParentId?: string) => {
    db.movePageToParent(pageId, newParentId)
    refreshData()
  }

  const handleAddComment = (blockId: string, content: string) => {
    if (!user || !currentPage) return
    db.addComment(blockId, currentPage.id, user.id, user.name, content)
    refreshData()
  }

  const handleResolveComment = (commentId: string) => {
    db.resolveComment(commentId)
    refreshData()
  }

  const handleDeleteComment = (commentId: string) => {
    db.deleteComment(commentId)
    refreshData()
  }

  const handleSharePage = (permissions: "read" | "write") => {
    if (!user || !currentPage) return
    db.sharePage(currentPage.id, permissions, user.id, user.name)
    refreshData()
  }

  const handleRevokeShare = (shareId: string) => {
    db.revokeShare(shareId)
    refreshData()
  }

  const WelcomeScreen = () => {
    const features = [
      {
        icon: <FileText className="w-6 h-6" />,
        title: "Editor Rico",
        description: "Crea contenido con bloques dinámicos",
      },
      {
        icon: <Users className="w-6 h-6" />,
        title: "Colaboración",
        description: "Trabaja en equipo con comentarios",
      },
      {
        icon: <Palette className="w-6 h-6" />,
        title: "Temas Personalizables",
        description: "Múltiples paletas púrpura",
      },
      {
        icon: <Zap className="w-6 h-6" />,
        title: "Rápido y Fluido",
        description: "Experiencia optimizada",
      },
    ]

    return (
      <div className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-violet-500/5 to-indigo-600/10 animate-gradient" />

        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-violet-600/20 rounded-full blur-xl animate-float" />
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 container mx-auto px-8 py-16 max-w-4xl">
          <div className="text-center mb-16 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                ¡Bienvenido, {user?.name}!
              </h1>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Tu espacio de trabajo está listo</h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Comienza creando tu primera página y descubre todas las funcionalidades que tenemos para ti
            </p>

            <Button
              size="lg"
              onClick={() => handleCreatePage()}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear Mi Primera Página
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-gradient-to-br from-white/60 to-purple-50/30 dark:from-gray-900/60 dark:to-purple-900/10 backdrop-blur-sm border-purple-200/30 dark:border-purple-700/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="text-purple-600 dark:text-purple-400 mb-3 animate-float"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center bg-gradient-to-r from-purple-600/5 to-violet-600/5 rounded-2xl p-8 backdrop-blur-sm border border-purple-200/20 dark:border-purple-700/20">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-muted-foreground mb-4">
              Explora las funciones usando los iconos de la barra superior o crea tu primera página para comenzar
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <div
          className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden border-r border-border`}
        >
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

        <div className="flex-1 flex flex-col">
          <header className="h-12 border-b border-border flex items-center px-4 gap-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentsOpen(!commentsOpen)}
                  className={commentsOpen ? "bg-accent" : ""}
                >
                  <MessageCircleIcon className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivityOpen(!activityOpen)}
              className={activityOpen ? "bg-accent" : ""}
            >
              <ActivityIcon className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground mr-4">Hola, {user?.name}</span>

            <Button variant="ghost" size="sm" onClick={() => handleCreatePage()}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva página
            </Button>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-auto">
              {showWelcome ? (
                <WelcomeScreen />
              ) : currentPage ? (
                <PageEditor page={currentPage} onUpdatePage={(updates) => handleUpdatePage(currentPage.id, updates)} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">No hay páginas seleccionadas</h2>
                    <p className="mb-4">Selecciona una página del sidebar o crea una nueva</p>
                    <Button onClick={() => handleCreatePage()}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Crear nueva página
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
              <div className="w-80 border-l border-border bg-background p-4 overflow-auto">
                <ActivityPanel activities={activities} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
