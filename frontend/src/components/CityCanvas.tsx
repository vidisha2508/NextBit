import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ComputedLayout, NavigationState } from '../types/architecture';
import { GardenGround } from './GardenGround';
import { DistrictZone } from './DistrictZone';
import { BuildingMesh } from './BuildingMesh';
import { BuildingInteriorView } from './BuildingInteriorView';
import { RelationshipLine } from './RelationshipLine';
import { CameraController } from './CameraController';

interface CityCanvasProps {
  layout: ComputedLayout | null;
  navigation: NavigationState;
  onSelectBuilding: (buildingId: string | null) => void;
  onSelectFloor: (floorId: string | null) => void;
  onSelectRoom: (roomId: string | null) => void;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  layout,
  navigation,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
}) => {
  const activeBuildingLayout = navigation.buildingId && layout
    ? layout.buildingsMap.get(navigation.buildingId) || null
    : null;

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 22, 28], fov: 40 }}
        onPointerDown={(e) => {
          // Deselect when clicking empty ground
          if (e.target === e.currentTarget && navigation.level !== 'city') {
            onSelectBuilding(null);
          }
        }}
        className="bg-[#9BE0FF]"
      >
        {/* Sunny Sky & Warm Daylight Atmosphere */}
        <color attach="background" args={['#9BE0FF']} />
        <ambientLight intensity={0.75} color="#F8FAFC" />
        <directionalLight
          position={[30, 45, 20]}
          intensity={1.5}
          color="#FFFBEB"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={120}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />
        <directionalLight position={[-20, 20, -20]} intensity={0.4} color="#BAE6FD" />

        {/* Camera Lerp Controller */}
        <CameraController layout={layout} navigation={navigation} />

        {/* Render Layout if present */}
        {layout && (
          <>
            {/* Garden Ground, Pathways, Voxel Trees & Flower Patches */}
            <GardenGround districts={layout.districts} />

            {/* District Base Zones */}
            {layout.districts.map((dLayout) => (
              <DistrictZone key={dLayout.district.id} layout={dLayout} />
            ))}

            {/* Render Buildings in City View or Building Interior when focused */}
            {Array.from(layout.buildingsMap.values()).map((bLayout) => {
              const isSelectedBuilding = navigation.buildingId === bLayout.building.id;

              // If a building is selected and we are in building/floor/room view, render multi-floor interior
              if (isSelectedBuilding && navigation.level !== 'city') {
                return (
                  <BuildingInteriorView
                    key={bLayout.building.id}
                    layout={bLayout}
                    selectedFloorId={navigation.floorId}
                    selectedRoomId={navigation.roomId}
                    onSelectFloor={(fId) => onSelectFloor(fId)}
                    onSelectRoom={(rId) => onSelectRoom(rId)}
                  />
                );
              }

              // Otherwise render the City View voxel building block
              return (
                <BuildingMesh
                  key={bLayout.building.id}
                  layout={bLayout}
                  isSelected={isSelectedBuilding}
                  onSelect={(bId) => onSelectBuilding(bId)}
                />
              );
            })}

            {/* Relationship Connections */}
            {layout.relationships.map((rLayout) => {
              const isConnectedToSelection =
                navigation.buildingId !== null &&
                (rLayout.relationship.source === navigation.buildingId ||
                  rLayout.relationship.target === navigation.buildingId);

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
      </Canvas>
    </div>
  );
};
