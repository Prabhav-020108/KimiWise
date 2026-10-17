// ─── KimiWise — Frontend AI Service Client ───────────────────────────────────
// All API calls go through the Express server (/api/ai/*)

const BASE = '/api/ai';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GenerateRequest {
  prompt: string;
  canvasImage?: string;
  canvasObjects?: unknown[];
  viewport?: { width: number; height: number; zoom: number };
  highResImage?: string;
  history?: { role: 'user' | 'model'; text: string }[];
  domElements?: Record<string, unknown>;
  intent?: 'question' | 'creation' | 'auto';
  mode?: 'gemma' | 'ollama';
}

export interface GenerateResponse {
  textResponse: string;
  actions: unknown[];
  thought?: string;
  mode: string;
  model?: string;
}

export interface OcrResponse {
  extractedCode: string;
  language: string;
  confidence: number;
  explanation: string;
  mode: string;
}

export interface TutorRequest {
  message: string;
  code?: string;
  language?: string;
  history?: { role: 'user' | 'model'; text: string }[];
}

export interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'model'; text: string }[];
  systemPrompt?: string;
}

export interface LessonPlanRequest {
  subject: string;
  topic: string;
  gradeLevel: string;
  duration?: number;
}

export interface QuizRequest {
  topic: string;
  gradeLevel: string;
  questionCount?: number;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

const post = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};

// ── Status ────────────────────────────────────────────────────────────────────

export const checkAiStatus = async () => {
  const res = await fetch(`${BASE}/status`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
};

// ── Board Agent ───────────────────────────────────────────────────────────────

export const generateBoardActions = (req: GenerateRequest): Promise<GenerateResponse> =>
  post<GenerateResponse>('/generate', req);

// ── OCR ───────────────────────────────────────────────────────────────────────

export const performOcr = (image: string): Promise<OcrResponse> =>
  post<OcrResponse>('/ocr', { image });

// ── Code Tutor ────────────────────────────────────────────────────────────────

export const askTutor = (req: TutorRequest): Promise<{ response: string; mode: string }> =>
  post('/tutor', req);

// ── Transcription ─────────────────────────────────────────────────────────────

export const transcribeAudio = (audio: string): Promise<{ transcript: string; mode: string }> =>
  post('/transcribe', { audio });

// ── General Chat ──────────────────────────────────────────────────────────────

export const sendChatMessage = (req: ChatRequest): Promise<{ response: string; mode: string }> =>
  post('/chat', req);

// ── Lesson Plan ───────────────────────────────────────────────────────────────

export const generateLessonPlan = (req: LessonPlanRequest): Promise<{ plan: unknown; mode: string }> =>
  post('/lesson-plan', req);

// ── Quiz ──────────────────────────────────────────────────────────────────────

export const generateQuiz = (req: QuizRequest): Promise<{ quiz: unknown; mode: string }> =>
  post('/quiz', req);

// ── Teacher Insights ──────────────────────────────────────────────────────────

export const getTeacherInsights = (students: unknown[]): Promise<{ insights: unknown[]; mode: string }> =>
  post('/insights', { students });

export interface BoardLessonData {
  title: string;
  type: 'flowchart' | 'mindmap';
  nodes: {
    label: string;
    sublabel: string;
    type: 'start' | 'process' | 'decision' | 'end';
  }[];
  lessonNotes: {
    title: string;
    overview: string;
    keyPrinciples: string[];
    realWorldAnalogy: string;
    takeaway: string;
  };
}

export const generateBoardLesson = (prompt: string): Promise<{ lesson: BoardLessonData; mode: string }> =>
  post('/board-lesson', { prompt });

// ── Unified aiService Client Export ───────────────────────────────────────────

export const aiService = {
  checkStatus: checkAiStatus,
  generateBoardActions,
  generateBoardLesson,
  performOcr,
  askTutor,
  transcribeAudio,
  sendChatMessage,
  chat: async (message: string, history?: { role: 'user' | 'model'; text: string }[]) => {
    const start = Date.now();
    const res = await sendChatMessage({ message, history });
    return {
      textResponse: res.response,
      mode: res.mode,
      model: 'Gemma 4',
      latencyMs: Date.now() - start,
    };
  },
  generateLessonPlan: (subject: string, topic: string) =>
    generateLessonPlan({ subject, topic, gradeLevel: 'High School' }),
  generateQuiz: async (topic: string, questionCount: number = 3) => {
    const res = await generateQuiz({ topic, gradeLevel: 'High School', questionCount });
    return { quiz: res.quiz as any, mode: res.mode };
  },
  getTeacherInsights,
};


