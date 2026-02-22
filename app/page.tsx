import React from 'react';

const user = {
  username: "Daniel",
  firstTimeUser: false,
  streak: 7,
  completionRate: 83,
  todayStatus: "Pending",
  currentDay: 12,
};

const tasks = [
  { id: 1, text: "20 min Deep Work" },
  { id: 2, text: "Review Weekly Goal" },
  { id: 3, text: "Journal Reflection" },
];

export default function ForgeDashboard() {
  const greeting = user.firstTimeUser ? "Welcome," : "Welcome back,";

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-zinc-200 antialiased">
      <div className="max-w-md mx-auto px-7 py-14 flex flex-col gap-10">

        {/* 1. Header Section */}
        <header className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-sm font-medium leading-none mb-1">{greeting}</span>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {user.username}.
            </h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-zinc-400 text-xs font-bold tracking-widest">DA</span>
          </div>
        </header>

        {/* 2. Progress Snapshot Section */}
        <section className="flex flex-col gap-3">
          <MetricCard
            label="Current Streak"
            value={`${user.streak} Days`}
            subtext="Consecutive completion"
          />
          <MetricCard
            label="Monthly Completion Rate"
            value={`${user.completionRate}%`}
            subtext="This month"
          />
          <MetricCard
            label="Today Status"
            value={user.todayStatus}
            subtext={user.todayStatus === 'Pending' ? 'Action required' : 'Great job'}
            status={user.todayStatus}
          />
        </section>

        {/* 3. Today's Execution Card */}
        <section className="flex flex-col gap-4">
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 ease-in-out" />

            <div className="relative z-10">
              <div className="flex flex-col mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Day {user.currentDay} of 30
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Today's Focus</h2>
              </div>

              <div className="space-y-5 mb-10">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 group/task cursor-pointer">
                    <div className="w-6 h-6 rounded-lg border-2 border-zinc-200 flex-shrink-0 group-hover/task:border-zinc-400 transition-all flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm bg-zinc-900 opacity-0 group-hover/task:opacity-10 transition-opacity" />
                    </div>
                    <span className="text-zinc-700 text-[15px] font-medium tracking-tight group-hover/task:text-zinc-900 transition-colors">
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full h-15 bg-zinc-900 text-white rounded-2xl font-bold text-[15px] hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-200 flex items-center justify-center gap-2">
                Mark Day as Complete
              </button>
            </div>
          </div>
        </section>

        {/* 4. Daily Intent Component */}
        <section className="flex flex-col gap-4 px-1">
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Today's Intent</h3>
            <p className="text-sm font-medium text-zinc-600">What is your primary focus today?</p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Deep work on project architecture..."
              className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:bg-white focus:border-zinc-200 transition-all placeholder:text-zinc-400 font-medium"
            />
            <button className="w-full h-14 bg-zinc-100 text-zinc-900 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-[0.99]">
              Save Intent
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, status }: { label: string; value: string; subtext: string; status?: string }) {
  const isCompleted = status === 'Completed';

  return (
    <div className="p-6 border border-zinc-100/80 rounded-2xl bg-white shadow-sm flex flex-col gap-1 transition-all hover:border-zinc-200 hover:shadow-md">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${isCompleted ? 'text-emerald-600' : 'text-zinc-900'}`}>{value}</span>
        {isCompleted && (
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        )}
      </div>
      <span className="text-[13px] font-medium text-zinc-500">{subtext}</span>
    </div>
  );
}
