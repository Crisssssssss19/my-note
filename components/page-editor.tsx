"use client"

import type React from "react"
import type { NotionPage, NotionBlock } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { PlusIcon } from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"

interface PageEditorProps {
  page: NotionPage
  onUpdatePage: (updates: Partial<NotionPage>) => void
}

export function PageEditor({ page, onUpdatePage }: PageEditorProps) {
  const [title, setTitle] = useState(page.title)
  const [blocks, setBlocks] = useState<NotionBlock[]>(page.content)
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(page.title)
    setBlocks(page.content)
  }, [page])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onUpdatePage({ title: newTitle })
  }

  const handleBlockUpdate = (blockId: string, updates: Partial<NotionBlock>) => {
    const updatedBlocks = blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block))
    setBlocks(updatedBlocks)
    onUpdatePage({ content: updatedBlocks })
  }

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", blockId)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedBlockId) return

    const draggedIndex = blocks.findIndex((block) => block.id === draggedBlockId)
    if (draggedIndex === -1 || draggedIndex === dropIndex) return

    const newBlocks = [...blocks]
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1)

    // Adjust drop index if dragging from above
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newBlocks.splice(adjustedDropIndex, 0, draggedBlock)

    setBlocks(newBlocks)
    onUpdatePage({ content: newBlocks })
    setDraggedBlockId(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedBlockId(null)
    setDragOverIndex(null)
  }

  const addNewBlock = (afterBlockId?: string, blockType: NotionBlock["type"] = "paragraph") => {
    const newBlock: NotionBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      content: "",
    }

    let updatedBlocks: NotionBlock[]
    if (afterBlockId) {
      const index = blocks.findIndex((block) => block.id === afterBlockId)
      updatedBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)]
    } else {
      updatedBlocks = [...blocks, newBlock]
    }

    setBlocks(updatedBlocks)
    onUpdatePage({ content: updatedBlocks })
    setFocusedBlockId(newBlock.id)
  }

  const deleteBlock = (blockId: string) => {
    if (blocks.length > 1) {
      const blockIndex = blocks.findIndex((block) => block.id === blockId)
      const updatedBlocks = blocks.filter((block) => block.id !== blockId)
      setBlocks(updatedBlocks)
      onUpdatePage({ content: updatedBlocks })

      // Focus previous block if available
      if (blockIndex > 0) {
        setFocusedBlockId(updatedBlocks[blockIndex - 1]?.id)
      } else if (updatedBlocks.length > 0) {
        setFocusedBlockId(updatedBlocks[0]?.id)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const currentBlock = blocks.find((block) => block.id === blockId)

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // If current block is empty and not paragraph, convert to paragraph
      if (currentBlock?.content === "" && currentBlock.type !== "paragraph") {
        handleBlockUpdate(blockId, { type: "paragraph" })
      } else {
        addNewBlock(blockId)
      }
    }

    if (e.key === "Backspace" && currentBlock?.content === "") {
      e.preventDefault()
      if (currentBlock.type !== "paragraph") {
        // Convert to paragraph instead of deleting
        handleBlockUpdate(blockId, { type: "paragraph" })
      } else if (blocks.length > 1) {
        deleteBlock(blockId)
      }
    }

    // Navigate between blocks with arrow keys
    if (e.key === "ArrowUp" && e.ctrlKey) {
      e.preventDefault()
      const currentIndex = blocks.findIndex((block) => block.id === blockId)
      if (currentIndex > 0) {
        setFocusedBlockId(blocks[currentIndex - 1].id)
      }
    }

    if (e.key === "ArrowDown" && e.ctrlKey) {
      e.preventDefault()
      const currentIndex = blocks.findIndex((block) => block.id === blockId)
      if (currentIndex < blocks.length - 1) {
        setFocusedBlockId(blocks[currentIndex + 1].id)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Page Title */}
      <div className="mb-8">
        <Input
          ref={titleRef}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Sin título"
          className="text-4xl font-bold border-none bg-transparent p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
        />
      </div>

      {/* Content Blocks */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative transition-all duration-200 ${
              dragOverIndex === index ? "border-t-2 border-primary pt-2" : ""
            } ${draggedBlockId === block.id ? "opacity-50" : ""}`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <RichTextEditor
              block={block}
              onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              autoFocus={focusedBlockId === block.id}
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              isDragging={draggedBlockId === block.id}
            />

            {/* Add Block Button */}
            <div className="absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => addNewBlock(block.id)} className="h-6 w-6 p-0">
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <div
          className={`h-2 transition-all duration-200 ${
            dragOverIndex === blocks.length ? "border-t-2 border-primary" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, blocks.length)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, blocks.length)}
        />
      </div>

      {/* Add Block Button */}
      <div className="mt-4">
        <Button variant="ghost" onClick={() => addNewBlock()} className="text-muted-foreground hover:text-foreground">
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar bloque
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <h4 className="font-medium mb-2">Atajos de teclado:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            • <kbd className="bg-background px-1 rounded">Ctrl+B</kbd> Negrita
          </div>
          <div>
            • <kbd className="bg-background px-1 rounded">Ctrl+I</kbd> Cursiva
          </div>
          <div>
            • <kbd className="bg-background px-1 rounded">Ctrl+U</kbd> Subrayado
          </div>
          <div>
            • <kbd className="bg-background px-1 rounded">Ctrl+`</kbd> Código
          </div>
          <div>
            • <kbd className="bg-background px-1 rounded">/</kbd> Menú de bloques
          </div>
          <div>
            • <kbd className="bg-background px-1 rounded">Enter</kbd> Nuevo bloque
          </div>
          <div>
            • <strong>Arrastrar</strong> Reordenar bloques
          </div>
        </div>
      </div>
    </div>
  )
}
