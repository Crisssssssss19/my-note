// app/api/pages/[id]/route.ts - CORREGIDO
import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { ServerAuth } from '@/lib/server-auth'

// GET single page
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = ServerAuth.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const db = MongoDatabase.getInstance()
    const page = await db.getPage(params.id, user.id)
    
    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error in GET /api/pages/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT update page
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = ServerAuth.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const updates = await request.json()
    
    const db = MongoDatabase.getInstance()
    await db.updatePage(params.id, updates, user.id, user.name)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/pages/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE page
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = ServerAuth.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const db = MongoDatabase.getInstance()
    await db.deletePage(params.id, user.id, user.name)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/pages/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}