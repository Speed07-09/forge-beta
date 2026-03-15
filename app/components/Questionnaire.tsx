'use client';

import React, { useState } from 'react';
import {
    UserProfile,
    ActivityLevel,
    FaceShape,
    HairTexture,
    EquipmentAccess,
} from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuestionnaireProps {
    onSubmit: (profile: UserProfile) => void;
    isLoading?: boolean;
}

type StepType = 'text' | 'select' | 'confirm';

interface Step {
    id: keyof UserProfile | 'confirm';
    label: string;
    description?: string;
    type: StepType;
    options?: string[];
    placeholder?: string;
    optional?: boolean;
}

// ─── Step Definitions ──────────────────────────────────────────────────────

const steps: Step[] = [
    {
        id: 'age',
        label: 'Age range',
        description: 'Tailoring the plan to your stage.',
        type: 'text',
        placeholder: 'e.g. 15',
    },
    {
        id: 'height',
        label: 'Height',
        description: 'For health context.',
        type: 'text',
        placeholder: "e.g. 5'9\"",
    },
    {
        id: 'weight',
        label: 'Weight',
        description: 'Skip if you prefer not to share.',
        type: 'text',
        placeholder: 'e.g. 140 lbs',
        optional: true,
    },
    {
        id: 'activityLevel',
        label: 'Activity Level',
        description: 'How active are you right now?',
        type: 'select',
        options: ['Low', 'Medium', 'High'] as ActivityLevel[],
    },
    {
        id: 'faceShape',
        label: 'Face Shape',
        description: 'For targeted grooming advice.',
        type: 'select',
        options: ['Round', 'Oval', 'Square', 'Unsure'] as FaceShape[],
    },
    {
        id: 'hairTexture',
        label: 'Hair Texture',
        description: 'For personalised hair care.',
        type: 'select',
        options: ['4C', '4B', '4A', 'Mixed', 'Unsure'] as HairTexture[],
    },
    {
        id: 'equipment',
        label: 'Equipment Access',
        description: 'What can you work with?',
        type: 'select',
        options: ['None', 'Home Basics', 'Full Gym'] as EquipmentAccess[],
    },
    {
        id: 'dietaryRestrictions',
        label: 'Dietary Needs',
        description: 'Allergies, halal, vegan, etc.',
        type: 'text',
        placeholder: 'e.g. None',
    },
    { id: 'confirm', label: 'Review', type: 'confirm' },
];

// ─── Helper Guide ──────────────────────────────────────────────────────────

function FaceShapeGuide() {
    return (
        <div className="mt-6 p-6 border border-zinc-800 rounded-full text-sm text-zinc-500 bg-zinc-900/20">
            <p className="font-bold mb-3 text-white text-xs uppercase tracking-widest">Reference</p>
            <ul className="space-y-2 font-light">
                <li><strong className="text-white/80 font-normal">Oval:</strong> Length &gt; width.</li>
                <li><strong className="text-white/80 font-normal">Round:</strong> Width ≈ length.</li>
                <li><strong className="text-white/80 font-normal">Square:</strong> Sharp jawline.</li>
            </ul>
        </div>
    );
}

function HairTextureGuide() {
    return (
        <div className="mt-6 p-6 border border-zinc-800 rounded-full text-sm text-zinc-500 bg-zinc-900/20">
            <p className="font-bold mb-3 text-white text-xs uppercase tracking-widest">Reference</p>
            <ul className="space-y-2 font-light">
                <li><strong className="text-white/80 font-normal">4C:</strong> Tight coils, shrinks a lot.</li>
                <li><strong className="text-white/80 font-normal">4B:</strong> Z-shaped angles.</li>
                <li><strong className="text-white/80 font-normal">4A:</strong> S-curl pattern.</li>
                <li><strong className="text-white/80 font-normal">Mixed:</strong> Blend of textures.</li>
            </ul>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function Questionnaire({ onSubmit, isLoading = false }: QuestionnaireProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [inputValue, setInputValue] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    const step = steps[currentStep];

    const handleNext = (val?: string) => {
        const valueToSave = val !== undefined ? val : inputValue;

        if (step.id !== 'confirm') {
            setProfile((prev) => ({ ...prev, [step.id]: valueToSave }));
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
            setInputValue('');
            setShowHelp(false);
        } else if (step.id === 'confirm') {
            onSubmit(profile as UserProfile);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1);
            setInputValue(
                (profile[steps[currentStep - 1].id as keyof UserProfile] as string) || ''
            );
        }
    };

    // ── Confirm screen ──────────────────────────────────────────────────────
    if (step.type === 'confirm') {
        return (
            <div className="max-w-xl mx-auto py-8" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center tracking-tight">Ready?</h2>
                <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 bg-zinc-900/20">
                    {steps
                        .filter((s) => s.id !== 'confirm')
                        .map((s) => (
                            <div
                                key={s.id}
                                className="flex justify-between py-4 border-b border-zinc-800/50 last:border-0"
                            >
                                <span className="text-xs font-normal uppercase tracking-widest text-zinc-500">{s.label}</span>
                                <span className="text-white font-bold text-sm">
                                    {String(profile[s.id as keyof UserProfile] || '—')}
                                </span>
                            </div>
                        ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleBack}
                        disabled={isLoading}
                        className="w-full py-4 px-8 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-300 text-sm font-normal disabled:opacity-40 active:opacity-80"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onSubmit(profile as UserProfile)}
                        disabled={isLoading}
                        className="w-full py-4 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  transition-all duration-300 text-sm font-normal disabled:opacity-40 flex items-center justify-center gap-2 active:opacity-80"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                                Generating…
                            </>
                        ) : (
                            'Generate Plan'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ── Step screen ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-xl mx-auto py-8">
            {/* Progress */}
            <div className="mb-12">
                <div className="mb-8">
                    <span className="text-xs font-normal text-zinc-500 uppercase tracking-widest">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                    {step.label}
                </h2>
                {step.description && (
                    <p className="text-base text-zinc-500 font-light">{step.description}</p>
                )}
            </div>

            {/* Input */}
            <div className="space-y-6">
                {step.type === 'text' && (
                    <div className="space-y-6">
                        <input
                            type="text"
                            autoFocus
                            className="w-full p-5 text-lg font-light rounded-2xl bg-zinc-900/20 border border-zinc-800 text-white focus:border-white focus:ring-0 outline-none transition-all duration-300 placeholder:text-zinc-700"
                            placeholder={step.placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (inputValue || step.optional)) handleNext();
                            }}
                        />
                        <button
                            onClick={() => handleNext()}
                            disabled={!inputValue && !step.optional}
                            className="w-full py-4 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  transition-all duration-300 text-sm font-normal disabled:opacity-20 disabled:cursor-not-allowed active:opacity-80"
                        >
                            Next
                        </button>
                    </div>
                )}

                {step.type === 'select' && (
                    <div className="grid grid-cols-1 gap-3">
                        {step.options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleNext(option)}
                                className="w-full text-left p-5 rounded-full border border-zinc-800 bg-zinc-900/20 hover:border-zinc-600 hover:bg-zinc-900/30 transition-all duration-300 group flex justify-between items-center active:opacity-80"
                            >
                                <span className="text-base font-normal text-zinc-400 group-hover:text-white transition-colors">
                                    {option}
                                </span>
                                <span className="text-zinc-700 group-hover:text-white transition-colors text-base">
                                    →
                                </span>
                            </button>
                        ))}

                        {(step.id === 'faceShape' || step.id === 'hairTexture') && (
                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                className="text-xs font-normal text-zinc-500 hover:text-white mt-4 uppercase tracking-widest transition-colors text-left"
                            >
                                {showHelp ? 'Hide guide ↑' : 'View guide ↓'}
                            </button>
                        )}
                        {showHelp && step.id === 'faceShape' && <FaceShapeGuide />}
                        {showHelp && step.id === 'hairTexture' && <HairTextureGuide />}
                    </div>
                )}
            </div>

            {/* Footer nav */}
            <div className="mt-16 flex items-center justify-between">
                {currentStep > 0 ? (
                    <button
                        onClick={handleBack}
                        className="text-zinc-500 hover:text-white text-xs font-normal tracking-widest uppercase transition-colors"
                    >
                        ← Back
                    </button>
                ) : (
                    <div />
                )}

                {step.optional && !inputValue && step.type === 'text' && (
                    <button
                        onClick={() => handleNext('')}
                        className="text-zinc-500 hover:text-white text-xs font-normal tracking-widest uppercase transition-colors"
                    >
                        Skip →
                    </button>
                )}
            </div>
        </div>
    );
}
