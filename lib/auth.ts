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

    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const userData = JSON.parse(stored)
      this.currentUser = {
        ...userData,
        createdAt: new Date(userData.createdAt),
      }
    }
  }

  private saveUser(user: User): void {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }

  private clearUser(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation - in real app, this would be server-side
    if (!email || !password) {
      return { success: false, error: "Email y contraseña son requeridos" }
    }

    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
    }

    // Create user (in real app, this would validate against database)
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0],
      createdAt: new Date(),
    }

    this.currentUser = user
    this.saveUser(user)

    return { success: true }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation
    if (!email || !password || !name) {
      return { success: false, error: "Todos los campos son requeridos" }
    }

    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
    }

    // Create user
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date(),
    }

    this.currentUser = user
    this.saveUser(user)

    return { success: true }
  }

  logout(): void {
    this.currentUser = null
    this.clearUser()
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}
