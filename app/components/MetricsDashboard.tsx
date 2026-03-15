"use client";

interface MetricsProps {
    metrics: {
        totalCompleted: number;
        currentStreak: number;
        completionRate: number;
        progress: number;
    };
}

export default function MetricsDashboard({ metrics }: MetricsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Card 1: Total Completed */}
            <div
                className="ghost-border rounded-2xl p-6 md:p-8 bg-surface-low transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '0ms' }}
            >
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold mb-3">Completed</p>
                <p className="text-4xl font-bold text-on-surface font-headline">{metrics.totalCompleted}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant mt-2">habits</p>
            </div>

            {/* Card 2: Current Streak */}
            <div
                className="ghost-border rounded-2xl p-6 md:p-8 bg-surface-low transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '100ms' }}
            >
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold mb-3">Streak</p>
                <p className="text-4xl font-bold text-on-surface font-headline">{metrics.currentStreak}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant mt-2">days</p>
            </div>

            {/* Card 3: Completion Rate */}
            <div
                className="ghost-border rounded-2xl p-6 md:p-8 bg-surface-low transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '200ms' }}
            >
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold mb-3">Today</p>
                <p className="text-4xl font-bold text-primary font-headline">{metrics.completionRate}%</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant mt-2">progress</p>
            </div>

            {/* Card 4: 30-Day Progress */}
            <div
                className="ghost-border rounded-2xl p-6 md:p-8 bg-surface-low transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '300ms' }}
            >
                <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold mb-4">Journey</p>
                <div className="w-full h-1 bg-surface-high rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full lit-gradient transition-all duration-1000 ease-out"
                        style={{ width: `${(metrics.progress / 30) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em]">Day {metrics.progress} / 30</span>
                    <span className="text-sm text-primary font-bold">{Math.round((metrics.progress / 30) * 100)}%</span>
                </div>
            </div>
        </div>
    );
}
