"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import AbstractBackground from "@/app/components/AbstractBackground";

/* ─── Screen data ─── */
const screens = [
    {
        title: "Build Lasting Habits",
        description: "Small daily actions compound into extraordinary results. Forge helps you stay on track.",
        variant: "circle" as const,
    },
    {
        title: "Track Your Progress",
        description: "Visualize your streak, completion rate, and growth over 30 transformative days.",
        variant: "wave" as const,
    },
    {
        title: "Transform in 30 Days",
        description: "A focused 30-day program designed to rewire your routines and unlock your potential.",
        variant: "geometric" as const,
    },
];

export default function OnboardingPage() {
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
            className="relative min-h-screen bg-black flex flex-col items-center justify-between overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Skip */}
            {!isLast && (
                <div className="absolute top-6 right-6 z-20">
                    <Link
                        href="/signin"
                        className="text-sm text-zinc-500 hover:text-white transition-colors duration-300"
                    >
                        Skip
                    </Link>
                </div>
            )}

            {/* ─── Main content ─── */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-8">
                {/* Abstract visual */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-12" key={`visual-${current}`} style={slideStyle}>
                    <AbstractBackground variant={screen.variant} className="absolute inset-0 overflow-hidden pointer-events-none" />
                </div>

                {/* Text */}
                <div className="text-center" key={`text-${current}`} style={slideStyle}>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                        {screen.title}
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed max-w-xs mx-auto">
                        {screen.description}
                    </p>
                </div>
            </div>

            {/* ─── Bottom controls ─── */}
            <div className="w-full max-w-md mx-auto px-8 pb-12 flex flex-col items-center gap-8">
                {/* Dot indicators */}
                <div className="flex items-center gap-3">
                    {screens.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i, i > current ? "left" : "right")}
                            aria-label={`Go to screen ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${i === current
                                ? "w-8 h-2 bg-white"
                                : "w-2 h-2 bg-zinc-600 hover:bg-zinc-400"
                                }`}
                        />
                    ))}
                </div>

                {/* Action button */}
                {isLast ? (
                    <Link
                        href="/signin"
                        className="w-full h-14 bg-white text-black rounded-full text-[15px] font-semibold tracking-wide flex items-center justify-center hover:bg-zinc-100 active:scale-[0.97] transition-all duration-300"
                    >
                        Sign In
                    </Link>
                ) : (
                    <button
                        onClick={goNext}
                        className="w-full h-14 border border-zinc-700 text-white rounded-full text-[15px] font-semibold tracking-wide flex items-center justify-center hover:border-zinc-500 hover:bg-white/5 active:scale-[0.97] transition-all duration-300"
                    >
                        Continue
                    </button>
                )}
            </div>
        </div>
    );
}
