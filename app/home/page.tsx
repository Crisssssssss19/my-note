"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  FileText,
  Palette,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { mode, toggleMode, palette, setPalette } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Editor Rico",
      description: "Crea contenido con bloques dinámicos y formato avanzado",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Colaboración",
      description: "Trabaja en equipo con comentarios y compartir páginas",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Temas Personalizables",
      description: "Múltiples paletas púrpura con modo oscuro",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Rápido y Fluido",
      description: "Experiencia optimizada con animaciones suaves",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-violet-500/10 to-indigo-600/20 animate-gradient" />

      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-violet-600/30 rounded-full blur-xl animate-float" />
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-indigo-400/30 to-purple-600/30 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-2xl animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            NotionClone
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleMode()}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {mode === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          {user ? (
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Ir a la App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Comenzar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Tu Espacio de
            <br />
            <span className="relative">
              Trabajo Perfecto
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full animate-gradient" />
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Organiza tus ideas, colabora con tu equipo y crea contenido
            increíble con nuestro editor rico y personalizable
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 animate-pulse-glow"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Empezar Gratis
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20 px-8 py-4 text-lg transition-all duration-300 bg-transparent"
            >
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-900/80 dark:to-purple-900/20 backdrop-blur-sm border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 animate-slide-up hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className="text-purple-600 dark:text-purple-400 mb-4 animate-float"
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600/10 to-violet-600/10 rounded-3xl p-12 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30 animate-slide-up">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            ¿Listo para comenzar?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están creando contenido increíble
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-12 py-4 text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 animate-pulse-glow"
          >
            <Zap className="w-5 h-5 mr-2" />
            Comenzar Ahora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
