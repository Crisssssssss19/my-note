import { NextRequest, NextResponse } from 'next/server'
import { MongoDatabase } from '@/lib/database-mongo'
import { AuthService } from '@/lib/auth-mongo'

function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  return AuthService.verifyToken(token)
}

export async function DELETE(request: NextRequest, { params }: { params: { shareId: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const db = MongoDatabase.getInstance()
    await db.revokeShare(params.shareId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}