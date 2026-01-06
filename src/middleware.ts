/**
 * Next.js Middleware
 *
 * Runs on every request to:
 * 1. Refresh auth session (keeps users logged in)
 * 2. Protect dashboard routes (redirect to login if not authenticated)
 * 3. Redirect authenticated users away from auth pages
 *
 * iOS Comparison: Like AppDelegate's application(_:didFinishLaunching:)
 * or a custom URLProtocol that intercepts requests.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const protectedRoutes = ['/today', '/week', '/month', '/quarter', '/review']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // Refresh the auth session
  const { supabaseResponse, user } = await updateSession(request)

  const path = request.nextUrl.pathname

  // Check if accessing a protected route without authentication
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path) // Remember where they wanted to go
    return NextResponse.redirect(loginUrl)
  }

  // Check if accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/today', request.url))
  }

  return supabaseResponse
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
