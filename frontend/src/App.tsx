import React, { useState, useMemo } from 'react';
import { ArchitectureJSON, NavigationState } from './types/architecture';
import { hydrateArchitectureHierarchy } from './utils/hierarchyTransformer';
import { calculateLayout } from './utils/layoutEngine';
import { CityCanvas } from './components/CityCanvas';
import { PromptForm } from './components/PromptForm';
import { ArchitectureBreadcrumbs } from './components/ArchitectureBreadcrumbs';
import { BuildingDetailsDrawer } from './components/BuildingDetailsDrawer';
import { fetchArchitecture } from './api/architectureApi';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [rawArchitecture, setRawArchitecture] = useState<ArchitectureJSON | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);

  // Navigation state management across hierarchy
  const [navigation, setNavigation] = useState<NavigationState>({
    level: 'city',
    districtId: null,
    buildingId: null,
    floorId: null,
    roomId: null
  });

  // Ensure architecture hierarchy is hydrated with floors and rooms
  const architectureData = useMemo(() => {
    if (!rawArchitecture) return null;
    return hydrateArchitectureHierarchy(rawArchitecture);
  }, [rawArchitecture]);

  // Calculate layout deterministically
  const layout = useMemo(() => {
    if (!architectureData) return null;
    return calculateLayout(architectureData);
  }, [architectureData]);

  // Selected building layout reference
  const selectedBuildingLayout = useMemo(() => {
    if (!navigation.buildingId || !layout) return null;
    return layout.buildingsMap.get(navigation.buildingId) || null;
  }, [navigation.buildingId, layout]);

  const handleGeneratePrompt = async (promptText: string) => {
    setIsLoading(true);
    setError(null);
    setNavigation({
      level: 'city',
      districtId: null,
      buildingId: null,
      floorId: null,
      roomId: null
    });

    try {
      const response = await fetchArchitecture(promptText);
      setRawArchitecture(response.architecture);
      setDataSource(response.source);
    } catch (err: any) {
      console.error('Failed to generate architecture:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (newState: Partial<NavigationState>) => {
    setNavigation((prev) => ({
      ...prev,
      ...newState
    }));
  };

  const handleSelectBuilding = (buildingId: string | null) => {
    if (!buildingId) {
      setNavigation({
        level: 'city',
        districtId: null,
        buildingId: null,
        floorId: null,
        roomId: null
      });
    } else {
      setNavigation({
        level: 'building',
        districtId: null,
        buildingId,
        floorId: null,
        roomId: null
      });
    }
  };

  const handleSelectFloor = (floorId: string | null) => {
    if (!floorId) {
      setNavigation((prev) => ({
        ...prev,
        level: 'building',
        floorId: null,
        roomId: null
      }));
    } else {
      setNavigation((prev) => ({
        ...prev,
        level: 'floor',
        floorId,
        roomId: null
      }));
    }
  };

  const handleSelectRoom = (roomId: string | null) => {
    if (!roomId) {
      setNavigation((prev) => ({
        ...prev,
        level: 'floor',
        roomId: null
      }));
    } else {
      setNavigation((prev) => ({
        ...prev,
        level: 'room',
        roomId
      }));
    }
  };

  return (
    <main className="w-screen h-screen relative bg-[#9BE0FF] overflow-hidden select-none">
      {/* Top Header / Prompt Form Bar */}
      <PromptForm
        projectName={architectureData?.projectName}
        onGenerate={handleGeneratePrompt}
        isLoading={isLoading}
        dataSource={dataSource}
      />

      {/* Hierarchical Breadcrumb Navigation */}
      <ArchitectureBreadcrumbs
        architecture={architectureData}
        navigation={navigation}
        onNavigate={handleNavigate}
      />

      {/* Error Alert Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-rose-50 border border-rose-300 text-rose-800 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-mono font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 text-xs font-bold ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-15 bg-sky-950/20 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/95 border border-sky-200 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm font-mono font-bold text-slate-800">Generating Software Garden City...</p>
            <p className="text-xs text-slate-500 font-mono">Building Districts, Floors & File Rooms</p>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!architectureData && !isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md border border-slate-300 p-8 rounded-3xl text-center max-w-md shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center mx-auto mb-4">
              <img src="/logo.png" alt="NextBit" className="w-9 h-9 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to NextBit</h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed mb-4">
              Describe the software system you want to build above to generate an interactive, explorable garden city.
            </p>

            <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-left text-xs space-y-1.5 text-sky-900 font-mono">
              <div className="font-bold flex items-center gap-1.5 text-sky-700">
                <Compass className="w-4 h-4" /> Exploration Hierarchy:
              </div>
              <div>🏡 City → 🏢 District & Building → 🥞 Floor → 📄 File Room</div>
            </div>
          </div>
        </div>
      )}

      {/* 3D City & Interior Visualization Canvas */}
      <CityCanvas
        layout={layout}
        navigation={navigation}
        onSelectBuilding={handleSelectBuilding}
        onSelectFloor={handleSelectFloor}
        onSelectRoom={handleSelectRoom}
      />

      {/* Selected Building / Floor / Room Details Sidebar Drawer */}
      <BuildingDetailsDrawer
        layout={selectedBuildingLayout}
        relationships={architectureData?.relationships || []}
        navigation={navigation}
        onNavigate={handleNavigate}
        onClose={() => handleSelectBuilding(null)}
      />

      {/* Bottom Hint Bar */}
      <footer className="absolute bottom-4 left-6 z-10 text-xs font-mono text-slate-700 pointer-events-none flex items-center gap-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-300 shadow-md">
        <span>Click Building / Floor to explore inside</span>
        <span>•</span>
        <span>Drag to rotate</span>
        <span>•</span>
        <span>Scroll to zoom</span>
      </footer>
    </main>
  );
};

export default App;
