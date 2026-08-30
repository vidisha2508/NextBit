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

  // Render specific shape geometry
  const renderGeometry = () => {
    switch (geometryShape) {
      case 'cylinder':
        return <cylinderGeometry args={[width / 2, width / 2, height, 24]} />;
      case 'prism':
        return <cylinderGeometry args={[width / 1.8, width / 1.8, height, 4]} />;
      case 'pyramid':
        return <coneGeometry args={[width / 1.5, height, 4]} />;
      case 'box':
      default:
        return <boxGeometry args={[width, height, depth]} />;
    }
  };

  const meshColor = isSelected ? '#00F0FF' : hovered ? accentColor : color;
  const emissiveColor = isSelected ? '#00F0FF' : hovered ? accentColor : '#000000';
  const emissiveIntensity = isSelected ? 0.6 : hovered ? 0.4 : 0;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Interactive Main Mesh */}
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
        {renderGeometry()}
        <meshStandardMaterial
          color={meshColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Selected / Hover Outline indicator */}
      {(isSelected || hovered) && (
        <lineSegments position={[0, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width + 0.1, height + 0.1, depth + 0.1)]} />
          <lineBasicMaterial color={isSelected ? '#00F0FF' : accentColor} linewidth={2} />
        </lineSegments>
      )}

      {/* Building Label Header */}
      <Html
        position={[0, height / 2 + 0.4, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap transition-all duration-200 border ${
          isSelected 
            ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-110 font-bold' 
            : hovered
            ? 'bg-slate-900/90 text-white border-slate-400 shadow-md'
            : 'bg-slate-950/75 text-slate-300 border-slate-700/60'
        }`}>
          {building.name}
        </div>
      </Html>
    </group>
  );
};
