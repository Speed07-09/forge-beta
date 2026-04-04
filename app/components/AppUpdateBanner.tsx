'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Shows a top banner when a new service worker is installed and waiting.
 * Reload applies the update (skipWaiting + controllerchange + full reload).
 */
export default function AppUpdateBanner() {
  const [visible, setVisible] = useState(false)
  const [reloading, setReloading] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  const applyUpdate = useCallback(() => {
    const reg = registrationRef.current
    if (!reg?.waiting) {
      window.location.reload()
      return
    }
    setReloading(true)
    const fallback = window.setTimeout(() => {
      window.location.reload()
    }, 10000)
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        window.clearTimeout(fallback)
        window.location.reload()
      },
      { once: true }
    )
    reg.waiting.postMessage({ type: 'SKIP_WAITING' })
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let interval: ReturnType<typeof setInterval> | undefined

    const attachUpdateListener = (reg: ServiceWorkerRegistration) => {
      registrationRef.current = reg

      if (reg.waiting) {
        setVisible(true)
      }

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (
            worker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setVisible(true)
          }
        })
      })
    }

    navigator.serviceWorker.ready.then((reg) => {
      attachUpdateListener(reg)
      reg.update().catch(() => {})
      interval = setInterval(() => {
        reg.update().catch(() => {})
      }, 60 * 60 * 1000)
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.ready
          .then((reg) => reg.update())
          .catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      if (interval) clearInterval(interval)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[110] flex items-center justify-center gap-3 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))] border-b border-outline-variant bg-surface-low/95 backdrop-blur-md shadow-lg font-body"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium text-on-surface text-center sm:text-left">
        A new version of FORGE is available.
      </span>
      <button
        type="button"
        onClick={applyUpdate}
        disabled={reloading}
        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide lit-gradient text-background disabled:opacity-60 active:scale-95 transition-transform"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${reloading ? 'animate-spin' : ''}`}
          aria-hidden
        />
        {reloading ? 'Updating…' : 'Reload'}
      </button>
    </div>
  )
}
