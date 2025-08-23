"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Sparkles, Zap } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Show logo animation after mount
    const timer1 = setTimeout(() => setShowContent(true), 500)
    // Show button after logo animation
    const timer2 = setTimeout(() => setShowButton(true), 2000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent animate-gradient overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-3/4 w-20 h-20 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center text-white">
        {/* Logo animation */}
        <div
          className={`transition-all duration-1000 ${showContent ? "translate-y-0 opacity-100 scale-100" : "-translate-y-20 opacity-0 scale-75"}`}
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse-glow">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent animate-slide-up">
            NotionClone
          </h1>

          <p className="text-xl mb-8 text-white/90 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Tu espacio de trabajo inteligente
          </p>

          {/* Feature highlights */}
          <div
            className={`grid grid-cols-3 gap-6 mb-8 transition-all duration-1000 ${showContent ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            style={{ animationDelay: "0.5s" }}
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-white/80">Editor Rico</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-white/80">Colaboración</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-white/80">Organización</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div
          className={`transition-all duration-1000 ${showButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}`}
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 animate-pulse-glow"
          >
            Comenzar Ahora
          </Button>
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
