import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SavedPlan, FeedbackItem } from './types';
import { Questionnaire } from './components/Questionnaire';
import { WelcomeScreen } from './components/WelcomeScreen'; // Keep for Home usage
import { Home } from './components/Home';
import { AmbientPlayer } from './components/AmbientPlayer';
import { FeedbackModal } from './components/FeedbackModal';
import { generateSelfImprovementPlan, regenerateSelfImprovementPlan, refinePlanWithImage, generateCoachAudio } from './services/geminiService';
import { Button } from './components/Button';

// Audio decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Interactive Components for the Plan

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group focus:outline-none"
      >
        <h2 className="text-xl font-light text-white group-hover:text-zinc-300 transition-colors">
          {title}
        </h2>
        <span className={`transform transition-transform duration-300 text-zinc-500 group-hover:text-white ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const InteractiveListItem: React.FC<{ text: React.ReactNode }> = ({ text }) => {
  return (
    <div className="group flex items-start space-x-4 p-3 -mx-3 rounded-lg hover:bg-zinc-900/50 transition-all cursor-default duration-300">
      <span className="text-zinc-600 group-hover:text-white mt-1.5 transition-colors text-[10px]">•</span>
      <span className="text-zinc-400 group-hover:text-zinc-200 leading-relaxed font-light flex-1 transition-colors">
        {text}
      </span>
    </div>
  );
};

const ExpandableExerciseItem: React.FC<{ prefix: string; title: string; details: string }> = ({ prefix, title, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`rounded-xl transition-all duration-300 border ${isExpanded ? 'bg-zinc-900/40 border-zinc-700 my-4' : 'bg-transparent border-transparent hover:bg-zinc-900/30 -mx-3 p-3'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-start space-x-4 ${isExpanded ? 'p-4 pb-0' : ''}`}
      >
        <span className={`text-[10px] mt-1.5 transition-colors ${isExpanded ? 'text-white' : 'text-zinc-600 group-hover:text-white'}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
        <div className="flex-1">
          <span className={`font-medium transition-colors ${isExpanded ? 'text-white text-lg' : 'text-zinc-300'}`}>
            {title}
          </span>
          {!isExpanded && (
            <p className="text-zinc-500 text-sm line-clamp-1 mt-1 font-light">{details}</p>
          )}
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-4">
          <p className="text-zinc-400 leading-relaxed font-light mb-6 text-sm">{details}</p>
          <div className="mt-4 p-4 border border-zinc-800 rounded-lg bg-black/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Visual Guide</p>
            <p className="text-zinc-400 text-sm italic">
               Search online for "{title}" to watch a video demonstration of proper form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Navigation State
  const [status, setStatus] = useState<'home' | 'idle' | 'loading' | 'completed' | 'error'>('home');
  
  // Data State
  const [plan, setPlan] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    try {
      const saved = localStorage.getItem('forged_plans');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // UI State
  const [error, setError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [showImageRefinementPrompt, setShowImageRefinementPrompt] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Audio State
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [isCoachPlaying, setIsCoachPlaying] = useState(false);
  const coachAudioContextRef = useRef<AudioContext | null>(null);
  const coachSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('forged_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  // Handlers
  const handleStart = () => {
    setStatus('idle');
    setPlan(null);
    setUserProfile(null);
    setCurrentPlanId(null);
    setError(null);
    stopCoachAudio();
  };

  const stopCoachAudio = () => {
    if (coachSourceRef.current) {
      try {
        coachSourceRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
      coachSourceRef.current = null;
    }
    setIsCoachPlaying(false);
  };

  const handleCoachToggle = async () => {
    if (!plan) return;

    if (isCoachPlaying) {
      stopCoachAudio();
      return;
    }

    setIsCoachLoading(true);
    try {
      const base64Audio = await generateCoachAudio(plan);
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!coachAudioContextRef.current) {
         coachAudioContextRef.current = new AudioContext({sampleRate: 24000});
      }
      const ctx = coachAudioContextRef.current;
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBytes = decode(base64Audio);
      // The API returns raw PCM 24kHz mono (usually)
      const audioBuffer = await decodePCM(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsCoachPlaying(false);
        coachSourceRef.current = null;
      };
      
      source.start();
      coachSourceRef.current = source;
      setIsCoachPlaying(true);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Coach unavailable.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setStatus('loading');
    setError(null);
    try {
      const generatedPlan = await generateSelfImprovementPlan(profile);
      setPlan(generatedPlan);
      setCurrentPlanId(null); // New plan, not saved yet
      setStatus('completed');
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setStatus('error');
    }
  };

  const handleSavePlan = () => {
    if (!plan || !userProfile) return;
    
    const newId = Date.now().toString();
    const newPlan: SavedPlan = {
      id: newId,
      timestamp: Date.now(),
      profile: userProfile,
      content: plan
    };

    setSavedPlans([newPlan, ...savedPlans]);
    setCurrentPlanId(newId);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPlans(savedPlans.filter(p => p.id !== id));
  };

  const handleViewSavedPlan = (savedPlan: SavedPlan) => {
    setUserProfile(savedPlan.profile);
    setPlan(savedPlan.content);
    setCurrentPlanId(savedPlan.id);
    setStatus('completed');
  };

  const handleRegenerate = async () => {
    if (!userProfile) return;
    stopCoachAudio();
    setStatus('loading');
    setError(null);
    try {
      const regenerated = await regenerateSelfImprovementPlan(userProfile);
      setPlan(regenerated);
      setCurrentPlanId(null); // Regenerated plan is treated as new
      setStatus('completed');
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setStatus('error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile || !plan) return;

    setIsRefining(true);
    setShowImageRefinementPrompt(false);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        try {
          const refinedPlan = await refinePlanWithImage(userProfile, plan, base64String, mimeType);
          setPlan(refinedPlan);
          setIsRefining(false);
        } catch (err: any) {
          setError(err.message);
          setIsRefining(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsRefining(false);
    }
  };

  const handleBackToHome = () => {
    stopCoachAudio();
    setStatus('home');
    setShowImageRefinementPrompt(true);
  };

  const handleFeedbackSubmit = (message: string, type: 'issue' | 'suggestion') => {
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      message
    };
    
    try {
      const existing = localStorage.getItem('forged_feedback');
      const feedbackList = existing ? JSON.parse(existing) : [];
      feedbackList.push(newFeedback);
      localStorage.setItem('forged_feedback', JSON.stringify(feedbackList));
    } catch (e) {
      console.error("Failed to save feedback", e);
    }
  };

  const cleanText = (text: string) => {
    return text.replace(/\*/g, '');
  };

  // Helper to render individual lines of content
  const renderContentLines = (lines: string[]) => {
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-4" />;

      if (trimmedLine.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-medium text-white mt-8 mb-4 tracking-wide">{cleanText(line.replace('### ', ''))}</h3>;
      } 
      
      if (trimmedLine.toLowerCase().includes('mistake') || trimmedLine.toLowerCase().includes('avoid') || trimmedLine.toLowerCase().includes('form check')) {
         return (
           <div key={i} className="border-l-2 border-zinc-700 pl-4 py-3 my-6 bg-zinc-900/30 rounded-r-lg hover:bg-zinc-900/50 transition-colors">
             <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Crucial Tip</p>
             <p className="text-zinc-300 text-sm leading-relaxed font-light">{cleanText(line)}</p>
           </div>
         );
      }
      
      const exerciseMatch = line.match(/^([*-]|\d+\.)\s+(.*?):\s+(.*)$/);
      if (exerciseMatch) {
         const [_, prefix, title, details] = exerciseMatch;
         const cleanTitle = cleanText(title);
         const cleanDetails = cleanText(details);
         return <ExpandableExerciseItem key={i} prefix={prefix} title={cleanTitle} details={cleanDetails} />;
      }
      
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        return <InteractiveListItem key={i} text={cleanText(line.replace(/^[*-]\s+/, ''))} />;
      }
      
      if (/^\d+\.\s/.test(trimmedLine)) {
         return (
          <div key={i} className="flex space-x-4 mb-4 items-start group p-2 -mx-2 rounded-lg hover:bg-zinc-900/30 transition-colors">
            <span className="font-medium text-white shrink-0 w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] group-hover:border-white transition-colors">{trimmedLine.split('.')[0]}</span>
            <span className="text-zinc-400 leading-7 font-light group-hover:text-zinc-200 transition-colors">{cleanText(trimmedLine.replace(/^\d+\.\s/, ''))}</span>
          </div>
         );
      }
      
      if (trimmedLine.toLowerCase().startsWith('day') && (trimmedLine.includes(':') || trimmedLine.length < 20)) {
        return (
          <div key={i} className="mt-10 mb-6">
             <span className="inline-block px-3 py-1 rounded-full border border-zinc-800 text-xs font-medium text-white bg-zinc-900 tracking-wide mb-2">
                {cleanText(line.split(':')[0] || line)}
             </span>
             {line.includes(':') && <p className="text-zinc-400 font-light italic">{cleanText(line.split(':')[1])}</p>}
          </div>
        );
      }

      return <p key={i} className="text-zinc-400 leading-relaxed mb-4 text-base font-light">{cleanText(line)}</p>;
    });
  };

  const renderPlan = (content: string) => {
    const lines = content.split('\n');
    const introLines: string[] = [];
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;
    let mainTitle = "";

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        mainTitle = cleanText(trimmed.replace('# ', ''));
      } else if (trimmed.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: cleanText(trimmed.replace('## ', '')), content: [] };
      } else {
        if (currentSection) {
          currentSection.content.push(line);
        } else {
          if (!trimmed.startsWith('# ')) {
             introLines.push(line);
          }
        }
      }
    });
    if (currentSection) {
      sections.push(currentSection);
    }

    return (
      <div className="animate-in fade-in duration-700">
        <div className="mb-12">
          {mainTitle && <h1 className="text-3xl md:text-5xl font-light text-white mb-8 leading-tight">{mainTitle}</h1>}
          
          <div className="flex justify-center mb-8">
             <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.25em]">
              Your 30-Day Blueprint
            </p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between p-6 border border-zinc-800 rounded-2xl bg-zinc-900/20">
             <div className="flex items-start space-x-4">
                <span className="text-xl text-zinc-500">🛡️</span>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Safety Check</p>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light">Safe, sustainable growth. No extremes. Prioritizing long-term health.</p>
                </div>
             </div>
             
             {/* Coach Audio Button */}
             <Button 
               onClick={handleCoachToggle} 
               disabled={isCoachLoading}
               className={`min-w-[140px] flex items-center justify-center gap-2 text-xs py-3 ${isCoachPlaying ? 'border-red-900/50 bg-red-900/10 text-red-400' : ''}`}
               variant="outline"
             >
                {isCoachLoading ? (
                  <span className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></span>
                ) : isCoachPlaying ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Stop Coach
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    Your Coach
                  </>
                )}
             </Button>
          </div>
          
          <div className="prose prose-invert max-w-none">
            {renderContentLines(introLines)}
          </div>
        </div>

        <div className="space-y-2">
          {sections.map((section, idx) => (
            <CollapsibleSection key={idx} title={section.title} defaultOpen={idx === 0 || idx === 1}>
              {renderContentLines(section.content)}
            </CollapsibleSection>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 selection:bg-zinc-800">
      {/* Background Music Player */}
      <AmbientPlayer />
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
      
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-zinc-900 z-50 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={handleBackToHome}
            className="flex items-center space-x-3 group focus:outline-none"
          >
            <span className="text-xl font-bold tracking-widest text-white opacity-90 group-hover:opacity-100 transition-opacity">FORGE</span>
          </button>
          
          <div className="flex space-x-3">
             {status === 'completed' && (
                <Button 
                   onClick={handleBackToHome} 
                   variant="outline" 
                   className="hidden md:block py-2 px-4 text-xs tracking-widest uppercase border-zinc-800 text-zinc-400 hover:text-white hover:border-white rounded-full"
                >
                   Library
                </Button>
             )}
             {status !== 'home' && status !== 'loading' && (
              <Button 
                variant="outline" 
                onClick={handleStart} 
                className="py-2 px-4 text-xs tracking-widest uppercase border-zinc-800 text-zinc-400 hover:text-white hover:border-white rounded-full"
              >
                Restart
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32">
        {status === 'home' && (
           <Home 
              savedPlans={savedPlans}
              onStartNew={handleStart}
              onViewPlan={handleViewSavedPlan}
              onDeletePlan={handleDeletePlan}
           />
        )}

        {status === 'idle' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-white mb-4">Input Data</h2>
              <p className="text-zinc-500 text-sm tracking-wide">CALIBRATING YOUR EXPERIENCE</p>
            </div>
            <Questionnaire onSubmit={handleSubmit} />
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-24 h-24 border-[0.5px] border-white rounded-full animate-[ping_3s_ease-in-out_infinite] mb-12 opacity-50"></div>
            <h3 className="text-xl font-light mb-4 text-white tracking-widest uppercase animate-pulse">
              {isRefining ? "Processing Visuals" : "Generating"}
            </h3>
            <p className="text-zinc-500 max-w-sm text-sm font-light">
              {isRefining 
                ? "Aligning recommendations with visual data." 
                : "Curating a path for consistency and growth."}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-xl mx-auto border border-zinc-800 p-12 rounded-2xl text-center bg-zinc-900/20">
            <div className="text-zinc-500 text-4xl mb-6">×</div>
            <h3 className="text-xl font-light text-white mb-4">Connection interrupted</h3>
            <p className="text-zinc-500 mb-8 font-light text-sm">{error}</p>
            <Button variant="primary" onClick={handleStart}>Retry</Button>
          </div>
        )}

        {status === 'completed' && plan && (
          <>
            <div className="border border-zinc-800 bg-black rounded-3xl p-8 md:p-12 mb-16 animate-in fade-in duration-1000 shadow-2xl shadow-zinc-900/20">
              {renderPlan(plan)}
              
              <div className="mt-16 pt-10 border-t border-zinc-900 flex flex-wrap justify-center gap-6 print:hidden">
                {!currentPlanId ? (
                   <Button onClick={handleSavePlan} variant="primary" className="min-w-[160px]">
                     Save to Library
                   </Button>
                ) : (
                   <Button disabled variant="outline" className="min-w-[160px] opacity-50 cursor-default border-green-900 text-green-500">
                     Saved to Library ✓
                   </Button>
                )}

                <Button onClick={handleRegenerate} variant="secondary" className="min-w-[160px]">
                  Regenerate
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="min-w-[160px]">
                  Export PDF
                </Button>
              </div>
            </div>

            {showImageRefinementPrompt && !isRefining && (
              <div className="border border-zinc-800 rounded-3xl p-10 mb-20 bg-zinc-900/30 animate-in slide-in-from-bottom-8 duration-700 hover:border-zinc-700 transition-colors">
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center gap-8">
                   <div className="flex-1">
                      <h2 className="text-2xl font-light mb-2 text-white">Visual Calibration</h2>
                      <p className="text-zinc-500 mb-6 font-light text-sm leading-relaxed">
                        Upload a photo to refine posture and grooming suggestions.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload}
                        />
                        <Button 
                          variant="primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowImageRefinementPrompt(false)}
                        >
                          Dismiss
                        </Button>
                      </div>
                   </div>
                   <div className="hidden md:block w-px h-24 bg-zinc-800"></div>
                   <div className="w-full md:w-auto text-xs text-zinc-600 font-mono">
                      <p>PRIVACY PROTECTED</p>
                      <p>NO DATA STORAGE</p>
                      <p>ANALYSIS ONLY</p>
                   </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="text-center text-zinc-600 text-xs px-6 pb-12 print:hidden">
        <div className="max-w-2xl mx-auto border-t border-zinc-900 pt-12">
          <p className="font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">Endel-Inspired Design</p>
          <p className="text-zinc-500 italic font-light max-w-lg mx-auto leading-relaxed mb-6">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </p>
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="text-zinc-600 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-medium border-b border-transparent hover:border-white pb-0.5"
          >
            Send Feedback
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;