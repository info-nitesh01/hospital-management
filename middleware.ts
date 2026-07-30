import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];
const IGNORED_ROUTES = ['/_next', '/api', '/favicon.ico', '/logo.png'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip ignored routes (static files, api, etc.)
  if (IGNORED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth_session');

  if (!authCookie) {
    // Build login URL with callback
    const loginUrl = new URL('/login', request.url);
    const callbackUrl = pathname + request.nextUrl.search;
    if (callbackUrl && callbackUrl !== '/') {
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
