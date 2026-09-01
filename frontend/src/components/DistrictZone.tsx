import React from 'react';
import { Html } from '@react-three/drei';
import { DistrictLayout } from '../types/architecture';
import { DISTRICT_COLORS } from '../utils/layoutEngine';

interface DistrictZoneProps {
  layout: DistrictLayout;
}

export const DistrictZone: React.FC<DistrictZoneProps> = ({ layout }) => {
  const { district, position, dimensions } = layout;
  const style = DISTRICT_COLORS[district.type] || DISTRICT_COLORS.default;

  const width = dimensions.width;
  const depth = dimensions.depth;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Sunny District Grass Base Tile */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.75} />
      </mesh>

      {/* Stone Curb Edge Border */}
      <lineSegments position={[0, 0.07, 0]}>
        <boxGeometry args={[width + 0.1, 0.14, depth + 0.1]} />
        <meshStandardMaterial color={style.border} roughness={0.5} />
      </lineSegments>

      {/* Outer Curb Frame */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[width + 0.3, 0.08, depth + 0.3]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
      </mesh>

      {/* Signboard Post in Corner */}
      <group position={[-width / 2 + 0.8, 0, depth / 2 - 0.8]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.12, 1.0, 0.12]} />
          <meshStandardMaterial color="#78350F" />
        </mesh>
      </group>

      {/* District Name Label Banner */}
      <Html
        position={[-width / 2 + 0.8, 1.2, depth / 2 - 0.8]}
        center
        distanceFactor={18}
        style={{ pointerEvents: 'none' }}
      >
        <div className="px-3 py-1 bg-white/95 text-slate-800 rounded-lg shadow-md border-2 border-slate-300 font-bold text-xs font-mono flex items-center gap-2 whitespace-nowrap">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: style.border }}
          />
          <span>{district.name}</span>
          <span className="text-[10px] text-slate-500 font-normal">({district.buildings.length} services)</span>
        </div>
      </Html>
    </group>
  );
};
