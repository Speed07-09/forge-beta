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
        <div className={`fixed left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-[16px] border bg-surface-high text-on-surface text-[14px] font-bold shadow-xl ${colors}`} style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 16px)', animation: 'fadeInUp 225ms ease-out both' }}>
            <Icon className="w-5 h-5 shrink-0" />
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
        <div className="ghost-border rounded-[24px] p-6 md:p-8 bg-surface-low relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-primary mb-6 uppercase tracking-[0.15em]">{title}</h2>
            {children}
        </div>
    )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
    return <div className="border-t border-outline-variant my-6" />
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
        <div className="min-h-screen bg-background text-on-surface font-body page-bottom-padding">
            <div className="max-w-2xl mx-auto px-6 pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-12 md:px-8 md:pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pb-16">

                {/* Header */}
                <div className="mb-12 md:mb-16" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2 font-headline">Settings</h1>
                    <p className="text-on-surface-variant font-medium text-base">Manage your account and preferences</p>
                </div>

                <div className="space-y-8 md:space-y-12" style={{ animation: 'fadeInUp 225ms ease-out 100ms both' }}>

                    {/* ── PROFILE SECTION ──────────────────────────────────────────── */}
                    <Section title="Profile">
                        {/* Avatar + info row */}
                        <div className="flex items-center gap-5 mb-8">
                            {/* Avatar */}
                            <div
                                className="w-[72px] h-[72px] ghost-border rounded-[20px] bg-surface-high flex flex-col items-center justify-center shrink-0 text-on-surface text-2xl font-bold select-none font-headline"
                                aria-label="Avatar"
                            >
                                {initials}
                            </div>

                            {/* Name / email */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-on-surface text-xl truncate mb-1 tracking-tight font-headline">{username || 'No username set'}</p>
                                <p className="text-on-surface-variant text-[15px] truncate font-medium">{email}</p>
                            </div>
                        </div>

                        {/* Username edit */}
                        <div>
                            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-3">
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
                                <div className="flex items-center justify-between p-4 px-5 ghost-border bg-surface-low rounded-xl">
                                    <span className="text-on-surface-variant font-medium text-[15px]">{username || <span className="text-on-surface-variant/50 italic">Not set</span>}</span>
                                    <button
                                        onClick={startEditing}
                                        className="py-3 px-6 rounded-full ghost-border text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-high transition-all text-[11px] font-bold tracking-[0.15em] uppercase active:scale-95"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-3">
                                Email
                            </label>
                            <p className="text-on-surface-variant font-medium p-4 px-5 ghost-border bg-surface-low rounded-xl text-[15px]">{email ?? '—'}</p>
                        </div>
                    </Section>

                    {/* ── ADMIN SECTION (only shown to admin) ───────────────────────── */}
                    {adminAccess && (
                        <Section title="Admin">
                            <Link
                                href="/admin"
                                className="flex items-center justify-between py-4 px-6 ghost-border bg-surface-low hover:bg-surface-high hover:border-outline transition-all rounded-xl group active:scale-[0.98]"
                            >
                                <span className="font-bold text-on-surface text-[15px]">Admin Dashboard</span>
                                <span className="text-primary group-hover:translate-x-1 transition-all">→</span>
                            </Link>
                        </Section>
                    )}

                    {/* ── ACCOUNT SECTION ──────────────────────────────────────────── */}
                    <Section title="Account">
                        <div className="space-y-4">

                            {/* Logout */}
                            <button
                                onClick={() => setModal('logout')}
                                className="w-full py-4 px-6 rounded-full ghost-border text-on-surface hover:bg-surface-high hover:border-outline transition-all duration-300 text-[15px] font-bold text-left flex items-center justify-between active:scale-95 group"
                            >
                                Sign Out
                                <span className="text-on-surface-variant group-hover:translate-x-1 transition-all">→</span>
                            </button>

                            {/* Reset progress */}
                            <button
                                onClick={() => setModal('resetProgress')}
                                disabled={resettingProgress}
                                className="w-full py-4 px-6 rounded-full ghost-border text-on-surface-variant hover:text-on-surface hover:bg-surface-high hover:border-outline disabled:opacity-50 transition-all duration-300 text-[15px] font-bold text-left flex items-center justify-between active:scale-95 group"
                            >
                                {resettingProgress ? 'Resetting…' : 'Reset Progress'}
                                <span className="text-on-surface-variant group-hover:translate-x-1 transition-all">→</span>
                            </button>

                            {/* Delete account */}
                            <button
                                onClick={() => setModal('deleteAccount')}
                                disabled={deletingAccount}
                                className="w-full py-4 px-6 rounded-[20px] ghost-border text-red-400 hover:border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 transition-all duration-300 text-[15px] font-bold text-left flex items-center justify-between active:scale-[0.98] group mt-8 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                            >
                                {deletingAccount ? 'Deleting…' : 'Delete Account'}
                                <span className="text-red-500/50 group-hover:translate-x-1 transition-all">→</span>
                            </button>
                        </div>
                    </Section>

                    {/* ── ABOUT SECTION ────────────────────────────────────────────── */}
                    <Section title="About">
                        <ul className="space-y-0 divide-y divide-outline-variant">
                            <li className="flex items-center justify-between py-4">
                                <span className="text-on-surface-variant font-bold text-[15px]">App Version</span>
                                <span className="text-on-surface text-[15px] font-mono">Forge v2.0.0</span>
                            </li>
                            <li>
                                <a
                                    href="mailto:feedback@forge.app"
                                    className="flex items-center justify-between py-4 text-on-surface-variant hover:text-on-surface transition-colors text-[15px] font-bold active:opacity-80 group"
                                >
                                    Send Feedback
                                    <span className="text-on-surface-variant group-hover:translate-x-1 transition-all">→</span>
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="flex items-center justify-between py-4 text-on-surface-variant hover:text-on-surface transition-colors text-[15px] font-bold active:opacity-80 group"
                                >
                                    Privacy Policy
                                    <span className="text-on-surface-variant group-hover:translate-x-1 transition-all">→</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="flex items-center justify-between py-4 text-on-surface-variant hover:text-on-surface transition-colors text-[15px] font-bold active:opacity-80 group"
                                >
                                    Terms of Service
                                    <span className="text-on-surface-variant group-hover:translate-x-1 transition-all">→</span>
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
