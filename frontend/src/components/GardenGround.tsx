import React, { useMemo } from 'react';
import { DistrictLayout } from '../types/architecture';

interface GardenGroundProps {
  districts: DistrictLayout[];
}

export const GardenGround: React.FC<GardenGroundProps> = ({ districts }) => {
  // Generate random tree & garden positions around districts
  const decorativeProps = useMemo(() => {
    const trees: { x: number; z: number; scale: number }[] = [];
    const flowers: { x: number; z: number; color: string }[] = [];

    const flowerColors = ['#F43F5E', '#F59E0B', '#A855F7', '#38BDF8', '#EC4899'];

    districts.forEach((d) => {
      const halfW = d.dimensions.width / 2 + 1.2;
      const halfD = d.dimensions.depth / 2 + 1.2;

      // Add trees near corners and margins of district tiles
      const corners = [
        { x: d.position.x - halfW - 0.8, z: d.position.z - halfD - 0.8 },
        { x: d.position.x + halfW + 0.8, z: d.position.z - halfD - 0.8 },
        { x: d.position.x - halfW - 0.8, z: d.position.z + halfD + 0.8 },
        { x: d.position.x + halfW + 0.8, z: d.position.z + halfD + 0.8 },
        { x: d.position.x, z: d.position.z - halfD - 1.5 },
        { x: d.position.x, z: d.position.z + halfD + 1.5 },
      ];

      corners.forEach((c, idx) => {
        trees.push({
          x: c.x + (idx % 2 === 0 ? 0.4 : -0.4),
          z: c.z + (idx % 3 === 0 ? 0.4 : -0.4),
          scale: 0.8 + (idx % 3) * 0.2
        });
      });

      // Add flower spots near margins
      for (let i = 0; i < 4; i++) {
        flowers.push({
          x: d.position.x + (i % 2 === 0 ? halfW + 0.4 : -halfW - 0.4),
          z: d.position.z + (i > 1 ? 1.5 : -1.5),
          color: flowerColors[i % flowerColors.length]
        });
      }
    });

    return { trees, flowers };
  }, [districts]);

  return (
    <group>
      {/* Main Sunny Meadow Grass Field */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[250, 250]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Inter-District Cobblestone Pathway/Road Strips */}
      {districts.map((d, i) => {
        if (i === districts.length - 1) return null;
        const nextD = districts[i + 1];
        const midX = (d.position.x + nextD.position.x) / 2;
        const pathWidth = nextD.position.x - d.position.x - d.dimensions.width / 2 - nextD.dimensions.width / 2;

        if (pathWidth <= 0) return null;

        return (
          <group key={`path-${i}`}>
            {/* Main Road/Path */}
            <mesh position={[midX, 0.02, 0]} receiveShadow>
              <boxGeometry args={[pathWidth + 0.2, 0.04, 3]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
            </mesh>
            {/* Path borders */}
            <mesh position={[midX, 0.04, 1.55]}>
              <boxGeometry args={[pathWidth + 0.2, 0.06, 0.15]} />
              <meshStandardMaterial color="#94A3B8" />
            </mesh>
            <mesh position={[midX, 0.04, -1.55]}>
              <boxGeometry args={[pathWidth + 0.2, 0.06, 0.15]} />
              <meshStandardMaterial color="#94A3B8" />
            </mesh>
          </group>
        );
      })}

      {/* Decorative Voxel Trees */}
      {decorativeProps.trees.map((t, i) => (
        <group key={`tree-${i}`} position={[t.x, 0, t.z]} scale={[t.scale, t.scale, t.scale]}>
          {/* Trunk */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Leaves Cluster 1 */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[1.2, 0.9, 1.2]} />
            <meshStandardMaterial color="#16A34A" roughness={0.8} />
          </mesh>
          {/* Leaves Cluster 2 Top */}
          <mesh position={[0, 2.0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.7, 0.8]} />
            <meshStandardMaterial color="#22C55E" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Decorative Flower Patches */}
      {decorativeProps.flowers.map((f, i) => (
        <group key={`flower-${i}`} position={[f.x, 0.05, f.z]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 6]} />
            <meshStandardMaterial color={f.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
