"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, Sparkles, Archive, Settings } from "lucide-react"
import { useEffect, useState } from "react"

const navItems = [
  {
    icon: Home,
    label: "Home",
    href: "/home",
  },
  {
    icon: CheckSquare,
    label: "Tracker",
    href: "/tracker",
  },
  {
    icon: Sparkles,
    label: "Plans",
    href: "/plans",
  },
  {
    icon: Archive,
    label: "Vault",
    href: "/vault",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-outline-variant" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-[88px] max-w-lg mx-auto px-6 pb-4">
          {/* Render placeholder to maintain layout */}
        </div>
      </nav>
    )
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-outline-variant"
      role="navigation"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[88px] max-w-lg mx-auto px-6 pb-4 pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/home" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] gap-1.5 transition-all duration-300 ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center h-8 w-8 transition-transform duration-300">
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_12px_rgba(192,193,255,0.4)] text-primary' : 'scale-100 text-on-surface-variant'}`} 
                  strokeWidth={2}
                  fill={isActive ? "currentColor" : "none"}
                />
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontFamily: 'Manrope, sans-serif' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}