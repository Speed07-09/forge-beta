'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Shield, Play } from 'lucide-react';

// ─── Sub-components ────────────────────────────────────────────────────────

function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-zinc-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group focus:outline-none"
            >
                <h2 className="text-lg font-normal text-white group-hover:text-zinc-300 transition-colors">
                    {title}
                </h2>
                <span
                    className={`transform transition-transform duration-300 text-zinc-500 group-hover:text-white ${isOpen ? 'rotate-180' : ''}`}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-2">{children}</div>
            </div>
        </div>
    );
}

function InteractiveListItem({ text }: { text: React.ReactNode }) {
    return (
        <div className="group flex items-start space-x-4 p-3 -mx-3 hover:bg-zinc-900/30 transition-all cursor-default duration-300 rounded-2xl">
            <span className="text-zinc-600 group-hover:text-zinc-400 mt-1.5 transition-colors text-[10px]">
                •
            </span>
            <span className="text-zinc-500 group-hover:text-zinc-300 leading-relaxed font-light flex-1 transition-colors">
                {text}
            </span>
        </div>
    );
}

function ExpandableExerciseItem({
    title,
    details,
}: {
    prefix: string;
    title: string;
    details: string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`transition-all duration-300 border ${isExpanded ? 'bg-zinc-900/20 border-zinc-800 my-4 rounded-2xl' : 'bg-transparent border-transparent hover:bg-zinc-900/20 -mx-3 p-3 rounded-2xl'}`}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full text-left flex items-start space-x-4 ${isExpanded ? 'p-4 pb-0' : ''}`}
            >
                <span
                    className={`text-[10px] mt-1.5 transition-colors ${isExpanded ? 'text-white' : 'text-zinc-600'}`}
                >
                    {isExpanded ? '▼' : '▶'}
                </span>
                <div className="flex-1">
                    <span
                        className={`font-normal transition-colors ${isExpanded ? 'text-white text-lg' : 'text-zinc-300'}`}
                    >
                        {title}
                    </span>
                    {!isExpanded && (
                        <p className="text-zinc-600 text-sm line-clamp-1 mt-1 font-light">{details}</p>
                    )}
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 pt-4">
                    <p className="text-zinc-500 leading-relaxed font-light mb-6 text-sm">{details}</p>
                    <div className="mt-4 p-4 border border-zinc-800 rounded-2xl bg-zinc-900/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">
                            Visual Guide
                        </p>
                        <p className="text-zinc-500 text-sm font-light italic">
                            Search online for &quot;{title}&quot; to watch a video demonstration of proper form.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Rendering Helpers ─────────────────────────────────────────────────────

function cleanText(text: string): string {
    return text.replace(/\*/g, '');
}

function renderContentLines(lines: string[]): React.ReactNode[] {
    return lines.map((line, i) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={i} className="h-4" />;

        if (trimmedLine.startsWith('### ')) {
            return (
                <h3 key={i} className="text-base font-bold text-white mt-8 mb-4 tracking-wide">
                    {cleanText(line.replace('### ', ''))}
                </h3>
            );
        }

        if (
            trimmedLine.toLowerCase().includes('mistake') ||
            trimmedLine.toLowerCase().includes('avoid') ||
            trimmedLine.toLowerCase().includes('form check')
        ) {
            return (
                <div
                    key={i}
                    className="border-l border-zinc-600 pl-4 py-3 my-6 bg-zinc-900/20 rounded-2xl hover:bg-zinc-900/30 transition-colors"
                >
                    <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">
                        Crucial Tip
                    </p>
                    <p className="text-zinc-500 text-sm leading-relaxed font-light">{cleanText(line)}</p>
                </div>
            );
        }

        const exerciseMatch = line.match(/^([*-]|\d+\.)\s+(.*?):\s+(.*)$/);
        if (exerciseMatch) {
            const [, prefix, title, details] = exerciseMatch;
            return (
                <ExpandableExerciseItem
                    key={i}
                    prefix={prefix}
                    title={cleanText(title)}
                    details={cleanText(details)}
                />
            );
        }

        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            return (
                <InteractiveListItem key={i} text={cleanText(line.replace(/^[*-]\s+/, ''))} />
            );
        }

        if (/^\d+\.\s/.test(trimmedLine)) {
            return (
                <div
                    key={i}
                    className="flex space-x-4 mb-4 items-start group p-2 -mx-2 rounded-2xl hover:bg-zinc-900/20 transition-colors"
                >
                    <span className="font-bold text-white shrink-0 w-6 h-6 border border-zinc-700 flex items-center justify-center text-[10px] group-hover:border-zinc-500 transition-colors">
                        {trimmedLine.split('.')[0]}
                    </span>
                    <span className="text-zinc-500 leading-7 font-light group-hover:text-zinc-300 transition-colors">
                        {cleanText(trimmedLine.replace(/^\d+\.\s/, ''))}
                    </span>
                </div>
            );
        }

        if (trimmedLine.toLowerCase().startsWith('day') && (trimmedLine.includes(':') || trimmedLine.length < 20)) {
            return (
                <div key={i} className="mt-10 mb-6">
                    <span className="inline-block px-3 py-1 border border-zinc-800 text-xs font-bold text-white bg-zinc-900/20 tracking-wide mb-2 rounded-2xl">
                        {cleanText(line.split(':')[0] || line)}
                    </span>
                    {line.includes(':') && (
                        <p className="text-zinc-500 font-light italic">{cleanText(line.split(':')[1])}</p>
                    )}
                </div>
            );
        }

        return (
            <p key={i} className="text-zinc-500 leading-relaxed mb-4 text-base font-light">
                {cleanText(line)}
            </p>
        );
    });
}

function parsePlan(content: string) {
    const lines = content.split('\n');
    const introLines: string[] = [];
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;
    let mainTitle = '';

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
            mainTitle = cleanText(trimmed.replace('# ', ''));
        } else if (trimmed.startsWith('## ')) {
            if (currentSection) sections.push(currentSection);
            currentSection = { title: cleanText(trimmed.replace('## ', '')), content: [] };
        } else {
            if (currentSection) {
                currentSection.content.push(line);
            } else if (!trimmed.startsWith('# ')) {
                introLines.push(line);
            }
        }
    });
    if (currentSection) sections.push(currentSection);

    return { mainTitle, introLines, sections };
}

// ─── Audio helpers ─────────────────────────────────────────────────────────

function decodePCM(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): AudioBuffer {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface PlanDisplayProps {
    plan: string;
    onSave?: () => void;
    onRegenerate?: () => void;
    isSaved?: boolean;
    isSaving?: boolean;
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function PlanDisplay({
    plan,
    onSave,
    onRegenerate,
    isSaved = false,
    isSaving = false,
}: PlanDisplayProps) {
    const { mainTitle, introLines, sections } = parsePlan(plan);

    // Coach audio state
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const [isCoachPlaying, setIsCoachPlaying] = useState(false);
    const coachAudioCtxRef = useRef<AudioContext | null>(null);
    const coachSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Image refinement
    const [isRefining, setIsRefining] = useState(false);
    const [showImagePrompt, setShowImagePrompt] = useState(true);
    const [refinedPlan, setRefinedPlan] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Share toast
    const [shareToast, setShareToast] = useState(false);

    const displayPlan = refinedPlan || plan;
    const { mainTitle: dt, introLines: di, sections: ds } = parsePlan(displayPlan);

    const stopCoach = () => {
        try { coachSourceRef.current?.stop(); } catch { /* already stopped */ }
        coachSourceRef.current = null;
        setIsCoachPlaying(false);
    };

    const handleCoachToggle = async () => {
        if (isCoachPlaying) { stopCoach(); return; }
        setIsCoachLoading(true);
        try {
            const { generateCoachAudio } = await import('../services/geminiService');
            const base64Audio = await generateCoachAudio(displayPlan);
            const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!coachAudioCtxRef.current) coachAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
            const ctx = coachAudioCtxRef.current;
            if (ctx.state === 'suspended') await ctx.resume();
            const audioBuffer = decodePCM(decodeBase64(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => { setIsCoachPlaying(false); coachSourceRef.current = null; };
            source.start();
            coachSourceRef.current = source;
            setIsCoachPlaying(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCoachLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsRefining(true);
        setShowImagePrompt(false);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            try {
                const { refinePlanWithImage } = await import('../services/geminiService');
                const refined = await refinePlanWithImage(
                    { age: '', height: '', activityLevel: 'Medium', faceShape: 'Unsure', hairTexture: 'Unsure', equipment: 'None', dietaryRestrictions: '' },
                    displayPlan,
                    base64String,
                    file.type
                );
                setRefinedPlan(refined);
            } catch (err) {
                console.error(err);
            } finally {
                setIsRefining(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleExportPDF = () => window.print();

    const handleShare = useCallback(async () => {
        const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://forge.app';
        const shareData = {
            title: 'Forge — My 30-Day Plan',
            text: 'Check out my 30-day transformation plan on Forge! 💪',
            url: appUrl,
        };
        if (typeof navigator !== 'undefined' && navigator.share) {
            try { await navigator.share(shareData); } catch { /* user dismissed */ }
        } else {
            try {
                await navigator.clipboard.writeText(appUrl);
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2500);
            } catch {
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2500);
            }
        }
    }, []);

    return (
        <div style={{ animation: 'fadeInUp 225ms ease-out both' }}>
            {/* Plan card */}
            <div className="border border-zinc-800 bg-zinc-900/20 rounded-2xl p-8 md:p-14 mb-16">

                {/* Main title */}
                {dt && (
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight tracking-tight">
                        {dt}
                    </h1>
                )}

                {/* Blueprint label */}
                <div className="flex justify-center mb-8">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.25em]">
                        Your 30-Day Blueprint
                    </p>
                </div>

                {/* Safety + Coach bar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between p-6 border border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <div className="flex items-start space-x-4">
                        <Shield className="w-5 h-5 text-zinc-500" />
                        <div>
                            <p className="text-xs font-normal text-zinc-500 uppercase tracking-widest mb-2">Safety Check</p>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Safe, sustainable growth. No extremes. Prioritising long-term health.
                            </p>
                        </div>
                    </div>

                    {/* Coach button */}
                    <button
                        onClick={handleCoachToggle}
                        disabled={isCoachLoading}
                        className={`min-w-[140px] flex items-center justify-center gap-2 text-xs font-normal uppercase tracking-widest py-3 px-6 rounded-full border transition-all duration-300 disabled:opacity-50 active:opacity-80 ${isCoachPlaying ? 'border-red-500/30 text-red-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'}`}
                    >
                        {isCoachLoading ? (
                            <span className="w-4 h-4 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                        ) : isCoachPlaying ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="relative inline-flex h-2 w-2 bg-red-500" style={{ animation: 'subtlePulse 1.5s ease-in-out infinite' }} />
                                </span>
                                Stop Coach
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Your Coach
                            </>
                        )}
                    </button>
                </div>

                {/* Plan intro */}
                <div className="prose prose-invert max-w-none mb-8">
                    {renderContentLines(di)}
                </div>

                {/* Collapsible sections */}
                <div className="space-y-0">
                    {ds.map((section, idx) => (
                        <CollapsibleSection
                            key={idx}
                            title={section.title}
                            defaultOpen={idx === 0 || idx === 1}
                        >
                            {renderContentLines(section.content)}
                        </CollapsibleSection>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="mt-16 pt-10 border-t border-zinc-800 flex flex-wrap justify-center gap-4 print:hidden">
                    {onSave && (
                        isSaved ? (
                            <button
                                disabled
                                className="min-w-[160px] py-4 px-8 rounded-full border border-emerald-500/50 text-emerald-500 text-sm font-normal opacity-70 cursor-default"
                            >
                                Saved to Vault ✓
                            </button>
                        ) : isSaving ? (
                            <button
                                disabled
                                className="min-w-[160px] py-4 px-8 rounded-full border border-zinc-800 text-zinc-500 text-sm font-normal flex items-center justify-center gap-2 cursor-default opacity-70"
                            >
                                <span className="w-4 h-4 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                                Saving…
                            </button>
                        ) : (
                            <button
                                onClick={onSave}
                                className="min-w-[160px] py-4 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  transition-all duration-300 text-sm font-normal active:opacity-80"
                            >
                                Save to Vault
                            </button>
                        )
                    )}

                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="min-w-[160px] py-4 px-8 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-300 text-sm font-normal flex items-center justify-center active:opacity-80"
                        >
                            Regenerate
                        </button>
                    )}

                    <button
                        onClick={handleShare}
                        className="min-w-[160px] py-4 px-8 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-300 text-sm font-normal flex items-center justify-center gap-2 active:opacity-80"
                    >
                        Share
                    </button>

                    <button
                        onClick={handleExportPDF}
                        className="min-w-[160px] py-4 px-8 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-300 text-sm font-normal flex items-center justify-center active:opacity-80"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Image refinement section */}
            {showImagePrompt && !isRefining && (
                <div className="border border-zinc-800 rounded-2xl p-8 md:p-10 mb-16 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors">
                    <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center gap-8">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2 text-white">Visual Calibration</h2>
                            <p className="text-zinc-500 mb-6 font-light text-sm leading-relaxed">
                                Upload a photo to refine posture and grooming suggestions with visual data.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="py-4 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  transition-all duration-300 text-sm font-normal active:opacity-80"
                                >
                                    Upload Photo
                                </button>
                                <button
                                    onClick={() => setShowImagePrompt(false)}
                                    className="py-4 px-8 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-300 text-sm font-normal active:opacity-80"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-24 bg-zinc-800" />
                        <div className="text-xs text-zinc-600 font-mono space-y-1">
                            <p>PRIVACY PROTECTED</p>
                            <p>NO DATA STORAGE</p>
                            <p>ANALYSIS ONLY</p>
                        </div>
                    </div>
                </div>
            )}

            {isRefining && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h3 className="text-base font-light text-white tracking-widest uppercase" style={{ animation: 'subtlePulse 2s ease-in-out infinite' }}>
                        Processing Visuals
                    </h3>
                    <p className="text-zinc-500 text-sm font-light mt-3">
                        Aligning recommendations with visual data.
                    </p>
                </div>
            )}

            {/* Share toast */}
            {shareToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-full border border-zinc-800 bg-black text-white text-sm font-normal" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                    Link copied to clipboard
                </div>
            )}

            {/* Print styles */}
            <style>{`
        @media print {
          body { background: white; color: black; }
          .print\\:hidden { display: none; }
        }
      `}</style>
        </div>
    );
}
