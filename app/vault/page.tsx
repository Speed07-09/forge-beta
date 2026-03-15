'use client';

import AuthGuard from '../components/AuthGuard';
import Vault from '../components/Vault';

function VaultContent() {
    return (
        <div className="min-h-screen bg-black text-white pb-32">

            {/* Header */}
            <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-zinc-800 z-50">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = '/home'}>
                        <span className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors">
                            ← Home
                        </span>
                        <span className="text-zinc-800">/</span>
                        <h1 className="text-sm font-bold tracking-widest uppercase text-white">
                            Vault
                        </h1>
                    </div>

                    <a
                        href="/plans"
                        className="py-3 px-6 text-xs font-normal tracking-widest uppercase border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 rounded-2xl transition-all duration-300 active:opacity-80"
                    >
                        + New Plan
                    </a>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-2xl mx-auto px-6 pt-28 md:pt-32">
                <div className="mb-16" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        Your Vault
                    </h2>
                    <p className="text-zinc-500 text-base font-light">
                        Your saved transformation blueprints.
                    </p>
                </div>

                <div style={{ animation: 'fadeInUp 225ms ease-out 100ms both' }}>
                    <Vault />
                </div>
            </main>
        </div>
    );
}

export default function VaultPage() {
    return (
        <AuthGuard>
            <VaultContent />
        </AuthGuard>
    );
}
