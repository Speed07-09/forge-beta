'use client';

import AuthGuard from '../components/AuthGuard';
import Vault from '../components/Vault';

function VaultContent() {
    return (
        <div className="min-h-screen bg-background text-on-surface font-body pb-[120px]">

            {/* Header */}
            <header className="fixed top-0 w-full bg-background/80 glass-panel border-b border-outline-variant z-50">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = '/home'}>
                        <span className="text-on-surface-variant hover:text-primary text-[11px] font-bold uppercase tracking-[0.15em] transition-colors">
                            ← Home
                        </span>
                        <span className="text-outline-variant">/</span>
                        <h1 className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface">
                            Vault
                        </h1>
                    </div>

                    <a
                        href="/plans"
                        className="py-3 px-6 text-[11px] font-bold tracking-[0.15em] uppercase ghost-border text-on-surface-variant hover:text-on-surface hover:bg-surface-high rounded-full transition-all duration-300 active:scale-95"
                    >
                        + New Plan
                    </a>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-2xl mx-auto px-6 pt-28 md:pt-32">
                <div className="mb-16" style={{ animation: 'fadeInUp 225ms ease-out both' }}>
                    <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight font-headline">
                        Your Vault
                    </h2>
                    <p className="text-on-surface-variant text-[15px] font-medium">
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
