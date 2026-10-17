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

const OCR_SYSTEM_PROMPT = `You are an expert code OCR assistant. You receive a photograph of handwritten or printed code.

Extract the code EXACTLY as written. Rules:
- Preserve all indentation (use spaces)
- Preserve line breaks exactly
- If a character is ambiguous, make the most likely programming interpretation
- If a section is unreadable, write [UNCLEAR]
- Return ONLY the extracted code — no explanations, no markdown fences, no commentary
- Detect the programming language from the code structure`;

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
    const { image, modelOverride } = body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'image (base64 data URL) is required' });
    }

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    const model = (modelOverride as string | undefined) || process.env.GEMMA_MODEL || 'gemma-4';

    // Extract base64 and mime type from data URL
    let mimeType = 'image/jpeg';
    let base64Data = image;
    if (image.startsWith('data:')) {
      const [header, data] = image.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) mimeType = mimeMatch[1];
      base64Data = data;
    }

    const client = new GoogleGenAI({ apiKey });
    const imagePart: Part = {
      inlineData: { data: base64Data, mimeType },
    };

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

    let extractedCode = '';
    let lastError: unknown = null;

    for (const m of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: m,
          contents: [{ role: 'user', parts: [imagePart, { text: 'Extract all code from this image.' }] }],
          config: { systemInstruction: OCR_SYSTEM_PROMPT, temperature: 0.1, maxOutputTokens: 4096 },
        });
        extractedCode = response.text?.trim() ?? '';
        if (extractedCode) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!extractedCode) {
      throw lastError || new Error('No code detected from image');
    }

    // Simple language detection heuristic
    let language = 'python';
    if (extractedCode.includes('function') || extractedCode.includes('=>') || extractedCode.includes('const ')) language = 'javascript';
    else if (extractedCode.includes('#include') || extractedCode.includes('int main')) language = 'c';
    else if (extractedCode.includes('public class') || extractedCode.includes('System.out')) language = 'java';
    else if (extractedCode.includes('def ') || extractedCode.includes('import ') || extractedCode.includes('print(')) language = 'python';

    return res.json({ code: extractedCode, language, confidence: 0.92, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/ocr]', err);
    return res.status(500).json({ error: 'OCR failed', detail: String(err) });
  }
}
