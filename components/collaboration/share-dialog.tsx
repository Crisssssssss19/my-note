"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShareIcon, CopyIcon, CheckIcon } from "lucide-react"
import type { SharedPage } from "@/lib/types"

interface ShareDialogProps {
  pageId: string
  pageTitle: string
  sharedPages: SharedPage[]
  onSharePage: (permissions: "read" | "write") => void
  onRevokeShare: (shareId: string) => void
}

export function ShareDialog({ pageId, pageTitle, sharedPages, onSharePage, onRevokeShare }: ShareDialogProps) {
  const [permissions, setPermissions] = useState<"read" | "write">("read")
  const [copied, setCopied] = useState<string | null>(null)

  const pageShares = sharedPages.filter((share) => share.pageId === pageId)

  const copyToClipboard = (shareId: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareId}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(shareId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShareIcon className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir página</DialogTitle>
          <DialogDescription>Comparte {pageTitle} con otros usuarios</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Share */}
          <div className="space-y-3">
            <Label>Crear nuevo enlace</Label>
            <div className="flex gap-2">
              <Select value={permissions} onValueChange={(value: "read" | "write") => setPermissions(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Solo lectura</SelectItem>
                  <SelectItem value="write">Editar</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => onSharePage(permissions)} className="flex-1">
                Crear enlace
              </Button>
            </div>
          </div>

          {/* Existing Shares */}
          {pageShares.length > 0 && (
            <div className="space-y-3">
              <Label>Enlaces existentes</Label>
              <div className="space-y-2">
                {pageShares.map((share) => (
                  <div key={share.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {share.permissions === "read" ? "Solo lectura" : "Editar"}
                      </div>
                      <div className="text-xs text-muted-foreground">Creado {share.createdAt.toLocaleDateString()}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(share.shareId)} className="h-8">
                      {copied === share.shareId ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onRevokeShare(share.shareId)} className="h-8">
                      Revocar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
