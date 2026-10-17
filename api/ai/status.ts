import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// ── Shared helpers ─────────────────────────────────────────────────────────────

function getKey(body: Record<string, unknown>): string {
  return (
    (body.customKey as string | undefined) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.API_KEY ||
    ''
  );
}

function getModel(body: Record<string, unknown>): string {
  return (
    (body.modelOverride as string | undefined) ||
    process.env.GEMMA_MODEL ||
    'gemma-4'
  );
}

// ── /api/ai/status ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY);

  return res.json({
    gemma: {
      available: hasKey,
      model: process.env.GEMMA_MODEL || 'gemma-4',
      reason: hasKey ? 'api_key_present' : 'missing_api_key',
    },
    ollama: { online: false, model: null },
    recommendedMode: hasKey ? 'gemma' : 'unavailable',
  });
}
