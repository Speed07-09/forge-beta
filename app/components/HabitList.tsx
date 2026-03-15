"use client";

import Link from "next/link";
import HabitItem from "./HabitItem";
import { Habit } from "@/app/types";
import { Plus } from "lucide-react";

interface HabitListProps {
    habits: Habit[];
    completedIds: string[];
    isLoading?: boolean;
    onToggle: (habitId: string) => void;
    onAddHabit: () => void;
}

export default function HabitList({
    habits,
    completedIds,
    isLoading = false,
    onToggle,
    onAddHabit,
}: HabitListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse flex items-start gap-5 p-6 ghost-border bg-surface-low rounded-2xl"
                    >
                        <div className="w-6 h-6 rounded-full bg-surface-high shrink-0" />
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-4 bg-surface-high w-1/3 rounded" />
                            <div className="h-3 bg-surface-high/50 w-2/3 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (habits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 ghost-border bg-surface-low rounded-2xl">
                <h3 className="text-2xl font-bold text-on-surface mb-3 font-headline">No habits yet</h3>
                <p className="text-on-surface-variant mb-10 max-w-sm font-medium leading-relaxed">
                    Generate a personalized plan to establish your daily routine and track your
                    progress.
                </p>
                <Link
                    href="/plans"
                    className="inline-flex items-center justify-center lit-gradient text-background rounded-full py-4 px-8 font-bold transition-all duration-300 active:scale-95 hover:scale-[1.02]"
                >
                    Create a Plan
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            <div className="grid gap-3">
                {habits.map((habit, index) => (
                    <div
                        key={habit.id}
                        className="opacity-0"
                        style={{ animation: `fadeInUp 225ms ease-out ${index * 50}ms forwards` }}
                    >
                        <HabitItem
                            habit={habit}
                            isCompleted={completedIds.includes(habit.id)}
                            onToggle={() => onToggle(habit.id)}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={onAddHabit}
                className="w-full mt-8 py-4 flex items-center justify-center gap-2 ghost-border rounded-full text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-high transition-all duration-300 active:scale-95 opacity-0 cursor-pointer"
                style={{ animation: `fadeInUp 225ms ease-out ${habits.length * 50 + 100}ms forwards` }}
            >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Add Custom Habit</span>
            </button>
        </div>
    );
}
