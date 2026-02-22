
import React, { useEffect, useRef, useState } from 'react';

export const AmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isInitializedRef = useRef(false);

  // Separate initialization logic
  const initAudio = () => {
    if (isInitializedRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Master Gain for overall volume control
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Start silent for fade-in
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Generative Drone Setup
    // Frequencies for a soothing, airy Am9 chord pad: A2, C3, E3, B3
    const oscillators = [
      { freq: 110.00, type: 'sine', pan: 0 },    // A2 - Root
      { freq: 130.81, type: 'sine', pan: -0.3 }, // C3 - Minor 3rd
      { freq: 164.81, type: 'sine', pan: 0.3 },  // E3 - 5th
      { freq: 246.94, type: 'triangle', pan: 0 } // B3 - 9th (Triangle for subtle harmonics)
    ]; 
    
    oscillators.forEach((oscConf, i) => {
      const osc = ctx.createOscillator();
      osc.type = oscConf.type as OscillatorType;
      osc.frequency.value = oscConf.freq;

      // Individual gain for mixing
      const oscGain = ctx.createGain();
      oscGain.gain.value = (0.05 / (i + 1)); 

      // Filter to soften the sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400; 

      // LFO for Amplitude Modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + (Math.random() * 0.05); 
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.02; 
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      // Stereo Panning
      const panner = ctx.createStereoPanner();
      panner.pan.value = oscConf.pan + (Math.random() * 0.2 - 0.1); 

      // Connections
      osc.connect(filter);
      filter.connect(panner);
      panner.connect(oscGain);
      oscGain.connect(masterGain);
      
      osc.start();
    });

    isInitializedRef.current = true;
  };

  const fadeIn = async () => {
    if (!isInitializedRef.current) initAudio();
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;

    if (!ctx || !master) return;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const currentTime = ctx.currentTime;
      master.gain.cancelScheduledValues(currentTime);
      master.gain.setValueAtTime(master.gain.value, currentTime);
      // Smooth fade in to 25% volume over 3 seconds
      master.gain.linearRampToValueAtTime(0.25, currentTime + 3);
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio playback failed (browser policy)", e);
    }
  };

  const fadeOut = () => {
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const currentTime = ctx.currentTime;
    master.gain.cancelScheduledValues(currentTime);
    master.gain.setValueAtTime(master.gain.value, currentTime);
    // 2 second fade out
    master.gain.linearRampToValueAtTime(0, currentTime + 2);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const toggleSound = () => {
    if (isPlaying) {
      fadeOut();
    } else {
      fadeIn();
    }
  };

  // Setup global listeners to auto-play on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      // Trigger fade in
      fadeIn();
      
      // Remove listeners so we don't trigger again or reset volume on every click
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 print:hidden">
      {isPlaying && (
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse font-medium mb-1">
          Focus Mode
        </span>
      )}
      <button
        onClick={(e) => {
           // Prevent the button click from bubbling up to the global listener 
           // (though the listener removes itself, this is safer)
           e.stopPropagation(); 
           toggleSound();
        }}
        className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-700 backdrop-blur-md ${
          isPlaying 
            ? 'bg-white/10 border-white/50 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
            : 'bg-black/40 border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300'
        }`}
        aria-label={isPlaying ? "Stop Ambient Music" : "Play Ambient Music"}
      >
        {isPlaying ? (
          <div className="flex items-end gap-[3px] h-4 pb-1">
             <div className="w-[2px] bg-current rounded-full animate-[pulse_1.4s_ease-in-out_infinite] h-2"></div>
             <div className="w-[2px] bg-current rounded-full animate-[pulse_1.8s_ease-in-out_infinite] h-4"></div>
             <div className="w-[2px] bg-current rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-3"></div>
             <div className="w-[2px] bg-current rounded-full animate-[pulse_1.6s_ease-in-out_infinite] h-2"></div>
          </div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M9 18V5l12-2v13"></path>
             <circle cx="6" cy="18" r="3"></circle>
             <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )}
      </button>
    </div>
  );
};
