// ─── KimiWise — Constants & Configuration ────────────────────────────────────

export const GEMMA_MODEL = 'gemini-3.1-flash-lite'; // Fast & active Gemini/Gemma engine (~800ms)
export const GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash-lite'; // Fast reliable fallback (~1200ms)
export const GEMMA_FALLBACK_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemma-4-26b-a4b-it',
];
export const OLLAMA_MODEL = 'gemma4:e2b'; // Local Ollama fallback
export const DEFAULT_CANVAS_COLOR = 'transparent';

export const CONFIG = {
  app: {
    name: 'KimiWise',
    version: '1.0.0',
    tagline: 'AI-Powered Smart Classroom',
  },
  ai: {
    gemma: {
      model: GEMMA_MODEL,
      fallbackModel: GEMINI_FALLBACK_MODEL,
      fallbackModels: GEMMA_FALLBACK_MODELS,
      apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      probeTimeoutMs: 3000,
      generateTimeoutMs: 120_000,
      generation: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        thinkingBudget: 0,
      },
      transcription: {
        temperature: 0.1,
      },
    },
    ollama: {
      model: OLLAMA_MODEL,
      defaultBaseUrl: 'http://localhost:11434',
      probeTimeoutMs: 1500,
      numCtx: 8192,
      generateTimeoutMs: 180_000,
    },
    request: {
      retryCount: 2,
      retryBaseDelayMs: 400,
      bodyLimit: '50mb',
    },
  },
  server: {
    defaultPort: 3030,
    host: '0.0.0.0',
    roomsPersistenceFile: 'rooms_persistence.json',
  },
  ui: {
    mobileBreakpointPx: 1024,
    aiStatusPollIntervalMs: 30_000,
    autoSaveDebounceMs: 3_000,
  },
} as const;

// ── AI System Prompts ────────────────────────────────────────────────────────

export const SYSTEM_PROMPTS = {
  boardAgent: `You are KimiWise — an intelligent teaching assistant powering an interactive whiteboard.
You help teachers create engaging, visual lessons and help students understand concepts.
When asked to create content on the board, use function calls to place elements.
When asked a question, give a clear educational explanation.
Always be encouraging, clear, and pedagogically sound.`,

  codeTutor: `You are KimiWise Code Tutor — a patient, encouraging programming mentor.
Help students understand their code, identify errors, and learn best practices.
Explain concepts at the right level for the student. Use analogies and examples.
When reviewing handwritten code from photos, be understanding of minor formatting issues.`,

  lessonPlanner: `You are KimiWise Lesson Planner — an expert curriculum designer.
Create structured, engaging lesson plans that leverage visual, auditory, and interactive learning.
Format lesson plans with clear phases: Introduction, Core Content, Practice, and Closing.
Each step should specify the content type (mindmap, quiz, flowchart, etc.) and a teaching suggestion.`,

  quizGenerator: `You are KimiWise Quiz Generator — an expert at creating educational assessments.
Generate varied questions that test understanding at different cognitive levels.
Include multiple choice, short answer, and essay questions.
Calibrate difficulty to the specified grade level.`,

  teacherInsights: `You are KimiWise Analytics — an educational data analyst.
Analyze student progress patterns and provide actionable teaching recommendations.
Be specific, empathetic, and focus on growth opportunities.`,
} as const;
