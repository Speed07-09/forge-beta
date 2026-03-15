'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import PlanDisplay from './PlanDisplay';
import { SupabasePlan } from '../types';
import { Trash2 } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getPreview(content: string, chars = 180): string {
    const clean = content.replace(/#+\s/g, '').replace(/\*/g, '').trim();
    return clean.length > chars ? clean.slice(0, chars) + '…' : clean;
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteModal({
    onConfirm,
    onCancel,
    isDeleting,
}: {
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* Modal */}
            <div className="relative z-10 max-w-sm w-full mx-4 bg-black border border-zinc-800 rounded-2xl p-8" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">Delete this plan?</h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed">This cannot be undone. You will lose access to this specific transformation blueprint forever.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 py-4 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white text-sm font-normal transition-all duration-300 disabled:opacity-40 active:opacity-80"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-4 rounded-full border border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300 text-sm font-normal transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 active:opacity-80"
                    >
                        {isDeleting ? (
                            <span className="w-4 h-4 border-2 border-red-800 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
    plan,
    onView,
    onDeleteRequest,
}: {
    plan: SupabasePlan;
    onView: (plan: SupabasePlan) => void;
    onDeleteRequest: (id: string) => void;
}) {
    return (
        <div className="group relative border border-zinc-800 rounded-2xl bg-zinc-900/20 hover:bg-zinc-900/30 transition-all duration-300">
            {/* Clickable body */}
            <button
                onClick={() => onView(plan)}
                className="w-full text-left p-6 md:p-8 focus:outline-none active:opacity-80"
            >
                {/* Date */}
                <p className="text-xs font-normal uppercase tracking-widest text-zinc-600 mb-2">
                    {formatDate(plan.created_at)}
                </p>

                {/* Content preview */}
                <p className="text-zinc-500 text-sm font-light leading-relaxed line-clamp-3 mb-6">
                    {getPreview(plan.content)}
                </p>

                {/* View hint */}
                <p className="text-xs font-normal uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    View Blueprint →
                </p>
            </button>

            {/* Delete button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRequest(plan.id);
                }}
                aria-label="Delete plan"
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 rounded-2xl"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function VaultSkeleton() {
    return (
        <div className="space-y-4">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="border border-zinc-800/50 rounded-2xl p-6 md:p-8 bg-zinc-900/10 animate-pulse"
                    style={{ opacity: 1 - i * 0.25 }}
                >
                    <div className="h-3 w-24 bg-zinc-800 mb-4" />
                    <div className="space-y-3">
                        <div className="h-3 bg-zinc-800/50 w-full" />
                        <div className="h-3 bg-zinc-800/50 w-4/5" />
                        <div className="h-3 bg-zinc-800/50 w-3/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Full Plan Viewer (modal overlay) ───────────────────────────────────────

function PlanViewer({
    plan,
    onClose,
}: {
    plan: SupabasePlan;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black overflow-y-auto">
            {/* Sticky back bar */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-normal tracking-widest uppercase transition-colors"
                >
                    ← Back to Vault
                </button>
                <span className="text-zinc-800">/</span>
                <span className="text-zinc-600 text-xs font-normal tracking-widest uppercase">{formatDate(plan.created_at)}</span>
            </div>

            <div className="max-w-2xl mx-auto px-6 pt-12 pb-32 w-full">
                <PlanDisplay plan={plan.content} />
            </div>
        </div>
    );
}

// ─── Main Vault Component ────────────────────────────────────────────────────

export default function Vault() {
    const [plans, setPlans] = useState<SupabasePlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [viewingPlan, setViewingPlan] = useState<SupabasePlan | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlans(data ?? []);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load plans.';
            setFetchError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleDeleteConfirm = async () => {
        if (!pendingDeleteId) return;
        const idToDelete = pendingDeleteId; // capture before clearing state
        setDeletingId(idToDelete);

        // Optimistic update
        setPlans((prev) => prev.filter((p) => p.id !== idToDelete));
        setPendingDeleteId(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('plans')
                .delete()
                .eq('id', idToDelete)
                .eq('user_id', user.id);

            if (error) throw error;
        } catch {
            // Rollback: re-fetch to restore state
            fetchPlans();
        } finally {
            setDeletingId(null);
        }
    };

    // ── Render ──

    if (isLoading) {
        return (
            <div className="pt-4" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                <VaultSkeleton />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="text-center py-20 border border-zinc-800 bg-zinc-900/20 rounded-2xl mt-8">
                <p className="text-zinc-500 text-sm mb-6 font-light">{fetchError}</p>
                <button
                    onClick={fetchPlans}
                    className="text-xs font-normal uppercase tracking-widest text-zinc-500 hover:text-white border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-2xl transition-all duration-300 active:opacity-80"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="text-center py-24 px-6 border border-zinc-800 bg-zinc-900/20 rounded-2xl mt-8">
                <p className="text-zinc-500 text-base font-light mb-10 max-w-xs mx-auto">Generate your first transformation blueprint and save it here.</p>
                <a
                    href="/plans"
                    className="inline-flex items-center gap-2 py-4 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  transition-all duration-300 text-sm font-normal active:opacity-80"
                >
                    Create Your First Plan
                </a>
            </div>
        );
    }

    return (
        <>
            {/* Plan card list */}
            <div className="space-y-4 pb-20">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onView={setViewingPlan}
                        onDeleteRequest={setPendingDeleteId}
                    />
                ))}
            </div>

            {/* Full plan viewer */}
            {viewingPlan && (
                <PlanViewer plan={viewingPlan} onClose={() => setViewingPlan(null)} />
            )}

            {/* Delete confirmation modal */}
            {pendingDeleteId && (
                <DeleteModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setPendingDeleteId(null)}
                    isDeleting={!!deletingId}
                />
            )}
        </>
    );
}
