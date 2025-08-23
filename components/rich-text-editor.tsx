"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  MinusIcon,
  TypeIcon,
  ImageIcon,
  VideoIcon,
  AlertCircleIcon,
  ChevronRightIcon,
  BookmarkIcon,
  CalculatorIcon,
  CheckSquareIcon,
  GripVerticalIcon,
} from "lucide-react"
import type { NotionBlock } from "@/lib/types"

interface RichTextEditorProps {
  block: NotionBlock
  onUpdate: (updates: Partial<NotionBlock>) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  autoFocus?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragging?: boolean
}

export function RichTextEditor({
  block,
  onUpdate,
  onKeyDown,
  autoFocus,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      const ref = block.type === "paragraph" ? textareaRef : inputRef
      ref.current?.focus()
    }
  }, [autoFocus, block.type])

  const handleContentChange = (content: string) => {
    onUpdate({ content })
  }

  const handleTypeChange = (newType: NotionBlock["type"]) => {
    onUpdate({ type: newType })
    setShowToolbar(false)
  }

  const toggleFormatting = (format: keyof NonNullable<NotionBlock["formatting"]>) => {
    const currentFormatting = block.formatting || {}
    const newFormatting = {
      ...currentFormatting,
      [format]: !currentFormatting[format],
    }
    onUpdate({ formatting: newFormatting })
  }

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          toggleFormatting("bold")
          return
        case "i":
          e.preventDefault()
          toggleFormatting("italic")
          return
        case "u":
          e.preventDefault()
          toggleFormatting("underline")
          return
        case "`":
          e.preventDefault()
          toggleFormatting("code")
          return
      }
    }

    // Handle slash commands
    if (e.key === "/" && block.content === "") {
      e.preventDefault()
      setShowToolbar(true)
      return
    }

    if (e.key === "Escape") {
      setShowToolbar(false)
      return
    }

    onKeyDown?.(e)
  }

  const getFormattedClassName = () => {
    const formatting = block.formatting || {}
    const classes = []

    if (formatting.bold) classes.push("font-bold")
    if (formatting.italic) classes.push("italic")
    if (formatting.underline) classes.push("underline")
    if (formatting.strikethrough) classes.push("line-through")
    if (formatting.code) classes.push("font-mono bg-muted px-1 rounded")

    return classes.join(" ")
  }

  const getPlaceholder = () => {
    switch (block.type) {
      case "heading1":
        return "Encabezado 1"
      case "heading2":
        return "Encabezado 2"
      case "heading3":
        return "Encabezado 3"
      case "bulletList":
        return "• Lista con viñetas"
      case "numberedList":
        return "1. Lista numerada"
      case "quote":
        return "Cita"
      case "code":
        return "Código"
      case "image":
        return "Pega la URL de la imagen..."
      case "video":
        return "Pega la URL del video..."
      case "callout":
        return "Escribe una nota importante..."
      case "toggle":
        return "Lista desplegable..."
      case "checklist":
        return "Elemento de lista de tareas..."
      case "bookmark":
        return "Pega un enlace para crear un marcador..."
      case "math":
        return "Escribe una ecuación matemática..."
      default:
        return "Escribe algo o presiona '/' para comandos..."
    }
  }

  const renderInput = () => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleContentChange(e.target.value),
      onKeyDown: handleKeyDownInternal,
      placeholder: getPlaceholder(),
      className: `w-full border-none bg-transparent resize-none focus:outline-none focus:ring-0 ${getFormattedClassName()}`,
    }

    switch (block.type) {
      case "heading1":
        return (
          <input {...commonProps} ref={inputRef} className={`${commonProps.className} text-3xl font-bold py-2 px-0`} />
        )
      case "heading2":
        return (
          <input
            {...commonProps}
            ref={inputRef}
            className={`${commonProps.className} text-2xl font-semibold py-2 px-0`}
          />
        )
      case "heading3":
        return (
          <input {...commonProps} ref={inputRef} className={`${commonProps.className} text-xl font-medium py-2 px-0`} />
        )
      case "quote":
        return (
          <div className="border-l-4 border-muted-foreground/20 pl-4">
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              className={`${commonProps.className} italic text-muted-foreground`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "code":
        return (
          <div className="bg-muted rounded-md p-3">
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              className={`${commonProps.className} font-mono text-sm`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "bulletList":
        return (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1">•</span>
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              className={`${commonProps.className} flex-1`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "numberedList":
        return (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1">1.</span>
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              className={`${commonProps.className} flex-1`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "image":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <input
              type="url"
              placeholder="Pega la URL de la imagen..."
              className="w-full text-center bg-transparent border-none focus:outline-none"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            {block.content && (
              <img src={block.content || "/placeholder.svg"} alt="Imagen" className="mt-4 max-w-full h-auto rounded" />
            )}
          </div>
        )
      case "video":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <input
              type="url"
              placeholder="Pega la URL del video..."
              className="w-full text-center bg-transparent border-none focus:outline-none"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            {block.content && (
              <video controls className="mt-4 max-w-full h-auto rounded">
                <source src={block.content} />
              </video>
            )}
          </div>
        )
      case "callout":
        return (
          <div className="bg-accent/20 border-l-4 border-accent rounded-r-lg p-4 flex gap-3">
            <AlertCircleIcon className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              placeholder="Escribe una nota importante..."
              className={`${commonProps.className} bg-transparent`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "toggle":
        return (
          <div className="flex items-start gap-2">
            <ChevronRightIcon className="h-4 w-4 mt-1 text-muted-foreground cursor-pointer hover:text-foreground" />
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              placeholder="Lista desplegable..."
              className={`${commonProps.className} flex-1 font-medium`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "checklist":
        return (
          <div className="flex items-start gap-2">
            <CheckSquareIcon className="h-4 w-4 mt-1 text-muted-foreground cursor-pointer hover:text-foreground" />
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              placeholder="Elemento de lista de tareas..."
              className={`${commonProps.className} flex-1`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "bookmark":
        return (
          <div className="border border-border rounded-lg p-4">
            <BookmarkIcon className="h-5 w-5 text-muted-foreground mb-2" />
            <input
              type="url"
              placeholder="Pega un enlace para crear un marcador..."
              className="w-full bg-transparent border-none focus:outline-none text-sm"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
          </div>
        )
      case "math":
        return (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <CalculatorIcon className="h-5 w-5 text-muted-foreground mb-2" />
            <textarea
              {...commonProps}
              ref={textareaRef}
              rows={1}
              placeholder="Escribe una ecuación matemática..."
              className={`${commonProps.className} font-mono text-sm`}
              style={{ minHeight: "1.5rem" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />
          </div>
        )
      case "divider":
        return <hr className="border-border my-4" />
      default:
        return (
          <textarea
            {...commonProps}
            ref={textareaRef}
            rows={1}
            style={{ minHeight: "1.5rem" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = target.scrollHeight + "px"
            }}
          />
        )
    }
  }

  return (
    <div
      className={`relative group flex items-start gap-2 ${isDragging ? "opacity-50" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing pt-1">
        <GripVerticalIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </div>

      <div className="flex-1">
        {renderInput()}

        {/* Formatting Toolbar */}
        {block.type === "paragraph" && block.content && (
          <div className="absolute -top-12 left-0 bg-popover border border-border rounded-md shadow-md p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFormatting("bold")}
              className={`h-8 w-8 p-0 ${block.formatting?.bold ? "bg-accent" : ""}`}
            >
              <BoldIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFormatting("italic")}
              className={`h-8 w-8 p-0 ${block.formatting?.italic ? "bg-accent" : ""}`}
            >
              <ItalicIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFormatting("underline")}
              className={`h-8 w-8 p-0 ${block.formatting?.underline ? "bg-accent" : ""}`}
            >
              <UnderlineIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFormatting("code")}
              className={`h-8 w-8 p-0 ${block.formatting?.code ? "bg-accent" : ""}`}
            >
              <CodeIcon className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Block Type Selector */}
        {showToolbar && (
          <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg p-2 z-10 min-w-64 max-h-96 overflow-y-auto">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("paragraph")}
                className="w-full justify-start h-8"
              >
                <TypeIcon className="h-4 w-4 mr-2" />
                Párrafo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("heading1")}
                className="w-full justify-start h-8"
              >
                <Heading1Icon className="h-4 w-4 mr-2" />
                Encabezado 1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("heading2")}
                className="w-full justify-start h-8"
              >
                <Heading2Icon className="h-4 w-4 mr-2" />
                Encabezado 2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("heading3")}
                className="w-full justify-start h-8"
              >
                <Heading3Icon className="h-4 w-4 mr-2" />
                Encabezado 3
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("bulletList")}
                className="w-full justify-start h-8"
              >
                <ListIcon className="h-4 w-4 mr-2" />
                Lista con viñetas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("numberedList")}
                className="w-full justify-start h-8"
              >
                <ListOrderedIcon className="h-4 w-4 mr-2" />
                Lista numerada
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("quote")}
                className="w-full justify-start h-8"
              >
                <QuoteIcon className="h-4 w-4 mr-2" />
                Cita
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("code")}
                className="w-full justify-start h-8"
              >
                <CodeIcon className="h-4 w-4 mr-2" />
                Código
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("divider")}
                className="w-full justify-start h-8"
              >
                <MinusIcon className="h-4 w-4 mr-2" />
                Divisor
              </Button>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t pt-2 mt-2">Multimedia</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("image")}
                className="w-full justify-start h-8"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Imagen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("video")}
                className="w-full justify-start h-8"
              >
                <VideoIcon className="h-4 w-4 mr-2" />
                Video
              </Button>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t pt-2 mt-2">Avanzado</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("callout")}
                className="w-full justify-start h-8"
              >
                <AlertCircleIcon className="h-4 w-4 mr-2" />
                Nota destacada
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("toggle")}
                className="w-full justify-start h-8"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Lista desplegable
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("checklist")}
                className="w-full justify-start h-8"
              >
                <CheckSquareIcon className="h-4 w-4 mr-2" />
                Lista de tareas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("bookmark")}
                className="w-full justify-start h-8"
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Marcador
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeChange("math")}
                className="w-full justify-start h-8"
              >
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Ecuación
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
