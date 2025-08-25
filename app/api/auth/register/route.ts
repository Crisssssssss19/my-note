import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'
import { MongoDatabase } from '@/lib/database-mongo'

const JWT_SECRET = process.env.JWT_SECRET as string

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    await dbConnect()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Todos los campos son requeridos" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Este email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const savedUser = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim()
    })

    const userForToken = {
      id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt
    }

    const token = jwt.sign({ user: userForToken }, JWT_SECRET, { expiresIn: '7d' })

    // Inicializar workspace en background
    MongoDatabase.getInstance()
      .initializeUserWorkspace(savedUser._id.toString(), savedUser.name)
      .catch(err => console.error("Error initializing workspace:", err))

    return NextResponse.json({ success: true, token, user: userForToken })
  } catch (error) {
    console.error('Error en register:', error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
