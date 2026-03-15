'use client'

import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-20">
            <div className="max-w-2xl w-full">
                <h1 className="text-4xl font-light mb-4">Privacy Policy</h1>
                <p className="text-zinc-500 mb-10 text-sm leading-relaxed">
                    Privacy policy coming soon. We take your privacy seriously and will publish our full policy shortly.
                </p>
                <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Settings
                </Link>
            </div>
        </div>
    )
}
