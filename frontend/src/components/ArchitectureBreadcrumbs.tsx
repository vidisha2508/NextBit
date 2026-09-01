import React from 'react';
import { ArchitectureJSON, NavigationState } from '../types/architecture';
import { Home, Building2, Layers, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

interface ArchitectureBreadcrumbsProps {
  architecture: ArchitectureJSON | null;
  navigation: NavigationState;
  onNavigate: (state: Partial<NavigationState>) => void;
}

export const ArchitectureBreadcrumbs: React.FC<ArchitectureBreadcrumbsProps> = ({
  architecture,
  navigation,
  onNavigate,
}) => {
  if (!architecture) return null;

  // Find active district, building, floor, room objects for display text
  let activeDistrict = null;
  let activeBuilding = null;
  let activeFloor = null;
  let activeRoom = null;

  if (navigation.buildingId) {
    for (const d of architecture.districts) {
      const b = d.buildings.find(b => b.id === navigation.buildingId);
      if (b) {
        activeDistrict = d;
        activeBuilding = b;
        break;
      }
    }
  }

  if (activeBuilding && navigation.floorId) {
    activeFloor = (activeBuilding.floors || []).find(f => f.id === navigation.floorId);
  }

  if (activeFloor && navigation.roomId) {
    activeRoom = activeFloor.rooms.find(r => r.id === navigation.roomId);
  }

  return (
    <nav className="absolute top-20 left-6 z-20 flex items-center gap-2 pointer-events-auto">
      {/* Back Button if not in City View */}
      {navigation.level !== 'city' && (
        <button
          onClick={() => {
            if (navigation.level === 'room') {
              onNavigate({ level: 'floor', roomId: null });
            } else if (navigation.level === 'floor') {
              onNavigate({ level: 'building', floorId: null, roomId: null });
            } else {
              onNavigate({ level: 'city', buildingId: null, floorId: null, roomId: null });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-slate-800 rounded-xl border border-slate-300 shadow-lg text-xs font-semibold hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
          <span>Back</span>
        </button>
      )}

      {/* Breadcrumbs Bar Container */}
      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-lg text-xs font-mono text-slate-700">
        {/* City Segment */}
        <button
          onClick={() => onNavigate({ level: 'city', buildingId: null, floorId: null, roomId: null })}
          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:text-sky-600 font-semibold transition ${
            navigation.level === 'city' ? 'text-sky-600 font-bold bg-sky-50' : 'text-slate-600'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-sky-500" />
          <span>City View</span>
        </button>

        {/* District Segment */}
        {activeDistrict && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-sans text-[11px] truncate max-w-[100px]">
              {activeDistrict.name}
            </span>
          </>
        )}

        {/* Building Segment */}
        {activeBuilding && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onNavigate({ level: 'building', floorId: null, roomId: null })}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:text-sky-600 transition truncate max-w-[130px] ${
                navigation.level === 'building' ? 'text-sky-600 font-bold bg-sky-50' : 'text-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>{activeBuilding.name}</span>
            </button>
          </>
        )}

        {/* Floor Segment */}
        {activeFloor && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onNavigate({ level: 'floor', roomId: null })}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:text-sky-600 transition truncate max-w-[140px] ${
                navigation.level === 'floor' ? 'text-sky-600 font-bold bg-sky-50' : 'text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{activeFloor.name}</span>
            </button>
          </>
        )}

        {/* Room Segment */}
        {activeRoom && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-emerald-700 bg-emerald-50 font-bold border border-emerald-200 truncate max-w-[130px]">
              <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{activeRoom.name}</span>
            </span>
          </>
        )}
      </div>
    </nav>
  );
};
