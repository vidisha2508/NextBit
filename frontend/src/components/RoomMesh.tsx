import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { RoomLayout } from '../types/architecture';
import { FileText, Code2, Database, Shield } from 'lucide-react';

interface RoomMeshProps {
  layout: RoomLayout;
  isSelected: boolean;
  onSelect: (roomId: string) => void;
}

export const RoomMesh: React.FC<RoomMeshProps> = ({ layout, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const { room, position, dimensions, color } = layout;

  const width = dimensions.width;
  const height = dimensions.height;
  const depth = dimensions.depth;

  const getRoomIcon = () => {
    const lang = (room.language || '').toLowerCase();
    if (lang === 'sql' || lang.includes('db')) return <Database className="w-3 h-3 text-amber-500" />;
    if (lang.includes('auth') || room.name.includes('auth') || room.name.includes('jwt')) return <Shield className="w-3 h-3 text-rose-500" />;
    if (lang.includes('script') || lang.includes('python') || lang.includes('go')) return <Code2 className="w-3 h-3 text-sky-500" />;
    return <FileText className="w-3 h-3 text-emerald-500" />;
  };

  const meshColor = isSelected ? '#0284C7' : hovered ? '#F59E0B' : color;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Voxel Room Module Block */}
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(room.id);
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
          color={meshColor}
          roughness={0.3}
          metalness={0.1}
          emissive={isSelected ? '#38BDF8' : hovered ? '#FBBF24' : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Top Roof Trim */}
      <mesh position={[0, height / 2 + 0.02, 0]}>
        <boxGeometry args={[width * 0.9, 0.04, depth * 0.9]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Floating Room File Name Tag */}
      <Html
        position={[0, height / 2 + 0.4, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap transition-all border shadow flex items-center gap-1.5 ${
          isSelected
            ? 'bg-sky-600 text-white border-sky-300 font-bold scale-110 shadow-sky-500/40'
            : hovered
            ? 'bg-amber-500 text-slate-900 border-amber-300 font-semibold'
            : 'bg-white/95 text-slate-800 border-slate-300'
        }`}>
          {getRoomIcon()}
          <span>{room.name}</span>
        </div>
      </Html>
    </group>
  );
};
