'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

interface AuthGuardProps {
    children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    setIsAuthenticated(true)
                } else {
                    router.replace('/signin')
                }
            } catch (err) {
                console.error('Auth check failed:', err)
                router.replace('/signin')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()

        // Listen for auth state changes (e.g., sign out in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!session) {
                    router.replace('/signin')
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                {/* Dark-themed ring spinner */}
                <div
                    className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-white"
                    style={{ animation: 'authguard-spin 0.7s linear infinite' }}
                    aria-label="Loading"
                    role="status"
                />
                <style>{`@keyframes authguard-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
