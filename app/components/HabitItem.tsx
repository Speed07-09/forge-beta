"use client";

import { Habit } from "@/app/types";
import { Check } from "lucide-react";

interface HabitItemProps {
    habit: Habit;
    isCompleted: boolean;
    onToggle: () => void;
}

export default function HabitItem({ habit, isCompleted, onToggle }: HabitItemProps) {
    return (
        <div
            onClick={onToggle}
            className={`
                group flex items-start gap-4 p-6 border cursor-pointer transition-all duration-300 rounded-2xl active:opacity-80
                ${isCompleted
                    ? "border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/30"
                    : "border-transparent hover:border-zinc-800 hover:bg-zinc-900/20"
                }
            `}
        >
            {/* Rounded Checkbox */}
            <div className="pt-0.5 shrink-0">
                <div
                    className={`
                        w-5 h-5 border rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted
                            ? "bg-white border-white"
                            : "border-zinc-700 group-hover:border-zinc-500"
                        }
                    `}
                >
                    {isCompleted && (
                        <Check
                            className="w-3 h-3 text-black"
                            strokeWidth={3}
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                    <h3
                        className={`text-[17px] font-bold transition-colors duration-300 font-headline ${isCompleted
                            ? "text-on-surface-variant line-through"
                            : "text-on-surface"
                            }`}
                    >
                        {habit.habit_name}
                    </h3>
                    {habit.is_custom && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
                            Custom
                        </span>
                    )}
                </div>
                {habit.habit_description && (
                    <p
                        className={`text-sm mt-1.5 font-medium transition-colors duration-300 ${isCompleted
                            ? "text-on-surface-variant opacity-50"
                            : "text-on-surface-variant"
                            }`}
                    >
                        {habit.habit_description}
                    </p>
                )}
            </div>
        </div>
    );
}
