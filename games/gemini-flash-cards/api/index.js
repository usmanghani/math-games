import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Initialize Gemini AI with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Convert buffer to base64
    const base64Audio = req.file.buffer.toString('base64');

    // Get the model and generate content
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: req.file.mimetype || 'audio/webm',
          data: base64Audio
        }
      },
      'Listen to this audio and respond with ONLY the exact word, letter, or number that was spoken. Do not include any other text, explanation, or punctuation. Just the single word, letter, or number.'
    ]);

    const response = await result.response;
    const transcript = response.text().toLowerCase().trim();

    res.json({ transcript });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({
      error: 'Failed to process audio',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY });
});

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
