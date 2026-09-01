import { 
  ArchitectureJSON, 
  ComputedLayout, 
  DistrictLayout, 
  BuildingLayout, 
  FloorLayout,
  RoomLayout,
  RelationshipLayout, 
} from '../types/architecture';
import { deriveFloorsAndRooms } from './hierarchyTransformer';

// Sunny Garden City district tile colors
export const DISTRICT_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  frontend: { bg: '#86EFAC', border: '#0284C7', label: 'Frontend Client Zone' },
  backend: { bg: '#86EFAC', border: '#7C3AED', label: 'Backend Microservices' },
  database: { bg: '#86EFAC', border: '#D97706', label: 'Data & Media Storage' },
  infrastructure: { bg: '#86EFAC', border: '#0D9488', label: 'Platform Infrastructure' },
  analytics: { bg: '#86EFAC', border: '#DB2777', label: 'Analytics & Pipeline' },
  default: { bg: '#86EFAC', border: '#475569', label: 'System District' }
};

// Map building type to voxel mesh style & sunny colors
export const BUILDING_STYLES: Record<string, { shape: 'box' | 'cylinder' | 'prism' | 'pyramid'; color: string; accent: string }> = {
  ui_component: { shape: 'box', color: '#0284C7', accent: '#38BDF8' },
  api_gateway: { shape: 'prism', color: '#7C3AED', accent: '#A78BFA' },
  microservice: { shape: 'box', color: '#4338CA', accent: '#818CF8' },
  auth_service: { shape: 'pyramid', color: '#E11D48', accent: '#FB7185' },
  database_node: { shape: 'cylinder', color: '#D97706', accent: '#FBBF24' },
  cache_layer: { shape: 'cylinder', color: '#15803D', accent: '#4ADE80' },
  queue_worker: { shape: 'box', color: '#0D9488', accent: '#2DD4BF' },
  default: { shape: 'box', color: '#475569', accent: '#94A3B8' }
};

// Warm relationship line colors for sunny theme
export const RELATIONSHIP_COLORS: Record<string, string> = {
  calls_api: '#0284C7',       // Sky blue
  reads_writes: '#D97706',    // Warm amber
  subscribes_to: '#16A34A',   // Fresh green
  authenticates_with: '#E11D48', // Crimson/Pink
  depends_on: '#7C3AED',      // Purple
  default: '#64748B'
};

export function calculateLayout(architecture: ArchitectureJSON): ComputedLayout {
  const districtLayouts: DistrictLayout[] = [];
  const buildingsMap = new Map<string, BuildingLayout>();
  const relationshipLayouts: RelationshipLayout[] = [];

  const districtSpacingX = 16;
  const districtPadding = 3.0;
  const buildingFootprint = 2.8;
  const buildingGap = 1.6;

  // Calculate layout for each district
  architecture.districts.forEach((district, districtIdx) => {
    const dStyle = DISTRICT_COLORS[district.type] || DISTRICT_COLORS.default;
    const numBuildings = district.buildings.length;

    // Arrange buildings in a grid inside the district zone
    const cols = Math.ceil(Math.sqrt(numBuildings)) || 1;
    const rows = Math.ceil(numBuildings / cols) || 1;

    const districtWidth = Math.max(8, cols * buildingFootprint + (cols - 1) * buildingGap + districtPadding * 2);
    const districtDepth = Math.max(8, rows * buildingFootprint + (rows - 1) * buildingGap + districtPadding * 2);

    // Center position of district on the main ground grid (X-axis layout)
    const districtX = (districtIdx - (architecture.districts.length - 1) / 2) * districtSpacingX;
    const districtZ = 0;

    const buildingLayouts: BuildingLayout[] = [];

    district.buildings.forEach((building, bIdx) => {
      // Ensure building has derived floors
      const floors = deriveFloorsAndRooms(building);
      const buildingWithFloors = { ...building, floors };

      const col = bIdx % cols;
      const row = Math.floor(bIdx / cols);

      // Local offset inside district tile
      const localX = (col - (cols - 1) / 2) * (buildingFootprint + buildingGap);
      const localZ = (row - (rows - 1) / 2) * (buildingFootprint + buildingGap);

      // Height derived deterministically from complexity score (1 to 5)
      const numFloorsCount = floors.length;
      const buildingHeight = Math.max(2.2, numFloorsCount * 1.5 + 0.8);
      const buildingWidth = buildingFootprint;
      const buildingDepth = buildingFootprint;

      const style = BUILDING_STYLES[building.type] || BUILDING_STYLES.default;

      // Absolute 3D position (Y = height / 2 so mesh sits on top of ground)
      const worldPosition = {
        x: districtX + localX,
        y: buildingHeight / 2 + 0.15,
        z: districtZ + localZ
      };

      // Calculate floor layouts inside building
      const floorLayouts: FloorLayout[] = floors.map((floor, fIdx) => {
        const floorHeight = 0.5;
        const floorSpacing = (buildingHeight - 0.4) / Math.max(1, numFloorsCount);
        const floorY = worldPosition.y - buildingHeight / 2 + 0.4 + fIdx * floorSpacing;

        // Calculate room layouts on this floor
        const numRooms = floor.rooms.length;
        const roomCols = Math.ceil(Math.sqrt(numRooms)) || 1;
        const roomSize = 0.7;
        const roomGap = 0.25;

        const roomLayouts: RoomLayout[] = floor.rooms.map((room, rIdx) => {
          const rCol = rIdx % roomCols;
          const rRow = Math.floor(rIdx / roomCols);
          const rLocalX = (rCol - (roomCols - 1) / 2) * (roomSize + roomGap);
          const rLocalZ = (rRow - (Math.ceil(numRooms / roomCols) - 1) / 2) * (roomSize + roomGap);

          return {
            room,
            floorId: floor.id,
            buildingId: building.id,
            position: {
              x: worldPosition.x + rLocalX,
              y: floorY + floorHeight / 2 + 0.3,
              z: worldPosition.z + rLocalZ
            },
            dimensions: {
              width: roomSize,
              height: 0.5,
              depth: roomSize
            },
            color: style.accent
          };
        });

        return {
          floor,
          buildingId: building.id,
          floorNumber: fIdx + 1,
          position: {
            x: worldPosition.x,
            y: floorY,
            z: worldPosition.z
          },
          dimensions: {
            width: buildingWidth * 0.9,
            height: floorHeight,
            depth: buildingDepth * 0.9
          },
          rooms: roomLayouts
        };
      });

      const bLayout: BuildingLayout = {
        building: buildingWithFloors,
        districtId: district.id,
        position: worldPosition,
        dimensions: {
          width: buildingWidth,
          height: buildingHeight,
          depth: buildingDepth
        },
        geometryShape: style.shape,
        color: style.color,
        accentColor: style.accent,
        floors: floorLayouts
      };

      buildingLayouts.push(bLayout);
      buildingsMap.set(building.id, bLayout);
    });

    districtLayouts.push({
      district: { ...district, buildings: buildingLayouts.map(b => b.building) },
      position: { x: districtX, y: 0.08, z: districtZ },
      dimensions: { width: districtWidth, depth: districtDepth },
      color: dStyle.bg,
      buildings: buildingLayouts
    });
  });

  // Calculate connection vectors for relationships
  (architecture.relationships || []).forEach((rel) => {
    const sourceB = buildingsMap.get(rel.source);
    const targetB = buildingsMap.get(rel.target);

    if (sourceB && targetB) {
      const sourceTop = {
        x: sourceB.position.x,
        y: sourceB.position.y + sourceB.dimensions.height / 2,
        z: sourceB.position.z
      };

      const targetTop = {
        x: targetB.position.x,
        y: targetB.position.y + targetB.dimensions.height / 2,
        z: targetB.position.z
      };

      const relColor = RELATIONSHIP_COLORS[rel.type] || RELATIONSHIP_COLORS.default;

      relationshipLayouts.push({
        relationship: rel,
        sourcePosition: sourceTop,
        targetPosition: targetTop,
        color: relColor
      });
    }
  });

  return {
    districts: districtLayouts,
    buildingsMap,
    relationships: relationshipLayouts,
    sceneBounds: {
      width: architecture.districts.length * districtSpacingX,
      depth: 25
    }
  };
}
