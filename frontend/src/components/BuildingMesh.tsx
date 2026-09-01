import React, { useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { BuildingLayout } from '../types/architecture';

interface BuildingMeshProps {
  layout: BuildingLayout;
  isSelected: boolean;
  onSelect: (buildingId: string) => void;
}

export const BuildingMesh: React.FC<BuildingMeshProps> = ({ layout, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const { position, dimensions, geometryShape, color, accentColor, building } = layout;

  const width = dimensions.width;
  const height = dimensions.height;
  const depth = dimensions.depth;

  const numFloors = building.floors?.length || building.complexity || 3;

  // Render voxel building structure
  const renderBuildingBody = () => {
    switch (geometryShape) {
      case 'cylinder':
        return <cylinderGeometry args={[width / 2, width / 2, height, 16]} />;
      case 'prism':
        return <cylinderGeometry args={[width / 1.8, width / 1.8, height, 4]} />;
      case 'pyramid':
        return <coneGeometry args={[width / 1.5, height, 4]} />;
      case 'box':
      default:
        return <boxGeometry args={[width, height, depth]} />;
    }
  };

  const meshColor = isSelected ? '#0284C7' : hovered ? accentColor : color;
  const emissiveColor = isSelected ? '#38BDF8' : hovered ? accentColor : '#000000';
  const emissiveIntensity = isSelected ? 0.35 : hovered ? 0.2 : 0;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Base Building Block */}
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(building.id);
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
        {renderBuildingBody()}
        <meshStandardMaterial
          color={meshColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Roof Block Accent Trim */}
      <mesh position={[0, height / 2 + 0.1, 0]} castShadow>
        <boxGeometry args={[width * 0.95, 0.2, depth * 0.95]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>

      {/* Glass Windows Lines (Decorative Architectural Voxel Details) */}
      {[...Array(Math.min(numFloors, 5))].map((_, idx) => {
        const winY = -height / 2 + 0.6 + idx * (height / (numFloors + 0.5));
        return (
          <group key={`win-${idx}`} position={[0, winY, 0]}>
            <mesh position={[0, 0, depth / 2 + 0.01]}>
              <planeGeometry args={[width * 0.75, 0.35]} />
              <meshStandardMaterial color="#E0F2FE" transparent opacity={0.85} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[width * 0.75, 0.35]} />
              <meshStandardMaterial color="#E0F2FE" transparent opacity={0.85} roughness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* Selected / Hover Outline indicator */}
      {(isSelected || hovered) && (
        <lineSegments position={[0, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width + 0.12, height + 0.12, depth + 0.12)]} />
          <lineBasicMaterial color={isSelected ? '#0284C7' : '#F59E0B'} linewidth={3} />
        </lineSegments>
      )}

      {/* Floating Building Label */}
      <Html
        position={[0, height / 2 + 0.7, 0]}
        center
        distanceFactor={16}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all duration-200 border shadow-md flex items-center gap-1.5 ${
          isSelected 
            ? 'bg-sky-600 text-white border-sky-300 font-bold scale-110 shadow-sky-500/40' 
            : hovered
            ? 'bg-slate-800 text-white border-slate-300'
            : 'bg-white/95 text-slate-800 border-slate-300'
        }`}>
          <span className="w-4 h-4 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-300">
            {numFloors}F
          </span>
          <span>{building.name}</span>
        </div>
      </Html>
    </group>
  );
};
