import { Router } from 'express';
import express from 'express';
import { CONFIG, SYSTEM_PROMPTS } from '../constants';
import {
  generateAgentActionsGemma,
  performOcrGemma,
  tutorCodeGemma,
  generateTextGemma,
  transcribeAudioGemma,
  generateLessonPlanGemma,
  generateQuizGemma,
  generateBoardLessonGemma,
} from './gemmaAdapter';
import {
  generateTextOllama,
  tutorCodeOllama,
  generateLessonPlanOllama,
  generateQuizOllama,
  probeOllama,
} from './ollamaAdapter';
import { executeToolCalls } from './toolRouter';

export const aiRouter = Router();

aiRouter.use(express.json({ limit: CONFIG.ai.request.bodyLimit }));

// ── AI Mode Resolution ────────────────────────────────────────────────────────

type AiMode = 'gemma' | 'ollama';

const resolveMode = (requested?: string): AiMode => {
  if (requested === 'ollama') return 'ollama';
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY);
  if (!hasKey) return 'ollama';
  return 'gemma';
};

// ── /api/ai/status — Health & availability probe ──────────────────────────────

aiRouter.get('/status', async (req, res) => {
  try {
    const hasGemmaKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY);
    const customOllamaUrl = req.query.ollamaUrl as string | undefined;
    const ollamaProbe = await probeOllama(customOllamaUrl);

    res.json({
      gemma: {
        available: hasGemmaKey,
        model: process.env.GEMMA_MODEL || CONFIG.ai.gemma.model,
        reason: hasGemmaKey ? 'api_key_present' : 'missing_api_key',
      },
      ollama: ollamaProbe,
      recommendedMode: hasGemmaKey ? 'gemma' : (ollamaProbe.online ? 'ollama' : 'unavailable'),
    });
  } catch (err) {
    res.status(500).json({ error: 'Status check failed', detail: String(err) });
  }
});

// ── /api/ai/generate — Main board agent (multimodal) ─────────────────────────

aiRouter.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      canvasImage,
      canvasObjects = [],
      viewport = { width: 1200, height: 800, zoom: 1 },
      highResImage,
      history = [],
      domElements = {},
      intent,
      mode,
      customKey,
      modelOverride,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const aiMode = resolveMode(mode);

    if (aiMode === 'gemma') {
      try {
        const result = await generateAgentActionsGemma(
          prompt,
          canvasImage || '',
          canvasObjects,
          viewport,
          highResImage,
          history,
          domElements,
          customKey,
          intent,
          modelOverride
        );

        const actions = executeToolCalls(result.functionCalls);
        let textResponse = result.textResponse?.trim();
        if (!textResponse) {
          textResponse = `I've created the whiteboard visual lesson for "${prompt}". Take a look at the interactive canvas!`;
        }

        return res.json({
          textResponse,
          actions,
          thought: result.thought,
          mode: 'gemma',
          model: modelOverride || process.env.GEMMA_MODEL || CONFIG.ai.gemma.model,
          usageMetadata: result.usageMetadata,
        });
      } catch (gemmaErr) {
        console.warn('[/api/ai/generate] Gemma function calling failed, trying text fallback:', gemmaErr);
        try {
          const text = await generateTextGemma(prompt, SYSTEM_PROMPTS.boardAgent, history, customKey, modelOverride);
          return res.json({
            textResponse: text,
            actions: [],
            mode: 'gemma',
            model: modelOverride || process.env.GEMMA_MODEL || CONFIG.ai.gemma.model,
          });
        } catch (textErr) {
          console.warn('[/api/ai/generate] Gemma text failed, falling back to Ollama:', textErr);
          const text = await generateTextOllama(prompt, SYSTEM_PROMPTS.boardAgent, history);
          return res.json({
            textResponse: text,
            actions: [],
            mode: 'ollama',
            model: CONFIG.ai.ollama.model,
          });
        }
      }
    } else {
      // Ollama fallback — text only (no function calling)
      const text = await generateTextOllama(prompt, SYSTEM_PROMPTS.boardAgent, history);
      return res.json({
        textResponse: text,
        actions: [],
        mode: 'ollama',
        model: CONFIG.ai.ollama.model,
      });
    }
  } catch (err) {
    console.error('[/api/ai/generate]', err);
    res.status(500).json({ error: 'AI generation failed', detail: String(err) });
  }
});

// ── /api/ai/ocr — Handwritten code photo → extracted code ────────────────────

aiRouter.post('/ocr', async (req, res) => {
  try {
    const { image, customKey, modelOverride } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'image (base64) is required' });
    }

    const result = await performOcrGemma(image, customKey, modelOverride);
    return res.json({ ...result, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/ocr]', err);
    res.status(500).json({ error: 'OCR failed', detail: String(err) });
  }
});

// ── /api/ai/tutor — AI code tutoring (multi-turn) ────────────────────────────

aiRouter.post('/tutor', async (req, res) => {
  try {
    const {
      message,
      code = '',
      language = 'python',
      history = [],
      mode,
      customKey,
      modelOverride,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const aiMode = resolveMode(mode);
    let response: string;

    if (aiMode === 'gemma') {
      try {
        response = await tutorCodeGemma(message, code, language, history, customKey, modelOverride);
      } catch (gemmaErr) {
        console.warn('[/api/ai/tutor] Gemma tutor failed, falling back to Ollama:', gemmaErr);
        response = await tutorCodeOllama(message, code, language, history);
      }
    } else {
      response = await tutorCodeOllama(message, code, language, history);
    }

    return res.json({ response, mode: aiMode });
  } catch (err) {
    console.error('[/api/ai/tutor]', err);
    res.status(500).json({ error: 'Tutor AI failed', detail: String(err) });
  }
});

// ── /api/ai/transcribe — Audio → text transcription ──────────────────────────

aiRouter.post('/transcribe', async (req, res) => {
  try {
    const { audio, customKey, modelOverride } = req.body;

    if (!audio || typeof audio !== 'string') {
      return res.status(400).json({ error: 'audio (base64) is required' });
    }

    const transcript = await transcribeAudioGemma(audio, customKey, modelOverride);
    return res.json({ transcript, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/transcribe]', err);
    res.status(500).json({ error: 'Transcription failed', detail: String(err) });
  }
});

// ── /api/ai/chat — General AI chat ───────────────────────────────────────────

aiRouter.post('/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      systemPrompt,
      mode,
      customKey,
      modelOverride,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const aiMode = resolveMode(mode);
    let response: string;

    if (aiMode === 'gemma') {
      try {
        response = await generateTextGemma(message, systemPrompt, history, customKey, modelOverride);
      } catch (gemmaErr) {
        console.warn('[/api/ai/chat] Gemma failed, falling back to Ollama:', gemmaErr);
        response = await generateTextOllama(message, systemPrompt, history);
      }
    } else {
      response = await generateTextOllama(message, systemPrompt, history);
    }

    return res.json({ response, mode: aiMode });
  } catch (err) {
    console.error('[/api/ai/chat]', err);
    res.status(500).json({ error: 'Chat AI failed', detail: String(err) });
  }
});

// ── /api/ai/lesson-plan — AI-generated lesson plan ───────────────────────────

aiRouter.post('/lesson-plan', async (req, res) => {
  try {
    const {
      subject,
      topic,
      gradeLevel,
      duration = 45,
      mode,
      customKey,
      modelOverride,
    } = req.body;

    if (!subject || !topic || !gradeLevel) {
      return res.status(400).json({ error: 'subject, topic, and gradeLevel are required' });
    }

    const aiMode = resolveMode(mode);
    let plan: unknown;

    if (aiMode === 'gemma') {
      try {
        plan = await generateLessonPlanGemma(subject, topic, gradeLevel, duration, customKey, modelOverride);
      } catch (gemmaErr) {
        console.warn('[/api/ai/lesson-plan] Gemma failed, falling back to Ollama:', gemmaErr);
        plan = await generateLessonPlanOllama(subject, topic, gradeLevel, duration);
      }
    } else {
      plan = await generateLessonPlanOllama(subject, topic, gradeLevel, duration);
    }

    if (!plan) {
      // Fallback default structured lesson plan if offline
      plan = {
        subject,
        topic,
        gradeLevel,
        steps: [
          { phase: 'intro', title: `Introduction to ${topic}`, contentType: 'mindmap', suggestion: `Review fundamentals and key concepts of ${topic}` },
          { phase: 'core', title: `Core Mechanics & Architecture`, contentType: 'flowchart', suggestion: `Walk through detailed algorithmic flow` },
          { phase: 'practice', title: `Hands-on Exercises`, contentType: 'quiz', suggestion: `Solve practice challenges in Code Lab` },
          { phase: 'closing', title: `Summary & Q&A`, contentType: 'text', suggestion: `Synthesize takeaways and assign homework` },
        ],
      };
    }

    return res.json({ plan, mode: aiMode });
  } catch (err) {
    console.error('[/api/ai/lesson-plan]', err);
    res.status(500).json({ error: 'Lesson plan generation failed', detail: String(err) });
  }
});

// ── /api/ai/quiz — AI-generated quiz ─────────────────────────────────────────

aiRouter.post('/quiz', async (req, res) => {
  try {
    const {
      topic,
      gradeLevel,
      questionCount = 5,
      mode,
      customKey,
      modelOverride,
    } = req.body;

    if (!topic || !gradeLevel) {
      return res.status(400).json({ error: 'topic and gradeLevel are required' });
    }

    const aiMode = resolveMode(mode);
    let quiz: unknown;

    if (aiMode === 'gemma') {
      try {
        quiz = await generateQuizGemma(topic, gradeLevel, questionCount, customKey, modelOverride);
      } catch (gemmaErr) {
        console.warn('[/api/ai/quiz] Gemma failed, falling back to Ollama:', gemmaErr);
        quiz = await generateQuizOllama(topic, gradeLevel, questionCount);
      }
    } else {
      quiz = await generateQuizOllama(topic, gradeLevel, questionCount);
    }

    if (!quiz) {
      quiz = {
        title: `${topic} Mastery Quiz`,
        questions: [
          { type: 'multiple_choice', question: `What is the primary foundation of ${topic}?`, options: ['Data representation', 'Syntax only', 'Hardware constraints', 'Manual calculation'], correctIndex: 0 },
          { type: 'multiple_choice', question: `Which methodology best optimizes ${topic}?`, options: ['Random testing', 'Algorithmic efficiency', 'Infinite recursion', 'Ignoring edge cases'], correctIndex: 1 },
          { type: 'essay', question: `Explain how ${topic} is applied in modern software engineering with a real-world example.`, expectedAnswer: 'Provide an architecture overview and implementation case.' },
        ],
      };
    }

    return res.json({ quiz, mode: aiMode });
  } catch (err) {
    console.error('[/api/ai/quiz]', err);
    res.status(500).json({ error: 'Quiz generation failed', detail: String(err) });
  }
});

// ── /api/ai/insights — Teacher insights from student data ───────────────────

aiRouter.post('/insights', async (req, res) => {
  try {
    const { students, customKey, modelOverride, mode } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'students array is required' });
    }

    const aiMode = resolveMode(mode);
    const studentSummary = students
      .map((s: { name: string; avgScore: number; areasToImprove?: string[] }) =>
        `- ${s.name}: avg score ${s.avgScore}%, struggling with: ${(s.areasToImprove || []).join(', ')}`
      )
      .join('\n');

    const prompt = `Based on these student progress metrics, provide 3 specific teaching recommendations:
${studentSummary}

Return a JSON array (no markdown):
[
  { "message": "...", "priority": "high|medium|low", "relatedStudents": ["name1"] }
]`;

    let insightsText: string;

    if (aiMode === 'gemma') {
      insightsText = await generateTextGemma(prompt, SYSTEM_PROMPTS.teacherInsights, [], customKey, modelOverride);
    } else {
      insightsText = await generateTextOllama(prompt, SYSTEM_PROMPTS.teacherInsights);
    }

    let insights: unknown[];
    try {
      insights = JSON.parse(insightsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      insights = [{ message: insightsText, priority: 'medium', relatedStudents: [] }];
    }

    return res.json({ insights, mode: aiMode });
  } catch (err) {
    console.error('[/api/ai/insights]', err);
    res.status(500).json({ error: 'Insights generation failed', detail: String(err) });
  }
});

// ── /api/ai/board-lesson — High-accuracy diagram + detailed lesson note card ──

aiRouter.post('/board-lesson', async (req, res) => {
  try {
    const { prompt, customKey, modelOverride } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const lesson = await generateBoardLessonGemma(prompt, customKey, modelOverride);
    if (!lesson) {
      return res.status(500).json({ error: 'Failed to generate structured board lesson' });
    }

    return res.json({ lesson, mode: 'gemma' });
  } catch (err) {
    console.error('[/api/ai/board-lesson]', err);
    res.status(500).json({ error: 'Board lesson generation failed', detail: String(err) });
  }
});

