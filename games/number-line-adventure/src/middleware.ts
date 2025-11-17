import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for the Number Line Adventure app
 *
 * Note: Authentication is now optional. Users can play without signing in,
 * but progress will only be saved locally. Signing in enables cloud sync.
 *
 * Only /profile requires authentication (redirects to auth page).
 * /game and /levels are now accessible to everyone.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect the profile page
  if (pathname.startsWith('/profile')) {
    const sessionCookie = request.cookies.get('sb-access-token')

    if (!sessionCookie) {
      const authUrl = new URL('/auth', request.url)
      authUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(authUrl)
    }
  }

  // Allow access to all other routes
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
