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
        <div className="fixed inset-0 bg-background/80 glass-panel z-50 flex items-center justify-center p-4">
            <div className="bg-surface ghost-border rounded-2xl p-8 max-w-md w-full shadow-2xl" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                <h2 className="text-xl font-bold text-on-surface mb-6 font-headline">Add Custom Habit</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Habit Name"
                            value={habitName}
                            onChange={(e) => setHabitName(e.target.value)}
                            required
                            autoFocus
                            className="bg-surface-low ghost-border text-on-surface focus:border-outline focus:outline-none w-full p-4 rounded-xl placeholder:text-on-surface-variant font-medium transition-colors"
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-surface-low ghost-border text-on-surface focus:border-outline focus:outline-none w-full p-4 rounded-xl min-h-[120px] resize-none placeholder:text-on-surface-variant font-medium transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-4 px-6 rounded-full ghost-border text-on-surface-variant hover:text-on-surface hover:bg-surface-high font-bold transition-all disabled:opacity-50 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !habitName.trim()}
                            className="flex-1 py-4 px-6 rounded-full lit-gradient text-background hover:scale-[1.02] font-bold transition-all disabled:opacity-30 active:scale-95"
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
