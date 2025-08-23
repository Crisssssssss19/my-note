// app/api/pages/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { AuthService } from '@/lib/auth-mongo'

function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  return AuthService.verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ pages: [] })
    }
    
    const db = MongoDatabase.getInstance()
    const pages = await db.searchPages(query, user.id)
    
    return NextResponse.json({ pages })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}