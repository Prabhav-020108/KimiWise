import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

const candidates = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemma-4-26b-a4b-it',
  'gemma-4-31b-it',
];

for (const m of candidates) {
  const t0 = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: m,
      contents: 'Hi, 3 words.',
    });
    console.log(`[SUCCESS] ${m} in ${Date.now() - t0}ms:`, res.text?.trim().slice(0, 40));
  } catch (e) {
    console.log(`[FAIL] ${m} in ${Date.now() - t0}ms:`, e.message?.slice(0, 80));
  }
}
