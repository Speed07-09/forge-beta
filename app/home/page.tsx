'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../components/AuthGuard'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Habit } from '../types'
import { getTodayCompletionRate, getCurrentStreak } from '../lib/metricsCalculator'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LatestPlan {
  content: string
  created_at: string
}

// ─── Circular Progress SVG ────────────────────────────────────────────────────

function CircularProgress({ percent }: { percent: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (percent / 100) * circumference

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx="48" cy="48" r={radius}
        fill="none"
        stroke="var(--color-surface-high)"
        strokeWidth="8"
      />
      {/* Progress */}
      <circle
        cx="48" cy="48" r={radius}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-container)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const PLACEHOLDER_HEIGHTS = [45, 60, 88, 72, 55, 38, 50]

function WeeklyChart({ bars = PLACEHOLDER_HEIGHTS }: { bars?: number[] }) {
  const max = Math.max(...bars)
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const peakIdx = bars.indexOf(Math.max(...bars))

  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {bars.map((h, i) => {
        const pct = max > 0 ? (h / max) * 100 : 0
        const isToday = i === todayIdx
        const isPeak = i === peakIdx
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            {isPeak && (
              <span className="text-[8px] font-semibold text-secondary">▲</span>
            )}
            <div
              className={`w-full rounded-t-sm transition-all duration-700 ease-out ${
                isToday ? 'lit-gradient' : isPeak ? 'bg-secondary/40' : 'bg-surface-high'
              }`}
              style={{
                height: `${Math.max(pct, 8)}%`,
                minHeight: '6px',
              }}
            />
            <span className={`text-[9px] font-medium ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
              {DAYS[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Home Content ─────────────────────────────────────────────────────────────

function HomeContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // ── State ──
  const [username, setUsername] = useState<string | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [allHabitsCount, setAllHabitsCount] = useState(0)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [todayRate, setTodayRate] = useState(0)
  const [latestPlan, setLatestPlan] = useState<LatestPlan | null>(null)
  const [daysElapsed, setDaysElapsed] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const togglingRef = useRef<Set<string>>(new Set())

  const today = new Date().toISOString().split('T')[0]

  // ── Data Fetching ──
  useEffect(() => {
    if (!user) return

    async function loadAll() {
      try {
        // Profile / username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user!.id)
          .single()

        if (profile?.username) setUsername(profile.username)
        else setUsername(user!.email?.split('@')[0] ?? null)

        // Habits: first 5 for display, total count
        const [
          { data: habitsData },
          { data: allHabitsData },
          { data: completionsData },
          { data: planData },
          streakVal,
          rateVal,
        ] = await Promise.all([
          supabase
            .from('habits')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: true })
            .limit(5),
          supabase
            .from('habits')
            .select('id', { count: 'exact', head: false })
            .eq('user_id', user!.id),
          supabase
            .from('habit_completions')
            .select('habit_id')
            .eq('user_id', user!.id)
            .eq('completed_date', today),
          supabase
            .from('plans')
            .select('content, created_at')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          getCurrentStreak(user!.id),
          getTodayCompletionRate(user!.id),
        ])

        setHabits((habitsData as Habit[]) ?? [])
        setAllHabitsCount(allHabitsData?.length ?? 0)
        setCompletedIds(completionsData?.map((c: { habit_id: string }) => c.habit_id) ?? [])
        setCurrentStreak(streakVal)
        setTodayRate(rateVal)

        if (planData) {
          setLatestPlan(planData)
          const elapsed = Math.floor((Date.now() - new Date(planData.created_at).getTime()) / 86400000)
          setDaysElapsed(Math.min(elapsed, 30))
        }
      } catch {
        // Silent — no plans / habits yet is a valid state
      } finally {
        setLoaded(true)
      }
    }

    loadAll()
  }, [user, today])

  // ── Toggle Habit Completion ──
  const handleToggle = useCallback(async (habitId: string) => {
    if (togglingRef.current.has(habitId)) return
    togglingRef.current.add(habitId)

    const wasCompleted = completedIds.includes(habitId)
    setCompletedIds(prev => wasCompleted ? prev.filter(id => id !== habitId) : [...prev, habitId])

    try {
      if (wasCompleted) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', user!.id)
          .eq('completed_date', today)
      } else {
        await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: user!.id,
          completed_date: today,
        })
      }
      const [newStreak, newRate] = await Promise.all([
        getCurrentStreak(user!.id),
        getTodayCompletionRate(user!.id),
      ])
      setCurrentStreak(newStreak)
      setTodayRate(newRate)
    } catch {
      // Rollback
      setCompletedIds(prev => wasCompleted ? [...prev, habitId] : prev.filter(id => id !== habitId))
    } finally {
      setTimeout(() => togglingRef.current.delete(habitId), 300)
    }
  }, [completedIds, today, user])

  // ── Derived Metrics ──
  const completionPercentage = todayRate
  const completedToday = completedIds.filter(id => habits.some(h => h.id === id)).length
  const daysRemaining = Math.max(0, 30 - daysElapsed)
  const displayName = username || user?.email?.split('@')[0] || 'User'

  // Status label based on completion
  const statusLabel = completionPercentage >= 80
    ? 'Peak Mode'
    : completionPercentage >= 50
    ? 'Efficiency'
    : completionPercentage >= 20
    ? 'Building'
    : 'Starting Up'

  if (!loaded && isLoading) {
    return (
      <div className="min-h-screen bg-surface-lowest flex items-center justify-center">
        <div className="flex gap-2">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-lowest font-body">

      {/* ── Fixed Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[88px] flex items-center justify-between px-6 glass-panel border-b border-outline-variant transition-all">
        <span className="text-sm font-bold tracking-[0.25em] text-on-surface uppercase select-none">
          FORGE
        </span>
        <button
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-high transition-all duration-200"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span>
        </button>
      </header>

      {/* ── Main Scroll Area ── */}
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-6 pb-40">

        {/* ── Greeting ── */}
        <section style={{ animation: 'fadeInUp 280ms ease-out both' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-1.5">
            Evolve your potentiality
          </p>
          {!isLoading && user && (
            <h2 className="text-[2rem] font-bold text-on-surface leading-tight font-headline">
              Welcome back, {displayName}
            </h2>
          )}
        </section>

        {/* ── CTA Card: Generate Plan ── */}
        <section style={{ animation: 'fadeInUp 280ms ease-out 80ms both' }}>
          <div className="relative rounded-2xl overflow-hidden bg-surface-low ghost-border animate-glow-pulse halo-glow">
            <div className="relative p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-3">30-Day Program</p>
              {latestPlan ? (
                <>
                  <h3 className="text-xl font-bold text-on-surface leading-snug mb-1 font-headline">
                    {displayName}&apos;s
                  </h3>
                  <h3 className="text-xl font-bold text-primary leading-snug mb-6 font-headline">
                    30 Day Journey
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed line-clamp-2">
                    {latestPlan.content.replace(/#+\s/g, '').replace(/\*/g, '').trim().slice(0, 120)}…
                  </p>
                  <button
                    onClick={() => router.push('/plans')}
                    className="flex items-center justify-center w-full gap-2 lit-gradient text-background text-[15px] font-bold px-6 py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    View / Regenerate Plan
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-on-surface leading-snug mb-1 font-headline">
                    Generate Your Personalized
                  </h3>
                  <h3 className="text-xl font-bold text-primary leading-snug mb-6 font-headline">
                    30-Day Plan
                  </h3>
                  <button
                    onClick={() => router.push('/plans')}
                    className="flex items-center justify-center w-full gap-2 lit-gradient text-background text-[15px] font-bold px-6 py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Generate Plan
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Bento Row: Progress Tracker + Today's Tasks ── */}
        <div
          className="grid grid-cols-2 gap-4"
          style={{ animation: 'fadeInUp 280ms ease-out 160ms both' }}
        >

          {/* Progress Tracker */}
          <div className="rounded-2xl p-5 flex flex-col items-center bg-surface-low ghost-border">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mb-4 self-start">
              Progress
            </p>

            {/* Circular progress */}
            <div className="relative mb-4">
              <CircularProgress percent={completionPercentage} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-on-surface font-headline">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary mb-4">
              Status: {statusLabel}
            </p>

            {/* Progress bars */}
            <div className="w-full space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-1 rounded-full bg-surface-high overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${i === 0 ? 'lit-gradient' : i === 1 ? 'bg-secondary/60' : 'bg-surface-high'}`}
                    style={{
                      width: i === 0
                        ? `${Math.min(completionPercentage * 1.4, 100)}%`
                        : i === 1
                        ? `${Math.min(completionPercentage * 0.9, 100)}%`
                        : `${Math.min(completionPercentage * 0.5, 100)}%`,
                    }}
                  />
                </div>
              ))}
            </div>

            <p className="text-[11px] text-on-surface-variant mt-4 text-center leading-tight">
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : latestPlan
                ? 'Cycle complete!'
                : 'No active cycle'}
              {latestPlan && daysRemaining > 0 && <><br />Alpha Cycle</>}
            </p>
          </div>

          {/* Today's Tasks */}
          <div className="rounded-2xl p-5 flex flex-col bg-surface-low ghost-border">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">
              Mission Control
            </p>
            <h4 className="text-[15px] font-bold text-on-surface mb-4 font-headline">
              Today's Tasks
            </h4>

            {/* Badge */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex items-center gap-1.5 bg-secondary-container rounded-full px-2.5 py-1 ghost-border">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                  {completedToday} / {habits.length || allHabitsCount} Done
                </span>
              </div>
            </div>

            {/* Task list */}
            {habits.length === 0 ? (
              <p className="text-sm text-on-surface-variant leading-relaxed flex-1 flex items-center">
                No tasks yet. Generate a plan to get started!
              </p>
            ) : (
              <div className="space-y-2 flex-1">
                {habits.slice(0, 4).map((habit, idx) => {
                  const done = completedIds.includes(habit.id)
                  const isActive = !done && habits.filter(h => !completedIds.includes(h.id))[0]?.id === habit.id
                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleToggle(habit.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
                        isActive
                          ? 'bg-surface-high ghost-border shadow-md'
                          : 'hover:bg-surface-high'
                      }`}
                    >
                      {/* Check icon */}
                      <div
                        className={`relative w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                          done
                            ? 'bg-secondary border-secondary'
                            : isActive
                            ? 'border-primary bg-primary/10'
                            : 'border-outline hover:border-outline-variant'
                        }`}
                      >
                        {isActive && !done && (
                          <div className="absolute mx-auto w-1.5 h-1.5 rounded-full bg-primary animate-atmospheric-pulse" />
                        )}
                        {done && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1.5 4L3.5 6L8.5 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium leading-tight truncate ${
                          done
                            ? 'text-on-surface-variant line-through'
                            : isActive
                            ? 'text-primary'
                            : 'text-on-surface'
                        }`}
                      >
                        {habit.habit_name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {habits.length > 0 && (
              <button
                onClick={() => router.push('/tracker')}
                className="mt-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                View all →
              </button>
            )}
          </div>
        </div>

        {/* ── Weekly Chart: Energy Variance ── */}
        <section
          className="rounded-2xl p-6 bg-surface-low ghost-border"
          style={{
            animation: 'fadeInUp 280ms ease-out 240ms both',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mb-1">Weekly Overview</p>
              <h4 className="text-[17px] font-bold text-on-surface font-headline">Energy Variance</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Peak</span>
            </div>
          </div>
          <WeeklyChart />
        </section>

        {/* ── Streak Banner ── */}
        {currentStreak > 0 && (
          <section
            className="rounded-2xl p-5 flex items-center gap-5 ghost-border glass-panel"
            style={{
              animation: 'fadeInUp 280ms ease-out 320ms both',
            }}
          >
            <div className="w-12 h-12 rounded-[14px] bg-primary/10 ghost-border flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary drop-shadow-[0_0_8px_rgba(192,193,255,0.6)]" style={{ fontSize: '24px' }}>local_fire_department</span>
            </div>
            <div>
              <p className="text-[15px] font-bold text-on-surface">{currentStreak} Day Streak 🔥</p>
              <p className="text-[12px] text-on-surface-variant">Keep the momentum going</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-primary font-headline">
                {currentStreak}
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">days</p>
            </div>
          </section>
        )}

      </main>

      {/* ── FAB ── */}
      <button
        onClick={() => router.push('/tracker')}
        aria-label="Open tracker"
        className="fixed right-6 w-14 h-14 rounded-full flex items-center justify-center ambient-shadow lit-gradient transition-all duration-300 hover:scale-110 active:scale-95 z-40"
        style={{ bottom: 'calc(88px + env(safe-area-inset-bottom) + 16px)' }}
      >
        <span className="material-symbols-outlined text-background font-bold" style={{ fontSize: '26px', fontVariationSettings: "'wght' 600" }}>add</span>
      </button>

      {/* Bottom nav handled by ConditionalBottomNav in layout.tsx */}

    </div>
  )
}

// ─── Page Export ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  )
}
