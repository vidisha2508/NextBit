import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { FloorLayout } from '../types/architecture';
import { RoomMesh } from './RoomMesh';
import { Layers } from 'lucide-react';

interface FloorMeshProps {
  layout: FloorLayout;
  isSelected: boolean;
  isFloorActive: boolean;
  selectedRoomId: string | null;
  onSelectFloor: (floorId: string) => void;
  onSelectRoom: (roomId: string) => void;
}

export const FloorMesh: React.FC<FloorMeshProps> = ({
  layout,
  isSelected,
  isFloorActive,
  selectedRoomId,
  onSelectFloor,
  onSelectRoom,
}) => {
  const [hovered, setHovered] = useState(false);
  const { floor, position, dimensions } = layout;

  const width = dimensions.width;
  const height = dimensions.height;
  const depth = dimensions.depth;

  const slabColor = isSelected ? '#0284C7' : hovered ? '#F59E0B' : '#E2E8F0';

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Floor Base Slab */}
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectFloor(floor.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={slabColor}
          roughness={0.4}
          metalness={0.1}
          emissive={isSelected ? '#38BDF8' : hovered ? '#FBBF24' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Glass Railing Border */}
      <mesh position={[0, height / 2 + 0.15, depth / 2]}>
        <boxGeometry args={[width, 0.3, 0.04]} />
        <meshStandardMaterial color="#E0F2FE" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, height / 2 + 0.15, -depth / 2]}>
        <boxGeometry args={[width, 0.3, 0.04]} />
        <meshStandardMaterial color="#E0F2FE" transparent opacity={0.6} />
      </mesh>
      <mesh position={[width / 2, height / 2 + 0.15, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.3, 0.04]} />
        <meshStandardMaterial color="#E0F2FE" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-width / 2, height / 2 + 0.15, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.3, 0.04]} />
        <meshStandardMaterial color="#E0F2FE" transparent opacity={0.6} />
      </mesh>

      {/* Render Rooms on top of this floor when active or inspected */}
      {(isFloorActive || isSelected) && (
        <group>
          {layout.rooms.map((rLayout) => (
            <RoomMesh
              key={rLayout.room.id}
              layout={rLayout}
              isSelected={selectedRoomId === rLayout.room.id}
              onSelect={onSelectRoom}
            />
          ))}
        </group>
      )}

      {/* Floating Floor Label Badge */}
      <Html
        position={[-width / 2 - 0.4, 0, 0]}
        center
        distanceFactor={14}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-all border shadow flex items-center gap-1.5 ${
          isSelected
            ? 'bg-sky-600 text-white border-sky-300 font-bold scale-110 shadow-sky-500/30'
            : hovered
            ? 'bg-amber-500 text-slate-900 border-amber-300 font-bold'
            : 'bg-white/95 text-slate-800 border-slate-300'
        }`}>
          <Layers className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{floor.name}</span>
          <span className="text-[10px] text-slate-500 font-normal">({floor.rooms.length} modules)</span>
        </div>
      </Html>
    </group>
  );
};
