import { ArchitectureJSON, Building, Floor, Room } from '../types/architecture';

/**
 * Deterministically constructs logical floors and rooms for a building if explicit floors are missing.
 * Derives structure from building type, name, description, technologies, responsibilities, and complexity.
 */
export function deriveFloorsAndRooms(building: Building): Floor[] {
  // If floors already exist and contain rooms, normalize and return them
  if (Array.isArray(building.floors) && building.floors.length > 0) {
    return building.floors.map((floor, fIdx) => ({
      id: floor.id || `floor-${building.id}-${fIdx + 1}`,
      name: floor.name || `Floor ${fIdx + 1}: Module Layer`,
      description: floor.description || `Module responsibilities for ${building.name}`,
      rooms: Array.isArray(floor.rooms) && floor.rooms.length > 0
        ? floor.rooms.map((room, rIdx) => ({
            id: room.id || `room-${building.id}-${fIdx + 1}-${rIdx + 1}`,
            name: room.name || `module_${rIdx + 1}.ts`,
            description: room.description || `Component logic for ${building.name}`,
            responsibility: room.responsibility || building.responsibilities[rIdx % (building.responsibilities.length || 1)] || 'Execute component task',
            technology: room.technology || building.technologies[rIdx % (building.technologies.length || 1)] || 'TypeScript',
            language: room.language || getLanguageFromTech(room.technology || building.technologies[0])
          }))
        : generateRoomsForFloor(building, fIdx + 1, `Floor ${fIdx + 1}: Module Component`)
    }));
  }

  const numFloors = Math.max(2, Math.min(5, Math.round(building.complexity || 3)));
  const typeKey = (building.type || '').toLowerCase();
  const techList = building.technologies || [];
  const respList = building.responsibilities || [];

  const floorTemplates = getFloorTemplatesForType(typeKey, building.name, techList, respList, numFloors);

  return floorTemplates.map((template, fIdx) => {
    const floorId = `floor-${building.id}-${fIdx + 1}`;
    return {
      id: floorId,
      name: template.name,
      description: template.description,
      rooms: template.rooms.map((r, rIdx) => ({
        id: `room-${building.id}-${fIdx + 1}-${rIdx + 1}`,
        name: r.name,
        description: r.description,
        responsibility: r.responsibility,
        technology: r.technology,
        language: getLanguageFromTech(r.technology)
      }))
    };
  });
}

function getLanguageFromTech(tech?: string): string {
  if (!tech) return 'typescript';
  const t = tech.toLowerCase();
  if (t.includes('react') || t.includes('next') || t.includes('typescript') || t.includes('ts')) return 'typescript';
  if (t.includes('javascript') || t.includes('js') || t.includes('node') || t.includes('express')) return 'javascript';
  if (t.includes('python') || t.includes('fastapi') || t.includes('flask') || t.includes('pytorch')) return 'python';
  if (t.includes('go') || t.includes('golang')) return 'go';
  if (t.includes('java') || t.includes('spring')) return 'java';
  if (t.includes('postgres') || t.includes('sql') || t.includes('mongo') || t.includes('redis')) return 'sql';
  if (t.includes('flutter') || t.includes('dart')) return 'dart';
  return 'typescript';
}

function generateRoomsForFloor(building: Building, floorNum: number, floorName: string): Room[] {
  const primaryTech = building.technologies[0] || 'TypeScript';
  return [
    {
      id: `room-${building.id}-${floorNum}-1`,
      name: `${sanitizeFilename(floorName)}_handler.${getFileExt(primaryTech)}`,
      description: `Handles request dispatching and core execution for ${building.name}.`,
      responsibility: building.responsibilities[0] || `Main execution handler for ${floorName}`,
      technology: primaryTech,
      language: getLanguageFromTech(primaryTech)
    },
    {
      id: `room-${building.id}-${floorNum}-2`,
      name: `${sanitizeFilename(floorName)}_config.${getFileExt(primaryTech)}`,
      description: `Configuration parameters and validation rules for ${floorName}.`,
      responsibility: building.responsibilities[1] || `Configuration management for ${floorName}`,
      technology: building.technologies[1] || primaryTech,
      language: getLanguageFromTech(building.technologies[1] || primaryTech)
    }
  ];
}

function sanitizeFilename(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 20);
}

function getFileExt(tech?: string): string {
  const lang = getLanguageFromTech(tech);
  switch (lang) {
    case 'typescript': return 'ts';
    case 'javascript': return 'js';
    case 'python': return 'py';
    case 'go': return 'go';
    case 'java': return 'java';
    case 'sql': return 'sql';
    case 'dart': return 'dart';
    default: return 'ts';
  }
}

interface FloorTemplate {
  name: string;
  description: string;
  rooms: { name: string; description: string; responsibility: string; technology: string }[];
}

function getFloorTemplatesForType(
  type: string,
  buildingName: string,
  techs: string[],
  resps: string[],
  count: number
): FloorTemplate[] {
  const t0 = techs[0] || 'React / TypeScript';
  const t1 = techs[1] || techs[0] || 'Node.js';
  const t2 = techs[2] || techs[0] || 'REST API';

  const r0 = resps[0] || `Core processing for ${buildingName}`;
  const r1 = resps[1] || `Validation and state management for ${buildingName}`;
  const r2 = resps[2] || `Data persistence and network transport`;

  if (type.includes('ui') || type.includes('frontend')) {
    return [
      {
        name: 'Floor 1: View Rendering & UI Components',
        description: 'User interface templates, layout structures, and visual components.',
        rooms: [
          { name: 'MainView.tsx', description: 'Primary component tree and grid renderer.', responsibility: r0, technology: t0 },
          { name: 'HeaderBar.tsx', description: 'Navigation controls, breadcrumbs, and active user banner.', responsibility: 'Render header navigation', technology: t0 },
          { name: 'CardGrid.tsx', description: 'Reusable card component grid layout.', responsibility: 'Display item cards', technology: t0 }
        ]
      },
      {
        name: 'Floor 2: Client State & Hooks',
        description: 'Application state store, reactivity models, and local caching.',
        rooms: [
          { name: 'useAppStore.ts', description: 'Global state manager for application UI.', responsibility: r1, technology: 'Zustand / Redux' },
          { name: 'useAuthSession.ts', description: 'Tracks user authentication token and profile state.', responsibility: 'Session persistence', technology: 'TypeScript' }
        ]
      },
      {
        name: 'Floor 3: Network & API Transport',
        description: 'HTTP client adapters, API endpoint wrappers, and WebSocket listeners.',
        rooms: [
          { name: 'apiClient.ts', description: 'Configured HTTP client for backend REST API requests.', responsibility: r2, technology: t1 },
          { name: 'socketStream.ts', description: 'Real-time WebSocket event connection adapter.', responsibility: 'Subscribe to real-time events', technology: 'WebSockets' }
        ]
      }
    ].slice(0, count);
  }

  if (type.includes('gateway')) {
    return [
      {
        name: 'Floor 1: Routing & Request Proxying',
        description: 'URL pattern matching and upstream service proxies.',
        rooms: [
          { name: 'router.ts', description: 'Routes incoming HTTP requests to internal microservices.', responsibility: r0, technology: t0 },
          { name: 'proxyAdapter.ts', description: 'Header mutation and payload proxy forwarding.', responsibility: 'Upstream HTTP proxying', technology: t1 }
        ]
      },
      {
        name: 'Floor 2: Authentication & Security Guard',
        description: 'Edge security validation, token inspection, and CORS.',
        rooms: [
          { name: 'authGuard.ts', description: 'Validates JWT access tokens before routing.', responsibility: r1, technology: 'JWT' },
          { name: 'corsHandler.ts', description: 'Cross-Origin Resource Sharing policy guard.', responsibility: 'Enforce CORS security policy', technology: t1 }
        ]
      },
      {
        name: 'Floor 3: Rate Limiting & Throttling',
        description: 'Traffic shaping, request quotas, and circuit breaker fallbacks.',
        rooms: [
          { name: 'rateLimiter.ts', description: 'Token bucket algorithm for IP request throttling.', responsibility: r2, technology: 'Redis' },
          { name: 'circuitBreaker.ts', description: 'Graceful degradation fallback when downstream services fail.', responsibility: 'Service fault tolerance', technology: t1 }
        ]
      },
      {
        name: 'Floor 4: Telemetry & Access Logging',
        description: 'Structured request logs, latency metrics, and trace tracing.',
        rooms: [
          { name: 'accessLogger.ts', description: 'Structured JSON access log stream writer.', responsibility: 'Log HTTP access metrics', technology: t1 },
          { name: 'traceExporter.ts', description: 'OpenTelemetry distributed trace propagator.', responsibility: 'Export request trace IDs', technology: 'OpenTelemetry' }
        ]
      }
    ].slice(0, count);
  }

  if (type.includes('db') || type.includes('database')) {
    return [
      {
        name: 'Floor 1: Schema & Data Definitions',
        description: 'Relational table DDL, indices, and domain entities.',
        rooms: [
          { name: 'schemaMigrations.sql', description: 'DDL migrations for tables, constraints, and foreign keys.', responsibility: r0, technology: t0 },
          { name: 'entityModel.ts', description: 'TypeScript ORM schema mapping definitions.', responsibility: 'Object-Relational mapping', technology: t1 }
        ]
      },
      {
        name: 'Floor 2: Query Execution & Indexing',
        description: 'Performance query index configurations and connection pooling.',
        rooms: [
          { name: 'spatialIndexes.sql', description: 'B-Tree and GIST spatial indices for fast query lookups.', responsibility: r1, technology: t0 },
          { name: 'connectionPool.ts', description: 'PgBouncer connection pool manager.', responsibility: r2, technology: 'PgBouncer' }
        ]
      }
    ].slice(0, count);
  }

  if (type.includes('cache')) {
    return [
      {
        name: 'Floor 1: Key Strategy & Invalidation',
        description: 'Cache key formatting and TTL expiration policies.',
        rooms: [
          { name: 'keyGenerator.ts', description: 'Formats deterministic cache keys based on entity IDs.', responsibility: r0, technology: t0 },
          { name: 'ttlPolicy.json', description: 'Time-to-live expiration rules for cached objects.', responsibility: r1, technology: 'Redis' }
        ]
      },
      {
        name: 'Floor 2: Store Connection & Cluster Pool',
        description: 'Redis cluster connections and failover commands.',
        rooms: [
          { name: 'redisClient.ts', description: 'High-speed in-memory store client adapter.', responsibility: r2, technology: t0 }
        ]
      }
    ].slice(0, count);
  }

  if (type.includes('queue') || type.includes('worker')) {
    return [
      {
        name: 'Floor 1: Event Ingestion & Message Broker',
        description: 'Asynchronous event consumer listeners and deserialization.',
        rooms: [
          { name: 'eventConsumer.ts', description: 'Listens to message broker queue topics.', responsibility: r0, technology: t0 },
          { name: 'messagePublisher.ts', description: 'Publishes completed job events to event bus.', responsibility: r1, technology: t1 }
        ]
      },
      {
        name: 'Floor 2: Asynchronous Job Processor',
        description: 'Background task pipeline and dead-letter retries.',
        rooms: [
          { name: 'jobPipeline.ts', description: 'Executes CPU-intensive background tasks.', responsibility: r2, technology: t0 },
          { name: 'deadLetterRetry.ts', description: 'Handles failed job retries with exponential backoff.', responsibility: 'Task failure recovery', technology: t1 }
        ]
      }
    ].slice(0, count);
  }

  if (type.includes('auth')) {
    return [
      {
        name: 'Floor 1: Identity & Credential Vault',
        description: 'Secure password hashing and identity record repositories.',
        rooms: [
          { name: 'passwordHasher.ts', description: 'Bcrypt salt generation and password verification.', responsibility: r0, technology: 'Bcrypt' },
          { name: 'userRepository.ts', description: 'Retrieves user credentials from database store.', responsibility: r1, technology: t0 }
        ]
      },
      {
        name: 'Floor 2: Token Signing & OAuth Provider',
        description: 'JWT token issuance, refresh token rotation, and RBAC authorization.',
        rooms: [
          { name: 'jwtSigner.ts', description: 'Issues and verifies asymmetric RS256 JWT tokens.', responsibility: r2, technology: 'JWT' },
          { name: 'rbacGuard.ts', description: 'Evaluates user role permissions against route policies.', responsibility: 'Enforce RBAC authorization', technology: t0 }
        ]
      }
    ].slice(0, count);
  }

  // Default Microservice / General Backend Service template
  return [
    {
      name: 'Floor 1: API Controllers & Handlers',
      description: 'REST/gRPC endpoint controllers and request payload validation.',
      rooms: [
        { name: 'controller.ts', description: `REST endpoint route handlers for ${buildingName}.`, responsibility: r0, technology: t0 },
        { name: 'validator.ts', description: 'Validates incoming JSON payload schemas.', responsibility: 'Request validation', technology: t1 }
      ]
    },
    {
      name: 'Floor 2: Core Domain Logic & Workflows',
      description: 'Business rules calculation, domain models, and orchestrators.',
      rooms: [
        { name: 'domainService.ts', description: `Core business logic processor for ${buildingName}.`, responsibility: r1, technology: t0 },
        { name: 'workflowEngine.ts', description: 'Orchestrates multi-step transactional operations.', responsibility: 'Transaction orchestration', technology: t1 }
      ]
    },
    {
      name: 'Floor 3: Data Access & Repositories',
      description: 'Database query abstraction layer and cache interaction.',
      rooms: [
        { name: 'repository.ts', description: `Persists domain state to relational storage for ${buildingName}.`, responsibility: r2, technology: techs[1] || 'PostgreSQL' },
        { name: 'cacheAdapter.ts', description: 'Caches frequent domain query results in memory.', responsibility: 'Query result caching', technology: 'Redis' }
      ]
    }
  ].slice(0, count);
}

/**
 * Ensures the entire ArchitectureJSON payload has hydrated floors & rooms on all buildings.
 */
export function hydrateArchitectureHierarchy(architecture: ArchitectureJSON): ArchitectureJSON {
  if (!architecture || !Array.isArray(architecture.districts)) return architecture;

  const hydratedDistricts = architecture.districts.map((district) => ({
    ...district,
    buildings: (district.buildings || []).map((building) => ({
      ...building,
      floors: deriveFloorsAndRooms(building)
    }))
  }));

  return {
    ...architecture,
    districts: hydratedDistricts
  };
}
