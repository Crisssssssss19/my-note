// app/api/pages/search/route.ts - CORREGIDO
import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { ServerAuth } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const user = ServerAuth.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ pages: [] })
    }
    
    const db = MongoDatabase.getInstance()
    const pages = await db.searchPages(query, user.id)
    
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error in GET /api/pages/search:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}