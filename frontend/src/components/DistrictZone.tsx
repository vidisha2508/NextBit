import React from 'react';
import * as THREE from 'three';
import { DistrictLayout } from '../types/architecture';
import { Text } from '@react-three/drei';

interface DistrictZoneProps {
  layout: DistrictLayout;
}

export const DistrictZone: React.FC<DistrictZoneProps> = ({ layout }) => {
  const { position, dimensions, district, color } = layout;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Ground Zone Base Tile */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[dimensions.width, 0.2, dimensions.depth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.6} 
          metalness={0.2} 
        />
      </mesh>

      {/* Border Wireframe Outline */}
      <lineSegments position={[0, 0.11, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(dimensions.width, 0.02, dimensions.depth)]} />
        <lineBasicMaterial color="#00F0FF" linewidth={2} />
      </lineSegments>

      {/* District Name Label on Floor */}
      <Text
        position={[0, 0.15, dimensions.depth / 2 - 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.6}
        color="#00F0FF"
        anchorX="center"
        anchorY="middle"
      >
        {district.name.toUpperCase()}
      </Text>
    </group>
  );
};
