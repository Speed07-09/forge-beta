"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, Sparkles, Settings } from "lucide-react"
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[88px] bg-[#0A0F1C]/90 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around h-full max-w-lg mx-auto px-6 pb-4">
          {/* Render placeholder to maintain layout */}
        </div>
      </nav>
    )
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[88px] bg-[#0A0F1C]/90 backdrop-blur-xl border-t border-white/5"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-6 pb-4 pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/home" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] gap-1.5 transition-all duration-300 ${
                isActive ? "text-action" : "text-text-secondary hover:text-white"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center h-8 w-8 transition-transform duration-300">
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'} ${isActive ? 'text-action' : 'text-text-secondary'}`} 
                  strokeWidth={2}
                  fill={isActive ? "currentColor" : "none"}
                />
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-action' : 'text-text-secondary'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}