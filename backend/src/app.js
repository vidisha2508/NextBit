import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { generateArchitecture } from './services/gemini.service.js';

const require = createRequire(import.meta.url);
const mockNetflixArchitecture = require('./data/mockNetflixArchitecture.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NextBit API', geminiKeyConfigured: !!process.env.GEMINI_API_KEY });
});

// Mock architecture endpoint preserved for development / testing data
app.get('/api/architecture/mock', (req, res) => {
  res.json({
    architecture: mockNetflixArchitecture,
    source: 'mock'
  });
});

// Real Gemini-powered Architecture Generation API endpoint
app.post('/api/architecture/generate', async (req, res) => {
  const { prompt } = req.body;

  // Validate prompt parameter
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({
      error: 'Prompt is required and must be a non-empty string.'
    });
  }

  try {
    const architecture = await generateArchitecture(prompt.trim());
    return res.json({
      architecture,
      source: 'gemini'
    });
  } catch (error) {
    console.error('[Gemini Service Error]:', error.message);

    if (error.code === 'MISSING_API_KEY') {
      return res.status(500).json({
        error: 'Server Configuration Error: GEMINI_API_KEY is not configured in backend environment.'
      });
    }

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(500).json({
        error: `Architecture Validation Error: ${error.message}`
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to generate architecture from Gemini.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`NextBit backend listening on http://localhost:${PORT}`);
});
