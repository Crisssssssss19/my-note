// app/api/pages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { ServerAuth } from '@/lib/server-auth'

// GET all pages
export async function GET(request: NextRequest) {
  try {
    const user = ServerAuth.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const db = MongoDatabase.getInstance()
    const pages = await db.getAllPages(user.id)
    
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error in GET /api/pages:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST create page
export async function POST(request: NextRequest) {
  try {
    const user = ServerAuth.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { title, parentId } = await request.json()
    
    const db = MongoDatabase.getInstance()
    const page = await db.createPage(title || 'Nueva página', user.id, user.name, parentId)
    
    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error in POST /api/pages:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}