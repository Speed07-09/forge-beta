import React, { useState } from 'react';
import { UserProfile, ActivityLevel, FaceShape, HairTexture, EquipmentAccess } from '../types';
import { Button } from './Button';

interface QuestionnaireProps {
  onSubmit: (profile: UserProfile) => void;
}

type StepType = 'text' | 'select' | 'confirm';

interface Step {
  id: keyof UserProfile | 'confirm';
  label: string;
  description?: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
  optional?: boolean;
}

const steps: Step[] = [
  { id: 'age', label: "Age range", description: "Tailoring to your stage.", type: 'text', placeholder: "e.g. 15" },
  { id: 'height', label: "Height", description: "Health context.", type: 'text', placeholder: "e.g. 5'9" },
  { id: 'weight', label: "Weight (Optional)", description: "Skip if preferred.", type: 'text', placeholder: "e.g. 140lbs", optional: true },
  { id: 'activityLevel', label: "Activity Level", type: 'select', options: ['Low', 'Medium', 'High'] },
  { 
    id: 'faceShape', 
    label: "Face Shape", 
    description: "For grooming advice.",
    type: 'select', 
    options: ['Round', 'Oval', 'Square', 'Unsure'] 
  },
  { 
    id: 'hairTexture', 
    label: "Hair Texture", 
    description: "For hair care.",
    type: 'select', 
    options: ['4C', '4B', '4A', 'Mixed', 'Unsure'] 
  },
  { id: 'equipment', label: "Equipment", type: 'select', options: ['None', 'Home Basics', 'Full Gym'] },
  { id: 'dietaryRestrictions', label: "Dietary needs", description: "Allergies etc.", type: 'text', placeholder: "e.g. None" },
  { id: 'confirm', label: "Review", type: 'confirm' }
];

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [inputValue, setInputValue] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const step = steps[currentStep];

  const handleNext = (val?: string) => {
    const valueToSave = val !== undefined ? val : inputValue;
    
    if (step.id !== 'confirm') {
      const newProfile = { ...profile, [step.id]: valueToSave };
      setProfile(newProfile);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue('');
      setShowHelp(false);
    } else if (step.id === 'confirm') {
      onSubmit(profile as UserProfile);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setInputValue((profile[steps[currentStep - 1].id as keyof UserProfile] as string) || '');
    }
  };

  const renderHelper = () => {
    if (step.id === 'faceShape') {
      return (
        <div className="mt-6 p-6 border border-zinc-800 rounded-xl text-sm text-zinc-400 animate-in fade-in slide-in-from-top-2">
          <p className="font-bold mb-2 text-white">Reference</p>
          <ul className="space-y-2 font-light">
            <li><strong className="text-zinc-200">Oval:</strong> Length {'>'} width.</li>
            <li><strong className="text-zinc-200">Round:</strong> Width ≈ length.</li>
            <li><strong className="text-zinc-200">Square:</strong> Sharp jawline.</li>
          </ul>
        </div>
      );
    }
    if (step.id === 'hairTexture') {
      return (
        <div className="mt-6 p-6 border border-zinc-800 rounded-xl text-sm text-zinc-400 animate-in fade-in slide-in-from-top-2">
          <p className="font-bold mb-2 text-white">Reference</p>
          <ul className="space-y-2 font-light">
            <li><strong className="text-zinc-200">4C:</strong> Tight coils.</li>
            <li><strong className="text-zinc-200">4B:</strong> Z-shaped angles.</li>
            <li><strong className="text-zinc-200">4A:</strong> S-curl pattern.</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  if (step.type === 'confirm') {
    return (
      <div className="max-w-xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-3xl font-light mb-8 text-white text-center">Ready?</h2>
        <div className="border border-zinc-800 rounded-2xl p-8 mb-8 bg-zinc-900/30">
          {steps.filter(s => s.id !== 'confirm').map(s => (
            <div key={s.id} className="flex justify-between py-3 border-b border-zinc-800 last:border-0">
              <span className="text-zinc-500 font-light">{s.label}</span>
              <span className="text-white font-medium">{String(profile[s.id as keyof UserProfile] || '—')}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleBack}>Edit</Button>
          <Button onClick={() => onSubmit(profile as UserProfile)}>Generate</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Step {currentStep + 1} / {steps.length}</span>
        </div>
        <h2 className="text-4xl font-light text-white mb-4">{step.label}</h2>
        {step.description && <p className="text-lg text-zinc-500 font-light">{step.description}</p>}
      </div>

      <div className="space-y-6">
        {step.type === 'text' && (
          <div className="space-y-6">
            <input
              type="text"
              autoFocus
              className="w-full p-5 text-xl rounded-xl bg-black border border-zinc-800 text-white focus:border-white focus:ring-0 outline-none transition-all placeholder:text-zinc-700"
              placeholder={step.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (inputValue || step.optional)) handleNext();
              }}
            />
            <Button 
              fullWidth 
              onClick={() => handleNext()} 
              disabled={!inputValue && !step.optional}
            >
              Next
            </Button>
          </div>
        )}

        {step.type === 'select' && (
          <div className="grid grid-cols-1 gap-3">
            {step.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleNext(option)}
                className="w-full text-left p-5 rounded-xl bg-black border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900 transition-all duration-300 group flex justify-between items-center"
              >
                <span className="text-lg font-light text-zinc-300 group-hover:text-white">{option}</span>
                <span className="text-zinc-700 group-hover:text-white transition-colors">→</span>
              </button>
            ))}
            
            {(step.id === 'faceShape' || step.id === 'hairTexture') && (
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs font-medium text-zinc-500 hover:text-white mt-4 uppercase tracking-wider"
              >
                {showHelp ? "Hide guide" : "View guide"}
              </button>
            )}
            {showHelp && renderHelper()}
          </div>
        )}
      </div>

      <div className="mt-16 flex items-center justify-between">
        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className="text-zinc-600 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Back
          </button>
        ) : <div />}
        
        {step.optional && !inputValue && step.type === 'text' && (
          <button
            onClick={() => handleNext('')}
            className="text-zinc-600 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};