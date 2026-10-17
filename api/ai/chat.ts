import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Content } from '@google/genai';

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
      message,
      history = [],
      systemPrompt,
      modelOverride,
    } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    const model = (modelOverride as string | undefined) || process.env.GEMMA_MODEL || 'gemma-4';
    const client = new GoogleGenAI({ apiKey });

    const gemmaHistory = ((history as Array<{ role: string; text: string }>) || []).map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })) as Content[];

    const candidateModels = [
      model,
      'gemma-4-26b-a4b-it',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
    ];

    let responseText = '';
    let lastError: unknown = null;

    for (const m of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: m,
          contents: [...gemmaHistory, { role: 'user', parts: [{ text: message }] }],
          config: {
            systemInstruction:
              (systemPrompt as string | undefined) ||
              'You are KimiWise, an expert AI classroom educator. Provide insightful, technically accurate, clear explanations.',
            temperature: 0.5,
            maxOutputTokens: 4096,
          },
        });
        responseText = response.text?.trim() ?? '';
        if (responseText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from AI models');
    }

    return res.json({ response: responseText, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/chat]', err);
    return res.status(500).json({ error: 'Chat AI failed', detail: String(err) });
  }
}
