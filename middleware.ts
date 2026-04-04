import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Preserve refreshed auth cookies when returning a redirect (e.g. sign-in). */
function copyAuthCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      expires: cookie.expires,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      partitioned: cookie.partitioned,
      priority: cookie.priority,
    })
  })
}

export async function middleware(req: NextRequest) {
  // PWA assets must never run auth (logged-out users get HTML redirect → broken SW/manifest on Android Chrome).
  const p = req.nextUrl.pathname
  if (p === '/sw.js' || p === '/manifest.json') {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // RequestCookies in middleware only accepts name + value; options go on the response.
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Validates JWT with Supabase and refreshes cookies (unlike getSession, which can read stale cookies only).
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[Middleware] getUser:', error.message)
  }

  const isAuthRoute =
    req.nextUrl.pathname.startsWith('/signin') ||
    req.nextUrl.pathname.startsWith('/signup') ||
    req.nextUrl.pathname.startsWith('/auth/callback')

  const isPublicRoute =
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname.startsWith('/privacy') ||
    req.nextUrl.pathname.startsWith('/terms') ||
    req.nextUrl.pathname.startsWith('/onboarding')

  if (user && isAuthRoute) {
    const redirect = NextResponse.redirect(new URL('/home', req.url))
    copyAuthCookies(response, redirect)
    return redirect
  }

  if (!user && !isAuthRoute && !isPublicRoute) {
    const redirect = NextResponse.redirect(new URL('/signin', req.url))
    copyAuthCookies(response, redirect)
    return redirect
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
