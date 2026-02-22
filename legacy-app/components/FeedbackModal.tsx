
import React, { useState } from 'react';
import { Button } from './Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string, type: 'issue' | 'suggestion') => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'issue' | 'suggestion'>('suggestion');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message, type);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-light text-white">Send Feedback</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors focus:outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setType('suggestion')}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium rounded-lg border transition-all ${type === 'suggestion' ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800/50'}`}
          >
            Suggestion
          </button>
          <button
            onClick={() => setType('issue')}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium rounded-lg border transition-all ${type === 'issue' ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800/50'}`}
          >
            Report Issue
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={type === 'suggestion' ? "How can we improve your experience?" : "Describe the issue you encountered..."}
          className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none mb-6 text-sm leading-relaxed"
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="py-2 px-4 text-xs">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!message.trim()} className="py-2 px-6 text-xs">Send</Button>
        </div>
      </div>
    </div>
  );
};
