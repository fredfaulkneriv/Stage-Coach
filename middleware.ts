import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth API through without checking session
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    // If already authenticated and hitting /login, redirect home
    if (pathname === '/login') {
      const session = request.cookies.get('sc-session')?.value
      const secret = process.env.SESSION_SECRET
      if (secret && session === secret) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    return NextResponse.next()
  }

  // Check session cookie
  const session = request.cookies.get('sc-session')?.value
  const secret = process.env.SESSION_SECRET

  if (!secret || session !== secret) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static public assets
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)',
  ],
}
