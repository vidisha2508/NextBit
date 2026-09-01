import React from 'react';
import { BuildingLayout, NavigationState, Relationship } from '../types/architecture';
import { X, Layers, Cpu, CheckCircle, ArrowRight, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

interface BuildingDetailsDrawerProps {
  layout: BuildingLayout | null;
  relationships: Relationship[];
  navigation: NavigationState;
  onNavigate: (state: Partial<NavigationState>) => void;
  onClose: () => void;
}

export const BuildingDetailsDrawer: React.FC<BuildingDetailsDrawerProps> = ({
  layout,
  relationships,
  navigation,
  onNavigate,
  onClose,
}) => {
  if (!layout) return null;

  const { building, accentColor } = layout;

  // Find active floor & room if selected
  const activeFloor = navigation.floorId
    ? layout.floors.find((f) => f.floor.id === navigation.floorId)
    : null;

  let activeRoom = null;
  if (navigation.roomId) {
    for (const f of layout.floors) {
      const r = f.rooms.find((r) => r.room.id === navigation.roomId);
      if (r) {
        activeRoom = r;
        break;
      }
    }
  }

  // Incoming/outgoing connections
  const outgoing = relationships.filter((r) => r.source === building.id);
  const incoming = relationships.filter((r) => r.target === building.id);

  return (
    <div className="absolute top-20 right-6 w-96 max-h-[84vh] bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl shadow-2xl p-5 overflow-y-auto z-20 text-slate-800 transition-all duration-300 animate-in slide-in-from-right-10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-3 mb-4">
        <div>
          <span
            className="inline-block px-2.5 py-0.5 text-[11px] font-mono rounded-full font-semibold uppercase tracking-wider mb-1"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}50` }}
          >
            {building.type.replace('_', ' ')}
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{building.name}</h2>
          <p className="text-xs font-mono text-slate-500">
            {activeRoom
              ? `Inspecting Room: ${activeRoom.room.name}`
              : activeFloor
              ? `Inspecting Floor: ${activeFloor.floor.name}`
              : `Building Overview (${layout.floors.length} Floors)`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ROOM LEVEL DETAILED VIEW */}
      {activeRoom && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 font-mono text-emerald-800 font-bold text-sm mb-1">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{activeRoom.room.name}</span>
            </div>
            <p className="text-xs text-emerald-700">{activeRoom.room.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Core Responsibility
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
              {activeRoom.room.responsibility || 'Executes component logic'}
            </div>
          </div>

          {activeRoom.room.technology && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-600" /> Technology & Language
              </h4>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-semibold">
                  {activeRoom.room.technology}
                </span>
                {activeRoom.room.language && (
                  <span className="px-2.5 py-1 text-xs font-mono bg-sky-50 text-sky-700 border border-sky-200 rounded-md font-semibold uppercase">
                    {activeRoom.room.language}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => onNavigate({ level: 'floor', roomId: null })}
            className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Floor View
          </button>
        </div>
      )}

      {/* FLOOR LEVEL DETAILED VIEW */}
      {activeFloor && !activeRoom && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 font-mono text-amber-900 font-bold text-sm mb-1">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>{activeFloor.floor.name}</span>
            </div>
            <p className="text-xs text-amber-800">{activeFloor.floor.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-600" /> Rooms / Files on this Floor ({activeFloor.floor.rooms.length})
            </h4>
            <div className="space-y-2">
              {activeFloor.floor.rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onNavigate({ level: 'room', roomId: room.id })}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 transition rounded-xl border border-slate-200 flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-sky-700 block">
                      📄 {room.name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{room.responsibility}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate({ level: 'building', floorId: null, roomId: null })}
            className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Building View
          </button>
        </div>
      )}

      {/* BUILDING OVERVIEW VIEW */}
      {!activeFloor && !activeRoom && (
        <div className="space-y-4">
          {building.description && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {building.description}
            </p>
          )}

          {/* Complexity Metric */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-sky-600" /> Building Complexity</span>
              <span className="font-mono text-sky-600 font-bold">{building.complexity} / 5</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    lvl <= building.complexity ? 'bg-sky-500 shadow-sm' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Technologies */}
          {building.technologies && building.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-600" /> Technology Stack
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {building.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Floors Navigation List */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" /> Internal Floors ({layout.floors.length})
            </h4>
            <div className="space-y-2">
              {layout.floors.map((fLayout) => (
                <button
                  key={fLayout.floor.id}
                  onClick={() => onNavigate({ level: 'floor', floorId: fLayout.floor.id })}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition rounded-xl border border-slate-200 flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-amber-800 block">
                      🥞 {fLayout.floor.name}
                    </span>
                    <span className="text-[11px] text-slate-500">{fLayout.floor.rooms.length} modules inside</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Core Responsibilities */}
          {building.responsibilities && building.responsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Component Responsibilities
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {building.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Architecture Connections */}
          {(outgoing.length > 0 || incoming.length > 0) && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-sky-600" /> Architecture Connections
              </h4>
              <div className="space-y-1.5 text-xs">
                {outgoing.map((rel) => (
                  <div key={rel.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                    <div className="flex items-center justify-between font-mono text-sky-700 font-bold mb-0.5">
                      <span>Outbound &rarr; {rel.target}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">{rel.type}</span>
                    </div>
                    {rel.description && <p className="text-[11px] text-slate-500">{rel.description}</p>}
                  </div>
                ))}
                {incoming.map((rel) => (
                  <div key={rel.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                    <div className="flex items-center justify-between font-mono text-amber-700 font-bold mb-0.5">
                      <span>Inbound &larr; {rel.source}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">{rel.type}</span>
                    </div>
                    {rel.description && <p className="text-[11px] text-slate-500">{rel.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
