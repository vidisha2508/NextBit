import React, { useState } from 'react';
import { Sparkles, Search, Layers } from 'lucide-react';

interface PromptFormProps {
  onGenerate: (prompt: string) => void;
  projectName: string;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, projectName }) => {
  const [promptText, setPromptText] = useState('Build a Netflix Clone');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      onGenerate(promptText.trim());
    }
  };

  return (
    <header className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand Title */}
      <div className="flex items-center gap-3 bg-[#0F172A]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80 shadow-xl pointer-events-auto">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-black font-bold font-mono">
          NB
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            NextBit <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">MVP</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">{projectName}</p>
        </div>
      </div>

      {/* Input Prompt Bar Placeholder */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xl w-full max-w-xl mx-4 pointer-events-auto"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Describe your software system architecture..."
          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full px-2 py-1 font-sans"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-cyan-500/20 shrink-0 flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" /> Generate Architecture
        </button>
      </form>

      {/* Legend / Status Pill */}
      <div className="hidden lg:flex items-center gap-4 bg-[#0F172A]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-mono text-slate-300 pointer-events-auto">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> UI</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> Service</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> DB</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> CDN</span>
      </div>
    </header>
  );
};
