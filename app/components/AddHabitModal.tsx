"use client";

import { useState } from "react";

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => Promise<void>;
}

export default function AddHabitModal({ isOpen, onClose, onSave }: AddHabitModalProps) {
    const [habitName, setHabitName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!habitName.trim()) return;

        setIsSubmitting(true);
        try {
            await onSave(habitName.trim(), description.trim());
            // Reset state upon successful save so it's clean for next time
            setHabitName("");
            setDescription("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border border-zinc-800 rounded-2xl p-8 max-w-md w-full" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                <h2 className="text-lg font-bold text-white mb-6">Add Custom Habit</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Habit Name"
                            value={habitName}
                            onChange={(e) => setHabitName(e.target.value)}
                            required
                            autoFocus
                            className="bg-zinc-900/20 border border-zinc-800 text-white focus:border-white focus:outline-none w-full p-4 rounded-2xl placeholder:text-zinc-700 font-light transition-colors"
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-zinc-900/20 border border-zinc-800 text-white focus:border-white focus:outline-none w-full p-4 rounded-2xl min-h-[120px] resize-none placeholder:text-zinc-700 font-light transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-4 px-6 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-normal transition-all disabled:opacity-50 active:opacity-80"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !habitName.trim()}
                            className="flex-1 py-4 px-6 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  font-normal transition-all disabled:opacity-30 active:opacity-80"
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
