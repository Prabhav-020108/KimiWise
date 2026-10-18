import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY;
console.log('Testing with API key present:', !!apiKey);

const ai = new GoogleGenAI({ apiKey });

async function bench(modelName) {
  const start = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: 'Give a 1-sentence definition of binary search.' }] }]
    });
    console.log(`Model ${modelName}: SUCCESS in ${Date.now() - start}ms -> ${res.text?.trim().slice(0, 60)}...`);
  } catch (e) {
    console.log(`Model ${modelName}: FAILED in ${Date.now() - start}ms -> ${e.message?.slice(0, 80)}`);
  }
}

async function run() {
  await bench('gemini-2.0-flash');
  await bench('gemini-1.5-flash');
  await bench('gemini-2.0-flash-lite');
}

run();
