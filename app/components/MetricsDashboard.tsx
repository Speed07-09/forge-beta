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
                className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '0ms' }}
            >
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-3">Completed</p>
                <p className="text-4xl font-bold text-white">{metrics.totalCompleted}</p>
                <p className="text-xs uppercase tracking-widest text-zinc-600 mt-1">habits</p>
            </div>

            {/* Card 2: Current Streak */}
            <div
                className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '100ms' }}
            >
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-3">Streak</p>
                <p className="text-4xl font-bold text-white">{metrics.currentStreak}</p>
                <p className="text-xs uppercase tracking-widest text-zinc-600 mt-1">days</p>
            </div>

            {/* Card 3: Completion Rate */}
            <div
                className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '200ms' }}
            >
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-3">Today</p>
                <p className="text-4xl font-bold text-white">{metrics.completionRate}%</p>
                <p className="text-xs uppercase tracking-widest text-zinc-600 mt-1">progress</p>
            </div>

            {/* Card 4: 30-Day Progress */}
            <div
                className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/20 hover:bg-zinc-900/30 transition-colors duration-300 opacity-0"
                style={{ animation: 'fadeInUp 225ms ease-out forwards', animationDelay: '300ms' }}
            >
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-normal mb-4">Journey</p>
                <div className="w-full h-1 bg-zinc-800 overflow-hidden mb-3">
                    <div
                        className="h-full bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${(metrics.progress / 30) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-normal uppercase tracking-widest">Day {metrics.progress} / 30</span>
                    <span className="text-sm text-white font-bold">{Math.round((metrics.progress / 30) * 100)}%</span>
                </div>
            </div>
        </div>
    );
}
