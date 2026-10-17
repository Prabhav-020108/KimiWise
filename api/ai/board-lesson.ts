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
    const { prompt, modelOverride } = body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    const model = (modelOverride as string | undefined) || process.env.GEMMA_MODEL || 'gemma-4';
    const client = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a world-class AI digital classroom educator.
The student/teacher asked: "${prompt}"

Generate a structured whiteboard lesson with an accurate sequential flowchart/mindmap AND detailed pedagogical lesson notes.
Return ONLY valid JSON matching this exact structure (no markdown, no backticks outside JSON):
{
  "title": "Clean concise topic title (e.g. Binary Search Algorithm)",
  "type": "flowchart",
  "nodes": [
    {
      "label": "Short Step Title (max 28 chars)",
      "sublabel": "Concise 1-sentence technical explanation of what occurs in this step",
      "type": "start"
    },
    {
      "label": "Step 2 Title",
      "sublabel": "Explanation of phase 2",
      "type": "process"
    },
    {
      "label": "Conditional/Decision or Core Pivot",
      "sublabel": "Explanation of decision or verification",
      "type": "decision"
    },
    {
      "label": "Step 4 Title",
      "sublabel": "Explanation of phase 4",
      "type": "process"
    },
    {
      "label": "Final Outcome / Completion",
      "sublabel": "Final state description",
      "type": "end"
    }
  ],
  "lessonNotes": {
    "title": "Core Concept Breakdown & Mechanism",
    "overview": "Clear 2-3 sentence overview explaining how this works from first principles.",
    "keyPrinciples": [
      "Key principle 1 with technical detail",
      "Key principle 2 explaining the mechanism",
      "Key principle 3 addressing common pitfalls"
    ],
    "realWorldAnalogy": "A relatable real-world comparison that makes the concept instantly click.",
    "takeaway": "One memorable takeaway rule."
  }
}`;

    const candidateModels = [
      model,
      'gemma-4-26b-a4b-it',
      'gemini-flash-latest',
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
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          config: {
            temperature: 0.4,
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
      throw lastError || new Error('Failed to generate response from models');
    }

    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const lesson = JSON.parse(cleanJson);

    return res.json({ lesson, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/board-lesson]', err);
    return res.status(500).json({ error: 'Board lesson generation failed', detail: String(err) });
  }
}
