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
            <div className="relative min-h-screen bg-black flex items-center justify-center">
                <AbstractBackground variant="wave" />
                <LoadingDots />
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden px-6 py-12">
            {/* Animated background */}
            <AbstractBackground variant="wave" />

            {/* Card */}
            <div
                className="relative z-10 w-full max-w-md"
                style={{ animation: 'fadeIn 0.8s ease-out forwards' }}
            >
                {/* Heading */}
                <div className="mb-10">
                    <h1 className="text-4xl font-light tracking-[0.2em] text-white mb-3 select-none">
                        FORGE
                    </h1>
                    <p className="text-zinc-400 text-lg font-light">
                        Start your journey.
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="mb-6 px-4 py-3 rounded-xl border border-red-900/50 bg-red-950/30 text-red-400 text-sm"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                )}

                {/* Sign-up form */}
                <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4" noValidate>
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="username"
                            className="text-sm text-zinc-400 font-medium tracking-wide"
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
                            className="w-full bg-transparent border border-zinc-800 text-white rounded-xl px-4 py-3 text-base placeholder:text-zinc-600 focus:border-white focus:outline-none transition-colors duration-200 disabled:opacity-50"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm text-zinc-400 font-medium tracking-wide"
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
                            className="w-full bg-transparent border border-zinc-800 text-white rounded-xl px-4 py-3 text-base placeholder:text-zinc-600 focus:border-white focus:outline-none transition-colors duration-200 disabled:opacity-50"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-sm text-zinc-400 font-medium tracking-wide"
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
                            className="w-full bg-transparent border border-zinc-800 text-white rounded-xl px-4 py-3 text-base placeholder:text-zinc-600 focus:border-white focus:outline-none transition-colors duration-200 disabled:opacity-50"
                        />
                        {/* Password strength meter */}
                        {password.length > 0 && (
                            <div className="mt-1.5">
                                <div className="flex gap-1 mb-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex-1 h-0.5 rounded-full transition-all duration-300"
                                            style={{
                                                backgroundColor:
                                                    i < passwordStrength.score
                                                        ? passwordStrength.color
                                                        : '#27272a',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    className="text-xs font-medium"
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
                        className="w-full mt-2 bg-white text-black rounded-full py-3 px-8 text-base font-medium hover:bg-zinc-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
                    >
                        {isLoading ? <LoadingDots /> : 'Create Account'}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-zinc-600 text-xs font-medium tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Google button */}
                <button
                    onClick={handleGoogleSignUp}
                    disabled={isLoading || isGoogleLoading}
                    aria-label="Continue with Google"
                    className="w-full border border-zinc-700 text-white rounded-full py-3 px-8 text-base font-medium flex items-center justify-center gap-3 hover:border-white hover:bg-white/5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
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
                <p className="text-center mt-8 text-sm text-zinc-500">
                    Already have an account?{' '}
                    <Link
                        href="/signin"
                        className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-colors duration-200"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
