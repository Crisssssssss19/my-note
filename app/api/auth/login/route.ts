// app/api/auth/login/route.ts - CORREGIDO
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'
import { MongoDatabase } from '@/lib/database-mongo'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Validación básica
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Email y contraseña son requeridos" 
      }, { status: 400 })
    }

    await dbConnect()

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean()
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Credenciales inválidas" 
      }, { status: 401 })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: "Credenciales inválidas" 
      }, { status: 401 })
    }

    // Crear token JWT
    const userForToken = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }

    const token = jwt.sign({ user: userForToken }, JWT_SECRET, { expiresIn: '7d' })

    // Devolver el token para que el cliente lo guarde
    return NextResponse.json({ 
      success: true, 
      token,
      user: userForToken
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}