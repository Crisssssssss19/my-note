"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ThemePalette, ThemeMode } from "@/lib/types"

const THEME_PALETTES: ThemePalette[] = [
  {
    name: "Lavanda",
    colors: {
      primary: "oklch(0.6 0.15 300)",
      secondary: "oklch(0.8 0.1 300)",
      accent: "oklch(0.7 0.12 280)",
      background: "oklch(0.98 0.02 300)",
      foreground: "oklch(0.2 0.05 300)",
      muted: "oklch(0.95 0.03 300)",
      border: "oklch(0.9 0.05 300)",
    },
  },
  {
    name: "Violeta",
    colors: {
      primary: "oklch(0.55 0.2 270)",
      secondary: "oklch(0.75 0.15 270)",
      accent: "oklch(0.65 0.18 250)",
      background: "oklch(0.97 0.03 270)",
      foreground: "oklch(0.15 0.08 270)",
      muted: "oklch(0.93 0.05 270)",
      border: "oklch(0.88 0.08 270)",
    },
  },
  {
    name: "Amatista",
    colors: {
      primary: "oklch(0.5 0.25 320)",
      secondary: "oklch(0.7 0.2 320)",
      accent: "oklch(0.6 0.22 300)",
      background: "oklch(0.96 0.04 320)",
      foreground: "oklch(0.1 0.1 320)",
      muted: "oklch(0.91 0.06 320)",
      border: "oklch(0.85 0.1 320)",
    },
  },
  {
    name: "Orquídea",
    colors: {
      primary: "oklch(0.58 0.18 290)",
      secondary: "oklch(0.78 0.13 290)",
      accent: "oklch(0.68 0.15 310)",
      background: "oklch(0.99 0.01 290)",
      foreground: "oklch(0.25 0.03 290)",
      muted: "oklch(0.94 0.04 290)",
      border: "oklch(0.87 0.07 290)",
    },
  },
]

interface ThemeContextType {
  mode: ThemeMode
  palette: ThemePalette
  toggleMode: () => void
  setPalette: (palette: ThemePalette) => void
  palettes: ThemePalette[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light")
  const [palette, setPaletteState] = useState<ThemePalette>(THEME_PALETTES[0])

  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode
    const savedPalette = localStorage.getItem("theme-palette")

    if (savedMode) setMode(savedMode)
    if (savedPalette) {
      const found = THEME_PALETTES.find((p) => p.name === savedPalette)
      if (found) setPaletteState(found)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const isDark = mode === "dark"

    root.classList.toggle("dark", isDark)

    // Apply palette colors
    const colors = palette.colors
    const darkMultiplier = isDark ? 0.3 : 1
    const lightMultiplier = isDark ? 1.5 : 1

    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--secondary", colors.secondary)
    root.style.setProperty("--accent", colors.accent)
    root.style.setProperty("--background", isDark ? "oklch(0.1 0.02 300)" : colors.background)
    root.style.setProperty("--foreground", isDark ? "oklch(0.95 0.02 300)" : colors.foreground)
    root.style.setProperty("--muted", isDark ? "oklch(0.2 0.03 300)" : colors.muted)
    root.style.setProperty("--border", isDark ? "oklch(0.25 0.05 300)" : colors.border)

    localStorage.setItem("theme-mode", mode)
    localStorage.setItem("theme-palette", palette.name)
  }, [mode, palette])

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"))
  }

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette)
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        palette,
        toggleMode,
        setPalette,
        palettes: THEME_PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
