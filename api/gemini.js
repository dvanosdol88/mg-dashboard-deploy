// Express.js router for Google Gemini AI API
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// POST /api/gemini - Generate content using Gemini AI
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt.trim());
    const responseText = result.response.text();

    res.json({ 
      response: responseText,
      prompt: prompt.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid Gemini API key' });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded' });
    }
    
    res.status(500).json({ error: 'Failed to generate response from Gemini AI' });
  }
});

// GET /api/gemini/models - List available models (optional)
router.get('/models', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // For now, return the models we know are available
    const models = [
      { 
        name: 'gemini-1.5-flash',
        description: 'Fast and efficient model for text-only prompts',
        inputTypes: ['text']
      },
      { 
        name: 'gemini-1.5-pro',
        description: 'Advanced model for complex tasks',
        inputTypes: ['text', 'image']
      }
    ];

    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch available models' });
  }
});

export default router;