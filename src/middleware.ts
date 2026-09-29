import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Solo proteger las rutas que empiecen con /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const session = req.cookies.get('admin_session');

    // Si no tiene la cookie de sesión, lo mandamos al login nuevo
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: ['/admin/:path*'],
};

