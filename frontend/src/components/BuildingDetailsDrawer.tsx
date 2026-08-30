import React from 'react';
import { BuildingLayout, Relationship } from '../types/architecture';
import { X, Layers, Cpu, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface BuildingDetailsDrawerProps {
  layout: BuildingLayout | null;
  relationships: Relationship[];
  onClose: () => void;
}

export const BuildingDetailsDrawer: React.FC<BuildingDetailsDrawerProps> = ({
  layout,
  relationships,
  onClose
}) => {
  if (!layout) return null;

  const { building, color, accentColor } = layout;

  // Find incoming & outgoing relationships
  const outgoing = relationships.filter(r => r.source === building.id);
  const incoming = relationships.filter(r => r.target === building.id);

  return (
    <div className="absolute top-20 right-6 w-96 max-h-[85vh] bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-5 overflow-y-auto z-20 text-slate-200 transition-all duration-300 animate-in slide-in-from-right-10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <span 
            className="inline-block px-2.5 py-0.5 text-xs font-mono rounded-full font-semibold uppercase tracking-wider mb-1"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}50` }}
          >
            {building.type.replace('_', ' ')}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">{building.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {building.description && (
        <p className="text-sm text-slate-300 mb-5 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          {building.description}
        </p>
      )}

      {/* Complexity Metric */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-cyan-400" /> Architectural Complexity</span>
          <span className="font-mono text-cyan-400 font-bold">{building.complexity} / 5</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div
              key={lvl}
              className={`h-2 flex-1 rounded-full transition-all ${
                lvl <= building.complexity ? 'bg-cyan-400 shadow-sm shadow-cyan-500/50' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Technologies */}
      {building.technologies && building.technologies.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" /> Technology Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {building.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs font-mono bg-slate-800/80 text-purple-300 border border-purple-500/30 rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {building.responsibilities && building.responsibilities.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Core Responsibilities
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {building.responsibilities.map((resp, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dependencies / Connections */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <div>
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <ArrowRight className="w-4 h-4 text-amber-400" /> Architecture Connections
          </h4>
          <div className="space-y-2 text-xs">
            {outgoing.map((rel) => (
              <div key={rel.id} className="p-2 bg-slate-900/50 rounded border border-slate-800 text-slate-300">
                <div className="flex items-center justify-between font-mono text-cyan-400 mb-1">
                  <span>Outbound &rarr; {rel.target}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800">{rel.type}</span>
                </div>
                {rel.description && <p className="text-[11px] text-slate-400">{rel.description}</p>}
              </div>
            ))}
            {incoming.map((rel) => (
              <div key={rel.id} className="p-2 bg-slate-900/50 rounded border border-slate-800 text-slate-300">
                <div className="flex items-center justify-between font-mono text-amber-400 mb-1">
                  <span>Inbound &larr; {rel.source}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 bg-amber-950 text-amber-300 rounded border border-amber-800">{rel.type}</span>
                </div>
                {rel.description && <p className="text-[11px] text-slate-400">{rel.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
