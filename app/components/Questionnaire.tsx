'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    UserProfile,
    ActivityLevel,
    FaceShape,
    HairTexture,
    EquipmentAccess,
} from '../types';

// ─── Value Maps (display → DB) ─────────────────────────────────────────────

const ACTIVITY_MAP: Record<string, ActivityLevel> = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
};

const FACE_SHAPE_MAP: Record<string, FaceShape> = {
    Round: 'Round',
    Oval: 'Oval',
    Square: 'Square',
    Unsure: 'Unsure',
};

const HAIR_TEXTURE_MAP: Record<string, HairTexture> = {
    '4C': '4C',
    '4B': '4B',
    '4A': '4A',
    Mixed: 'Mixed',
    Unsure: 'Unsure',
};

const EQUIPMENT_MAP: Record<string, EquipmentAccess> = {
    None: 'None',
    'Home Basics': 'Home Basics',
    'Full Gym': 'Full Gym',
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface QuestionnaireProps {
    onSubmit: (profile: UserProfile) => void;
    isLoading?: boolean;
}

// ─── Form State ────────────────────────────────────────────────────────────

interface FormData {
    age: string;
    height: string;
    weight: string;
    activityLevel: string;
    faceShape: string;
    hairTexture: string;
    equipment: string;
}

// ─── Step Subcomponents ────────────────────────────────────────────────────

function StepTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-[2.5rem] leading-tight font-semibold text-white text-center"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {children}
        </h2>
    );
}

function StepSubtitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-center mt-3 text-base"
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
            {children}
        </p>
    );
}

// Step 1 — Age
function AgeStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>How old are you?</StepTitle>
                <StepSubtitle>We'll tailor your plan to your stage of life.</StepSubtitle>
            </div>
            <div className="relative w-40">
                <input
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={100}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="25"
                    className="w-full text-center text-5xl font-semibold bg-transparent border-0 border-b-2 pb-3 outline-none transition-colors"
                    style={{
                        color: 'var(--color-primary)',
                        borderColor: value ? 'var(--color-primary)' : 'var(--color-outline)',
                        fontFamily: 'Space Grotesk, sans-serif',
                    }}
                    autoFocus
                />
                <span className="block text-center mt-2 text-sm"
                    style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                    years
                </span>
            </div>
        </div>
    );
}

// Step 2 — Height
function HeightStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    // Determine initial unit from existing value
    const [unit, setUnit] = useState<'cm' | 'ft'>(value && value.includes("'") ? 'ft' : (value ? 'cm' : 'ft'));

    let ft = '';
    let inch = '';
    let cm = '';
    if (value && value.includes("'")) {
        const parts = value.split("'");
        ft = parts[0];
        inch = parts[1]?.replace('"', '') || '';
    } else {
        cm = value || '';
    }

    const handleSwitchUnit = (newUnit: 'cm' | 'ft') => {
        setUnit(newUnit);
        onChange(''); // clear value when switching
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>What's your height?</StepTitle>
                <StepSubtitle>Used for health and fitness context.</StepSubtitle>
            </div>

            {/* unit toggle */}
            <div className="flex bg-surface-low rounded-full p-1 border ghost-border mt-[-10px]">
                <button
                    onClick={() => handleSwitchUnit('ft')}
                    className={`px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${unit === 'ft' ? 'bg-surface-high text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                    Ft / In
                </button>
                <button
                    onClick={() => handleSwitchUnit('cm')}
                    className={`px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${unit === 'cm' ? 'bg-surface-high text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                    Cm
                </button>
            </div>

            {unit === 'cm' ? (
                <div className="relative w-48 mt-2">
                    <input
                        type="number"
                        inputMode="numeric"
                        min={100}
                        max={250}
                        value={cm}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="175"
                        className="w-full text-center text-5xl font-semibold bg-transparent border-0 border-b-2 pb-3 outline-none transition-colors"
                        style={{
                            color: 'var(--color-primary)',
                            borderColor: value ? 'var(--color-primary)' : 'var(--color-outline)',
                            fontFamily: 'Space Grotesk, sans-serif',
                        }}
                        autoFocus
                    />
                    <span className="block text-center mt-2 text-sm"
                        style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                        cm
                    </span>
                </div>
            ) : (
                <div className="flex gap-4 mt-2 relative justify-center">
                    <div className="relative w-24">
                        <input
                            type="number"
                            inputMode="numeric"
                            min={3}
                            max={8}
                            value={ft}
                            onChange={(e) => {
                                const newFt = e.target.value;
                                onChange(`${newFt}'${inch}"`);
                            }}
                            placeholder="5"
                            className="w-full text-center text-5xl font-semibold bg-transparent border-0 border-b-2 pb-3 outline-none transition-colors"
                            style={{
                                color: 'var(--color-primary)',
                                borderColor: ft ? 'var(--color-primary)' : 'var(--color-outline)',
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}
                            autoFocus
                        />
                        <span className="block text-center mt-2 text-sm"
                            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                            ft
                        </span>
                    </div>
                    
                    <div className="relative w-24">
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={11}
                            value={inch}
                            onChange={(e) => {
                                const newIn = e.target.value;
                                onChange(`${ft}'${newIn}"`);
                            }}
                            placeholder="10"
                            className="w-full text-center text-5xl font-semibold bg-transparent border-0 border-b-2 pb-3 outline-none transition-colors"
                            style={{
                                color: 'var(--color-primary)',
                                borderColor: inch ? 'var(--color-primary)' : 'var(--color-outline)',
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}
                        />
                        <span className="block text-center mt-2 text-sm"
                            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                            in
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Step 3 — Weight (optional)
function WeightStep({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>What's your weight?</StepTitle>
                <StepSubtitle>Optional — you can skip this if you prefer.</StepSubtitle>
            </div>
            <div className="relative w-48">
                <input
                    type="number"
                    inputMode="numeric"
                    min={30}
                    max={300}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="70"
                    className="w-full text-center text-5xl font-semibold bg-transparent border-0 border-b-2 pb-3 outline-none transition-colors"
                    style={{
                        color: 'var(--color-primary)',
                        borderColor: value ? 'var(--color-primary)' : 'var(--color-outline)',
                        fontFamily: 'Space Grotesk, sans-serif',
                    }}
                    autoFocus
                />
                <span className="block text-center mt-2 text-sm"
                    style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                    kg
                </span>
            </div>
        </div>
    );
}

// Step 4 — Activity Level
function ActivityLevelStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const options = [
        {
            id: 'Low',
            label: 'Low',
            description: 'Mostly sitting, light movement',
            icon: '🧘',
        },
        {
            id: 'Medium',
            label: 'Medium',
            description: 'Some exercise, moderately active',
            icon: '🚶',
        },
        {
            id: 'High',
            label: 'High',
            description: 'Regular intense training',
            icon: '🏋️',
        },
    ];

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>Activity level?</StepTitle>
                <StepSubtitle>How active are you on a weekly basis?</StepSubtitle>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-3">
                {options.map((opt) => {
                    const selected = value === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition-all duration-200 text-left"
                            style={{
                                borderColor: selected ? 'var(--color-primary)' : 'var(--color-outline)',
                                background: selected
                                    ? 'var(--color-primary-container)'
                                    : 'var(--color-surface-low)',
                            }}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <div>
                                <p className="font-semibold text-white text-sm"
                                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {opt.label}
                                </p>
                                <p className="text-xs mt-0.5"
                                    style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                                    {opt.description}
                                </p>
                            </div>
                            {selected && (
                                <span className="ml-auto material-symbols-outlined text-xl"
                                    style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Step 5 — Face Shape
function FaceShapeStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const options = [
        { id: 'Round', label: 'Round', description: 'Width ≈ length, soft jaw' },
        { id: 'Oval', label: 'Oval', description: 'Length > width, balanced' },
        { id: 'Square', label: 'Square', description: 'Strong, defined jawline' },
        { id: 'Unsure', label: 'Not sure', description: 'We\'ll give general tips' },
    ];

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>Your face shape?</StepTitle>
                <StepSubtitle>For targeted grooming and styling advice.</StepSubtitle>
            </div>
            <div className="w-full max-w-sm grid grid-cols-2 gap-3">
                {options.map((opt) => {
                    const selected = value === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className="flex flex-col items-start px-4 py-4 rounded-2xl border transition-all duration-200 text-left"
                            style={{
                                borderColor: selected ? 'var(--color-primary)' : 'var(--color-outline)',
                                background: selected
                                    ? 'var(--color-primary-container)'
                                    : 'var(--color-surface-low)',
                            }}
                        >
                            <p className="font-semibold text-white text-sm"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {opt.label}
                            </p>
                            <p className="text-xs mt-1"
                                style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                                {opt.description}
                            </p>
                            {selected && (
                                <span className="material-symbols-outlined text-sm mt-2"
                                    style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Step 6 — Hair Texture
function HairTextureStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const options = [
        { id: '4C', label: '4C', description: 'Tight coils, high shrinkage' },
        { id: '4B', label: '4B', description: 'Z-shaped coil pattern' },
        { id: '4A', label: '4A', description: 'Defined S-curl pattern' },
        { id: 'Mixed', label: 'Mixed', description: 'Blend of multiple textures' },
        { id: 'Unsure', label: 'Not sure', description: 'We\'ll give general tips' },
    ];

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>Hair texture?</StepTitle>
                <StepSubtitle>For personalised hair care routines.</StepSubtitle>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-3">
                {options.map((opt) => {
                    const selected = value === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition-all duration-200 text-left"
                            style={{
                                borderColor: selected ? 'var(--color-primary)' : 'var(--color-outline)',
                                background: selected
                                    ? 'var(--color-primary-container)'
                                    : 'var(--color-surface-low)',
                            }}
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-white text-sm"
                                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {opt.label}
                                </p>
                                <p className="text-xs mt-0.5"
                                    style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                                    {opt.description}
                                </p>
                            </div>
                            {selected && (
                                <span className="material-symbols-outlined text-xl"
                                    style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Step 7 — Equipment
function EquipmentStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const options = [
        {
            id: 'None',
            label: 'No equipment',
            description: 'Bodyweight workouts only',
            icon: '🏠',
        },
        {
            id: 'Home Basics',
            label: 'Home basics',
            description: 'Resistance bands, dumbbells, etc.',
            icon: '🔧',
        },
        {
            id: 'Full Gym',
            label: 'Full gym',
            description: 'Machines, cables, barbells',
            icon: '🏋️',
        },
    ];

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <StepTitle>Equipment access?</StepTitle>
                <StepSubtitle>We'll build your plan around what you have.</StepSubtitle>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-3">
                {options.map((opt) => {
                    const selected = value === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition-all duration-200 text-left"
                            style={{
                                borderColor: selected ? 'var(--color-primary)' : 'var(--color-outline)',
                                background: selected
                                    ? 'var(--color-primary-container)'
                                    : 'var(--color-surface-low)',
                            }}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <div>
                                <p className="font-semibold text-white text-sm"
                                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {opt.label}
                                </p>
                                <p className="text-xs mt-0.5"
                                    style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}>
                                    {opt.description}
                                </p>
                            </div>
                            {selected && (
                                <span className="ml-auto material-symbols-outlined text-xl"
                                    style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Validation ────────────────────────────────────────────────────────────

function isStepValid(step: number, data: FormData): boolean {
    switch (step) {
        case 1:
            return !!data.age && parseInt(data.age) > 0 && parseInt(data.age) <= 120;
        case 2:
            if (!data.height) return false;
            // Support ft format: e.g. "5'10""
            if (data.height.includes("'")) {
                const parts = data.height.split("'");
                const ft = parseInt(parts[0], 10);
                const inch = parseInt(parts[1]?.replace('"', '') || '0', 10);
                return !isNaN(ft) && ft > 0 && ft <= 8 && !isNaN(inch) && inch >= 0 && inch < 12;
            }
            return parseInt(data.height) > 0 && parseInt(data.height) <= 300;
        case 3:
            return true; // Weight is optional — always valid
        case 4:
            return !!data.activityLevel;
        case 5:
            return !!data.faceShape;
        case 6:
            return !!data.hairTexture;
        case 7:
            return !!data.equipment;
        default:
            return false;
    }
}

// ─── Main Component ────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

export default function Questionnaire({ onSubmit, isLoading = false }: QuestionnaireProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        age: '',
        height: '',
        weight: '',
        activityLevel: '',
        faceShape: '',
        hairTexture: '',
        equipment: '',
    });

    const update = (field: keyof FormData) => (v: string) =>
        setFormData((prev) => ({ ...prev, [field]: v }));

    const valid = isStepValid(currentStep, formData);

    const handleNext = () => {
        if (!valid && currentStep !== 3) return; // weight step always passable
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep((s) => s + 1);
        } else {
            // Final step — build and submit UserProfile
            onSubmit({
                age: formData.age,
                height: formData.height,
                weight: formData.weight || undefined,
                activityLevel: ACTIVITY_MAP[formData.activityLevel] ?? (formData.activityLevel as ActivityLevel),
                faceShape: FACE_SHAPE_MAP[formData.faceShape] ?? (formData.faceShape as FaceShape),
                hairTexture: HAIR_TEXTURE_MAP[formData.hairTexture] ?? (formData.hairTexture as HairTexture),
                equipment: EQUIPMENT_MAP[formData.equipment] ?? (formData.equipment as EquipmentAccess),
                dietaryRestrictions: '',
            });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((s) => s - 1);
        }
    };

    const handleSkip = () => {
        // Only for weight (step 3)
        update('weight')('');
        setCurrentStep((s) => s + 1);
    };

    return (
        <div className="fixed inset-0 z-40 flex flex-col" style={{ background: 'var(--color-background)' }}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <header
                className="flex items-center justify-between px-6 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-4 shrink-0"
                style={{ background: 'var(--color-surface)', backdropFilter: 'blur(20px)' }}
            >
                <button
                    onClick={() => currentStep > 1 ? handleBack() : router.back()}
                    className="flex items-center justify-center w-9 h-9 rounded-full transition-colors ghost-border hover:bg-surface-high active:scale-95"
                    style={{ background: 'var(--color-surface-low)' }}
                >
                    <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-on-surface-variant)' }}>
                        {currentStep > 1 ? 'arrow_back' : 'close'}
                    </span>
                </button>

                <span
                    className="text-sm font-medium tracking-wide"
                    style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}
                >
                    Step {currentStep} of {TOTAL_STEPS}
                </span>

                {/* Spacer to center the step text */}
                <div className="w-9" />
            </header>

            {/* ── Progress Bar ───────────────────────────────────────────── */}
            <div className="px-6 pt-2 pb-4 shrink-0">
                <div className="flex gap-1.5">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
                        <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                                background: i <= currentStep ? 'var(--color-primary)' : 'rgba(192,193,255,0.15)',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Step Content ───────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
                <div
                    key={currentStep}
                    className="w-full max-w-sm mx-auto flex flex-col items-center"
                    style={{ animation: 'fadeInUp 220ms ease-out both' }}
                >
                    {currentStep === 1 && <AgeStep value={formData.age} onChange={update('age')} />}
                    {currentStep === 2 && <HeightStep value={formData.height} onChange={update('height')} />}
                    {currentStep === 3 && <WeightStep value={formData.weight} onChange={update('weight')} />}
                    {currentStep === 4 && <ActivityLevelStep value={formData.activityLevel} onChange={update('activityLevel')} />}
                    {currentStep === 5 && <FaceShapeStep value={formData.faceShape} onChange={update('faceShape')} />}
                    {currentStep === 6 && <HairTextureStep value={formData.hairTexture} onChange={update('hairTexture')} />}
                    {currentStep === 7 && <EquipmentStep value={formData.equipment} onChange={update('equipment')} />}

                    {/* Next Submittion Controls */}
                    <div className="w-full mt-10 flex flex-col gap-3">
                        <button
                            onClick={handleNext}
                            disabled={!valid || isLoading}
                            className={`w-full h-14 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${valid && !isLoading ? 'lit-gradient text-background shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:scale-[1.02] active:scale-[0.98]' : 'bg-primary/5 text-primary/40 ghost-border cursor-not-allowed'}`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    Generating…
                                </>
                            ) : currentStep === TOTAL_STEPS ? (
                                <>
                                    Generate Plan
                                    <span className="material-symbols-outlined text-xl">
                                        auto_awesome
                                    </span>
                                </>
                            ) : (
                                'Next'
                            )}
                        </button>
                        
                        {/* Skip (weight step only) */}
                        {currentStep === 3 && (
                            <button
                                onClick={handleSkip}
                                className="w-full h-14 rounded-full font-bold text-[15px] ghost-border bg-surface-low text-on-surface-variant hover:text-on-surface hover:bg-surface-high transition-all active:scale-[0.98]"
                            >
                                Skip Weight
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
