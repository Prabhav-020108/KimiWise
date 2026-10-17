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
      subject,
      topic,
      gradeLevel,
      duration = 45,
      modelOverride,
    } = body;

    if (!subject || !topic || !gradeLevel) {
      return res.status(400).json({ error: 'subject, topic, and gradeLevel are required' });
    }

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    const model = (modelOverride as string | undefined) || process.env.GEMMA_MODEL || 'gemma-4';
    const client = new GoogleGenAI({ apiKey });

    const prompt = `Create a detailed ${duration}-minute lesson plan for teaching "${topic}" in ${subject} to ${gradeLevel} students.

Return a JSON object (no markdown):
{
  "subject": "${subject}",
  "topic": "${topic}",
  "gradeLevel": "${gradeLevel}",
  "duration": ${duration},
  "learningObjectives": ["objective1", "objective2"],
  "steps": [
    {
      "phase": "intro|core|practice|closing",
      "title": "Step title",
      "contentType": "mindmap|flowchart|text|quiz|exercise|diagram",
      "durationMins": 10,
      "suggestion": "What to do or show in this step",
      "boardPrompt": "Specific prompt to send to KimiWise board AI for this step"
    }
  ]
}

Make 4-6 engaging steps that build progressively. Each boardPrompt should be a ready-to-use command like "Draw a mind map of [concept] with key branches".`;

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

    let text = '';
    for (const m of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: m,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.6, maxOutputTokens: 4096 },
        });
        text = response.text?.trim() ?? '';
        if (text) break;
      } catch (err) {
        // try next fallback model
      }
    }
    let plan: unknown;
    try {
      plan = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      plan = {
        subject,
        topic,
        gradeLevel,
        steps: [
          { phase: 'intro', title: `Introduction to ${topic}`, contentType: 'mindmap', suggestion: `Review fundamentals`, boardPrompt: `Draw a mind map about ${topic}` },
          { phase: 'core', title: 'Core Concepts', contentType: 'flowchart', suggestion: 'Walk through the main ideas', boardPrompt: `Create a flowchart explaining ${topic}` },
          { phase: 'practice', title: 'Practice', contentType: 'quiz', suggestion: 'Apply what we learned', boardPrompt: `Write 3 practice problems about ${topic}` },
          { phase: 'closing', title: 'Summary', contentType: 'text', suggestion: 'Recap key takeaways', boardPrompt: `Summarize the key points of ${topic}` },
        ],
      };
    }

    return res.json({ plan, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/lesson-plan]', err);
    return res.status(500).json({ error: 'Lesson plan generation failed', detail: String(err) });
  }
}
