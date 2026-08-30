import { ArchitectureJSON } from '../types/architecture';

export interface GenerateArchitectureResponse {
  architecture: ArchitectureJSON;
  source: 'mock' | 'llm';
}

export async function fetchArchitecture(prompt: string): Promise<GenerateArchitectureResponse> {
  const response = await fetch('/api/architecture/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to generate architecture' }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return response.json();
}
