"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import AbstractBackground from "@/app/components/AbstractBackground";
import { useRouter } from "next/navigation";

/* ─── Screen data ─── */
const screens = [
    {
        title: "FORGE",
        isLogo: true,
        description: "Welcome. Your transformation journey starts here.",
        variant: "wave" as const,
    },
    {
        title: "Plan Generation",
        isLogo: false,
        description: "We analyze your profile to curate a specialized 30-day blueprint. Small daily actions compound into extraordinary results.",
        variant: "geometric" as const,
    },
    {
        title: "Tracker & Vault",
        isLogo: false,
        description: "Visualize your streaks in the interactive Tracker and save all your historic 30-day blueprints securely in the Vault.",
        variant: "circle" as const,
    },
    {
        title: "Ready to FORGE your 30 day path?",
        isLogo: false,
        description: "Click sign-up below",
        variant: "wave" as const,
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState<"left" | "right" | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const isLast = current === screens.length - 1;

    /* ─── Navigation ─── */
    const goTo = useCallback(
        (next: number, dir: "left" | "right") => {
            if (isAnimating || next < 0 || next >= screens.length) return;
            setDirection(dir);
            setIsAnimating(true);
            setTimeout(() => {
                setCurrent(next);
                setDirection(null);
                setIsAnimating(false);
            }, 300);
        },
        [isAnimating]
    );

    const goNext = () => goTo(current + 1, "left");

    /* ─── Touch handling ─── */
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const threshold = 50;

        if (deltaX < -threshold && current < screens.length - 1) {
            goTo(current + 1, "left");
        } else if (deltaX > threshold && current > 0) {
            goTo(current - 1, "right");
        }

        touchStartX.current = null;
    };

    const screen = screens[current];

    /* ─── Slide animation style ─── */
    const slideStyle: React.CSSProperties = direction
        ? {
            animation: `slide${direction === "left" ? "Left" : "Right"} 300ms ease-out forwards`,
        }
        : { animation: "fadeInUp 0.5s ease-out both" };

    return (
        <div
            className="relative min-h-screen bg-background flex flex-col items-center justify-between overflow-hidden select-none font-body"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background elements running constantly */}
            {!screen.isLogo && (
               <div className="absolute inset-0 z-0 opacity-40 pointer-events-none transition-opacity duration-1000">
                   <AbstractBackground variant={screen.variant} />
               </div>
            )}

            {/* Skip */}
            {!isLast && (
                <div
                    className="absolute z-20"
                    style={{
                        top: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
                        right: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
                    }}
                >
                    <Link
                        href="/signup"
                        className="text-sm font-bold tracking-wide uppercase text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                    >
                        Skip
                    </Link>
                </div>
            )}

            {/* ─── Main content ─── */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-8 relative z-10">
                {/* Visuals */}
                {screen.isLogo && (
                    <div className="relative flex items-center justify-center w-full mb-8" key={`visual-${current}`} style={slideStyle}>
                       {/* Subtle glow behind the logo */}
                       <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full pointer-events-none w-64 h-64 mx-auto" />
                    </div>
                )}

                {/* Text */}
                <div className={`text-center ${screen.isLogo ? '-mt-24' : 'mt-12'}`} key={`text-${current}`} style={slideStyle}>
                    {screen.isLogo ? (
                        <h1 className="text-5xl sm:text-7xl font-bold tracking-[0.2em] font-headline text-on-surface mb-6 drop-shadow-[0_0_15px_rgba(192,193,255,0.3)]">
                            {screen.title}
                        </h1>
                    ) : (
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface font-headline mb-6 drop-shadow-md">
                            {screen.title}
                        </h2>
                    )}
                    
                    {screen.description && (
                        <p className="text-on-surface-variant text-base sm:text-lg font-medium leading-relaxed max-w-xs mx-auto drop-shadow-sm">
                            {screen.description}
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Bottom controls ─── */}
            <div className="w-full max-w-md mx-auto px-8 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] flex flex-col items-center gap-8 relative z-20">
                {/* Dot indicators */}
                <div className="flex items-center gap-3">
                    {screens.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i, i > current ? "left" : "right")}
                            aria-label={`Go to screen ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${i === current
                                ? "w-8 h-2 lit-gradient"
                                : "w-2 h-2 bg-surface-high hover:bg-outline"
                                }`}
                        />
                    ))}
                </div>

                {/* Action button */}
                {isLast ? (
                    <button
                        onClick={() => router.push("/signup")}
                        className="w-full h-14 lit-gradient text-background rounded-full text-[15px] font-bold tracking-wide flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(192,193,255,0.3)]"
                    >
                        Sign-up
                    </button>
                ) : (
                    <button
                        onClick={goNext}
                        className="w-full h-14 ghost-border bg-surface-low text-on-surface rounded-full text-[15px] font-bold tracking-wide flex items-center justify-center hover:bg-surface-high hover:border-outline active:scale-[0.98] transition-all duration-300"
                    >
                        Next
                    </button>
                )}
            </div>

            {/* Global style for sliding animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideLeft {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}} />
        </div>
    );
}
