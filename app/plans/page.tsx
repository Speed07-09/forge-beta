'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../components/AuthGuard';
import Questionnaire from '../components/Questionnaire';
import PlanDisplay from '../components/PlanDisplay';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { generateSelfImprovementPlan, extractHabitsFromPlan } from '../services/deepseekService';

// ─── Loading State ─────────────────────────────────────────────────────────

function GeneratingLoader({ phase }: { phase: 'generating' | 'extracting' }) {
    return (
        <div className="flex flex-col items-center justify-center py-40 text-center">
            <h3 className="text-lg font-bold mb-4 text-primary tracking-[0.2em] uppercase font-headline animate-atmospheric-pulse">
                {phase === 'generating' ? 'Generating' : 'Analyzing'}
            </h3>
            <p className="text-on-surface-variant max-w-sm text-sm font-medium">
                {phase === 'generating'
                    ? 'Curating a path for consistency and growth.'
                    : 'Analyzing plan and creating habits…'}
            </p>
        </div>
    );
}

// ─── Error State ───────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="max-w-xl mx-auto ghost-border rounded-2xl p-12 text-center bg-surface-low">
            <p className="text-secondary text-4xl mb-6 material-symbols-outlined shrink-0" style={{ fontSize: '48px' }}>error</p>
            <h3 className="text-xl font-bold text-on-surface mb-4 font-headline">Connection interrupted</h3>
            <p className="text-on-surface-variant mb-8 font-medium text-sm">{message}</p>
            <button
                onClick={onRetry}
                className="py-3 px-8 lit-gradient text-background rounded-full transition-all duration-300 text-sm font-bold active:scale-95 hover:scale-[1.02]"
            >
                Retry
            </button>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function PlansPage() {
    const router = useRouter();
    const [step, setStep] = useState<'questionnaire' | 'generating' | 'extracting' | 'display' | 'error'>('questionnaire');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (profile: UserProfile) => {
        setUserProfile(profile);
        setStep('generating');
        setError('');

        try {
            // Generate plan with DeepSeek
            console.log('[Plans Page] Generating plan for profile:', profile);
            const plan = await generateSelfImprovementPlan(profile);
            
            setGeneratedPlan(plan);
            setStep('extracting');

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            // Save plan to database
            const { error: saveError } = await supabase
                .from('plans')
                .insert({
                    user_id: user.id,
                    content: plan,
                    profile_data: profile,
                });

            if (saveError) {
                console.error('[Plans Page] Error saving plan:', saveError);
                throw saveError;
            }

            console.log('[Plans Page] ✅ Plan saved to database');

            // Extract habits
            console.log('[Plans Page] Extracting habits...');
            const habits = await extractHabitsFromPlan(plan);
            console.log('[Plans Page] Extracted habits:', habits);

            // Get the plan ID we just inserted
            const { data: planData } = await supabase
                .from('plans')
                .select('id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const planId = planData?.id;

            // Save habits to database
            const habitsToInsert = habits.map(habit => ({
                user_id: user.id,
                plan_id: planId,
                habit_name: habit.name,
                habit_description: habit.description,
                is_custom: false,
            }));

            const { error: habitsError } = await supabase
                .from('habits')
                .insert(habitsToInsert);

            if (habitsError) {
                console.error('[Plans Page] Error saving habits:', habitsError);
            } else {
                console.log('[Plans Page] ✅ Habits saved to database');
            }

            // Show plan
            setStep('display');

        } catch (err: any) {
            console.error('[Plans Page] Error:', err);
            setError(err.message || 'Failed to generate plan. Please try again.');
            setStep('error');
        }
    };

    const handleRetry = () => {
        setStep('questionnaire');
        setError('');
        setGeneratedPlan('');
    };

    const handleSave = async () => {
        // Plan is already saved in handleSubmit
        console.log('[Plans Page] Plan already saved, redirecting to vault');
        router.push('/vault');
    };

    return (
        <AuthGuard>
            {/* Full-screen questionnaire — no wrapper needed (fixed inset-0) */}
            {step === 'questionnaire' && (
                <Questionnaire onSubmit={handleSubmit} />
            )}

            {/* All other states use the padded layout */}
            {step !== 'questionnaire' && (
                <div className="min-h-screen bg-background font-body pb-[120px]">
                    {/* Header */}
                    <header className="fixed top-0 w-full bg-background/80 glass-panel border-b border-outline-variant z-50">
                        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/home')}>
                                <span className="text-on-surface-variant hover:text-primary text-[11px] font-bold uppercase tracking-[0.15em] transition-colors">
                                    ← Home
                                </span>
                                <span className="text-outline-variant">/</span>
                                <h1 className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface">
                                    Generate Plan
                                </h1>
                            </div>

                            <a
                                href="/vault"
                                className="py-3 px-6 text-[11px] font-bold tracking-[0.15em] uppercase ghost-border text-on-surface-variant hover:text-on-surface hover:bg-surface-high rounded-full transition-all duration-300 active:scale-95 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                Vault
                            </a>
                        </div>
                    </header>

                    <main className="max-w-2xl mx-auto px-6 pt-28 md:pt-32">
                        {/* Header Content */}
                        <div className="mb-12" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                            <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight font-headline">
                                Generate Plan
                            </h2>
                            <p className="text-on-surface-variant text-[15px] font-medium">
                                Personalized transformation blueprint.
                            </p>
                        </div>

                        {step === 'generating' && (
                            <GeneratingLoader phase="generating" />
                        )}

                        {step === 'extracting' && (
                            <GeneratingLoader phase="extracting" />
                        )}

                        {step === 'display' && generatedPlan && (
                            <PlanDisplay
                                plan={generatedPlan}
                                onSave={handleSave}
                            />
                        )}

                        {step === 'error' && (
                            <ErrorState
                                message={error}
                                onRetry={handleRetry}
                            />
                        )}

                    </main>
                </div>
            )}
        </AuthGuard>
    );
}