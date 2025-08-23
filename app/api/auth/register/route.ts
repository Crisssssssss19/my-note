
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'
import { MongoDatabase } from '@/lib/database-mongo'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    await dbConnect()

    // Validaciones
    if (!email || !password || !name) {
      return NextResponse.json({ 
        success: false, 
        error: "Todos los campos son requeridos" 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: "La contraseña debe tener al menos 6 caracteres" 
      }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Este email ya está registrado" 
      }, { status: 400 })
    }

    // Hash de la contraseña
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crear usuario
    const newUser = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim()
    })

    const savedUser = await newUser.save()

    // Crear token JWT
    const userForToken = {
      id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt
    }

    const token = jwt.sign({ user: userForToken }, JWT_SECRET, { expiresIn: '7d' })

    // Inicializar workspace del usuario
    try {
      const db = MongoDatabase.getInstance()
      await db.initializeUserWorkspace(savedUser._id.toString(), savedUser.name)
    } catch (initError) {
      console.error('Error initializing workspace:', initError)
      // No fallar el registro si esto falla
    }

    // Devolver el token para que el cliente lo guarde
    return NextResponse.json({ 
      success: true, 
      token,
      user: userForToken
    })
  } catch (error) {
    console.error('Error en register:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}