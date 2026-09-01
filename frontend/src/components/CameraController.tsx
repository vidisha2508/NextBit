import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { ComputedLayout, NavigationState } from '../types/architecture';

interface CameraControllerProps {
  layout: ComputedLayout | null;
  navigation: NavigationState;
}

export const CameraController: React.FC<CameraControllerProps> = ({ layout, navigation }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const targetPos = useRef(new THREE.Vector3(0, 22, 28));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Determine target camera vectors based on navigation state
  if (navigation.level === 'city' || !layout || !navigation.buildingId) {
    targetPos.current.set(0, 22, 28);
    targetLookAt.current.set(0, 0, 0);
  } else {
    const bLayout = layout.buildingsMap.get(navigation.buildingId);
    if (bLayout) {
      const { position: bp } = bLayout;

      if (navigation.level === 'building') {
        targetPos.current.set(bp.x + 8, bp.y + 8, bp.z + 14);
        targetLookAt.current.set(bp.x, bp.y, bp.z);
      } else if (navigation.level === 'floor' && navigation.floorId) {
        const fLayout = bLayout.floors.find(f => f.floor.id === navigation.floorId);
        if (fLayout) {
          const fp = fLayout.position;
          targetPos.current.set(fp.x + 5, fp.y + 3.5, fp.z + 8);
          targetLookAt.current.set(fp.x, fp.y, fp.z);
        } else {
          targetPos.current.set(bp.x + 8, bp.y + 8, bp.z + 14);
          targetLookAt.current.set(bp.x, bp.y, bp.z);
        }
      } else if (navigation.level === 'room' && navigation.roomId) {
        let roomPos: THREE.Vector3 | null = null;
        for (const f of bLayout.floors) {
          const rLayout = f.rooms.find(r => r.room.id === navigation.roomId);
          if (rLayout) {
            roomPos = new THREE.Vector3(rLayout.position.x, rLayout.position.y, rLayout.position.z);
            break;
          }
        }
        if (roomPos) {
          targetPos.current.set(roomPos.x + 2.5, roomPos.y + 2, roomPos.z + 4);
          targetLookAt.current.set(roomPos.x, roomPos.y, roomPos.z);
        } else {
          targetPos.current.set(bp.x + 8, bp.y + 8, bp.z + 14);
          targetLookAt.current.set(bp.x, bp.y, bp.z);
        }
      }
    }
  }

  // Smoothly interpolate camera position and orbit target frame-by-frame
  useFrame((_, delta) => {
    if (controlsRef.current) {
      camera.position.lerp(targetPos.current, Math.min(1, delta * 3.5));
      controlsRef.current.target.lerp(targetLookAt.current, Math.min(1, delta * 3.5));
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={3}
      maxDistance={80}
    />
  );
};
