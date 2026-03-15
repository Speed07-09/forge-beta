'use client'

import { useState, useEffect } from 'react'

interface ConfirmationModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    confirmStyle?: 'danger' | 'warning' | 'primary'
    requireTypedConfirmation?: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    confirmStyle = 'primary',
    requireTypedConfirmation,
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    const [typedValue, setTypedValue] = useState('')

    useEffect(() => {
        if (!isOpen) setTypedValue('')
    }, [isOpen])

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const confirmDisabled =
        requireTypedConfirmation !== undefined && typedValue !== requireTypedConfirmation

    const confirmClasses =
        confirmStyle === 'danger'
            ? 'border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed'
            : confirmStyle === 'warning'
                ? 'border-yellow-500/30 text-yellow-400 hover:border-yellow-500/60 hover:text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed'
                : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-full disabled:opacity-40 disabled:cursor-not-allowed'

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <div
                className="bg-black border border-zinc-800 rounded-2xl p-8 max-w-md w-full"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'fadeInUp 225ms ease-out both' }}
            >
                {/* Title */}
                <h2 className="text-xl font-bold text-white mb-3">{title}</h2>

                {/* Message */}
                <p className="text-zinc-500 leading-relaxed mb-6 text-sm font-light">{message}</p>

                {/* Typed confirmation input */}
                {requireTypedConfirmation && (
                    <div className="mb-6">
                        <label className="block text-xs font-normal text-zinc-500 uppercase tracking-widest mb-2">
                            Type &ldquo;{requireTypedConfirmation}&rdquo; to confirm
                        </label>
                        <input
                            type="text"
                            value={typedValue}
                            onChange={e => setTypedValue(e.target.value)}
                            placeholder={requireTypedConfirmation}
                            autoFocus
                            className="w-full bg-zinc-900/20 border border-zinc-800 rounded-2xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors font-mono text-sm"
                        />
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 px-6 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-all duration-300 text-sm font-normal active:opacity-80"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className={`flex-1 py-4 px-6 rounded-full border transition-all duration-300 text-sm font-normal active:opacity-80 ${confirmClasses}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
