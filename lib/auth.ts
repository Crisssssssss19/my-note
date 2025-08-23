// lib/auth.ts - VERSIÓN CORREGIDA SIN DUPLICACIONES
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

const AUTH_STORAGE_KEY = "notion-clone-auth"

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  private constructor() {
    this.loadUser()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private loadUser(): void {
    if (typeof window === "undefined") return

    const token = localStorage.getItem(AUTH_STORAGE_KEY)
    if (token) {
      try {
        // Decode JWT payload to get user info (client-side only for UI)
        const payload = JSON.parse(atob(token.split('.')[1]))
        this.currentUser = {
          ...payload.user,
          createdAt: new Date(payload.user.createdAt)
        }
      } catch (error) {
        console.error('Error al verificar token:', error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
  }

  private saveToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_STORAGE_KEY, token)
  }

  private clearToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success && result.token) {
        // Guardar el token
        this.saveToken(result.token)
        
        // Establecer el usuario actual
        this.currentUser = {
          ...result.user,
          createdAt: new Date(result.user.createdAt)
        }
        
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error de autenticación' }
      }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: "Error de conexión" }
    }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const result = await response.json()

      if (result.success && result.token) {
        // Guardar el token
        this.saveToken(result.token)
        
        // Establecer el usuario actual
        this.currentUser = {
          ...result.user,
          createdAt: new Date(result.user.createdAt)
        }
        
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error de registro' }
      }
    } catch (error) {
      console.error('Error en register:', error)
      return { success: false, error: "Error de conexión" }
    }
  }

  logout(): void {
    this.currentUser = null
    this.clearToken()
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Get token for API calls
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(AUTH_STORAGE_KEY)
  }
}