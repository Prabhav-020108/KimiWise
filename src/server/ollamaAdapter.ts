import { CONFIG } from '../constants';

// ── Ollama local AI fallback ──────────────────────────────────────────────────
// Used when Google AI is not available (offline, no API key, etc.)

const getOllamaUrl = () =>
  (process.env.OLLAMA_BASE_URL || CONFIG.ai.ollama.defaultBaseUrl).replace(/\/$/, '');

const getOllamaModel = () =>
  process.env.OLLAMA_MODEL || CONFIG.ai.ollama.model;

// ── Availability probe ────────────────────────────────────────────────────────

export const probeOllama = async (customUrl?: string): Promise<{ online: boolean; models: string[]; reason: string }> => {
  const url = customUrl || getOllamaUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.ai.ollama.probeTimeoutMs);
    const response = await fetch(`${url}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return { online: false, models: [], reason: `http_${response.status}` };

    const data = await response.json() as { models?: { name: string }[] };
    const models = (data.models || []).map((m) => m.name);
    return { online: true, models, reason: 'ok' };
  } catch (e: unknown) {
    const err = e as Error;
    return { online: false, models: [], reason: err?.name === 'AbortError' ? 'timeout' : 'connection_refused' };
  }
};

// ── Generic Ollama generate ───────────────────────────────────────────────────

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const ollamaChat = async (
  messages: OllamaMessage[],
  customUrl?: string,
  modelOverride?: string
): Promise<string> => {
  const url = customUrl || getOllamaUrl();
  const model = modelOverride || getOllamaModel();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.ai.ollama.generateTimeoutMs);

  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          num_ctx: CONFIG.ai.ollama.numCtx,
          temperature: 0.3,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      if (!modelOverride && model !== 'llama3.2:3b') {
        const probe = await probeOllama(url);
        const fallback = probe.models.find((m) => m !== model && !m.includes('gemma4'));
        if (fallback) {
          console.warn(`[ollamaAdapter] ${model} failed (${errText.slice(0, 60)}...). Falling back to ${fallback}`);
          return ollamaChat(messages, customUrl, fallback);
        }
      }
      throw new Error(`Ollama HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json() as { message?: { content?: string } };
    return data?.message?.content?.trim() || '';
  } finally {
    clearTimeout(timeout);
  }
};

// ── Board Agent (Ollama — text only, no function calling) ─────────────────────

export const generateTextOllama = async (
  prompt: string,
  systemPrompt?: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  customUrl?: string,
  modelOverride?: string
): Promise<string> => {
  const messages: OllamaMessage[] = [
    {
      role: 'system',
      content: systemPrompt || 'You are KimiWise, an AI-powered educational assistant. Help teachers and students with clear, engaging explanations.',
    },
    ...history.map((h) => ({
      role: (h.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.text,
    })),
    { role: 'user', content: prompt },
  ];

  return ollamaChat(messages, customUrl, modelOverride);
};

// ── Code Tutor (Ollama) ───────────────────────────────────────────────────────

export const tutorCodeOllama = async (
  userMessage: string,
  code: string,
  language: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  customUrl?: string,
  modelOverride?: string
): Promise<string> => {
  const context = code
    ? `\n\nCode under review (${language}):\n\`\`\`${language}\n${code}\n\`\`\``
    : '';

  const messages: OllamaMessage[] = [
    {
      role: 'system',
      content: 'You are KimiWise Code Tutor — a patient, encouraging programming mentor. Help students understand their code, identify errors, and learn best practices.',
    },
    ...history.map((h) => ({
      role: (h.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.text,
    })),
    { role: 'user', content: userMessage + context },
  ];

  return ollamaChat(messages, customUrl, modelOverride);
};

// ── Lesson Plan (Ollama) ──────────────────────────────────────────────────────

export const generateLessonPlanOllama = async (
  subject: string,
  topic: string,
  gradeLevel: string,
  duration: number,
  customUrl?: string,
  modelOverride?: string
): Promise<unknown> => {
  const prompt = `Create a lesson plan for teaching "${topic}" in ${subject} for ${gradeLevel} students (${duration} minutes).
Return ONLY valid JSON (no markdown):
{
  "subject": "${subject}",
  "topic": "${topic}",
  "gradeLevel": "${gradeLevel}",
  "steps": [
    { "phase": "intro", "title": "...", "contentType": "text", "suggestion": "..." },
    { "phase": "core", "title": "...", "contentType": "mindmap", "suggestion": "..." },
    { "phase": "practice", "title": "...", "contentType": "quiz", "suggestion": "..." },
    { "phase": "closing", "title": "...", "contentType": "text", "suggestion": "..." }
  ]
}`;

  const messages: OllamaMessage[] = [
    { role: 'system', content: 'You are an expert curriculum designer. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ];

  const text = await ollamaChat(messages, customUrl, modelOverride);
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return null;
  }
};

// ── Quiz Generator (Ollama) ───────────────────────────────────────────────────

export const generateQuizOllama = async (
  topic: string,
  gradeLevel: string,
  questionCount: number = 5,
  customUrl?: string,
  modelOverride?: string
): Promise<unknown> => {
  const prompt = `Generate a quiz about "${topic}" for ${gradeLevel} students.
Return ONLY valid JSON (no markdown):
{
  "title": "Quiz: ${topic}",
  "questions": [
    { "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 },
    { "type": "essay", "question": "...", "expectedAnswer": "..." }
  ]
}
Include ${Math.max(2, questionCount - 1)} multiple choice and 1 essay question.`;

  const messages: OllamaMessage[] = [
    { role: 'system', content: 'You are an expert educational assessor. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ];

  const text = await ollamaChat(messages, customUrl, modelOverride);
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return null;
  }
};
