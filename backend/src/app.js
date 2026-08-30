import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const mockArchitecture = require('./data/mockNetflixArchitecture.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NextBit API' });
});

// Architecture generation API endpoint (Backend Contract)
app.post('/api/architecture/generate', (req, res) => {
  const { prompt } = req.body;

  // Validate prompt parameter
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({
      error: 'Prompt is required and must be a non-empty string.'
    });
  }

  // Simulate slight network processing latency (300ms) for realistic UX flow
  setTimeout(() => {
    res.json({
      architecture: mockArchitecture,
      source: 'mock'
    });
  }, 300);
});

app.listen(PORT, () => {
  console.log(`NextBit backend listening on http://localhost:${PORT}`);
});
