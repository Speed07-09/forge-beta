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
            <h3 className="text-base font-light mb-4 text-white tracking-widest uppercase" style={{ animation: 'subtlePulse 2s ease-in-out infinite' }}>
                {phase === 'generating' ? 'Generating' : 'Analyzing'}
            </h3>
            <p className="text-zinc-500 max-w-sm text-sm font-light">
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
        <div className="max-w-xl mx-auto border border-zinc-800 p-12 text-center bg-zinc-900/20">
            <p className="text-zinc-500 text-4xl mb-6">×</p>
            <h3 className="text-xl font-bold text-white mb-4">Connection interrupted</h3>
            <p className="text-zinc-500 mb-8 font-light text-sm">{message}</p>
            <button
                onClick={onRetry}
                className="py-4 px-8 border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-all duration-300 text-sm font-normal active:opacity-80"
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
            <main className="min-h-screen bg-black px-6 py-8 pb-24">
                <div className="max-w-2xl mx-auto">
                    
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                            Generate Plan
                        </h1>
                        <p className="text-sm text-zinc-500 uppercase tracking-widest">
                            Personalized transformation
                        </p>
                    </div>

                    {/* Content */}
                    {step === 'questionnaire' && (
                        <Questionnaire onSubmit={handleSubmit} />
                    )}

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

                </div>
            </main>

            <style jsx>{`
                @keyframes subtlePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </AuthGuard>
    );
}