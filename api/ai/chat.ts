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

    const response = await client.models.generateContent({
      model,
      contents: [...gemmaHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: (systemPrompt as string | undefined) || 'You are KimiWise, a helpful AI classroom assistant.',
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    return res.json({ response: response.text?.trim() ?? '', mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/chat]', err);
    return res.status(500).json({ error: 'Chat AI failed', detail: String(err) });
  }
}
