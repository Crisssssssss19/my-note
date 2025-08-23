"use client"

import type { NotionPage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PlusIcon,
  FileTextIcon,
  TrashIcon,
  MoreHorizontalIcon,
  CopyIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  pages: NotionPage[]
  currentPageId?: string
  onSelectPage: (pageId: string) => void
  onCreatePage: (parentId?: string) => void
  onDeletePage: (pageId: string) => void
  onDuplicatePage: (pageId: string) => void
  onMovePageToParent: (pageId: string, newParentId?: string) => void
}

export function Sidebar({
  pages,
  currentPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onDuplicatePage,
  onMovePageToParent,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())

  const rootPages = pages.filter((page) => !page.parentId)
  const getChildPages = (parentId: string) => pages.filter((page) => page.parentId === parentId)

  const filteredPages = searchTerm
    ? pages.filter((page) => page.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : rootPages

  const toggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId)
    } else {
      newExpanded.add(pageId)
    }
    setExpandedPages(newExpanded)
  }

  const renderPageItem = (page: NotionPage, level = 0) => {
    const childPages = getChildPages(page.id)
    const hasChildren = childPages.length > 0
    const isExpanded = expandedPages.has(page.id)
    const isSelected = currentPageId === page.id

    return (
      <div key={page.id}>
        <div
          className={`group flex items-center gap-1 p-1 rounded-md cursor-pointer hover:bg-sidebar-accent transition-colors ${
            isSelected ? "bg-sidebar-accent" : ""
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(page.id)
              }}
              className="h-4 w-4 p-0 hover:bg-sidebar-accent-foreground/10"
            >
              {isExpanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
            </Button>
          ) : (
            <div className="w-4" />
          )}

          {/* Page Content */}
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onSelectPage(page.id)}>
            <span className="text-sm">{page.emoji || "📄"}</span>
            <span className="flex-1 text-sm text-sidebar-foreground truncate">{page.title}</span>
          </div>

          {/* Actions Menu */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onCreatePage(page.id)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar subpágina
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicatePage(page.id)}>
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDeletePage(page.id)} className="text-destructive">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Child Pages */}
        {hasChildren && isExpanded && (
          <div className="ml-2">{childPages.map((childPage) => renderPageItem(childPage, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-semibold text-sidebar-foreground">Mi Workspace</h1>
          <Button variant="ghost" size="sm" onClick={() => onCreatePage()} className="h-6 w-6 p-0">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar páginas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 bg-sidebar-accent border-sidebar-border pl-8"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-auto p-2">
        {filteredPages.length === 0 ? (
          <div className="text-center py-8 text-sidebar-foreground/60">
            <FileTextIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{searchTerm ? "No se encontraron páginas" : "No hay páginas"}</p>
            {!searchTerm && (
              <Button variant="ghost" size="sm" onClick={() => onCreatePage()} className="mt-2 text-xs">
                Crear primera página
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {searchTerm
              ? filteredPages.map((page) => renderPageItem(page, 0))
              : filteredPages.map((page) => renderPageItem(page, 0))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCreatePage()}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva página
        </Button>
      </div>
    </div>
  )
}
