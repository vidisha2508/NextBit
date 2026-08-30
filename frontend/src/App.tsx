import React, { useState, useMemo } from 'react';
import { ArchitectureJSON } from './types/architecture';
import mockData from './data/mockNetflixArchitecture.json';
import { calculateLayout } from './utils/layoutEngine';
import { CityCanvas } from './components/CityCanvas';
import { PromptForm } from './components/PromptForm';
import { BuildingDetailsDrawer } from './components/BuildingDetailsDrawer';

export const App: React.FC = () => {
  const [architectureData] = useState<ArchitectureJSON>(mockData as ArchitectureJSON);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Calculate layout deterministically from raw architecture data
  const layout = useMemo(() => {
    return calculateLayout(architectureData);
  }, [architectureData]);

  // Selected building layout reference
  const selectedBuildingLayout = useMemo(() => {
    if (!selectedBuildingId) return null;
    return layout.buildingsMap.get(selectedBuildingId) || null;
  }, [selectedBuildingId, layout]);

  const handleGeneratePrompt = (prompt: string) => {
    console.log('Generating architecture for prompt:', prompt);
    // Future LLM endpoint call will happen here!
  };

  return (
    <main className="w-screen h-screen relative bg-[#0B0F19] overflow-hidden select-none">
      {/* Top Header / Prompt Form Bar */}
      <PromptForm
        projectName={architectureData.projectName}
        onGenerate={handleGeneratePrompt}
      />

      {/* 3D City Visualization Canvas */}
      <CityCanvas
        layout={layout}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={(id) => setSelectedBuildingId(id)}
      />

      {/* Selected Building Details Sidebar Drawer */}
      <BuildingDetailsDrawer
        layout={selectedBuildingLayout}
        relationships={architectureData.relationships}
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
