import 'dotenv/config';

// Suppress @google/genai SDK internal warning about non-text function-call parts.
const _consoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('non-text parts') && msg.includes('functionCall')) return;
  _consoleWarn(...args);
};

import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import type { CanvasObjectData } from '../types';
import { CONFIG, SYSTEM_PROMPTS } from '../constants';
import { CANVAS_TOOLS, buildSystemInstruction } from './toolRouter';

// ── Client factory ────────────────────────────────────────────────────────────

const getClient = (customKey?: string) =>
  new GoogleGenAI({
    apiKey: customKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || 'dummy',
  });

const getModel = (override?: string) =>
  override ||
  process.env.GEMMA_MODEL ||
  process.env.GOOGLE_AI_MODEL ||
  CONFIG.ai.gemma.model;

// ── Board Agent — multimodal (canvas image + function calling) ────────────────

export const generateAgentActionsGemma = async (
  prompt: string,
  canvasImageBase64: string,
  canvasObjects: CanvasObjectData[],
  viewport: { width: number; height: number; zoom: number },
  highResInputImage?: string | null,
  history: { role: 'user' | 'model'; text: string }[] = [],
  domElements: Record<string, unknown> = {},
  customKey?: string,
  intent?: string,
  modelOverride?: string
): Promise<{
  functionCalls: { name: string; args: Record<string, unknown> }[];
  textResponse: string;
  thought?: string;
  usageMetadata?: unknown;
}> => {
  const extractImagePayload = (rawUri?: string | null) => {
    if (!rawUri || typeof rawUri !== 'string') return null;
    const trimmed = rawUri.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^data:([a-zA-Z0-9+.\-]+\/[a-zA-Z0-9+.\-]+);base64,(.*)$/s);
    if (match) return { mimeType: match[1], data: match[2].trim() };
    return { mimeType: 'image/png', data: trimmed };
  };

  const canvasPayload = extractImagePayload(canvasImageBase64);
  const inputImagePayload = extractImagePayload(highResInputImage);
  const selectedModel = getModel(modelOverride);

  const systemInstruction = buildSystemInstruction(canvasObjects, viewport, domElements) +
    (intent === 'question'
      ? '\n\nNOTE: User is asking a QUESTION. Prioritize a helpful educational text answer. Only use tools if a visual would genuinely help.'
      : intent === 'creation'
      ? '\n\nNOTE: User wants to CREATE something on the board. Use function calls immediately. Briefly explain what you made.'
      : '');

  const contents = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    {
      role: 'user' as const,
      parts: [
        ...(canvasPayload?.data ? [{ inlineData: { mimeType: canvasPayload.mimeType, data: canvasPayload.data } }] : []),
        ...(inputImagePayload?.data ? [{ inlineData: { mimeType: inputImagePayload.mimeType, data: inputImagePayload.data } }] : []),
        {
          text: `User request: ${prompt}\n\nUse function calls for all visual content. Explain clearly in text too.`,
        },
      ],
    },
  ];

  const ai = getClient(customKey);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.ai.gemma.generateTimeoutMs);

  let response: Awaited<ReturnType<typeof ai.models.generateContent>>;
  try {
    response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        tools: [{ functionDeclarations: CANVAS_TOOLS as any }],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
        systemInstruction,
        temperature: CONFIG.ai.gemma.generation.temperature,
        maxOutputTokens: CONFIG.ai.gemma.generation.maxOutputTokens,
        thinkingConfig: {
          thinkingBudget:
            prompt.length > 300 ? 1024 : CONFIG.ai.gemma.generation.thinkingBudget,
        },
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  // Extract parts directly to avoid SDK warning
  const candidate = (response as unknown as { candidates?: { content?: { parts?: unknown[] } }[] }).candidates?.[0];
  const parts: unknown[] = (candidate as { content?: { parts?: unknown[] } })?.content?.parts || [];

  const textResponse = (parts as { text?: string; thought?: boolean }[])
    .filter((p) => p.text && !p.thought)
    .map((p) => p.text)
    .join('') || '';

  const thought = (parts as { thought?: boolean; text?: string }[])
    .filter((p) => p.thought && p.text)
    .map((p) => p.text)
    .join('') || undefined;

  const functionCalls = (parts as { functionCall?: { name: string; args?: Record<string, unknown> } }[])
    .filter((p) => p.functionCall)
    .map((p) => ({ name: p.functionCall!.name, args: p.functionCall!.args || {} }));

  return {
    functionCalls,
    textResponse,
    thought,
    usageMetadata: (response as unknown as { usageMetadata?: unknown }).usageMetadata,
  };
};

// ── OCR — handwritten code photo → extracted code ─────────────────────────────

export const performOcrGemma = async (
  imageBase64: string,
  customKey?: string,
  modelOverride?: string
): Promise<{
  extractedCode: string;
  language: string;
  confidence: number;
  explanation: string;
}> => {
  const ai = getClient(customKey);
  const model = getModel(modelOverride);

  const imageData = imageBase64.replace(/^data:[^;]+;base64,/, '');
  const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageData } },
          {
            text: `You are an expert code OCR system. Analyze this image of handwritten or printed code.

Return a JSON object with this exact structure (no markdown, no explanation outside the JSON):
{
  "extractedCode": "the code exactly as written, preserving indentation",
  "language": "programming language name (python, javascript, java, c++, etc.)",
  "confidence": 0.95,
  "explanation": "brief note about what the code does and any issues you spotted"
}

If the image contains no code, return extractedCode as empty string and confidence as 0.`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      systemInstruction: SYSTEM_PROMPTS.codeTutor,
    },
  });

  const text = response.text?.trim() || '';
  try {
    const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(json);
  } catch {
    return {
      extractedCode: text,
      language: 'unknown',
      confidence: 0.5,
      explanation: 'Could not parse structured response — raw text returned.',
    };
  }
};

// ── Code Tutor — multi-turn tutoring conversation ─────────────────────────────

export const tutorCodeGemma = async (
  userMessage: string,
  code: string,
  language: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  customKey?: string,
  modelOverride?: string
): Promise<string> => {
  const ai = getClient(customKey);
  const model = getModel(modelOverride);

  const context = code
    ? `\n\nCurrent code being reviewed (${language}):\n\`\`\`${language}\n${code}\n\`\`\``
    : '';

  const contents = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    {
      role: 'user' as const,
      parts: [{ text: userMessage + context }],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPTS.codeTutor,
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  });

  return response.text?.trim() || "I couldn't generate a response. Please try again.";
};

// ── General Generate — for chat, lesson planning, insights ───────────────────

export const generateTextGemma = async (
  prompt: string,
  systemPrompt?: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  customKey?: string,
  modelOverride?: string
): Promise<string> => {
  const ai = getClient(customKey);
  const model = getModel(modelOverride);

  const contents = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user' as const, parts: [{ text: prompt }] },
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemPrompt || SYSTEM_PROMPTS.boardAgent,
      temperature: 0.4,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  return response.text?.trim() || '';
};

// ── Audio Transcription — voice → text ───────────────────────────────────────

export const transcribeAudioGemma = async (
  base64Audio: string,
  customKey?: string,
  modelOverride?: string
): Promise<string> => {
  const ai = getClient(customKey);
  const model = getModel(modelOverride);

  const audioData = base64Audio.replace(/^data:audio\/[^;]+;base64,/, '');
  const mimeMatch = base64Audio.match(/^data:(audio\/[^;]+);base64,/);
  const mimeType = (mimeMatch?.[1] || 'audio/webm') as 'audio/webm' | 'audio/ogg' | 'audio/wav' | 'audio/mp4';

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data: audioData } },
          {
            text: 'Transcribe this audio exactly as spoken. Detect the language automatically and return the transcript in that same language. Return only the transcribed text — no commentary, no explanation. If there is no human speech, return an empty string.',
          },
        ],
      },
    ],
    config: {
      temperature: CONFIG.ai.gemma.transcription.temperature,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  return response.text?.trim() || '';
};

// ── Lesson Plan Generator ─────────────────────────────────────────────────────

export const generateLessonPlanGemma = async (
  subject: string,
  topic: string,
  gradeLevel: string,
  duration: number,
  customKey?: string,
  modelOverride?: string
): Promise<unknown> => {
  const ai = getClient(customKey);
  const model = getModel(modelOverride);

  const prompt = `Generate a structured lesson plan as JSON (no markdown wrapping):
{
  "subject": "${subject}",
  "topic": "${topic}",
  "gradeLevel": "${gradeLevel}",
  "steps": [
    {
      "phase": "intro|core|practice|closing",
      "title": "step title",
      "contentType": "mindmap|flowchart|text|quiz|timeline|comparison",
      "suggestion": "brief teaching suggestion for this step"
    }
  ]
}

Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Duration: ${duration} minutes

Create 4-6 steps covering intro, core concepts, practice, and closing.
Return ONLY the raw JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPTS.lessonPlanner,
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const text = response.text?.trim() || '';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return null;
  }
};

// ── Quiz Generator ────────────────────────────────────────────────────────────

export const generateQuizGemma = async (
  topic: string,
  gradeLevel: string,
  questionCount: number = 5,
  customKey?: string,
  modelOverride?: string
): Promise<unknown> => {
  const ai = getClient(customKey);
  const model = getModel(modelOverride);

  const prompt = `Generate a quiz about "${topic}" for ${gradeLevel} students.
Return ONLY this JSON (no markdown):
{
  "title": "Quiz title",
  "questions": [
    { "type": "multiple_choice", "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 },
    { "type": "essay", "question": "...", "expectedAnswer": "..." }
  ]
}
Include ${Math.max(2, questionCount - 1)} multiple choice and 1 essay question.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPTS.quizGenerator,
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const text = response.text?.trim() || '';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return null;
  }
};
