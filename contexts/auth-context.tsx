"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { AuthService, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  showSplash: boolean
  setShowSplash: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })
  const [showSplash, setShowSplash] = useState(true)

  const authService = AuthService.getInstance()

  useEffect(() => {
    // Load user on mount
    const user = authService.getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
    })
  }, [authService])

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.login(email, password)

    if (result.success) {
      const user = authService.getCurrentUser()
      setAuthState({ user, isLoading: false })
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }

    return result
  }

  const register = async (email: string, password: string, name: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.register(email, password, name)

    if (result.success) {
      const user = authService.getCurrentUser()
      setAuthState({ user, isLoading: false })
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }

    return result
  }

  const logout = () => {
    authService.logout()
    setAuthState({ user: null, isLoading: false })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        showSplash,
        setShowSplash,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
