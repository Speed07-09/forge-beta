"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import HabitList from "@/app/components/HabitList";
import MetricsDashboard from "@/app/components/MetricsDashboard";
import AddHabitModal from "@/app/components/AddHabitModal";
import { supabase } from "@/app/lib/supabase";
import {
    getTotalCompleted,
    getCurrentStreak,
    getTodayCompletionRate,
    get30DayProgress,
} from "@/app/lib/metricsCalculator";
import { Habit } from "@/app/types";
import { Plus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics {
    totalCompleted: number;
    currentStreak: number;
    completionRate: number;
    progress: number;
}

// ─── Toast notification ───────────────────────────────────────────────────────

function Toast({
    message,
    type,
}: {
    message: string;
    type: "success" | "error";
}) {
    return (
        <div
            className={`fixed left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-full text-sm font-bold border animate-[fadeInUp_225ms_ease-out] ${type === "error"
                ? "bg-surface-high border-red-500/30 text-red-400"
                : "bg-surface-high ghost-border text-on-surface"
                }`}
            style={{ bottom: 'calc(88px + env(safe-area-inset-bottom) + 16px)' }}
        >
            {message}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TrackerContent() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({
        totalCompleted: 0,
        currentStreak: 0,
        completionRate: 0,
        progress: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Track which habits are mid-toggle to debounce rapid clicks
    const togglingRef = useRef<Set<string>>(new Set());

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // ─── Formatted date label ────────────────────────────────────────────────
    const todayLabel = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    // ─── Show a temporary toast ──────────────────────────────────────────────
    const showToast = useCallback(
        (message: string, type: "success" | "error" = "success") => {
            setToast({ message, type });
            setTimeout(() => setToast(null), 3000);
        },
        []
    );

    // ─── Fetch metrics ───────────────────────────────────────────────────────
    const loadMetrics = useCallback(async (userId: string) => {
        const [total, streak, rate, progress] = await Promise.all([
            getTotalCompleted(userId),
            getCurrentStreak(userId),
            getTodayCompletionRate(userId),
            get30DayProgress(userId),
        ]);
        setMetrics({ totalCompleted: total, currentStreak: streak, completionRate: rate, progress });
    }, []);

    // ─── Fetch habits + today's completions ──────────────────────────────────
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
                supabase
                    .from("habits")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true }),
                supabase
                    .from("habit_completions")
                    .select("habit_id")
                    .eq("user_id", user.id)
                    .eq("completed_date", today),
            ]);

            setHabits((habitsData as Habit[]) ?? []);
            setCompletedIds(completionsData?.map((c) => c.habit_id) ?? []);

            await loadMetrics(user.id);
        } finally {
            setIsLoading(false);
        }
    }, [today, loadMetrics]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ─── Toggle a habit (optimistic + rollback on error) ─────────────────────
    const handleToggle = useCallback(
        async (habitId: string) => {
            // Debounce: ignore rapid re-clicks while a request is in-flight
            if (togglingRef.current.has(habitId)) return;
            togglingRef.current.add(habitId);

            const wasCompleted = completedIds.includes(habitId);

            // Optimistic update
            setCompletedIds((prev) =>
                wasCompleted ? prev.filter((id) => id !== habitId) : [...prev, habitId]
            );

            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                let dbError = null;

                if (wasCompleted) {
                    // Delete the completion record
                    const { error } = await supabase
                        .from("habit_completions")
                        .delete()
                        .eq("habit_id", habitId)
                        .eq("user_id", user.id)
                        .eq("completed_date", today);
                    dbError = error;
                } else {
                    // Insert a new completion record
                    const { error } = await supabase.from("habit_completions").insert({
                        habit_id: habitId,
                        user_id: user.id,
                        completed_date: today,
                    });
                    dbError = error;
                }

                if (dbError) throw dbError;

                // Refresh metrics after successful toggle
                await loadMetrics(user.id);
            } catch (error) {
                // Rollback optimistic update
                setCompletedIds((prev) =>
                    wasCompleted ? [...prev, habitId] : prev.filter((id) => id !== habitId)
                );
                const isNetworkError =
                    (error instanceof Error && error.message?.includes('Failed to fetch')) ||
                    !navigator.onLine;
                showToast(
                    isNetworkError
                        ? 'No internet connection. Please try again.'
                        : 'Something went wrong. Please try again.',
                    'error'
                );
            } finally {
                // Wait 300 ms before allowing another toggle for this habit
                setTimeout(() => togglingRef.current.delete(habitId), 300);
            }
        },
        [completedIds, today, loadMetrics, showToast]
    );

    // ─── Save a custom habit ───────────────────────────────────────────────
    const handleSaveHabit = useCallback(
        async (name: string, description: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                showToast("Not authenticated", "error");
                throw new Error("Not authenticated");
            }

            const { error } = await supabase.from("habits").insert({
                user_id: user.id,
                plan_id: null,
                habit_name: name,
                habit_description: description || null,
                is_custom: true,
            });

            if (error) {
                showToast("Failed to add habit", "error");
                throw error;
            }

            setShowAddModal(false);
            showToast("Habit added!");
            await loadData();
        },
        [loadData, showToast]
    );

    // ─── Delete a custom habit ─────────────────────────────────────────────
    const handleDeleteHabit = useCallback(
        async (habitId: string) => {
            // Safety guard: only custom habits can be deleted
            const habit = habits.find((h) => h.id === habitId);
            if (!habit || !habit.is_custom) return;

            // Optimistic update
            setHabits((prev) => prev.filter((h) => h.id !== habitId));
            setCompletedIds((prev) => prev.filter((id) => id !== habitId));

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('habits')
                    .delete()
                    .eq('id', habitId)
                    .eq('user_id', user.id)
                    .eq('is_custom', true); // double-guard on the server side

                if (error) throw error;

                showToast('Custom habit removed.');
                await loadMetrics(user.id);
            } catch {
                // Rollback
                await loadData();
                showToast('Failed to delete habit. Please try again.', 'error');
            }
        },
        [habits, loadData, loadMetrics, showToast]
    );

    return (
        <div className="min-h-screen bg-background text-on-surface page-bottom-padding font-body">
            <div className="max-w-2xl mx-auto px-6 py-12 md:px-8 md:py-16 space-y-12 md:space-y-16">
                {/* Header */}
                <header
                    className="space-y-3"
                    style={{ animation: 'fadeInUp 225ms ease-out both' }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight font-headline">
                        Today&apos;s Habits
                    </h1>
                    <p className="text-on-surface-variant text-base font-medium leading-relaxed">
                        <span className="text-on-surface">{todayLabel}</span> · Stay consistent.
                    </p>
                </header>

                {/* Metrics */}
                <section
                    aria-label="Metrics Dashboard"
                    style={{ animation: 'fadeInUp 225ms ease-out 100ms both' }}
                >
                    <MetricsDashboard metrics={metrics} />
                </section>

                {/* Habit list */}
                <section
                    aria-label="Habit List"
                    style={{ animation: 'fadeInUp 225ms ease-out 200ms both' }}
                >
                    <HabitList
                        habits={habits}
                        completedIds={completedIds}
                        isLoading={isLoading}
                        onToggle={handleToggle}
                        onAddHabit={() => setShowAddModal(true)}
                        onDelete={handleDeleteHabit}
                    />

                    {!isLoading && (
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="ghost-border text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-high rounded-full py-4 px-8 text-[15px] font-bold transition-all duration-300 flex items-center gap-2 active:scale-95"
                            >
                                <Plus className="w-5 h-5" /> Add Custom Habit
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Add Habit Modal */}
            <AddHabitModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveHabit}
            />

            {/* Toast notifications */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}

export default function TrackerPage() {
    return (
        <AuthGuard>
            <TrackerContent />
        </AuthGuard>
    );
}
