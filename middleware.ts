import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            req.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            req.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Add 3-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), 3000)
    )

    const sessionPromise = supabase.auth.getSession()

    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise,
    ]) as any

    const isAuthRoute = req.nextUrl.pathname.startsWith('/signin') ||
                        req.nextUrl.pathname.startsWith('/signup') ||
                        req.nextUrl.pathname.startsWith('/auth/callback')

    const isPublicRoute = req.nextUrl.pathname === '/' ||
                          req.nextUrl.pathname.startsWith('/privacy') ||
                          req.nextUrl.pathname.startsWith('/terms')

    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    if (!session && !isAuthRoute && !isPublicRoute) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    return response

  } catch (error) {
    console.error('[Middleware] Error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}