// lib/server-auth.ts - NUEVA UTILIDAD PARA EL SERVIDOR
import jwt, { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export interface ServerUser {
  id: string
  email: string
  name: string
  createdAt: Date
}

// Tipo del payload JWT esperado
interface JwtUserPayload extends JwtPayload {
  user: ServerUser
}

export class ServerAuth {
  static verifyToken(token: string): ServerUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload
      return decoded.user ?? null
    } catch {
      return null
    }
  }

  static getUserFromRequest(request: Request): ServerUser | null {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const token = authHeader.replace('Bearer ', '')
    return this.verifyToken(token)
  }
}
