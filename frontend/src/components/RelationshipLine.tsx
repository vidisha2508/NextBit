import React, { useMemo } from 'react';
import * as THREE from 'three';
import { QuadraticBezierLine } from '@react-three/drei';
import { RelationshipLayout } from '../types/architecture';

interface RelationshipLineProps {
  layout: RelationshipLayout;
  isHighlighted: boolean;
}

export const RelationshipLine: React.FC<RelationshipLineProps> = ({ layout, isHighlighted }) => {
  const { sourcePosition, targetPosition, color } = layout;

  const start = useMemo(() => new THREE.Vector3(sourcePosition.x, sourcePosition.y, sourcePosition.z), [sourcePosition]);
  const end = useMemo(() => new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), [targetPosition]);

  // Calculate curve control point (arching upwards into 3D space)
  const midPoint = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    mid.y += Math.min(3, Math.max(1.5, distance * 0.25)); // Arch height
    return mid;
  }, [start, end]);

  const lineColor = isHighlighted ? '#0284C7' : color;
  const lineWidth = isHighlighted ? 3 : 1.5;
  const opacity = isHighlighted ? 1.0 : 0.65;

  return (
    <group>
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={midPoint}
        color={lineColor}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        dashed={false}
      />
    </group>
  );
};
