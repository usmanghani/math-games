import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to protect routes that require authentication
 *
 * Protected routes:
 * - /profile
 * - /levels
 * - /game (future)
 *
 * Public routes:
 * - /
 * - /auth/*
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/profile', '/levels', '/game']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Check for authentication cookie/session
  // Note: In a full implementation, you would verify the session with Supabase
  // For now, we'll do basic cookie check
  const sessionCookie = request.cookies.get('sb-access-token')

  // If no session and trying to access protected route, redirect to auth
  if (!sessionCookie && isProtectedRoute) {
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(authUrl)
  }

  // Allow access
  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*$).*)',
  ],
}
