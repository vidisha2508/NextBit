import React, { useState } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';

interface PromptFormProps {
  onGenerate: (prompt: string) => void;
  projectName?: string;
  isLoading: boolean;
  dataSource?: string | null;
}

export const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  projectName,
  isLoading,
  dataSource
}) => {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim() && !isLoading) {
      onGenerate(promptText.trim());
    }
  };

  return (
    <header className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand Title & Logo */}
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-300 shadow-xl pointer-events-auto">
        <img
          src="/logo.png"
          alt="NextBit Logo"
          className="w-8 h-8 object-contain shrink-0 rounded-lg"
          onError={(e) => {
            // Fallback badge if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            NextBit <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-sky-100 text-sky-700 border border-sky-300 rounded-md font-bold">Garden City</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono truncate max-w-[180px]">
            {projectName || 'Interactive City'}
          </p>
        </div>
      </div>

      {/* Input Prompt Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-300 shadow-xl w-full max-w-xl mx-4 pointer-events-auto"
      >
        <Sparkles className="w-4 h-4 text-sky-500 shrink-0 ml-1" />
        <input
          type="text"
          value={promptText}
          disabled={isLoading}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Describe the software you want to build (e.g. Build a Netflix clone)..."
          className="bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full px-2 py-1 font-sans disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !promptText.trim()}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-sky-500/20 shrink-0 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" /> Generate Architecture
            </>
          )}
        </button>
      </form>

      {/* Data Source & Legend */}
      <div className="hidden lg:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-mono text-slate-700 shadow-xl pointer-events-auto">
        {dataSource && (
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-300 text-[11px] font-bold uppercase">
            SOURCE: {dataSource}
          </span>
        )}
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span> UI</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> Service</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> DB</span>
      </div>
    </header>
  );
};
