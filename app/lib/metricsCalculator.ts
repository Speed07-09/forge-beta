import { supabase } from './supabase'

/**
 * Total number of habit completions ever recorded for this user.
 */
export async function getTotalCompleted(userId: string): Promise<number> {
    const { count } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    return count ?? 0
}

/**
 * Number of consecutive days (ending today) on which the user completed
 * at least one habit.  Returns 0 if today has no completions.
 */
export async function getCurrentStreak(userId: string): Promise<number> {
    const { data } = await supabase
        .from('habit_completions')
        .select('completed_date')
        .eq('user_id', userId)
        .order('completed_date', { ascending: false })

    if (!data || data.length === 0) return 0

    // Deduplicate dates and sort descending
    const uniqueDates = [...new Set(data.map((d) => d.completed_date))].sort(
        (a, b) => b.localeCompare(a)
    )

    // Walk backwards from today; break as soon as a day is missing
    let streak = 0
    const todayUTC = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    for (let i = 0; i < uniqueDates.length; i++) {
        const expected = offsetDate(todayUTC, -i)
        if (uniqueDates[i] === expected) {
            streak++
        } else {
            break
        }
    }

    return streak
}

/**
 * Percentage of today's habits that have been completed (0–100).
 */
export async function getTodayCompletionRate(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]

    const [{ count: totalHabits }, { count: completedToday }] = await Promise.all([
        supabase
            .from('habits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
        supabase
            .from('habit_completions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('completed_date', today),
    ])

    if (!totalHabits || totalHabits === 0) return 0
    return Math.round(((completedToday ?? 0) / totalHabits) * 100)
}

/**
 * Number of days elapsed since the user's first habit was created, capped at 30.
 */
export async function get30DayProgress(userId: string): Promise<number> {
    const { data } = await supabase
        .from('habits')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (!data) return 0

    const startDate = new Date(data.created_at)
    const today = new Date()
    const daysPassed = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return Math.min(Math.max(daysPassed, 0), 30)
}

// ─── Helper ─────────────────────────────────────────────────────────────────

/**
 * Returns a YYYY-MM-DD string for `base` offset by `days`.
 */
function offsetDate(base: string, days: number): string {
    const d = new Date(base + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().split('T')[0]
}
