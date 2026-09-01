import { GoogleGenAI, Type } from '@google/genai';
import { validateArchitecture } from '../utils/validation.js';

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = 'MISSING_API_KEY';
  }
}

// Define the response schema using @google/genai Type schema
const architectureResponseSchema = {
  type: Type.OBJECT,
  properties: {
    version: { type: Type.STRING },
    projectName: { type: Type.STRING },
    summary: { type: Type.STRING },
    description: { type: Type.STRING },
    districts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING },
          buildings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                complexity: { type: Type.INTEGER },
                technologies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                responsibilities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['id', 'name', 'type', 'description', 'complexity', 'technologies', 'responsibilities']
            }
          }
        },
        required: ['id', 'name', 'description', 'type', 'buildings']
      }
    },
    relationships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          type: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['id', 'source', 'target', 'type']
      }
    }
  },
  required: ['projectName', 'summary', 'description', 'districts']
};

const SYSTEM_INSTRUCTION = `You are an expert software architect AI powering NextBit, a 3D interactive software architecture visualization engine.
Your sole job is to design a realistic, high-quality, domain-specific software architecture model for the user's project prompt.

Visualizer Engine Mapping Rules:
1. Output MUST strictly conform to the specified JSON schema. Do NOT wrap output in markdown, code blocks, or include extra commentary outside the JSON response.
2. Structure the application into logical districts (major architectural areas).
   District types MUST be selected from: 'frontend', 'backend', 'database', 'infrastructure', 'analytics', 'third_party'.
3. For each district, generate relevant component buildings (services/modules).
   Building types MUST be selected from: 'ui_component', 'api_gateway', 'microservice', 'database_node', 'cache_layer', 'queue_worker', 'auth_service'.
4. Building complexity MUST be an integer from 1 to 5 representing structural depth and height (1=light component, 5=heavy core service).
5. All IDs (districts, buildings, relationships) MUST be unique strings within the document (e.g. 'dist-client', 'comp-api-gw', 'rel-1').
6. Provide logical relationships connecting buildings (source building ID -> target building ID). Relationship types MUST be selected from: 'calls_api', 'reads_writes', 'subscribes_to', 'authenticates_with', 'depends_on'. Ensure source and target refer to valid building IDs.
7. Include realistic technology stacks (e.g. ['React', 'TypeScript'], ['PostgreSQL'], ['Redis']) and responsibilities for every building. Do not return empty arrays.
8. Make the architecture realistic and custom tailored to the specific domain requested by the prompt.
`;

/**
 * Generates software architecture JSON using Gemini API and validates the output.
 * @param {string} prompt User project description
 * @returns {Promise<object>} Validated Architecture JSON
 */
export async function generateArchitecture(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new ConfigurationError('GEMINI_API_KEY is not configured in backend environment.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: architectureResponseSchema,
      }
    });
  } catch (err) {
    throw new Error(`Gemini API request failed: ${err.message}`);
  }

  if (!response || !response.text) {
    throw new Error('Gemini API returned an empty response.');
  }

  let rawJson;
  try {
    rawJson = JSON.parse(response.text);
  } catch (parseErr) {
    throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
  }

  // Validate and normalize Gemini response before returning
  const validated = validateArchitecture(rawJson);
  return validated;
}
