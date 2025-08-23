// lib/auth-mongo.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from './mongodb'
import { User, type UserDoc } from './models'
import { HydratedDocument } from 'mongoose'

export interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
}

// Definir payload del JWT
interface JwtPayload {
  user: AuthUser
  iat: number
  exp: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const AUTH_STORAGE_KEY = "notion-clone-auth"

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null

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
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
        this.currentUser = decoded.user
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

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      await dbConnect()

      const user: HydratedDocument<UserDoc> | null = await User.findOne({ email })

      if (!user) {
        return { success: false, error: "Credenciales inválidas" }
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return { success: false, error: "Credenciales inválidas" }
      }

      const userForToken: AuthUser = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }

      const token = jwt.sign({ user: userForToken }, JWT_SECRET, { expiresIn: '7d' })

      this.currentUser = userForToken
      this.saveToken(token)

      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      await dbConnect()

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return { success: false, error: "Este email ya está registrado" }
      }

      if (!email || !password || !name) {
        return { success: false, error: "Todos los campos son requeridos" }
      }

      if (password.length < 6) {
        return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = new User({
        email,
        password: hashedPassword,
        name
      })

      const savedUser: HydratedDocument<UserDoc> = await newUser.save()

      const userForToken: AuthUser = {
        id: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name,
        createdAt: savedUser.createdAt
      }

      const token = jwt.sign({ user: userForToken }, JWT_SECRET, { expiresIn: '7d' })

      this.currentUser = userForToken
      this.saveToken(token)

      return { success: true }
    } catch (error) {
      console.error('Error en register:', error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  logout(): void {
    this.currentUser = null
    this.clearToken()
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
      return decoded.user
    } catch {
      return null
    }
  }
}
