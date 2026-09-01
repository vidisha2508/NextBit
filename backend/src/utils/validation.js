export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}

/**
 * Validates and normalizes the generated architecture object from Gemini.
 * @param {any} data 
 * @returns {object} Validated and normalized architecture object
 */
export function validateArchitecture(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Architecture payload must be a valid JSON object.');
  }

  // Top-level fields
  if (!data.projectName || typeof data.projectName !== 'string' || data.projectName.trim() === '') {
    throw new ValidationError('Top-level "projectName" is required and must be a non-empty string.');
  }

  const summary = data.summary || data.description;
  const description = data.description || data.summary;

  if (!summary || typeof summary !== 'string' || summary.trim() === '') {
    throw new ValidationError('Top-level "summary" or "description" is required and must be a non-empty string.');
  }

  if (!Array.isArray(data.districts) || data.districts.length === 0) {
    throw new ValidationError('Top-level "districts" must be a non-empty array.');
  }

  const seenIds = new Set();
  const buildingIds = new Set();

  const validatedDistricts = data.districts.map((district, dIndex) => {
    if (!district || typeof district !== 'object') {
      throw new ValidationError(`District at index ${dIndex} is invalid.`);
    }

    if (!district.id || typeof district.id !== 'string' || district.id.trim() === '') {
      throw new ValidationError(`District at index ${dIndex} missing required string "id".`);
    }

    if (seenIds.has(district.id)) {
      throw new ValidationError(`Duplicate ID found: "${district.id}". All IDs must be unique.`);
    }
    seenIds.add(district.id);

    if (!district.name || typeof district.name !== 'string' || district.name.trim() === '') {
      throw new ValidationError(`District "${district.id}" missing required string "name".`);
    }

    if (!Array.isArray(district.buildings)) {
      throw new ValidationError(`District "${district.id}" ("${district.name}") must contain a "buildings" array.`);
    }

    const validatedBuildings = district.buildings.map((building, bIndex) => {
      if (!building || typeof building !== 'object') {
        throw new ValidationError(`Building at index ${bIndex} in district "${district.id}" is invalid.`);
      }

      if (!building.id || typeof building.id !== 'string' || building.id.trim() === '') {
        throw new ValidationError(`Building at index ${bIndex} in district "${district.id}" missing required string "id".`);
      }

      if (seenIds.has(building.id)) {
        throw new ValidationError(`Duplicate ID found: "${building.id}". All IDs must be unique.`);
      }
      seenIds.add(building.id);
      buildingIds.add(building.id);

      if (!building.name || typeof building.name !== 'string' || building.name.trim() === '') {
        throw new ValidationError(`Building "${building.id}" missing required string "name".`);
      }

      if (!building.type || typeof building.type !== 'string' || building.type.trim() === '') {
        throw new ValidationError(`Building "${building.id}" missing required string "type".`);
      }

      let complexity = building.complexity;
      if (typeof complexity !== 'number' || isNaN(complexity)) {
        throw new ValidationError(`Building "${building.id}" ("${building.name}") complexity must be a valid integer.`);
      }
      complexity = Math.round(complexity);
      if (complexity < 1) complexity = 1;
      if (complexity > 5) complexity = 5;

      const technologies = Array.isArray(building.technologies)
        ? building.technologies.filter(t => typeof t === 'string' && t.trim() !== '')
        : [];

      const responsibilities = Array.isArray(building.responsibilities)
        ? building.responsibilities.filter(r => typeof r === 'string' && r.trim() !== '')
        : [];

      return {
        id: building.id.trim(),
        name: building.name.trim(),
        type: building.type.trim(),
        description: typeof building.description === 'string' ? building.description.trim() : '',
        complexity,
        technologies,
        responsibilities,
        ...(Array.isArray(building.floors) ? { floors: building.floors } : {})
      };
    });

    return {
      id: district.id.trim(),
      name: district.name.trim(),
      description: typeof district.description === 'string' ? district.description.trim() : '',
      type: typeof district.type === 'string' && district.type.trim() ? district.type.trim() : 'backend',
      buildings: validatedBuildings
    };
  });

  // Filter and validate relationships if present
  let validatedRelationships = [];
  if (Array.isArray(data.relationships)) {
    validatedRelationships = data.relationships
      .filter(rel => rel && typeof rel === 'object' && rel.id && rel.source && rel.target)
      .filter(rel => buildingIds.has(rel.source) && buildingIds.has(rel.target))
      .map((rel, rIndex) => {
        const relId = rel.id.trim();
        if (seenIds.has(relId)) {
          // If relationship ID duplicates building/district ID, generate unique rel ID
          return {
            id: `rel-${rIndex + 1}-${relId}`,
            source: rel.source.trim(),
            target: rel.target.trim(),
            type: typeof rel.type === 'string' ? rel.type.trim() : 'calls_api',
            description: typeof rel.description === 'string' ? rel.description.trim() : ''
          };
        }
        seenIds.add(relId);
        return {
          id: relId,
          source: rel.source.trim(),
          target: rel.target.trim(),
          type: typeof rel.type === 'string' ? rel.type.trim() : 'calls_api',
          description: typeof rel.description === 'string' ? rel.description.trim() : ''
        };
      });
  }

  return {
    version: typeof data.version === 'string' ? data.version.trim() : '1.0.0',
    projectName: data.projectName.trim(),
    summary: summary.trim(),
    description: description.trim(),
    districts: validatedDistricts,
    relationships: validatedRelationships
  };
}
