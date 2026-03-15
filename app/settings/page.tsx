'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '../components/AuthGuard'
import ConfirmationModal from '../components/ConfirmationModal'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { isAdmin } from '../lib/adminCheck'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning'

function Toast({
    message,
    type,
    onDone,
}: {
    message: string
    type: ToastType
    onDone: () => void
}) {
    useEffect(() => {
        const t = setTimeout(onDone, 3500)
        return () => clearTimeout(t)
    }, [onDone])

    const colors =
        type === 'success'
            ? 'border-emerald-500/30 text-emerald-500'
            : type === 'error'
                ? 'border-red-500/30 text-red-400'
                : 'border-yellow-500/30 text-yellow-400'

    const Icon =
        type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : AlertTriangle

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-full border bg-black text-sm font-normal ${colors}`} style={{ animation: 'fadeInUp 225ms ease-out both' }}>
            <Icon className="w-4 h-4 shrink-0" />
            {message}
        </div>
    )
}

function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        setToast({ message, type })
    }, [])

    const clearToast = useCallback(() => setToast(null), [])

    return { toast, showToast, clearToast }
}

// ─── Avatar initials helper ───────────────────────────────────────────────────

function getInitials(username: string | null, email: string | null): string {
    const source = username || email || '?'
    const parts = source.split(/[\s@._-]+/).filter(Boolean).slice(0, 2)
    return parts.map(p => p[0].toUpperCase()).join('') || '?'
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20">
            <h2 className="text-xs font-normal text-zinc-500 mb-6 uppercase tracking-widest">{title}</h2>
            {children}
        </div>
    )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
    return <div className="border-t border-zinc-800/50 my-6" />
}

// ─── Main settings content ─────────────────────────────────────────────────────

function SettingsContent() {
    const router = useRouter()
    const { user, signOut } = useAuth()
    const { toast, showToast, clearToast } = useToast()
    const [adminAccess, setAdminAccess] = useState(false)

    // Check admin status on mount
    useEffect(() => {
        isAdmin().then(setAdminAccess)
    }, [])

    // Profile state
    const [username, setUsername] = useState<string>('')
    const [editingUsername, setEditingUsername] = useState(false)
    const [draftUsername, setDraftUsername] = useState('')
    const [savingUsername, setSavingUsername] = useState(false)

    // Modal state
    const [modal, setModal] = useState<
        null | 'logout' | 'resetProgress' | 'deleteAccount'
    >(null)

    // Action loading states
    const [resettingProgress, setResettingProgress] = useState(false)
    const [deletingAccount, setDeletingAccount] = useState(false)

    // Load profile on mount
    useEffect(() => {
        if (!user) return
        const loadProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()
            if (data?.username) setUsername(data.username)
        }
        loadProfile()
    }, [user])

    // ── Username edit ──────────────────────────────────────────────────────────

    const startEditing = () => {
        setDraftUsername(username)
        setEditingUsername(true)
    }

    const cancelEditing = () => {
        setEditingUsername(false)
        setDraftUsername('')
    }

    const saveUsername = async () => {
        if (!user) return
        if (!draftUsername.trim()) {
            showToast('Username cannot be empty.', 'error')
            return
        }
        setSavingUsername(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, username: draftUsername.trim() }, { onConflict: 'id' })
            if (error) throw error
            setUsername(draftUsername.trim())
            setEditingUsername(false)
            showToast('Username updated!', 'success')
        } catch (err) {
            console.error(err)
            showToast('Failed to update username. Please try again.', 'error')
        } finally {
            setSavingUsername(false)
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    const handleLogout = async () => {
        setModal(null)
        try {
            await signOut()
            showToast('Signed out successfully', 'success')
            setTimeout(() => router.replace('/signin'), 800)
        } catch {
            showToast('Failed to sign out. Please try again.', 'error')
        }
    }

    // ── Reset progress ────────────────────────────────────────────────────────

    const handleResetProgress = async () => {
        if (!user) return
        setModal(null)
        setResettingProgress(true)
        try {
            const { error } = await supabase
                .from('habit_completions')
                .delete()
                .eq('user_id', user.id)
            if (error) throw error
            showToast('Progress reset. Start fresh!', 'success')
            // Redirect to tracker so the user sees habits unchecked
            setTimeout(() => router.push('/tracker'), 1200)
        } catch (err) {
            console.error(err)
            showToast('Failed to reset progress. Please try again.', 'error')
        } finally {
            setResettingProgress(false)
        }
    }

    // ── Delete account ────────────────────────────────────────────────────────

    const handleDeleteAccount = async () => {
        if (!user) return
        setModal(null)
        setDeletingAccount(true)
        try {
            // Delete data in order (habit_completions → habits → plans → profile)
            await supabase.from('habit_completions').delete().eq('user_id', user.id)
            await supabase.from('habits').delete().eq('user_id', user.id)
            await supabase.from('plans').delete().eq('user_id', user.id)
            await supabase.from('profiles').delete().eq('id', user.id)
            await supabase.auth.signOut()
            showToast('Account deleted.', 'success')
            setTimeout(() => router.replace('/signin'), 800)
        } catch (err) {
            console.error(err)
            showToast('Failed to delete account. Please contact support.', 'error')
        } finally {
            setDeletingAccount(false)
        }
    }

    const email = user?.email ?? null
    const initials = getInitials(username || null, email)

    return (
        <div className="min-h-screen bg-black text-white pb-32">
            <div className="max-w-2xl mx-auto px-6 py-8 md:px-8 md:py-12">

                {/* Header */}
                <div className="mb-12 md:mb-16" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Settings</h1>
                    <p className="text-zinc-500 font-light text-base">Manage your account and preferences</p>
                </div>

                <div className="space-y-8 md:space-y-12" style={{ animation: 'fadeInUp 225ms ease-out 100ms both' }}>

                    {/* ── PROFILE SECTION ──────────────────────────────────────────── */}
                    <Section title="Profile">
                        {/* Avatar + info row */}
                        <div className="flex items-center gap-5 mb-8">
                            {/* Avatar */}
                            <div
                                className="w-16 h-16 border border-zinc-800 rounded-2xl bg-zinc-900/20 flex flex-col items-center justify-center shrink-0 text-white text-xl font-bold select-none"
                                aria-label="Avatar"
                            >
                                {initials}
                            </div>

                            {/* Name / email */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate mb-1 tracking-tight">{username || 'No username set'}</p>
                                <p className="text-zinc-500 text-sm truncate font-light">{email}</p>
                            </div>
                        </div>

                        {/* Username edit */}
                        <div>
                            <label className="block text-xs font-normal text-zinc-500 uppercase tracking-widest mb-3">
                                Username
                            </label>
                            {editingUsername ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={draftUsername}
                                        onChange={e => setDraftUsername(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') cancelEditing() }}
                                        className="flex-1 bg-zinc-900/20 border border-zinc-800 focus:border-white rounded-2xl px-5 py-4 text-white placeholder-zinc-700 focus:outline-none transition-all text-sm font-light"
                                        placeholder="Enter your new username"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveUsername}
                                            disabled={savingUsername}
                                            className="flex-1 sm:flex-none py-4 px-6 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700  disabled:opacity-50 transition-all text-sm font-normal"
                                        >
                                            {savingUsername ? '…' : 'Save'}
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="flex-1 sm:flex-none py-4 px-6 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm font-normal"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 border border-zinc-800 bg-zinc-900/20 rounded-2xl">
                                    <span className="text-zinc-400 font-light text-base">{username || <span className="text-zinc-700 italic">Not set</span>}</span>
                                    <button
                                        onClick={startEditing}
                                        className="py-3 px-6 rounded-full border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 transition-all text-xs font-normal tracking-widest uppercase"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-xs font-normal text-zinc-500 uppercase tracking-widest mb-2">
                                Email
                            </label>
                            <p className="text-zinc-400 font-light p-4 border border-zinc-800 bg-zinc-900/20 rounded-2xl">{email ?? '—'}</p>
                        </div>
                    </Section>

                    {/* ── ADMIN SECTION (only shown to admin) ───────────────────────── */}
                    {adminAccess && (
                        <Section title="Admin">
                            <Link
                                href="/admin"
                                className="flex items-center justify-between py-4 px-5 border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all rounded-2xl group active:opacity-80"
                            >
                                <span className="font-normal text-white text-sm">Admin Dashboard</span>
                                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                            </Link>
                        </Section>
                    )}

                    {/* ── ACCOUNT SECTION ──────────────────────────────────────────── */}
                    <Section title="Account">
                        <div className="space-y-4">

                            {/* Logout */}
                            <button
                                onClick={() => setModal('logout')}
                                className="w-full py-4 px-5 rounded-full border border-zinc-800 text-white hover:bg-zinc-900/30 hover:border-zinc-700 transition-all duration-300 text-sm font-normal text-left flex items-center justify-between active:opacity-80"
                            >
                                Sign Out
                                <span className="text-zinc-700">→</span>
                            </button>

                            {/* Reset progress */}
                            <button
                                onClick={() => setModal('resetProgress')}
                                disabled={resettingProgress}
                                className="w-full py-4 px-5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/30 hover:border-zinc-700 disabled:opacity-50 transition-all duration-300 text-sm font-normal text-left flex items-center justify-between active:opacity-80"
                            >
                                {resettingProgress ? 'Resetting…' : 'Reset Progress'}
                                <span className="text-zinc-700">→</span>
                            </button>

                            {/* Delete account */}
                            <button
                                onClick={() => setModal('deleteAccount')}
                                disabled={deletingAccount}
                                className="w-full py-4 px-5 rounded-full border border-zinc-800 text-red-500 hover:border-red-500/30 disabled:opacity-50 transition-all duration-300 text-sm font-normal text-left flex items-center justify-between active:opacity-80"
                            >
                                {deletingAccount ? 'Deleting…' : 'Delete Account'}
                                <span className="text-red-500/30">→</span>
                            </button>
                        </div>
                    </Section>

                    {/* ── ABOUT SECTION ────────────────────────────────────────────── */}
                    <Section title="About">
                        <ul className="space-y-0 divide-y divide-zinc-800/50">
                            <li className="flex items-center justify-between py-4">
                                <span className="text-zinc-500 font-normal text-sm">App Version</span>
                                <span className="text-zinc-400 text-sm font-mono">Forge v1.0.0</span>
                            </li>
                            <li>
                                <a
                                    href="mailto:feedback@forge.app"
                                    className="flex items-center justify-between py-4 text-zinc-500 hover:text-white transition-colors text-sm font-normal active:opacity-80"
                                >
                                    Send Feedback
                                    <span className="text-zinc-700">→</span>
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="flex items-center justify-between py-4 text-zinc-500 hover:text-white transition-colors text-sm font-normal active:opacity-80"
                                >
                                    Privacy Policy
                                    <span className="text-zinc-700">→</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="flex items-center justify-between py-4 text-zinc-500 hover:text-white transition-colors text-sm font-normal active:opacity-80"
                                >
                                    Terms of Service
                                    <span className="text-zinc-700">→</span>
                                </Link>
                            </li>
                        </ul>
                    </Section>

                </div>
            </div>

            {/* ── MODALS ──────────────────────────────────────────────────────── */}

            {/* Logout modal */}
            <ConfirmationModal
                isOpen={modal === 'logout'}
                title="Sign Out?"
                message="You'll be redirected to the sign-in page. You can sign back in anytime."
                confirmText="Sign Out"
                cancelText="Cancel"
                confirmStyle="primary"
                onConfirm={handleLogout}
                onCancel={() => setModal(null)}
            />

            {/* Reset progress modal */}
            <ConfirmationModal
                isOpen={modal === 'resetProgress'}
                title="Reset Your Progress?"
                message="This will delete all habit completions. Your plans and habits will remain. This cannot be undone."
                confirmText="Reset Progress"
                cancelText="Cancel"
                confirmStyle="danger"
                onConfirm={handleResetProgress}
                onCancel={() => setModal(null)}
            />

            {/* Delete account modal */}
            <ConfirmationModal
                isOpen={modal === 'deleteAccount'}
                title="Delete Your Account?"
                message="This will permanently delete your account, all plans, habits, and progress. This action cannot be undone. Are you absolutely sure?"
                confirmText="Delete Forever"
                cancelText="Cancel"
                confirmStyle="danger"
                requireTypedConfirmation="DELETE"
                onConfirm={handleDeleteAccount}
                onCancel={() => setModal(null)}
            />

            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onDone={clearToast} />
            )}
        </div>
    )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
    return (
        <AuthGuard>
            <SettingsContent />
        </AuthGuard>
    )
}
