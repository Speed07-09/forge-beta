import { supabase } from './supabase'

// Admin email - server-side check only
const ADMIN_EMAIL = 'trentspeed07@gmail.com'

export async function isAdmin(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false
        return user.email === ADMIN_EMAIL
    } catch {
        return false
    }
}

export async function requireAdmin(): Promise<void> {
    const admin = await isAdmin()
    if (!admin) {
        throw new Error('Unauthorized: Admin access required')
    }
}
