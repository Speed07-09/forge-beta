
import React from 'react';
import { Button } from './Button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="max-w-2xl mx-auto text-center px-6 py-12 animate-in fade-in duration-1000">
      
      <div className="mb-16">
        <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-white mb-8">FORGE</h1>
      </div>
      
      <p className="text-xl text-zinc-400 mb-16 leading-relaxed font-light max-w-lg mx-auto">
        A quiet, disciplined approach to self-improvement. 
        Powered by consistency.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
        <div className="p-6 border border-zinc-800 rounded-2xl bg-black/50 hover:border-zinc-600 transition-colors">
          <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center mb-4 text-white font-light text-sm">1</div>
          <h3 className="font-medium text-white mb-2">Sustainable</h3>
          <p className="text-sm text-zinc-500 font-light">Real growth. No trends.</p>
        </div>
        <div className="p-6 border border-zinc-800 rounded-2xl bg-black/50 hover:border-zinc-600 transition-colors">
          <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center mb-4 text-white font-light text-sm">2</div>
          <h3 className="font-medium text-white mb-2">Natural</h3>
          <p className="text-sm text-zinc-500 font-light">Mind & body focus.</p>
        </div>
        <div className="p-6 border border-zinc-800 rounded-2xl bg-black/50 hover:border-zinc-600 transition-colors">
          <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center mb-4 text-white font-light text-sm">3</div>
          <h3 className="font-medium text-white mb-2">Personal</h3>
          <p className="text-sm text-zinc-500 font-light">Adapted to you.</p>
        </div>
      </div>

      <Button 
        onClick={onStart} 
        className="px-16 py-5 text-lg"
      >
        Continue
      </Button>
      
      <p className="mt-8 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-medium">
        Beginner Focused
      </p>
    </div>
  );
};
