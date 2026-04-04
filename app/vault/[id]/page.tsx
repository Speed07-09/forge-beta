'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import PlanDisplay from '../../components/PlanDisplay';
import { supabase } from '../../lib/supabase';
import { SupabasePlan } from '../../types';

function PlanDetailContent() {
    const params = useParams();
    const router = useRouter();
    const [plan, setPlan] = useState<SupabasePlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchPlan() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/'); return; }

            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .eq('id', params.id as string)
                .eq('user_id', user.id)
                .single();

            if (error || !data) { setNotFound(true); }
            else { setPlan(data as SupabasePlan); }
            setLoading(false);
        }
        fetchPlan();
    }, [params.id, router]);

    return (
        <div className="min-h-screen bg-background text-on-surface font-body page-bottom-padding">
            {/* Header */}
            <header className="fixed top-0 w-full bg-background/80 glass-panel border-b border-outline-variant z-50 fixed-header-safe-top">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/vault')}
                        className="flex items-center gap-2 text-on-surface-variant hover:text-primary text-[11px] font-bold tracking-[0.15em] uppercase transition-colors"
                    >
                        ← Vault
                    </button>
                    {plan && (
                        <>
                            <span className="text-outline-variant">/</span>
                            <span className="text-primary text-[11px] font-bold tracking-[0.15em] uppercase">
                                {new Date(plan.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </span>
                        </>
                    )}
                </div>
            </header>

            {/* Content — normal page flow, browser handles scroll */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-[calc(6rem+env(safe-area-inset-top,0px))] pb-24">
                {loading && (
                    <div className="space-y-4 animate-pulse pt-8">
                        <div className="h-10 bg-surface-high rounded-xl w-3/4" />
                        <div className="h-4 bg-surface-high/70 rounded w-full" />
                        <div className="h-4 bg-surface-high/50 rounded w-5/6" />
                        <div className="h-4 bg-surface-high/30 rounded w-4/6" />
                    </div>
                )}
                {!loading && notFound && (
                    <div className="text-center py-24">
                        <p className="text-on-surface-variant font-medium mb-6">Plan not found.</p>
                        <button
                            onClick={() => router.push('/vault')}
                            className="ghost-border text-on-surface-variant hover:text-on-surface hover:bg-surface-high px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300"
                        >
                            Back to Vault
                        </button>
                    </div>
                )}
                {!loading && plan && (
                    <PlanDisplay plan={plan.content} />
                )}
            </main>
        </div>
    );
}

export default function PlanDetailPage() {
    return (
        <AuthGuard>
            <PlanDetailContent />
        </AuthGuard>
    );
}
