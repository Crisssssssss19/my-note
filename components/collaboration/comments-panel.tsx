"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircleIcon, CheckIcon, XIcon } from "lucide-react"
import type { Comment } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

interface CommentsPanelProps {
  comments: Comment[]
  pageId: string
  onAddComment: (blockId: string, content: string) => void
  onResolveComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
}

export function CommentsPanel({
  comments,
  pageId,
  onAddComment,
  onResolveComment,
  onDeleteComment,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [selectedBlockId, setSelectedBlockId] = useState<string>("")
  const { user } = useAuth()

  const pageComments = comments.filter((comment) => comment.pageId === pageId)
  const unresolvedComments = pageComments.filter((comment) => !comment.resolved)
  const resolvedComments = pageComments.filter((comment) => comment.resolved)

  const handleAddComment = () => {
    if (newComment.trim() && selectedBlockId) {
      onAddComment(selectedBlockId, newComment.trim())
      setNewComment("")
      setSelectedBlockId("")
    }
  }

  return (
    <div className="w-80 border-l border-border bg-background p-4 overflow-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircleIcon className="h-5 w-5" />
          <h3 className="font-semibold">Comentarios</h3>
          <Badge variant="secondary">{unresolvedComments.length}</Badge>
        </div>

        {/* Add Comment Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Agregar comentario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
                Comentar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setNewComment("")}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unresolved Comments */}
        {unresolvedComments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Pendientes</h4>
            {unresolvedComments.map((comment) => (
              <Card key={comment.id} className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{comment.userName}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolveComment(comment.id)}
                        className="h-6 w-6 p-0"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </Button>
                      {comment.userId === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteComment(comment.id)}
                          className="h-6 w-6 p-0"
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleDateString()} {comment.createdAt.toLocaleTimeString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Resolved Comments */}
        {resolvedComments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Resueltos</h4>
            {resolvedComments.map((comment) => (
              <Card key={comment.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs text-white">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{comment.userName}</span>
                      <CheckIcon className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleDateString()} {comment.createdAt.toLocaleTimeString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pageComments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircleIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay comentarios aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
