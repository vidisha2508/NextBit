import React, { useState, useMemo } from 'react';
import { ArchitectureJSON } from './types/architecture';
import { calculateLayout } from './utils/layoutEngine';
import { CityCanvas } from './components/CityCanvas';
import { PromptForm } from './components/PromptForm';
import { BuildingDetailsDrawer } from './components/BuildingDetailsDrawer';
import { fetchArchitecture } from './api/architectureApi';
import { AlertCircle, RefreshCw, Building2 } from 'lucide-react';

export const App: React.FC = () => {
  const [architectureData, setArchitectureData] = useState<ArchitectureJSON | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);

  // Calculate layout deterministically when architectureData exists
  const layout = useMemo(() => {
    if (!architectureData) return null;
    return calculateLayout(architectureData);
  }, [architectureData]);

  // Selected building layout reference
  const selectedBuildingLayout = useMemo(() => {
    if (!selectedBuildingId || !layout) return null;
    return layout.buildingsMap.get(selectedBuildingId) || null;
  }, [selectedBuildingId, layout]);

  const handleGeneratePrompt = async (promptText: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedBuildingId(null); // Reset selection on new architecture load

    try {
      const response = await fetchArchitecture(promptText);
      setArchitectureData(response.architecture);
      setDataSource(response.source);
    } catch (err: any) {
      console.error('Failed to generate architecture:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-screen h-screen relative bg-[#0B0F19] overflow-hidden select-none">
      {/* Top Header / Prompt Form Bar */}
      <PromptForm
        projectName={architectureData?.projectName}
        onGenerate={handleGeneratePrompt}
        isLoading={isLoading}
        dataSource={dataSource}
      />

      {/* Error Alert Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-rose-950/90 border border-rose-600/80 text-rose-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs font-mono">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-15 bg-slate-950/50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-[#0F172A]/90 border border-cyan-500/40 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm font-mono text-cyan-200">Processing Prompt via Backend API...</p>
            <p className="text-xs text-slate-400 font-mono">Calculating 3D Layout Matrix</p>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!architectureData && !isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-[#0F172A]/75 backdrop-blur-md border border-slate-800 p-8 rounded-2xl text-center max-w-md shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Welcome to NextBit</h2>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Describe the software system you want to build above to generate your interactive 3D architecture city.
            </p>
          </div>
        </div>
      )}

      {/* 3D City Visualization Canvas */}
      <CityCanvas
        layout={layout}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={(id) => setSelectedBuildingId(id)}
      />

      {/* Selected Building Details Sidebar Drawer */}
      <BuildingDetailsDrawer
        layout={selectedBuildingLayout}
        relationships={architectureData?.relationships || []}
        onClose={() => setSelectedBuildingId(null)}
      />

      {/* Bottom Hint / Info Bar */}
      <footer className="absolute bottom-4 left-6 z-10 text-xs font-mono text-slate-500 pointer-events-none flex items-center gap-4">
        <span>Click building to inspect metadata</span>
        <span>•</span>
        <span>Drag to rotate</span>
        <span>•</span>
        <span>Scroll to zoom</span>
      </footer>
    </main>
  );
};

export default App;
