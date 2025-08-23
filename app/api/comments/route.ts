// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { AuthService } from '@/lib/auth-mongo'

function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  return AuthService.verifyToken(token)
}

// GET all comments
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const db = MongoDatabase.getInstance()
    const comments = await db.getComments(user.id)
    
    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST create comment
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { blockId, pageId, content } = await request.json()
    
    const db = MongoDatabase.getInstance()
    const comment = await db.addComment(blockId, pageId, user.id, user.name, content)
    
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
