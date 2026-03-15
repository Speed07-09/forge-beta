'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from './BottomNav'
import { useEffect, useState } from 'react'

// Pages where bottom nav should NOT appear
const EXCLUDED_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/onboarding',
  '/auth/callback',
  '/privacy',
  '/terms',
  '/admin',
]

export function ConditionalBottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render anything on server (prevents hydration mismatch)
  if (!mounted) {
    return null
  }
  
  // Don't show on excluded routes
  if (EXCLUDED_ROUTES.includes(pathname)) {
    return null
  }
  
  // Don't show on auth routes
  if (pathname.startsWith('/auth/')) {
    return null
  }
  
  // Show on all authenticated pages
  return <BottomNav />
}