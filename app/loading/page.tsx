"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  EditIcon,
  ShareIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  SparklesIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <EditIcon className="h-8 w-8" />,
      title: "Editor Rico",
      description: "Crea contenido con nuestro editor de bloques intuitivo y potente",
    },
    {
      icon: <LayersIcon className="h-8 w-8" />,
      title: "Organización Jerárquica",
      description: "Organiza tus páginas en estructuras anidadas y fáciles de navegar",
    },
    {
      icon: <ShareIcon className="h-8 w-8" />,
      title: "Colaboración",
      description: "Comparte páginas y colabora en tiempo real con tu equipo",
    },
    {
      icon: <MessageSquareIcon className="h-8 w-8" />,
      title: "Comentarios",
      description: "Comenta y discute directamente en el contenido",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-secondary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/20 rounded-full blur-2xl animate-bounce" />
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <SparklesIcon className="h-16 w-16 mx-auto mb-6 text-primary-foreground animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Tu Espacio de
              <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Trabajo Digital
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Crea, organiza y colabora con una herramienta que se adapta a tu forma de pensar. Todo tu conocimiento en
              un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Comenzar Ahora
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 bg-transparent"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Características Poderosas</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre las herramientas que harán que tu productividad alcance nuevos niveles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-primary/20 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 text-primary group-hover:text-secondary transition-colors duration-300 group-hover:scale-110 transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <UsersIcon className="h-16 w-16 mx-auto mb-6 text-primary-foreground animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">¿Listo para Comenzar?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están transformando su forma de trabajar
            </p>
            <Link href="/">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Empezar Gratis
                <SparklesIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
