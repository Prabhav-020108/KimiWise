import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

const candidates = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemma-4-26b-a4b-it'
];

for (const m of candidates) {
  const t0 = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: m,
      contents: 'Give 3 steps of binary search in 10 words.',
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    console.log(`[SUCCESS] ${m} in ${Date.now() - t0}ms:`, res.text?.trim().slice(0, 50));
  } catch (e) {
    console.log(`[FAIL] ${m} in ${Date.now() - t0}ms:`, e.message?.slice(0, 80));
  }
}
