import { 
  ArchitectureJSON, 
  ComputedLayout, 
  DistrictLayout, 
  BuildingLayout, 
  RelationshipLayout, 
  BuildingType, 
  DistrictType,
  RelationshipType
} from '../types/architecture';

// Map district type to ground tile base color
const DISTRICT_COLORS: Record<string, { bg: string; border: string }> = {
  frontend: { bg: '#0A2540', border: '#00F0FF' },
  backend: { bg: '#1E1B4B', border: '#818CF8' },
  database: { bg: '#2E1065', border: '#C084FC' },
  infrastructure: { bg: '#14532D', border: '#4ADE80' },
  analytics: { bg: '#701A75', border: '#F472B6' },
  default: { bg: '#1E293B', border: '#94A3B8' }
};

// Map building type to mesh geometry shape & color tokens
const BUILDING_STYLES: Record<string, { shape: 'box' | 'cylinder' | 'prism' | 'pyramid'; color: string; accent: string }> = {
  ui_component: { shape: 'box', color: '#0284C7', accent: '#38BDF8' },
  api_gateway: { shape: 'prism', color: '#6D28D9', accent: '#A855F7' },
  microservice: { shape: 'box', color: '#4F46E5', accent: '#818CF8' },
  auth_service: { shape: 'pyramid', color: '#BE123C', accent: '#FB7185' },
  database_node: { shape: 'cylinder', color: '#B45309', accent: '#FBBF24' },
  cache_layer: { shape: 'cylinder', color: '#15803D', accent: '#4ADE80' },
  queue_worker: { shape: 'box', color: '#0F766E', accent: '#2DD4BF' },
  default: { shape: 'box', color: '#475569', accent: '#94A3B8' }
};

// Map relationship type to visual line color
const RELATIONSHIP_COLORS: Record<string, string> = {
  calls_api: '#38BDF8',       // Light cyan
  reads_writes: '#FBBF24',    // Gold
  subscribes_to: '#4ADE80',   // Green
  authenticates_with: '#FB7185', // Coral/Pink
  depends_on: '#A855F7',      // Purple
  default: '#94A3B8'
};

export function calculateLayout(architecture: ArchitectureJSON): ComputedLayout {
  const districtLayouts: DistrictLayout[] = [];
  const buildingsMap = new Map<string, BuildingLayout>();
  const relationshipLayouts: RelationshipLayout[] = [];

  const districtSpacingX = 14;
  const districtPadding = 2.5;
  const buildingFootprint = 2.2;
  const buildingGap = 1.2;

  // Calculate layout for each district
  architecture.districts.forEach((district, districtIdx) => {
    const dStyle = DISTRICT_COLORS[district.type] || DISTRICT_COLORS.default;
    const numBuildings = district.buildings.length;

    // Arrange buildings in a grid inside the district zone
    const cols = Math.ceil(Math.sqrt(numBuildings));
    const rows = Math.ceil(numBuildings / cols) || 1;

    const districtWidth = Math.max(6, cols * buildingFootprint + (cols - 1) * buildingGap + districtPadding * 2);
    const districtDepth = Math.max(6, rows * buildingFootprint + (rows - 1) * buildingGap + districtPadding * 2);

    // Center position of district on the main ground grid (X-axis layout)
    const districtX = (districtIdx - (architecture.districts.length - 1) / 2) * districtSpacingX;
    const districtZ = 0;

    const buildingLayouts: BuildingLayout[] = [];

    district.buildings.forEach((building, bIdx) => {
      const col = bIdx % cols;
      const row = Math.floor(bIdx / cols);

      // Local offset inside district tile
      const localX = (col - (cols - 1) / 2) * (buildingFootprint + buildingGap);
      const localZ = (row - (rows - 1) / 2) * (buildingFootprint + buildingGap);

      // Height derived deterministically from complexity score (1 to 5)
      const buildingHeight = Math.max(1, building.complexity) * 1.4 + 0.6;
      const buildingWidth = buildingFootprint;
      const buildingDepth = buildingFootprint;

      const style = BUILDING_STYLES[building.type] || BUILDING_STYLES.default;

      // Absolute 3D position (Y = height / 2 so mesh sits on top of ground)
      const worldPosition = {
        x: districtX + localX,
        y: buildingHeight / 2 + 0.1, // Slight offset above district floor tile
        z: districtZ + localZ
      };

      const bLayout: BuildingLayout = {
        building,
        districtId: district.id,
        position: worldPosition,
        dimensions: {
          width: buildingWidth,
          height: buildingHeight,
          depth: buildingDepth
        },
        geometryShape: style.shape,
        color: style.color,
        accentColor: style.accent
      };

      buildingLayouts.push(bLayout);
      buildingsMap.set(building.id, bLayout);
    });

    districtLayouts.push({
      district,
      position: { x: districtX, y: 0.05, z: districtZ },
      dimensions: { width: districtWidth, depth: districtDepth },
      color: dStyle.bg,
      buildings: buildingLayouts
    });
  });

  // Calculate connection vectors for relationships
  architecture.relationships.forEach((rel) => {
    const sourceB = buildingsMap.get(rel.source);
    const targetB = buildingsMap.get(rel.target);

    if (sourceB && targetB) {
      // Connect top-center of source building to top-center of target building
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
      depth: 20
    }
  };
}
