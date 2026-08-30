// 1. Architecture JSON Schema Data Contract (Semantic Layer)

export type DistrictType = 'frontend' | 'backend' | 'database' | 'infrastructure' | 'analytics' | 'third_party' | string;

export type BuildingType = 
  | 'ui_component' 
  | 'api_gateway' 
  | 'microservice' 
  | 'database_node' 
  | 'cache_layer' 
  | 'queue_worker' 
  | 'auth_service' 
  | string;

export type RelationshipType = 
  | 'calls_api' 
  | 'reads_writes' 
  | 'subscribes_to' 
  | 'authenticates_with' 
  | 'depends_on' 
  | string;

export interface FileItem {
  id: string;
  path: string;
  language?: string;
}

export interface Room {
  id: string;
  name: string;
  files?: FileItem[];
}

export interface Floor {
  id: string;
  name: string;
  description?: string;
  rooms?: Room[];
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  description?: string;
  complexity: number; // 1 - 5
  technologies: string[];
  responsibilities: string[];
  floors?: Floor[];
}

export interface District {
  id: string;
  name: string;
  description?: string;
  type: DistrictType;
  buildings: Building[];
}

export interface Relationship {
  id: string;
  source: string; // building id
  target: string; // building id
  type: RelationshipType;
  description?: string;
}

export interface ArchitectureJSON {
  version: string;
  projectName: string;
  description: string;
  districts: District[];
  relationships: Relationship[];
}

// 2. Visual Layout Data Contract (Calculated by Layout Engine)

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BuildingLayout {
  building: Building;
  districtId: string;
  position: Vector3D; // Base center position (x, y, z)
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  geometryShape: 'box' | 'cylinder' | 'prism' | 'pyramid';
  color: string;
  accentColor: string;
}

export interface DistrictLayout {
  district: District;
  position: Vector3D; // Ground tile center (x, 0, z)
  dimensions: {
    width: number;
    depth: number;
  };
  color: string;
  buildings: BuildingLayout[];
}

export interface RelationshipLayout {
  relationship: Relationship;
  sourcePosition: Vector3D; // Top/center point of source building
  targetPosition: Vector3D; // Top/center point of target building
  color: string;
}

export interface ComputedLayout {
  districts: DistrictLayout[];
  buildingsMap: Map<string, BuildingLayout>;
  relationships: RelationshipLayout[];
  sceneBounds: {
    width: number;
    depth: number;
  };
}
