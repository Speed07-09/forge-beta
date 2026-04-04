'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from './BottomNav'
import { useEffect, useState } from 'react'

import { isBottomNavExcluded } from '@/app/lib/bottomNavRoutes'

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
  if (isBottomNavExcluded(pathname)) {
    return null
  }
  
  // Show on all authenticated pages
  return <BottomNav />
}