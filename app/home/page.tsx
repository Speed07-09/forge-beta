'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback, useRef } from 'react'
import AuthGuard from '../components/AuthGuard'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Habit } from '../types'
import { getTodayCompletionRate, getCurrentStreak } from '../lib/metricsCalculator'
import { Check } from 'lucide-react'

// ─── Latest Plan Preview ────────────────────────────────────────────────────

interface LatestPlan {
    content: string;
    created_at: string;
}

function LatestPlanSection() {
    const [latestPlan, setLatestPlan] = useState<LatestPlan | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        async function fetchLatest() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from('plans')
                    .select('content, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) setLatestPlan(data);
            } catch {
                // No plans yet — silent
            } finally {
                setChecked(true);
            }
        }
        fetchLatest();
    }, []);

    if (!checked || !latestPlan) return null;

    const preview = latestPlan.content
        .replace(/#+\s/g, '')
        .replace(/\*/g, '')
        .trim()
        .slice(0, 200);

    const relDate = (() => {
        const d = new Date(latestPlan.created_at);
        const days = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    })();

    return (
        <div
            className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-all duration-300"
            style={{ animation: 'fadeInUp 225ms ease-out 300ms both' }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Your Plan</h3>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal">{relDate}</p>
                </div>
                <Link
                    href="/vault"
                    className="inline-flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 rounded-full py-3 px-8 text-sm font-normal transition-all duration-300"
                >
                    View Full Plan
                </Link>
            </div>
            <p className="text-zinc-500 text-base font-light leading-relaxed line-clamp-3 md:line-clamp-4">{preview}…</p>
        </div>
    );
}

// ─── Today's Habits Preview ──────────────────────────────────────────────────

function TodayHabitsSection() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [streak, setStreak] = useState(0);
    const [rate, setRate] = useState(0);
    const [totalCompleted, setTotalCompleted] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const togglingRef = useRef<Set<string>>(new Set());

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const [{ data: habitsData }, { data: completionsData }, streakVal, rateVal, { count: totalCount }] = await Promise.all([
                    supabase
                        .from('habits')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: true })
                        .limit(3),
                    supabase
                        .from('habit_completions')
                        .select('habit_id')
                        .eq('user_id', user.id)
                        .eq('completed_date', today),
                    getCurrentStreak(user.id),
                    getTodayCompletionRate(user.id),
                    supabase
                        .from('habit_completions')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                ]);

                setHabits((habitsData as Habit[]) ?? []);
                setCompletedIds(completionsData?.map(c => c.habit_id) ?? []);
                setStreak(streakVal);
                setRate(rateVal);
                setTotalCompleted(totalCount ?? 0);
            } finally {
                setLoaded(true);
            }
        }
        load();
    }, [today]);

    const handleToggle = useCallback(async (habitId: string) => {
        if (togglingRef.current.has(habitId)) return;
        togglingRef.current.add(habitId);

        const wasCompleted = completedIds.includes(habitId);
        setCompletedIds(prev => wasCompleted ? prev.filter(id => id !== habitId) : [...prev, habitId]);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            if (wasCompleted) {
                await supabase
                    .from('habit_completions')
                    .delete()
                    .eq('habit_id', habitId)
                    .eq('user_id', user.id)
                    .eq('completed_date', today);
            } else {
                await supabase.from('habit_completions').insert({
                    habit_id: habitId,
                    user_id: user.id,
                    completed_date: today,
                });
            }

            const [newStreak, newRate, { count: newTotal }] = await Promise.all([
                getCurrentStreak(user.id),
                getTodayCompletionRate(user.id),
                supabase.from('habit_completions').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
            ]);
            setStreak(newStreak);
            setRate(newRate);
            setTotalCompleted(newTotal ?? 0);
        } catch {
            // Rollback
            setCompletedIds(prev => wasCompleted ? [...prev, habitId] : prev.filter(id => id !== habitId));
        } finally {
            setTimeout(() => togglingRef.current.delete(habitId), 300);
        }
    }, [completedIds, today]);

    if (!loaded || habits.length === 0) return null;

    // Progress bar math
    const monthlyProgress = Math.min(Math.round(((streak || 0) / 30) * 100), 100);

    return (
        <div className="space-y-12" style={{ animation: 'fadeInUp 225ms ease-out 400ms both' }}>

            {/* Metric summary cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-3">Streak</p>
                    <p className="text-4xl font-bold text-white">{streak}</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-600 mt-1">days</p>
                </div>
                <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-3">Today</p>
                    <p className="text-4xl font-bold text-white">{rate}%</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-600 mt-1">complete</p>
                </div>
                <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-3">Total</p>
                    <p className="text-4xl font-bold text-white">{totalCompleted}</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-600 mt-1">completed</p>
                </div>
                <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-4">30-Day</p>
                    <div className="w-full h-1 bg-zinc-800 overflow-hidden mb-3">
                        <div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${monthlyProgress}%` }}></div>
                    </div>
                    <p className="text-sm font-normal text-zinc-500">{monthlyProgress}%</p>
                </div>
            </div>

            {/* Habit section */}
            <div>
                <div className="flex items-end justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Today&apos;s Habits</h3>
                    <Link
                        href="/tracker"
                        className="text-sm text-zinc-500 hover:text-white transition-colors font-normal"
                    >
                        View All →
                    </Link>
                </div>

                <div className="border border-zinc-800 rounded-2xl divide-y divide-zinc-800/50">
                    {habits.map(habit => {
                        const done = completedIds.includes(habit.id);
                        return (
                            <button
                                key={habit.id}
                                onClick={() => handleToggle(habit.id)}
                                className="w-full flex items-center gap-4 px-6 py-5 hover:bg-zinc-900/30 transition-colors duration-300 text-left group active:opacity-80"
                            >
                                {/* Rounded checkbox */}
                                <div className={`w-5 h-5 border rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? 'bg-white border-white' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                                    {done && (
                                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                    )}
                                </div>
                                <span className={`text-base font-normal transition-colors duration-300 ${done ? 'text-zinc-600 line-through' : 'text-white'}`}>
                                    {habit.habit_name}
                                </span>
                                {habit.is_custom && (
                                    <span className="text-[10px] font-normal uppercase tracking-widest text-zinc-600 ml-auto shrink-0">
                                        Custom
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}

// ─── Home Content ─────────────────────────────────────────────────────────────

function HomeContent() {
    const { user, signOut, isLoading } = useAuth()
    const [username, setUsername] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data?.username) setUsername(data.username)
                else setUsername(user.email?.split('@')[0] ?? null)
            })
    }, [user])

    const displayName = username || user?.email?.split('@')[0] || ''

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto px-6 py-8 md:px-8 md:py-12 pb-32">
                {/* Header */}
                <header className="flex items-center justify-between mb-16 md:mb-24" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                    <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase select-none">
                        FORGE
                    </h1>
                    <button
                        onClick={signOut}
                        aria-label="Sign out"
                        className="text-xs font-normal uppercase tracking-widest text-zinc-500 hover:text-white transition-colors duration-300"
                    >
                        Sign out
                    </button>
                </header>

                {/* Welcome */}
                <div className="mb-16 md:mb-20 space-y-12" style={{ animation: 'fadeInUp 225ms ease-out 100ms both' }}>
                    {!isLoading && user && (
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                                Welcome back,<br />
                                {displayName}
                            </h2>
                            <p className="text-zinc-500 text-base font-light leading-relaxed max-w-xl">
                                Consistency is the foundation of excellence.
                            </p>
                        </div>
                    )}
                </div>

                {/* Primary CTA */}
                <div className="flex flex-col md:flex-row gap-4 mb-16" style={{ animation: 'fadeInUp 225ms ease-out 200ms both' }}>
                    <Link
                        href="/plans"
                        className="inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-full  py-4 px-8 text-base font-normal transition-all duration-300 active:opacity-80"
                    >
                        Generate New Plan
                    </Link>
                    <Link
                        href="/tracker"
                        className="inline-flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 rounded-full py-4 px-8 text-base font-normal transition-all duration-300 active:opacity-80"
                    >
                        Daily Tracker
                    </Link>
                    <Link
                        href="/vault"
                        className="inline-flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 rounded-full py-4 px-8 text-base font-normal transition-all duration-300 active:opacity-80"
                    >
                        Vault
                    </Link>
                </div>

                {/* Latest plan preview */}
                <LatestPlanSection />

                {/* Spacer */}
                <div className="mt-16" />

                {/* Today's habits preview */}
                <TodayHabitsSection />

            </div>
        </div>
    )
}

export default function HomePage() {
    return (
        <AuthGuard>
            <HomeContent />
        </AuthGuard>
    )
}
