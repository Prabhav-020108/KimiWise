import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function getApiKey(body: Record<string, unknown>): string {
  return (
    (body.customKey as string | undefined) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.API_KEY ||
    ''
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as Record<string, unknown>;
    const {
      topic,
      gradeLevel,
      questionCount = 5,
      modelOverride,
    } = body;

    if (!topic || !gradeLevel) {
      return res.status(400).json({ error: 'topic and gradeLevel are required' });
    }

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    const model = (modelOverride as string | undefined) || process.env.GEMMA_MODEL || 'gemma-4';
    const client = new GoogleGenAI({ apiKey });

    const prompt = `Create an engaging quiz about "${topic}" for ${gradeLevel} students with ${questionCount} questions.

Return a JSON object (no markdown) with this exact structure:
{
  "title": "Quiz title",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ]
}

Mix question types: 80% multiple_choice, 20% essay (essay type has no options/correctIndex, just "expectedAnswer").`;

    const response = await client.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.7, maxOutputTokens: 4096 },
    });

    const text = response.text?.trim() ?? '{}';
    let quiz: unknown;
    try {
      quiz = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      quiz = { title: `${topic} Quiz`, questions: [] };
    }

    return res.json({ quiz, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/quiz]', err);
    return res.status(500).json({ error: 'Quiz generation failed', detail: String(err) });
  }
}
