'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/app/lib/adminCheck'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function checkAdmin() {
            try {
                const admin = await isAdmin()
                if (!admin) {
                    router.replace('/home')
                } else {
                    setAuthorized(true)
                }
            } catch {
                router.replace('/home')
            } finally {
                setLoading(false)
            }
        }
        checkAdmin()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
                <div
                    className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-blue-500"
                    style={{ animation: 'adminguard-spin 0.7s linear infinite' }}
                    aria-label="Verifying access"
                    role="status"
                />
                <style>{`@keyframes adminguard-spin { to { transform: rotate(360deg); } }`}</style>
                <p className="text-zinc-500 text-sm">Verifying access…</p>
            </div>
        )
    }

    if (!authorized) return null

    return <>{children}</>
}
