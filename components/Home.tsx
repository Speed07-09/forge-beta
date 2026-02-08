
import React from 'react';
import { SavedPlan } from '../types';
import { Button } from './Button';
import { WelcomeScreen } from './WelcomeScreen';

interface HomeProps {
  savedPlans: SavedPlan[];
  onStartNew: () => void;
  onViewPlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string, e: React.MouseEvent) => void;
}

export const Home: React.FC<HomeProps> = ({ savedPlans, onStartNew, onViewPlan, onDeletePlan }) => {
  // Reuse the existing WelcomeScreen design for the empty state
  if (savedPlans.length === 0) {
    return <WelcomeScreen onStart={onStartNew} />;
  }

  return (
    <div className="animate-in fade-in duration-700 pb-20">
       {/* Dashboard Header */}
       <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">Library</h1>
            <p className="text-zinc-500 text-sm tracking-wide uppercase">Your Saved Blueprints</p>
          </div>
          <Button onClick={onStartNew} className="md:w-auto w-full">
            + New Plan
          </Button>
       </div>

       {/* Saved Plans Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => onViewPlan(plan)}
              className="group relative p-6 border border-zinc-800 rounded-2xl bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[200px]"
            >
               {/* Abstract decorative element */}
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-zinc-800/10 rounded-full blur-3xl group-hover:bg-zinc-700/20 transition-colors pointer-events-none"></div>

               <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-6">
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded-full bg-black/50">
                       {plan.profile.faceShape} • {plan.profile.equipment}
                     </span>
                     <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlan(plan.id, e);
                        }}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
                        title="Delete Plan"
                     >
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                     </button>
                  </div>
                  
                  <h3 className="text-xl font-light text-white mb-2 leading-tight">30-Day Protocol</h3>
                  <p className="text-zinc-500 text-xs font-mono">
                    {new Date(plan.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
               </div>

               <div className="relative z-10 flex items-center text-zinc-400 text-sm group-hover:text-white transition-colors mt-6">
                 <span className="font-medium text-xs tracking-wider uppercase">Open Plan</span>
                 <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>
            </div>
          ))}
          
          {/* Create New Card (optional visual cue) */}
          <div 
             onClick={onStartNew}
             className="border border-zinc-900 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[200px] text-zinc-700 hover:text-zinc-500 hover:border-zinc-700 transition-all cursor-pointer bg-black/20"
          >
             <span className="text-4xl mb-2 font-light">+</span>
             <span className="text-xs font-bold uppercase tracking-widest">Create New</span>
          </div>
       </div>
    </div>
  );
};
