import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { AuthService } from '@/lib/auth-mongo'

function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  return AuthService.verifyToken(token)
}

// GET shared pages
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const db = MongoDatabase.getInstance()
    const sharedPages = await db.getSharedPages(user.id)
    
    return NextResponse.json({ sharedPages })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST share page
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { pageId, permissions } = await request.json()
    
    const db = MongoDatabase.getInstance()
    const sharedPage = await db.sharePage(pageId, permissions, user.id, user.name)
    
    return NextResponse.json({ sharedPage })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 