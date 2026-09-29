import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Solo proteger las rutas que empiecen con /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    // La contraseña por defecto es "admin" y "admin"
    // Puedes cambiarlos en tus variables de entorno en Vercel
    const user = process.env.ADMIN_USER || 'admin';
    const pwd = process.env.ADMIN_PASSWORD || 'admin';

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [providedUser, providedPwd] = atob(authValue).split(':');

      if (providedUser === user && providedPwd === pwd) {
        return NextResponse.next();
      }
    }

    // Si no hay credenciales o son incorrectas, mostrar el prompt nativo del navegador
    return new NextResponse('Autenticación Requerida', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Panel de Administración Seguro"',
      },
    });
  }

  return NextResponse.next();
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
