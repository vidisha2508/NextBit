import React from 'react';
import { BuildingLayout } from '../types/architecture';
import { FloorMesh } from './FloorMesh';

interface BuildingInteriorViewProps {
  layout: BuildingLayout;
  selectedFloorId: string | null;
  selectedRoomId: string | null;
  onSelectFloor: (floorId: string) => void;
  onSelectRoom: (roomId: string) => void;
}

export const BuildingInteriorView: React.FC<BuildingInteriorViewProps> = ({
  layout,
  selectedFloorId,
  selectedRoomId,
  onSelectFloor,
  onSelectRoom,
}) => {
  return (
    <group>
      {layout.floors.map((fLayout) => {
        const isFloorSelected = selectedFloorId === fLayout.floor.id;
        const containsSelectedRoom = fLayout.rooms.some(r => r.room.id === selectedRoomId);
        const isFloorActive = isFloorSelected || containsSelectedRoom;

        return (
          <FloorMesh
            key={fLayout.floor.id}
            layout={fLayout}
            isSelected={isFloorSelected}
            isFloorActive={isFloorActive}
            selectedRoomId={selectedRoomId}
            onSelectFloor={onSelectFloor}
            onSelectRoom={onSelectRoom}
          />
        );
      })}
    </group>
  );
};
