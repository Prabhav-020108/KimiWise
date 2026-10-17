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

    const isSvgPrompt = /svg|image|draw|illustration|vector|diagram|cycle|anatomy|architecture|structure|circuit/i.test(prompt);

    const systemPrompt = `You are a world-class AI digital classroom educator and blackboard illustrator.
The user asked: "${prompt}"

CRITICAL INSTRUCTIONS FOR ACCURACY AND VISUAL QUALITY:
1. Provide an extremely accurate, specific, and technically detailed response for: "${prompt}".
2. Do NOT be vague, random, or generic. Use real terminology, formulas, code, or protocols specific to the subject.
3. ${isSvgPrompt ? 'GENERATE A HIGH-QUALITY VECTOR SVG in the "svg" field. The SVG must be standalone, valid XML (<svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg">...</svg>), with vibrant modern colors (#6366f1, #3b82f6, #10b981, #f59e0b, #0f172a), rounded boxes, crisp connecting arrows, and readable text labels for every part.' : 'Optionally include a clean standalone SVG in the "svg" field if a visual diagram directly illustrates this concept.'}
4. Provide 4 to 6 sequential workflow nodes accurately mapping out the concept.
5. Provide detailed pedagogical lesson notes with a concrete real-world analogy and high-yield takeaway.

Return ONLY valid JSON matching this exact structure (no markdown fences, no text outside JSON):
{
  "title": "Precise topic title",
  "type": "${isSvgPrompt ? 'svg' : 'flowchart'}",
  "svg": "<svg viewBox=\\"0 0 600 450\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>",
  "nodes": [
    {
      "label": "Accurate Step 1 Title (max 28 chars)",
      "sublabel": "Precise technical explanation of this phase",
      "type": "start"
    },
    {
      "label": "Step 2 Title",
      "sublabel": "Precise technical explanation of phase 2",
      "type": "process"
    },
    {
      "label": "Pivot / Verification Condition",
      "sublabel": "Precise condition or check",
      "type": "decision"
    },
    {
      "label": "Step 4 Title",
      "sublabel": "Phase 4 technical details",
      "type": "process"
    },
    {
      "label": "Final Outcome",
      "sublabel": "Final state description",
      "type": "end"
    }
  ],
  "lessonNotes": {
    "title": "Deep Concept Breakdown & Mechanism",
    "overview": "Rigorous explanation of how this works from first principles.",
    "keyPrinciples": [
      "Principle 1 with domain-specific depth",
      "Principle 2 explaining internal mechanism",
      "Principle 3 addressing edge cases or common misconceptions"
    ],
    "realWorldAnalogy": "A relatable real-world comparison that makes the concept click instantly.",
    "takeaway": "The core rule, equation, or takeaway to remember."
  }
}`;

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
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          config: {
            temperature: 0.2,
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
