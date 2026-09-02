import Groq from 'groq-sdk';
import { validateArchitecture } from '../utils/validation.js';

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = 'MISSING_API_KEY';
  }
}

const architectureSchema = {
  type: "object",
  properties: {
    version: { type: "string" },
    projectName: { type: "string" },
    summary: { type: "string" },
    description: { type: "string" },
    districts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          type: { type: "string" },
          buildings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                type: { type: "string" },
                description: { type: "string" },
                complexity: { type: "integer" },
                technologies: {
                  type: "array",
                  items: { type: "string" }
                },
                responsibilities: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["id", "name", "type", "description", "complexity", "technologies", "responsibilities"],
              additionalProperties: false
            }
          }
        },
        required: ["id", "name", "description", "type", "buildings"],
        additionalProperties: false
      }
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          source: { type: "string" },
          target: { type: "string" },
          type: { type: "string" },
          description: { type: "string" }
        },
        required: ["id", "source", "target", "type", "description"],
        additionalProperties: false
      }
    }
  },
  required: ["version", "projectName", "summary", "description", "districts", "relationships"],
  additionalProperties: false
};


const SYSTEM_INSTRUCTION = `You are an expert software architect AI powering NextBit, a 3D interactive software architecture visualization engine.

Your sole job is to design a realistic, high-quality, domain-specific software architecture model for the user's project prompt.

Visualizer Engine Mapping Rules:

1. Output MUST strictly conform to the specified JSON schema.
   Do NOT wrap output in markdown, code blocks, or include extra commentary outside the JSON response.

2. Structure the application into logical districts (major architectural areas).
   District types MUST be selected from:
   'frontend',
   'backend',
   'database',
   'infrastructure',
   'analytics',
   'third_party'.

3. For each district, generate relevant component buildings (services/modules).
   Building types MUST be selected from:
   'ui_component',
   'api_gateway',
   'microservice',
   'database_node',
   'cache_layer',
   'queue_worker',
   'auth_service'.

4. Building complexity MUST be an integer from 1 to 5 representing structural depth and height.
   1 = light component.
   5 = heavy core service.

5. All IDs (districts, buildings, relationships) MUST be unique strings within the document.
   Examples:
   'dist-client',
   'comp-api-gw',
   'rel-1'.

6. Provide logical relationships connecting buildings.
   Relationships use:
   source building ID -> target building ID.

   Relationship types MUST be selected from:
   'calls_api',
   'reads_writes',
   'subscribes_to',
   'authenticates_with',
   'depends_on'.

   Ensure source and target refer to valid building IDs.

7. Include realistic technology stacks and responsibilities for every building.
   Do not return empty arrays.

   Examples:
   ['React', 'TypeScript']
   ['PostgreSQL']
   ['Redis']

8. Make the architecture realistic and custom-tailored to the specific domain requested by the prompt.
`;

/**
 * Generates software architecture JSON using Groq API
 * and validates the output.
 *
 * @param {string} prompt User project description
 * @returns {Promise<object>} Validated Architecture JSON
 */
export async function generateArchitecture(prompt) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new ConfigurationError(
      'GROQ_API_KEY is not configured in backend environment.'
    );
  }

  const groq = new Groq({
    apiKey: apiKey.trim()
  });

  let response;

  try {
    response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_INSTRUCTION
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'openai/gpt-oss-20b',
      max_completion_tokens: 4096,
      reasoning_effort: 'low',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'architecture',
          schema: architectureSchema,
          strict: true
        }
      }
    });
  } catch (err) {
    throw new Error(`Groq API request failed: ${err.message}`);
  }

  const textOutput = response.choices[0]?.message?.content;

  if (!textOutput) {
    throw new Error('Groq API returned an empty response.');
  }

  let rawJson;

  try {
    rawJson = JSON.parse(textOutput);
  } catch (parseErr) {
    throw new Error(
      `Failed to parse Groq response as JSON: ${parseErr.message}`
    );
  }

  // Validate and normalize Groq response before returning.
  const validated = validateArchitecture(rawJson);

  return validated;
}