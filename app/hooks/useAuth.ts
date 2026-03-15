'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UseAuthReturn {
    user: User | null
    isLoading: boolean
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)
            } catch (err) {
                console.error('Failed to get session:', err)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        getInitialSession()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                setIsLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            router.replace('/signin')
        } catch (err) {
            console.error('Sign out failed:', err)
            // Force redirect even on error
            router.replace('/signin')
        }
    }, [router])

    const refreshSession = useCallback(async () => {
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession()
            if (error) {
                console.error('Session refresh failed:', error)
                return
            }
            setUser(session?.user ?? null)
        } catch (err) {
            console.error('Session refresh failed:', err)
        }
    }, [])

    return { user, isLoading, signOut, refreshSession }
}
