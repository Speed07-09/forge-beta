'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, X } from 'lucide-react'
import { isBottomNavVisible } from '@/app/lib/bottomNavRoutes'

const SESSION_DISMISS_KEY = 'forge-pwa-install-dismissed-session'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return true
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isWebkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIOS && isWebkit
}

export default function InstallPrompt() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  const bottomOffset = isBottomNavVisible(pathname)
    ? 'calc(88px + env(safe-area-inset-bottom, 0px) + 12px)'
    : 'calc(20px + env(safe-area-inset-bottom, 0px))'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_DISMISS_KEY)) return
    if (isStandalonePWA()) return

    setVisible(true)

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setVisible(false)
    }

    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [mounted])

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
    setVisible(false)
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return
    setInstalling(true)
    try {
      await deferred.prompt()
      await deferred.userChoice
    } catch {
      // ignore
    } finally {
      setDeferred(null)
      setInstalling(false)
    }
  }, [deferred])

  if (!mounted || !visible) return null

  const subtitle = deferred
    ? 'Add FORGE to your home screen for quick access and a full-screen experience.'
    : isIosSafari()
      ? 'Tap Share, then “Add to Home Screen” to install FORGE.'
      : 'In Chrome: tap the menu (⋮) and choose “Install app” or “Add to Home screen”.'

  return (
    <div
      className="fixed left-3 right-3 z-[100] max-w-lg mx-auto flex gap-3 items-center rounded-2xl border border-outline-variant bg-surface-low/95 backdrop-blur-md px-4 py-3 shadow-lg font-body"
      style={{ bottom: bottomOffset }}
      role="region"
      aria-label="Install FORGE app"
    >
      <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Download className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-on-surface tracking-wide">Install FORGE</p>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {deferred ? (
          <button
            type="button"
            onClick={install}
            disabled={installing}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide lit-gradient text-background disabled:opacity-50 active:scale-95 transition-transform"
          >
            {installing ? '…' : 'Install'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-high transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
