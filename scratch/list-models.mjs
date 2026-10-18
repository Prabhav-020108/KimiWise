import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function listModels() {
  try {
    const list = await ai.models.list();
    console.log('Available models from API:');
    for await (const m of list) {
      if (m.name.includes('flash') || m.name.includes('gemma') || m.name.includes('pro')) {
        console.log(' - ', m.name);
      }
    }
  } catch (e) {
    console.error('List models failed:', e.message);
  }
}

listModels();
