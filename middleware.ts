// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { ServerAuth } from '@/lib/server-auth'

export function middleware(request: NextRequest) {
  // Solo proteger rutas API que requieren autenticación
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/')) {
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const user = ServerAuth.verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Token de acceso inválido o expirado' },
        { status: 401 }
      )
    }

    // Agregar información del usuario a los headers para las rutas API
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-name', user.name)
    requestHeaders.set('x-user-email', user.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

// 👇 Esto siempre va al final
export const config = {
  matcher: '/api/:path*'
}
