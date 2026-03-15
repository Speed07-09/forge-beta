'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminGuard from '../components/AdminGuard'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics {
    // Users
    totalUsers: number
    newUsers: number
    activeUsers: number
    // App
    totalPlans: number
    totalHabits: number
    totalCompletions: number
    avgCompletionRate: number
    // DB
    profilesCount: number
    plansCount: number
    habitsCount: number
    completionsCount: number
    // Recent users
    recentUsers: { id: string; username: string | null; created_at: string }[]
    // Status
    supabaseConnected: boolean
}

const EMPTY_METRICS: Metrics = {
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    totalPlans: 0,
    totalHabits: 0,
    totalCompletions: 0,
    avgCompletionRate: 0,
    profilesCount: 0,
    plansCount: 0,
    habitsCount: 0,
    completionsCount: 0,
    recentUsers: [],
    supabaseConnected: false,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
}

function truncateId(id: string): string {
    return id.slice(0, 8) + '…'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={`border border-zinc-800 bg-zinc-900/20 rounded-2xl p-4 md:p-6 hover:border-zinc-700 transition-colors w-full ${className}`}
        >
            {children}
        </div>
    )
}

function CardHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {children}
        </h2>
    )
}

function MetricRow({
    label,
    value,
    color = 'text-white',
    large = false,
}: {
    label: string
    value: string | number
    color?: string
    large?: boolean
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
            <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
            <span className={`font-bold ${large ? 'text-3xl md:text-4xl' : 'text-lg'} ${color}`}>
                {value}
            </span>
        </div>
    )
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function UsersCard({ m }: { m: Metrics }) {
    return (
        <Card>
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Users
            </CardHeading>
            <div className="space-y-1">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-500 mb-4">{m.totalUsers}</div>
                <MetricRow label="Total Users" value={m.totalUsers} color="text-blue-500" />
                <MetricRow label="New (7d)" value={m.newUsers} color="text-zinc-400" />
                <MetricRow label="Active (7d)" value={m.activeUsers} color="text-emerald-500" />
            </div>
        </Card>
    )
}

function AppMetricsCard({ m }: { m: Metrics }) {
    return (
        <Card>
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                App Metrics
            </CardHeading>
            <MetricRow label="Plans Generated" value={m.totalPlans} color="text-purple-500" />
            <MetricRow label="Habits Tracked" value={m.totalHabits} color="text-blue-500" />
            <MetricRow label="Total Completions" value={m.totalCompletions} color="text-emerald-500" />
            <MetricRow label="Avg Completion" value={`${m.avgCompletionRate}%`} color="text-zinc-400" />
        </Card>
    )
}

function TechStackCard() {
    const stack = [
        { label: 'Frontend', value: 'Next.js 14 (App Router)', icon: '▲' },
        { label: 'Styling', value: 'Tailwind CSS', icon: '🎨' },
        { label: 'Auth', value: 'Supabase Auth', icon: '🔐' },
        { label: 'Database', value: 'PostgreSQL (Supabase)', icon: '🗄️' },
        { label: 'AI', value: 'DeepSeek (API)', icon: '✨' },
        { label: 'Hosting', value: 'Vercel', icon: '🚀' },
        { label: 'Language', value: 'TypeScript', icon: '📘' },
    ]
    return (
        <Card>
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Tech Stack
            </CardHeading>
            <ul className="space-y-2.5">
                {stack.map(({ label, value, icon }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 flex items-center gap-2">
                            <span className="text-base">{icon}</span>
                            <span className="text-xs uppercase tracking-widest">{label}</span>
                        </span>
                        <span className="text-zinc-300 font-medium">{value}</span>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

function DatabaseCard({ m }: { m: Metrics }) {
    const tables = [
        { name: 'profiles', count: m.profilesCount, color: 'text-blue-400' },
        { name: 'plans', count: m.plansCount, color: 'text-purple-400' },
        { name: 'habits', count: m.habitsCount, color: 'text-emerald-400' },
        { name: 'habit_completions', count: m.completionsCount, color: 'text-yellow-400' },
    ]
    return (
        <Card>
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                Database
            </CardHeading>
            <div className="space-y-1 mb-5">
                {tables.map(({ name, count, color }) => (
                    <MetricRow key={name} label={name} value={count} color={color} />
                ))}
            </div>
            <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-emerald-400 transition-colors border border-zinc-800 hover:border-emerald-800 rounded-lg px-3 py-2"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View Supabase Dashboard
            </a>
        </Card>
    )
}

function SystemStatusCard({ m }: { m: Metrics }) {
    const env = process.env.NODE_ENV ?? 'unknown'
    const items = [
        {
            label: 'Supabase',
            status: m.supabaseConnected ? '🟢 Connected' : '🔴 Error',
            color: m.supabaseConnected ? 'text-emerald-400' : 'text-red-400',
        },
        { label: 'DeepSeek API', status: '🟢 Available', color: 'text-emerald-400' },
        {
            label: 'Environment',
            status: env.charAt(0).toUpperCase() + env.slice(1),
            color: env === 'production' ? 'text-blue-400' : 'text-yellow-400',
        },
        { label: 'Version', status: 'v1.0.0', color: 'text-zinc-400' },
    ]
    return (
        <Card>
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
                System Status
            </CardHeading>
            {items.map(({ label, status, color }) => (
                <MetricRow key={label} label={label} value={status} color={color} />
            ))}
        </Card>
    )
}

function RecentUsersTable({ users }: { users: Metrics['recentUsers'] }) {
    return (
        <Card className="col-span-full">
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
                Recent Users
                <span className="ml-auto text-xs font-normal text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5">{users.length}</span>
            </CardHeading>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left text-xs uppercase tracking-widest text-zinc-600 pb-3 pr-6">Username</th>
                            <th className="text-left text-xs uppercase tracking-widest text-zinc-600 pb-3 pr-6">Joined</th>
                            <th className="text-left text-xs uppercase tracking-widest text-zinc-600 pb-3">User ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-6 text-center text-zinc-600 text-sm">No users found</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors">
                                    <td className="py-3 pr-6 text-zinc-200 font-medium">
                                        {u.username ?? <span className="text-zinc-600 italic">No username</span>}
                                    </td>
                                    <td className="py-3 pr-6 text-zinc-500">{timeAgo(u.created_at)}</td>
                                    <td className="py-3 text-zinc-600 font-mono text-xs">{truncateId(u.id)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

function QuickActions() {
    return (
        <Card className="col-span-full">
            <CardHeading>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Quick Actions
            </CardHeading>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    Open Supabase
                </button>
                <button
                    onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View Logs (Vercel)
                </button>
                <button
                    onClick={() => alert('CSV export coming soon!')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Data
                </button>
            </div>
        </Card>
    )
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchMetrics(): Promise<Metrics> {
    const m = { ...EMPTY_METRICS }

    try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const sevenDaysAgoISO = sevenDaysAgo.toISOString()

        // ── Users ──────────────────────────────────────────────────────────────────
        const [
            { count: totalUsers },
            { count: newUsers },
            { data: activeData },
            { data: recentUsers },
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoISO),
            supabase.from('habit_completions').select('user_id').gte('completed_date', sevenDaysAgoISO.split('T')[0]),
            supabase.from('profiles').select('id, username, created_at').order('created_at', { ascending: false }).limit(10),
        ])

        m.totalUsers = totalUsers ?? 0
        m.newUsers = newUsers ?? 0
        m.activeUsers = new Set(activeData?.map((u: { user_id: string }) => u.user_id)).size
        m.recentUsers = (recentUsers ?? []) as Metrics['recentUsers']
        m.profilesCount = totalUsers ?? 0

        // ── App metrics ────────────────────────────────────────────────────────────
        const [
            { count: totalPlans },
            { count: totalHabits },
            { count: totalCompletions },
        ] = await Promise.all([
            supabase.from('plans').select('*', { count: 'exact', head: true }),
            supabase.from('habits').select('*', { count: 'exact', head: true }),
            supabase.from('habit_completions').select('*', { count: 'exact', head: true }),
        ])

        m.totalPlans = totalPlans ?? 0
        m.totalHabits = totalHabits ?? 0
        m.totalCompletions = totalCompletions ?? 0
        m.avgCompletionRate =
            (totalHabits ?? 0) > 0
                ? Math.min(100, Math.round(((totalCompletions ?? 0) / ((totalHabits ?? 0) * 30)) * 100))
                : 0

        m.plansCount = totalPlans ?? 0
        m.habitsCount = totalHabits ?? 0
        m.completionsCount = totalCompletions ?? 0
        m.supabaseConnected = true
    } catch (err) {
        console.error('[Admin] Error fetching metrics:', err)
        m.supabaseConnected = false
    }

    return m
}

// ─── Main content ─────────────────────────────────────────────────────────────

function AdminContent() {
    const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(false)

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(false)
        try {
            const data = await fetchMetrics()
            setMetrics(data)
        } catch {
            setError(true)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5" />

            {/* Gradient glow - top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

                {/* ── Header ─────────────────────────────────────────────────────────── */}
                <div className="flex items-start justify-between mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs text-blue-400 border border-blue-900/60 bg-blue-950/30 rounded-full px-3 py-1 mb-4">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            Admin Access
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-zinc-500 text-sm mt-2">System overview and metrics</p>
                    </div>

                    <button
                        onClick={() => load(true)}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-600 disabled:opacity-50 transition-all duration-200 text-sm font-medium shrink-0"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={refreshing ? 'animate-spin' : ''}
                        >
                            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                        </svg>
                        {refreshing ? 'Refreshing…' : 'Refresh Data'}
                    </button>
                </div>

                {/* ── Error banner ────────────────────────────────────────────────────── */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl border border-red-900/60 bg-red-950/20 text-red-400 text-sm flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Unable to fetch some metrics. Check your Supabase connection.
                    </div>
                )}

                {/* ── Loading skeleton ────────────────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-zinc-800 bg-zinc-900/10 rounded-2xl p-6 space-y-3 animate-pulse">
                                <div className="h-4 bg-zinc-800 rounded w-1/3" />
                                <div className="h-8 bg-zinc-800 rounded w-1/2" />
                                <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
                                <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* ── Main grid ────────────────────────────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <UsersCard m={metrics} />
                            <AppMetricsCard m={metrics} />
                            <TechStackCard />
                            <DatabaseCard m={metrics} />
                            <SystemStatusCard m={metrics} />
                        </div>

                        {/* ── Full-width sections ───────────────────────────────────────────── */}
                        <div className="mt-5 space-y-5">
                            <RecentUsersTable users={metrics.recentUsers} />
                            <QuickActions />
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AdminPage() {
    return (
        <AdminGuard>
            <AdminContent />
        </AdminGuard>
    )
}
