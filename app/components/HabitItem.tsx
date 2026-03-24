"use client";

import { Habit } from "@/app/types";
import { Check, Trash2 } from "lucide-react";

interface HabitItemProps {
    habit: Habit;
    isCompleted: boolean;
    onToggle: () => void;
    onDelete?: (habitId: string) => void;
}

export default function HabitItem({ habit, isCompleted, onToggle, onDelete }: HabitItemProps) {
    return (
        <div
            className={`
                group flex items-start gap-4 p-6 border cursor-pointer transition-all duration-300 rounded-2xl active:opacity-80
                ${isCompleted
                    ? "border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/30"
                    : "border-transparent hover:border-zinc-800 hover:bg-zinc-900/20"
                }
            `}
        >
            {/* Rounded Checkbox — clicking toggles completion */}
            <div className="pt-0.5 shrink-0" onClick={onToggle}>
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

            {/* Content — clicking toggles completion */}
            <div className="flex-1 min-w-0" onClick={onToggle}>
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

            {/* Delete button — ONLY for custom habits, never plan-generated habits */}
            {habit.is_custom && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(habit.id);
                    }}
                    aria-label="Delete custom habit"
                    className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-9 h-9 flex items-center justify-center ghost-border bg-surface-high text-on-surface-variant hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all duration-300 active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
