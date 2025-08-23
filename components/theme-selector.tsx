"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { PaletteIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeSelector() {
  const { mode, palette, toggleMode, setPalette, palettes } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <PaletteIcon className="h-4 w-4" />
          {mode === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Modo</DropdownMenuLabel>
        <DropdownMenuItem onClick={toggleMode}>
          {mode === "dark" ? <SunIcon className="h-4 w-4 mr-2" /> : <MoonIcon className="h-4 w-4 mr-2" />}
          {mode === "dark" ? "Modo Claro" : "Modo Oscuro"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Paleta de Colores</DropdownMenuLabel>
        {palettes.map((p) => (
          <DropdownMenuItem
            key={p.name}
            onClick={() => setPalette(p)}
            className={palette.name === p.name ? "bg-accent" : ""}
          >
            <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: p.colors.primary }} />
            {p.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
