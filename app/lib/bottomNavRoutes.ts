/** Routes where the bottom navigation bar is hidden (see ConditionalBottomNav). */
export const BOTTOM_NAV_EXCLUDED_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/onboarding',
  '/auth/callback',
  '/privacy',
  '/terms',
  '/admin',
  '/plans',
] as const

export function isBottomNavExcluded(pathname: string): boolean {
  if ((BOTTOM_NAV_EXCLUDED_ROUTES as readonly string[]).includes(pathname)) return true
  if (pathname.startsWith('/auth/')) return true
  return false
}

export function isBottomNavVisible(pathname: string | null): boolean {
  if (!pathname) return false
  return !isBottomNavExcluded(pathname)
}
