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
        // Validate token format (should have 3 parts)
        const parts = token.split('.')
        if (parts.length !== 3) {
          console.warn('Invalid token format')
          localStorage.removeItem(AUTH_STORAGE_KEY)
          return
        }

        // Decode JWT payload to get user info
        const payload = JSON.parse(atob(parts[1]))
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('Token expired')
          localStorage.removeItem(AUTH_STORAGE_KEY)
          return
        }

        if (payload.user) {
          this.currentUser = {
            ...payload.user,
            createdAt: new Date(payload.user.createdAt)
          }
        }
      } catch (error) {
        console.error('Error loading user from token:', error)
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

      if (response.ok && result.success && result.token) {
        // Save token
        this.saveToken(result.token)
        
        // Set current user
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

      if (response.ok && result.success && result.token) {
        // Save token
        this.saveToken(result.token)
        
        // Set current user
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
