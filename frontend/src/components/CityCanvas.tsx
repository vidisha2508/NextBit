import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ComputedLayout } from '../types/architecture';
import { DistrictZone } from './DistrictZone';
import { BuildingMesh } from './BuildingMesh';
import { RelationshipLine } from './RelationshipLine';

interface CityCanvasProps {
  layout: ComputedLayout | null;
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string | null) => void;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  layout,
  selectedBuildingId,
  onSelectBuilding,
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 18, 25], fov: 45 }}
        onPointerDown={(e) => {
          // Deselect if clicking on empty space
          if (e.target === e.currentTarget) {
            onSelectBuilding(null);
          }
        }}
        className="bg-[#0B0F19]"
      >
        {/* Lights & Atmosphere */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[20, 35, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-20, 15, -20]} intensity={0.3} color="#00F0FF" />

        {/* Global Ground Grid */}
        <Grid
          infiniteGrid
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1E293B"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={60}
          fadeStrength={1}
        />

        {/* Render Layout if present */}
        {layout && (
          <>
            {/* District Zones */}
            {layout.districts.map((dLayout) => (
              <DistrictZone key={dLayout.district.id} layout={dLayout} />
            ))}

            {/* Buildings */}
            {Array.from(layout.buildingsMap.values()).map((bLayout) => (
              <BuildingMesh
                key={bLayout.building.id}
                layout={bLayout}
                isSelected={selectedBuildingId === bLayout.building.id}
                onSelect={(id) => onSelectBuilding(id)}
              />
            ))}

            {/* Relationships */}
            {layout.relationships.map((rLayout) => {
              const isConnectedToSelection =
                selectedBuildingId !== null &&
                (rLayout.relationship.source === selectedBuildingId ||
                  rLayout.relationship.target === selectedBuildingId);

              return (
                <RelationshipLine
                  key={rLayout.relationship.id}
                  layout={rLayout}
                  isHighlighted={isConnectedToSelection}
                />
              );
            })}
          </>
        )}

        {/* Camera Control */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going under grid
          minDistance={5}
          maxDistance={70}
        />
      </Canvas>
    </div>
  );
};
