'use client';

import React, { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';

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
        <div className="border-b border-outline-variant last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group focus:outline-none"
            >
                <h2 className="text-[17px] font-bold text-on-surface group-hover:text-primary transition-colors font-headline">
                    {title}
                </h2>
                <span
                    className={`transform transition-transform duration-300 text-on-surface-variant group-hover:text-primary ${isOpen ? 'rotate-180' : ''}`}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
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
        <div className="group flex items-start space-x-4 p-3 -mx-3 hover:bg-surface-high transition-all cursor-default duration-300 rounded-xl">
            <span className="text-primary/50 group-hover:text-primary mt-1.5 transition-colors text-[10px]">
                •
            </span>
            <span className="text-on-surface-variant group-hover:text-on-surface leading-relaxed font-medium flex-1 transition-colors">
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
            className={`transition-all duration-300 ${isExpanded ? 'bg-surface-low ghost-border my-4 rounded-xl shadow-md' : 'bg-transparent border border-transparent hover:bg-surface-high hover:ghost-border -mx-3 p-3 rounded-xl'}`}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full text-left flex items-start space-x-4 ${isExpanded ? 'p-4 pb-0' : ''}`}
            >
                <span
                    className={`text-[10px] mt-1.5 transition-colors ${isExpanded ? 'text-primary drop-shadow-[0_0_8px_rgba(192,193,255,0.5)]' : 'text-on-surface-variant'}`}
                >
                    {isExpanded ? '▼' : '▶'}
                </span>
                <div className="flex-1">
                    <span
                        className={`font-bold font-headline transition-colors ${isExpanded ? 'text-on-surface text-[17px]' : 'text-on-surface'}`}
                    >
                        {title}
                    </span>
                    {!isExpanded && (
                        <p className="text-on-surface-variant text-sm line-clamp-1 mt-1 font-medium">{details}</p>
                    )}
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 pt-4">
                    <p className="text-on-surface-variant leading-relaxed font-medium mb-6 text-sm">{details}</p>
                    <div className="mt-4 p-5 ghost-border rounded-xl bg-surface-high">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                            Visual Guide
                        </p>
                        <p className="text-on-surface-variant text-sm font-medium italic">
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
                <h3 key={i} className="text-[17px] font-bold text-on-surface mt-8 mb-4 font-headline">
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
                    className="border-l-2 border-secondary pl-5 py-4 my-6 bg-surface-high rounded-r-xl"
                >
                    <p className="text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-[0.15em]">
                        Crucial Tip
                    </p>
                    <p className="text-on-surface-variant text-sm leading-relaxed font-medium">{cleanText(line)}</p>
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
                    className="flex space-x-4 mb-4 items-start group p-3 -mx-2 rounded-xl hover:bg-surface-high transition-colors"
                >
                    <span className="font-bold text-primary shrink-0 w-6 h-6 ghost-border flex items-center justify-center text-[11px] group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors rounded-full">
                        {trimmedLine.split('.')[0]}
                    </span>
                    <span className="text-on-surface-variant leading-7 font-medium group-hover:text-on-surface transition-colors">
                        {cleanText(trimmedLine.replace(/^\d+\.\s/, ''))}
                    </span>
                </div>
            );
        }

        if (trimmedLine.toLowerCase().startsWith('day') && (trimmedLine.includes(':') || trimmedLine.length < 20)) {
            return (
                <div key={i} className="mt-10 mb-6">
                    <span className="inline-block px-3 py-1 ghost-border text-[11px] font-bold text-primary bg-surface-low uppercase tracking-[0.15em] mb-2 rounded-[6px]">
                        {cleanText(line.split(':')[0] || line)}
                    </span>
                    {line.includes(':') && (
                        <p className="text-on-surface-variant font-medium italic">{cleanText(line.split(':')[1])}</p>
                    )}
                </div>
            );
        }

        return (
            <p key={i} className="text-on-surface-variant leading-relaxed mb-4 text-[15px] font-medium">
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
    const { mainTitle: dt, introLines: di, sections: ds } = parsePlan(plan);

    // Share toast
    const [shareToast, setShareToast] = useState(false);

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
            <div className="glass-panel ghost-border rounded-[24px] p-8 md:p-14 mb-16 shadow-2xl relative overflow-hidden">

                {/* Main title */}
                {dt && (
                    <h1 className="text-[2.5rem] md:text-5xl font-bold text-on-surface mb-8 leading-tight tracking-tight font-headline relative z-10">
                        {dt}
                    </h1>
                )}

                {/* Blueprint label */}
                <div className="flex justify-center mb-10 relative z-10">
                    <p className="text-primary text-[11px] font-bold uppercase tracking-[0.25em] bg-primary/10 px-4 py-1.5 rounded-full">
                        Your 30-Day Blueprint
                    </p>
                </div>

                {/* Safety bar */}
                <div className="mb-10 flex items-start space-x-4 p-6 ghost-border rounded-xl bg-surface-high relative z-10">
                    <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.15em] mb-1.5">Safety Check</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                            Safe, sustainable growth. No extremes. Prioritising long-term health.
                        </p>
                    </div>
                </div>

                {/* Plan intro */}
                <div className="prose prose-invert max-w-none mb-10 relative z-10 text-on-surface-variant font-medium">
                    {renderContentLines(di)}
                </div>

                {/* Collapsible sections */}
                <div className="space-y-0 relative z-10">
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
                <div className="mt-16 pt-10 border-t border-outline-variant flex flex-wrap justify-center gap-4 print:hidden relative z-10">
                    {onSave && (
                        isSaved ? (
                            <button
                                disabled
                                className="min-w-[160px] py-3.5 px-8 rounded-full border border-secondary text-secondary text-[15px] font-bold opacity-70 cursor-default shadow-[0_0_15px_rgba(68,226,205,0.2)]"
                            >
                                Saved to Vault ✓
                            </button>
                        ) : isSaving ? (
                            <button
                                disabled
                                className="min-w-[160px] py-3.5 px-8 rounded-full ghost-border text-on-surface-variant text-[15px] font-bold flex items-center justify-center gap-2 cursor-default opacity-70"
                            >
                                <span className="w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
                                Saving…
                            </button>
                        ) : (
                            <button
                                onClick={onSave}
                                className="min-w-[160px] py-3.5 px-8 rounded-full lit-gradient text-background transition-all duration-300 text-[15px] font-bold active:scale-95 hover:scale-[1.02]"
                            >
                                Save to Vault
                            </button>
                        )
                    )}

                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="min-w-[160px] py-3.5 px-8 rounded-full ghost-border text-on-surface-variant hover:border-outline hover:text-on-surface hover:bg-surface-high transition-all duration-300 text-[15px] font-bold flex items-center justify-center active:scale-95"
                        >
                            Regenerate
                        </button>
                    )}

                    <button
                        onClick={handleShare}
                        className="min-w-[160px] py-3.5 px-8 rounded-full ghost-border text-on-surface-variant hover:border-outline hover:text-on-surface hover:bg-surface-high transition-all duration-300 text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95"
                    >
                        Share
                    </button>

                    <button
                        onClick={handleExportPDF}
                        className="min-w-[160px] py-3.5 px-8 rounded-full ghost-border text-on-surface-variant hover:border-outline hover:text-on-surface hover:bg-surface-high transition-all duration-300 text-[15px] font-bold flex items-center justify-center active:scale-95"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Share toast */}
            {shareToast && (
                <div
                    className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-full border border-zinc-800 bg-black text-white text-sm font-normal"
                    style={{ animation: 'fadeInUp 225ms ease-out both', bottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 24px)' }}
                >
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
