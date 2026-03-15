'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import AbstractBackground from '../components/AbstractBackground'
import type { AuthError } from '@supabase/supabase-js'

interface PasswordStrength {
    score: number // 0-4
    label: string
    color: string
}

function getPasswordStrength(password: string): PasswordStrength {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    score = Math.min(score, 4)

    const labels: Record<number, string> = {
        0: 'Very Weak',
        1: 'Weak',
        2: 'Fair',
        3: 'Strong',
        4: 'Very Strong',
    }

    const colors: Record<number, string> = {
        0: '#ef4444',
        1: '#f97316',
        2: '#eab308',
        3: '#22c55e',
        4: '#16a34a',
    }

    return { score, label: labels[score], color: colors[score] }
}

// Inline SVG of the official Google "G" logo
function GoogleLogo() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
                fill="#4285F4"
            />
            <path
                d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                fill="#34A853"
            />
            <path
                d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z"
                fill="#FBBC05"
            />
            <path
                d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
                fill="#EA4335"
            />
        </svg>
    )
}

// Three-dot loading indicator
function LoadingDots() {
    return (
        <span className="flex items-center justify-center gap-1.5" aria-label="Loading">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
        </span>
    )
}

export default function SignUpPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

    // Redirect if already authenticated
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.replace('/home')
            } else {
                setIsCheckingSession(false)
            }
        }
        checkSession()
    }, [router])

    const getErrorMessage = (err: AuthError): string => {
        const msg = err.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already been registered')) {
            return 'An account with this email already exists. Try signing in instead.'
        }
        if (msg.includes('password') && msg.includes('short')) {
            return 'Password must be at least 6 characters long.'
        }
        if (msg.includes('valid email')) {
            return 'Please enter a valid email address.'
        }
        if (msg.includes('network')) {
            return 'Network error. Please check your connection and try again.'
        }
        return err.message || 'An unexpected error occurred. Please try again.'
    }

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!username.trim()) {
            setError('Please enter a username.')
            return
        }
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters.')
            return
        }
        if (!email.trim()) {
            setError('Please enter your email address.')
            return
        }
        if (!password) {
            setError('Please enter a password.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        setIsLoading(true)
        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (authError) {
                setError(getErrorMessage(authError))
                return
            }

            // Create profile row
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        username: username.trim(),
                        onboarding_completed: false,
                    })

                if (profileError && !profileError.message.includes('duplicate')) {
                    console.error('Profile creation error:', profileError)
                    // Don't block the user — profile can be created later
                }
            }

            router.replace('/home')
        } catch {
            setError('Network error. Please check your connection and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setError(null)
        setIsGoogleLoading(true)
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (authError) {
                setError(getErrorMessage(authError))
                setIsGoogleLoading(false)
            }
        } catch {
            setError('Network error. Please check your connection and try again.')
            setIsGoogleLoading(false)
        }
    }

    // Full-screen loading while checking session
    if (isCheckingSession) {
        return (
            <div className="relative min-h-screen bg-background flex items-center justify-center">
                <AbstractBackground variant="wave" />
                <LoadingDots />
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden px-6 py-12 font-body">
            {/* Animated background */}
            <AbstractBackground variant="wave" />

            {/* Card */}
            <div
                className="relative z-10 w-full max-w-md ghost-border bg-surface-low/80 backdrop-blur-xl rounded-[24px] p-8 sm:p-10 shadow-2xl"
                style={{ animation: 'fadeIn 0.8s ease-out forwards' }}
            >
                {/* Heading */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-[0.2em] font-headline text-on-surface mb-3 select-none drop-shadow-[0_0_12px_rgba(192,193,255,0.2)]">
                        FORGE
                    </h1>
                    <p className="text-on-surface-variant text-[15px] font-medium">
                        Start your journey.
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="mb-8 px-5 py-4 rounded-2xl ghost-border border-red-500/30 bg-red-500/10 text-red-400 text-[15px] font-medium"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                )}

                {/* Sign-up form */}
                <form onSubmit={handleEmailSignUp} className="flex flex-col gap-5" noValidate>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="username"
                            className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant pl-1"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            autoComplete="username"
                            disabled={isLoading || isGoogleLoading}
                            aria-label="Username"
                            className="w-full bg-surface-lowest ghost-border text-on-surface rounded-xl px-5 py-4 text-[15px] placeholder:text-outline-variant focus:border-primary focus:bg-surface-high focus:outline-none hover:border-outline transition-all duration-300 shadow-inner disabled:opacity-50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant pl-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={isLoading || isGoogleLoading}
                            aria-label="Email address"
                            className="w-full bg-surface-lowest ghost-border text-on-surface rounded-xl px-5 py-4 text-[15px] placeholder:text-outline-variant focus:border-primary focus:bg-surface-high focus:outline-none hover:border-outline transition-all duration-300 shadow-inner disabled:opacity-50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant pl-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            autoComplete="new-password"
                            disabled={isLoading || isGoogleLoading}
                            aria-label="Password"
                            className="w-full bg-surface-lowest ghost-border text-on-surface rounded-xl px-5 py-4 text-[15px] placeholder:text-outline-variant focus:border-primary focus:bg-surface-high focus:outline-none hover:border-outline transition-all duration-300 shadow-inner disabled:opacity-50"
                        />
                        {/* Password strength meter */}
                        {password.length > 0 && (
                            <div className="mt-2 ml-1">
                                <div className="flex gap-1.5 mb-2">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex-1 h-1 rounded-full transition-all duration-300"
                                            style={{
                                                backgroundColor:
                                                    i < passwordStrength.score
                                                        ? passwordStrength.color
                                                        : 'var(--color-surface-high)',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    className="text-[11px] font-bold uppercase tracking-[0.1em]"
                                    style={{ color: passwordStrength.color }}
                                >
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        aria-label="Create account"
                        className="w-full mt-4 lit-gradient text-background rounded-full py-4 px-8 text-[15px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[56px] shadow-[0_0_20px_rgba(192,193,255,0.2)]"
                    >
                        {isLoading ? <LoadingDots /> : 'Create Account'}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-outline-variant" />
                    <span className="text-outline-variant text-[11px] font-bold tracking-[0.2em] uppercase">OR</span>
                    <div className="flex-1 h-px bg-outline-variant" />
                </div>

                {/* Google button */}
                <button
                    onClick={handleGoogleSignUp}
                    disabled={isLoading || isGoogleLoading}
                    aria-label="Continue with Google"
                    className="w-full ghost-border bg-surface text-on-surface rounded-full py-4 px-8 text-[15px] font-bold flex items-center justify-center gap-3 hover:border-outline hover:bg-surface-high active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] shadow-sm"
                >
                    {isGoogleLoading ? (
                        <LoadingDots />
                    ) : (
                        <>
                            <GoogleLogo />
                            Continue with Google
                        </>
                    )}
                </button>

                {/* Footer link */}
                <p className="text-center mt-10 text-[15px] text-on-surface-variant font-medium">
                    Already have an account?{' '}
                    <Link
                        href="/signin"
                        className="text-primary italic hover:brightness-110 transition-all duration-300"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
