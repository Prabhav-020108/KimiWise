import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Part } from '@google/genai';

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
      prompt,
      canvasImage,
      history = [],
      modelOverride,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    const model = (modelOverride as string | undefined) || process.env.GEMMA_MODEL || 'gemma-4';
    const client = new GoogleGenAI({ apiKey });

    const contents: any[] = [];

    // Add prior conversation history
    const historyList = (history as Array<{ role: string; text: string }>) || [];
    for (const h of historyList) {
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }

    const currentParts: Part[] = [];

    // If canvas snapshot image was provided, attach it as multimodal context
    if (typeof canvasImage === 'string' && canvasImage.trim()) {
      let mimeType = 'image/png';
      let base64Data = canvasImage;
      if (canvasImage.startsWith('data:')) {
        const [header, data] = canvasImage.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64Data = data;
      }
      currentParts.push({
        inlineData: {
          mimeType,
          data: base64Data.trim(),
        },
      });
    }

    currentParts.push({
      text: `User request for the smart classroom whiteboard:\n${prompt}\n\nProvide an inspiring, crystal-clear explanation with step-by-step educational insights.`,
    });

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const candidateModels = [
      model,
      'gemma-4-26b-a4b-it',
      'gemini-flash-latest',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
    ];

    let textResponse = '';
    let usedModel = model;

    for (const m of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: m,
          contents,
          config: {
            systemInstruction:
              'You are KimiWise, an expert AI digital classroom educator and whiteboard assistant. Guide students with clear explanations, structured walkthroughs, and helpful insights.',
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        });
        textResponse = response.text?.trim() ?? '';
        usedModel = m;
        if (textResponse) break;
      } catch (err) {
        // Continue to fallback candidate
      }
    }

    if (!textResponse) {
      textResponse = `Generated visual explanation for "${prompt}". Check the whiteboard tools and notes!`;
    }

    return res.json({
      textResponse,
      actions: [],
      mode: 'gemma',
      model: usedModel,
    });
  } catch (err) {
    console.error('[/api/ai/generate]', err);
    return res.status(500).json({ error: 'AI generation failed', detail: String(err) });
  }
}
