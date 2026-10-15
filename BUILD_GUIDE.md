# KimiWise — Detailed Build Guide

> **Self-contained execution manual for two developers.**
> Any AI agent or developer can pick this up and build KimiWise from scratch.
> Last updated: 15 October 2026, 6:00 PM IST

---

## TABLE OF CONTENTS

1. [Problem Statement & Track](#1-problem-statement--track)
2. [What Is KimiWise](#2-what-is-kimiwise)
3. [Reference Projects Map](#3-reference-projects-map)
4. [Prerequisites & Environment Setup](#4-prerequisites--environment-setup)
5. [Developer Roles — Person A & Person B](#5-developer-roles--person-a--person-b)
6. [Phase 1 — Project Scaffold](#phase-1--project-scaffold-commit-1)
7. [Phase 2 — Design System & Global Styles](#phase-2--design-system--global-styles-commit-2)
8. [Phase 3 — Core Data Layer](#phase-3--core-data-layer-commit-3)
9. [Phase 4 — Layout Shell & Navigation](#phase-4--layout-shell--navigation-commit-4)
10. [Phase 5 — AI Backend Engine](#phase-5--ai-backend-engine-commits-5-8)
11. [Phase 6 — Interactive Whiteboard](#phase-6--interactive-whiteboard-commits-9-11)
12. [Phase 7 — Voice-First Interaction](#phase-7--voice-first-interaction-commits-12-14)
13. [Phase 8 — Code Lab (OCR + Editor + Tutor)](#phase-8--code-lab-ocr--editor--tutor-commits-15-18)
14. [Phase 9 — AI Chat & Lesson Tools](#phase-9--ai-chat--lesson-tools-commits-19-22)
15. [Phase 10 — Polish, Deploy & README](#phase-10--polish-deploy--readme-commits-23-27)
16. [Deployment Checklist](#deployment-checklist)
17. [Reference Code Lookup Table](#reference-code-lookup-table)

---

## 1. Problem Statement & Track

**Hackathon:** Hacktoberfest Hack Day Bengaluru 2026
**Track:** Track 01 — Best Use of Gemma 4
**Problem Statement:** G3. Multimodal AI Intelligence

> *"Build a solution that combines information such as text, images or audio to understand context and produce meaningful outcomes. Demonstrate reasoning across multiple input formats."*

### Why G3 fits KimiWise

KimiWise processes **three modalities simultaneously** and reasons across them:

| Modality | Concrete Feature | Gemma 4 Capability Used |
|----------|-----------------|------------------------|
| **Image** | Student photographs handwritten code → Gemma 4 Vision reads, extracts, and understands the code | `gemma-4` with image input (multimodal vision) |
| **Voice** | Teacher speaks → transcribed → Gemma 4 generates whiteboard content + lesson material | Text generation from transcribed speech with function calling |
| **Text** | Direct chat, code editing, lesson planning, quiz generation | Multi-turn conversation, structured output, function calling |

**Cross-modal reasoning example:** A teacher speaks "explain what's wrong with this student's code" while showing a photo of handwritten code. The AI sees the image (Vision), understands the spoken context (Voice→Text), and generates a visual explanation on the whiteboard (Function Calling → Canvas actions).

---

## 2. What Is KimiWise

**KimiWise** = AI-powered smart classroom platform combining:
- **Smart Whiteboard** — Interactive Fabric.js canvas where teachers draw and AI generates visual content from voice commands
- **Code Lab** — Students photograph handwritten code; Gemma 4 Vision reads it; AI tutors them through errors
- **Voice Island** — Floating voice control bar; teachers speak, the board builds itself
- **AI Chat** — Multi-turn conversation panel for questions, explanations, and lesson assistance
- **Teacher Dashboard** — Student progress tracking with AI-generated insights

**Tech Stack:** React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + Express 5 + Zustand + Fabric.js 5 + `@google/genai` SDK + Socket.IO

---

## 3. Reference Projects Map

Two reference projects exist in the workspace at:
- `codebuddy-main/codebuddy-main/` — Python FastAPI + Gradio AI coding tutor
- `trido-main/trido-main/` — React/Vite/Express AI digital classroom

> **CRITICAL RULES:**
> 1. These folders are in `.gitignore` — they must NEVER be committed.
> 2. Do NOT copy files directly. Read them for patterns, logic, and prompts, then rewrite in TypeScript.
> 3. No import/require should ever reference these directories.

### What to reference from each project:

| Need | Reference Source | File to Study | What to Extract |
|------|-----------------|---------------|-----------------|
| Gemma 4 AI adapter (cloud) | Trido | `trido-main/trido-main/server/geminiAdapter.ts` | `@google/genai` SDK usage, image payload handling, function calling setup |
| Ollama local AI adapter | Trido | `trido-main/trido-main/server/ollamaAdapter.ts` | Local model calling, streaming, Ollama HTTP API pattern |
| AI tool definitions (function calling) | Trido | `trido-main/trido-main/server/aiTools.ts` | Tool schema format, `FunctionDeclaration` interface, system instruction builder |
| Express API router structure | Trido | `trido-main/trido-main/server/aiRouter.ts` | Route organization, auto/gemini/ollama mode switching, error handling |
| Express server entry + Socket.IO | Trido | `trido-main/trido-main/server.ts` | Server bootstrap, Vite dev middleware, Socket.IO room setup |
| Vite config with Tailwind 4 | Trido | `trido-main/trido-main/vite.config.ts` | `@tailwindcss/vite` plugin, React plugin, env loading |
| Zustand store pattern | Trido | `trido-main/trido-main/store.ts` | Store shape, state slices, action patterns |
| TypeScript types | Trido | `trido-main/trido-main/types.ts` | `ChatMessage`, `AgentAction`, `AgentState`, canvas types |
| Tailwind 4 CSS theme with HSL tokens | Trido | `trido-main/trido-main/index.css` | `@theme` block, HSL color system, dark mode vars |
| index.html with fonts & libs | Trido | `trido-main/trido-main/index.html` | Google Fonts links, Fabric.js CDN, KaTeX CSS |
| Canvas whiteboard engine | Trido | `trido-main/trido-main/components/CanvasManager.tsx` | Fabric.js initialization, pan/zoom, tool handling |
| Drawing toolbar | Trido | `trido-main/trido-main/components/DrawingToolbar.tsx` | Tool button layout, tool state management |
| Voice Island + Waveform | Trido | `trido-main/trido-main/components/ProcessingStatusHud.tsx` | Floating voice UI, audio waveform visualizer |
| Chat UI | Trido | `trido-main/trido-main/components/ChatInterface.tsx` | Chat layout, message rendering, input handling |
| Quiz tool | Trido | `trido-main/trido-main/components/QuizTool.tsx` | Quiz generation, answer checking, UI pattern |
| OCR prompt engineering | CodeBuddy | `codebuddy-main/codebuddy-main/backend/services/ocr_service.py` | Image preprocessing strategy, OCR prompt patterns |
| LLM tutoring prompts | CodeBuddy | `codebuddy-main/codebuddy-main/backend/services/llm_service.py` | Tutor system prompts, multi-language instructions, hint levels |
| Code execution sandbox | CodeBuddy | `codebuddy-main/codebuddy-main/backend/services/code_executor.py` | Sandbox isolation approach, timeout handling |
| Agent tutoring pipeline | CodeBuddy | `codebuddy-main/codebuddy-main/backend/services/agent_service.py` | Multi-step agent pipeline: OCR → validate → execute → tutor |
| API schema design | CodeBuddy | `codebuddy-main/codebuddy-main/backend/api/schemas.py` | Request/response shapes for OCR, tutor, code exec, exercises |
| Teacher dashboard API | CodeBuddy | `codebuddy-main/codebuddy-main/backend/api/teacher.py` | Student progress endpoints, insight generation |
| Multi-language tutor config | CodeBuddy | `codebuddy-main/codebuddy-main/backend/services/llm_service.py` lines 22-61 | `BAHASA_DAERAH` language configuration object — port this to TypeScript |
| Frontend Gradio layout (design ideas) | CodeBuddy | `codebuddy-main/codebuddy-main/frontend/app.py` | Tab layout, CSS color tokens (adapt), feature flow |

---

## 4. Prerequisites & Environment Setup

### System Requirements

```
Node.js >= 20.x (LTS)
npm >= 10.x
Git
Google Chrome (for Web Speech API testing)
```

### Required API Keys

```env
# REQUIRED — Get from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL — For local AI (offline mode)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b
```

### Install All Dependencies (run AFTER Phase 1 scaffold)

```bash
npm install
```

### Full dependency list (what goes in package.json):

**Production dependencies:**
```json
{
  "@google/genai": "^1.34.0",
  "@tailwindcss/typography": "^0.5.19",
  "@tailwindcss/vite": "^4.2.2",
  "clsx": "^2.1.1",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "fabric": "^5.3.1",
  "gsap": "^3.15.0",
  "lucide-react": "^1.8.0",
  "motion": "^12.38.0",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "react-markdown": "^10.1.0",
  "rehype-katex": "^7.0.1",
  "remark-gfm": "^4.0.1",
  "remark-math": "^6.0.0",
  "socket.io": "^4.8.3",
  "socket.io-client": "^4.8.3",
  "tailwind-merge": "^3.5.0",
  "tailwindcss": "^4.2.2",
  "tsx": "^4.21.0",
  "zustand": "^5.0.9"
}
```

**Dev dependencies:**
```json
{
  "@types/express": "^5.0.6",
  "@types/node": "^22.14.0",
  "@vitejs/plugin-react": "^5.0.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

---

## 5. Developer Roles — Person A & Person B

### Person A — Frontend & UI Lead

**Focus:** All React components, canvas, voice UI, styling, animations
**Phases owned:** 2 (Design System), 4 (Layout), 6 (Whiteboard), 7 (Voice), 9a (Chat UI, Teacher Dashboard UI)

### Person B — Backend & AI Lead

**Focus:** Express server, AI adapters, API routes, function calling, deployment
**Phases owned:** 5 (AI Backend), 8 (Code Lab), 9b (Lesson Planner logic, Quiz logic), 10 (Deploy)

### Shared Phases (work together)

- Phase 1 (Scaffold) — either person
- Phase 3 (Data Layer) — Person B writes types/store, Person A reviews
- Phase 10 (Polish) — both

### Timeline

```
Oct 15 (Today, Evening) : Phase 1–3 (Scaffold + Design + Data)     → Person B
Oct 15 (Today, Evening) : Phase 2 (Design System CSS)               → Person A
Oct 16 (Morning)        : Phase 4 (Layout Shell)                     → Person A
Oct 16 (Morning)        : Phase 5 (AI Backend)                       → Person B
Oct 16 (Afternoon)      : Phase 6 (Whiteboard)                       → Person A
Oct 16 (Afternoon)      : Phase 8 (Code Lab - OCR + Tutor)           → Person B
Oct 16 (Evening)        : Phase 7 (Voice)                            → Person A
Oct 16 (Evening)        : Phase 8 contd (Code Editor + Sandbox)      → Person B
Oct 17 (Morning)        : Phase 9 (Chat + Teacher + Quiz)            → Both
Oct 17 (Afternoon)      : Phase 10 (Polish + Deploy)                 → Both
Oct 17 (Evening)        : Testing + Bug fixes + README               → Both
Oct 18 (Hack Day)       : Demo prep + final submission by 3:30 PM    → Both
```

---

## Phase 1 — Project Scaffold (Commit 1)

**Owner:** Person B
**Commit:** `feat: initialize project with Vite, React, TypeScript`

### Steps

**Step 1.1 — Create Vite project**

```bash
cd c:\Users\Prabhav\Downloads\KimiWise
npx -y create-vite@latest ./ --template react-ts
```

> If prompted about non-empty directory, say yes. The `.gitignore`, `PLAN.md`, and reference folders already exist.

**Step 1.2 — Verify scaffold files exist**

Expected files after scaffold:
```
index.html
src/
  App.tsx
  App.css
  main.tsx
  vite-env.d.ts
package.json
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
```

**Step 1.3 — Restructure for our architecture**

Move files to match our structure. The goal is a flat `src/`-less layout (matching Trido's pattern for simpler imports):

```bash
# We'll keep things inside src/ for Vite convention but reorganize
```

Actually, keep the standard `src/` structure that Vite creates. It works fine with Vercel.

**Step 1.4 — Update package.json scripts**

Replace the scripts section:

```json
{
  "scripts": {
    "dev": "tsx watch src/server/server.ts",
    "dev:client": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "check": "tsc --noEmit",
    "start": "tsx src/server/server.ts"
  }
}
```

**Step 1.5 — Update .gitignore**

Ensure the `.gitignore` already in root includes all entries (it already does from our setup).

**Step 1.6 — Create initial README.md**

```markdown
# KimiWise

AI-powered smart classroom platform. Teachers speak — the board builds itself. Students photograph handwritten code — the AI tutors them.

**Track:** Best Use of Gemma 4 | G3: Multimodal AI Intelligence
**Event:** Hacktoberfest Hack Day Bengaluru 2026

## Setup

npm install
npm run dev

## Tech Stack

React 19 + Vite + TypeScript + Tailwind CSS 4 + Express + Gemma 4
```

**Step 1.7 — Install all dependencies**

```bash
npm install @google/genai @tailwindcss/typography @tailwindcss/vite clsx dotenv express fabric gsap lucide-react motion react-markdown rehype-katex remark-gfm remark-math socket.io socket.io-client tailwind-merge tailwindcss tsx zustand

npm install -D @types/express @types/node @vitejs/plugin-react typescript vite
```

**Step 1.8 — Commit**

```bash
git add -A
git commit -m "feat: initialize project with Vite, React, TypeScript"
git push origin main
```

### Expected Outcome
- Project scaffolded with Vite + React + TS
- All dependencies installed
- `npm run dev:client` starts the Vite dev server on `localhost:5173`
- Clean first commit on GitHub

---

## Phase 2 — Design System & Global Styles (Commit 2)

**Owner:** Person A
**Commit:** `feat: add Tailwind CSS, design tokens, and global styles`

### Steps

**Step 2.1 — Update `vite.config.ts`**

Reference: `trido-main/trido-main/vite.config.ts`

Create a Vite config with Tailwind 4 plugin and React:

```typescript
// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: Number(env.VITE_PORT || 5173),
      proxy: {
        '/api': {
          target: `http://localhost:${env.SERVER_PORT || 3000}`,
          changeOrigin: true,
        },
        '/socket.io': {
          target: `http://localhost:${env.SERVER_PORT || 3000}`,
          ws: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
```

**Step 2.2 — Create `src/index.css`**

Reference: `trido-main/trido-main/index.css` — adapt the HSL token system, but with KimiWise branding colors.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --font-display: "Inter Tight", ui-sans-serif, system-ui, sans-serif;

  /* KimiWise brand tokens */
  --color-kimi: #6366f1;         /* Indigo primary */
  --color-kimi-deep: #4f46e5;
  --color-kimi-light: #a5b4fc;

  /* Semantic HSL tokens */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-border: hsl(var(--border));
  --color-ring: hsl(var(--ring));
}

:root {
  --background: 220 20% 97%;
  --foreground: 224 71% 4%;
  --card: 0 0% 100%;
  --card-foreground: 224 71% 4%;
  --primary: 239 84% 67%;       /* Indigo-500 */
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14% 96%;
  --secondary-foreground: 224 71% 4%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  --accent: 220 14% 96%;
  --accent-foreground: 224 71% 4%;
  --destructive: 0 84% 60%;
  --border: 220 13% 91%;
  --ring: 239 84% 67%;
}

.dark {
  --background: 224 71% 4%;
  --foreground: 210 20% 98%;
  --card: 224 71% 4%;
  --card-foreground: 210 20% 98%;
  --primary: 239 84% 67%;
  --primary-foreground: 0 0% 100%;
  --secondary: 215 28% 17%;
  --secondary-foreground: 210 20% 98%;
  --muted: 215 28% 17%;
  --muted-foreground: 218 11% 65%;
  --accent: 215 28% 17%;
  --accent-foreground: 210 20% 98%;
  --destructive: 0 63% 31%;
  --border: 215 28% 17%;
  --ring: 239 84% 67%;
}

/* Base styles */
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background: var(--color-background);
  color: var(--color-foreground);
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); border-radius: 3px; }

/* Selection */
::selection { background: hsl(var(--primary) / 0.2); }
```

**Step 2.3 — Update `index.html`**

Reference: `trido-main/trido-main/index.html` — adapt fonts and meta tags.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KimiWise | AI Smart Classroom</title>
    <meta name="description" content="AI-powered smart classroom. Teachers speak, the board builds itself. Students photograph code, the AI tutors them. Powered by Gemma 4." />
    <meta name="theme-color" content="#6366f1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&family=Inter+Tight:wght@600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js" crossorigin></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2.4 — Create favicon**

Create `public/favicon.svg` — a simple KimiWise logo SVG:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#6366f1"/>
  <text x="16" y="22" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-weight="700" font-size="18">K</text>
</svg>
```

**Step 2.5 — Commit**

```bash
git add -A
git commit -m "feat: add Tailwind CSS, design tokens, and global styles"
git push origin main
```

### Expected Outcome
- Tailwind CSS 4 working with `@theme` tokens
- KimiWise indigo color scheme defined
- Light + dark mode HSL variables
- Google Fonts loading (Inter, JetBrains Mono)
- Fabric.js CDN loaded in index.html
- Vite proxy configured for API calls during development

---

## Phase 3 — Core Data Layer (Commit 3)

**Owner:** Person B
**Commit:** `feat: add project structure, types, constants, and Zustand store`

### Steps

**Step 3.1 — Create `src/types.ts`**

Reference: `trido-main/trido-main/types.ts` — adapt the types for KimiWise.

Define these core interfaces (rewrite, don't copy):

```typescript
// Key types to define:

// Canvas
export interface Point { x: number; y: number; }
export type CreatorTool = 'SELECT' | 'PENCIL' | 'ERASER' | 'TEXT' | 'RECTANGLE' | 'CIRCLE' | 'LINE' | 'ARROW';

// AI
export type AiProvider = 'gemma' | 'ollama' | 'unavailable';
export interface ChatMessage { role: 'user' | 'model'; text: string; model?: string; latencyMs?: number; }

// Agent
export interface AgentAction {
  id: string;
  type: 'CREATE_SHAPE' | 'WRITE_TEXT' | 'CREATE_SVG' | 'RENDER_HTML' | 'DELETE_OBJECT' | 'PAN_CAMERA';
  payload: any;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
}

export interface AgentState {
  isThinking: boolean;
  isActing: boolean;
  currentAction: string | null;
  agentMessage: string | null;
}

// Code Lab
export interface CodeSubmission {
  code: string;
  language: string;
  source: 'typed' | 'ocr' | 'voice';
  imageBase64?: string;
}

export interface TutorResponse {
  explanation: string;
  fixedCode?: string;
  hints: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

// Teacher
export interface Student {
  id: string;
  name: string;
  level: string;
  progress: number;
  recentActivity: string;
}

export interface LessonPlan {
  id: string;
  subject: string;
  topic: string;
  steps: LessonStep[];
}

export interface LessonStep {
  id: string;
  title: string;
  contentType: 'explanation' | 'diagram' | 'quiz' | 'exercise';
  status: 'planned' | 'completed';
  content: string;
}

// Voice
export interface VoiceConfig {
  autoStopSeconds: number;
  silenceDetectionTimeout: number;
  language: string;
}

// Window extensions
declare global {
  interface Window {
    fabric: any;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
```

**Step 3.2 — Create `src/constants.ts`**

Reference: `trido-main/trido-main/constants.ts` — adapt for KimiWise with Gemma 4.

```typescript
export const GEMMA_MODEL = 'gemma-4';
export const GEMINI_FLASH_MODEL = 'gemini-3.8-flash';
export const OLLAMA_MODEL = 'gemma4:e2b';

export const CONFIG = {
  ai: {
    gemma: {
      model: GEMMA_MODEL,
      apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      generateTimeoutMs: 120_000,
      generation: { temperature: 0.3, maxOutputTokens: 8192 },
    },
    ollama: {
      model: OLLAMA_MODEL,
      defaultBaseUrl: 'http://localhost:11434',
      generateTimeoutMs: 300_000,
      numCtx: 16384,
    },
    request: { retryCount: 2, retryBaseDelayMs: 400, bodyLimit: '50mb' },
  },
  server: {
    defaultPort: 3000,
    host: '0.0.0.0',
  },
  ui: {
    mobileBreakpointPx: 768,
    autoSaveDebounceMs: 3000,
  },
} as const;
```

**Step 3.3 — Create `src/store.ts`**

Reference: `trido-main/trido-main/store.ts` — create a Zustand store with KimiWise-specific slices.

```typescript
import { create } from 'zustand';
import { ChatMessage, AgentState, CreatorTool, Student, LessonPlan } from './types';

interface AppStore extends AgentState {
  // Navigation
  activeView: 'board' | 'codelab' | 'chat' | 'teacher' | 'settings';
  setActiveView: (view: AppStore['activeView']) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  // Canvas
  activeTool: CreatorTool;
  setActiveTool: (tool: CreatorTool) => void;
  canvasColor: string;

  // Voice
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  lastTranscript: string | null;
  setLastTranscript: (text: string | null) => void;

  // Code Lab
  currentCode: string;
  setCurrentCode: (code: string) => void;
  codeOutput: string;
  setCodeOutput: (output: string) => void;

  // Teacher
  students: Student[];
  setStudents: (students: Student[]) => void;
  activeLessonPlan: LessonPlan | null;
  setActiveLessonPlan: (plan: LessonPlan | null) => void;

  // AI Status
  aiProvider: 'gemma' | 'ollama' | 'unavailable';
  setAiProvider: (provider: AppStore['aiProvider']) => void;
  isAiOnline: boolean;
  setAiOnline: (online: boolean) => void;

  // Agent State (from AgentState interface)
  setThinking: (thinking: boolean) => void;
  setActing: (acting: boolean) => void;
  setAgentMessage: (msg: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Navigation
  activeView: 'board',
  setActiveView: (view) => set({ activeView: view }),

  // Theme
  theme: 'light',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

  // Chat
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  // Canvas
  activeTool: 'SELECT',
  setActiveTool: (tool) => set({ activeTool: tool }),
  canvasColor: 'transparent',

  // Voice
  isVoiceActive: false,
  setVoiceActive: (active) => set({ isVoiceActive: active }),
  lastTranscript: null,
  setLastTranscript: (text) => set({ lastTranscript: text }),

  // Code Lab
  currentCode: '',
  setCurrentCode: (code) => set({ currentCode: code }),
  codeOutput: '',
  setCodeOutput: (output) => set({ codeOutput: output }),

  // Teacher
  students: [],
  setStudents: (students) => set({ students }),
  activeLessonPlan: null,
  setActiveLessonPlan: (plan) => set({ activeLessonPlan: plan }),

  // AI
  aiProvider: 'gemma',
  setAiProvider: (provider) => set({ aiProvider: provider }),
  isAiOnline: false,
  setAiOnline: (online) => set({ isAiOnline: online }),

  // Agent
  isThinking: false,
  isActing: false,
  currentAction: null,
  agentMessage: null,
  setThinking: (thinking) => set({ isThinking: thinking }),
  setActing: (acting) => set({ isActing: acting }),
  setAgentMessage: (msg) => set({ agentMessage: msg }),
}));
```

**Step 3.4 — Create directory structure**

```bash
mkdir -p src/components/layout
mkdir -p src/components/board
mkdir -p src/components/voice
mkdir -p src/components/chat
mkdir -p src/components/codelab
mkdir -p src/components/teacher
mkdir -p src/components/tools
mkdir -p src/components/shared
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/server
mkdir -p api/ai
mkdir -p public/assets
```

**Step 3.5 — Commit**

```bash
git add -A
git commit -m "feat: add project structure, types, constants, and Zustand store"
git push origin main
```

### Expected Outcome
- All TypeScript types defined for the entire app
- Constants configured for Gemma 4 + Ollama
- Zustand store fully typed with all state slices
- Directory structure ready for component development
- `npm run check` passes with no type errors

---

## Phase 4 — Layout Shell & Navigation (Commit 4)

**Owner:** Person A
**Commit:** `feat: add layout shell — header, sidebar, responsive navigation`

### Steps

**Step 4.1 — Create `src/components/layout/Header.tsx`**

A top bar with:
- KimiWise logo + name on the left
- Navigation tabs: Board | Code Lab | Chat | Teacher
- AI status indicator (green dot = online, red = offline) on the right
- Theme toggle button

Use `lucide-react` icons. Reference Trido's `AiStatusBadge.tsx` for the status indicator pattern.

**Step 4.2 — Create `src/components/layout/Sidebar.tsx`**

A collapsible sidebar (shown on desktop, hidden on mobile) with:
- Icon-based nav matching the header tabs
- Tool shortcuts (Timer, Quiz)
- Settings link at bottom

**Step 4.3 — Create `src/components/shared/ErrorBoundary.tsx`**

Reference: `trido-main/trido-main/components/ErrorBoundary.tsx`

Standard React error boundary wrapping the app.

**Step 4.4 — Update `src/App.tsx`**

Main app component with:
- ErrorBoundary wrapper
- Header at top
- Content area that switches between views based on `activeView` from store
- Placeholder components for each view (will be built in later phases)

```tsx
// Pseudo-structure:
<ErrorBoundary>
  <div className="h-screen flex flex-col">
    <Header />
    <main className="flex-1 overflow-hidden">
      {activeView === 'board' && <BoardView />}
      {activeView === 'codelab' && <CodeLabView />}
      {activeView === 'chat' && <ChatView />}
      {activeView === 'teacher' && <TeacherView />}
    </main>
  </div>
</ErrorBoundary>
```

Create placeholder components for each view that just show the view name. They'll be replaced in later phases.

**Step 4.5 — Update `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 4.6 — Verify visually**

Run `npm run dev:client` and confirm:
- Header renders with logo, nav tabs, AI status
- Clicking tabs switches the active view
- Responsive on mobile
- Dark/light theme toggle works

**Step 4.7 — Commit**

```bash
git add -A
git commit -m "feat: add layout shell — header, sidebar, responsive navigation"
git push origin main
```

### Expected Outcome
- Full layout shell visible in browser
- Navigation between views works
- Responsive design on mobile/desktop
- Theme toggle functional
- AI status badge shows (offline initially)

---

## Phase 5 — AI Backend Engine (Commits 5–8)

**Owner:** Person B
**4 commits — build one at a time**

### Commit 5: `feat: add Express server with Gemma 4 AI adapter`

**Step 5.1 — Create `src/server/server.ts`**

Reference: `trido-main/trido-main/server.ts` lines 1–60 for the Express+Vite setup pattern.

```typescript
// Key structure:
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { aiRouter } from './aiRouter';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/ai', aiRouter);

// In production, serve the Vite build
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')));
}

httpServer.listen(PORT, () => {
  console.log(`KimiWise server running on port ${PORT}`);
});
```

**Step 5.2 — Create `src/server/gemmaAdapter.ts`**

Reference: `trido-main/trido-main/server/geminiAdapter.ts` — study the `@google/genai` SDK usage pattern.

This is the CORE AI file. It must:
1. Initialize `GoogleGenAI` client with API key
2. Handle text-only generation
3. Handle multimodal generation (text + image for OCR)
4. Support function calling (tool use) for canvas actions
5. Parse base64 image payloads correctly

```typescript
import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../constants';

const getClient = (customKey?: string) =>
  new GoogleGenAI({ apiKey: customKey || process.env.GEMINI_API_KEY || '' });

// Function: generateText(prompt, history?, systemInstruction?)
// Function: generateWithImage(prompt, imageBase64, mimeType)
// Function: generateWithTools(prompt, tools, canvasImage?, history?)
```

Study the `extractImagePayload` function in geminiAdapter.ts — the base64 parsing logic is critical for OCR.

**Step 5.3 — Create `tsconfig.server.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist-server",
    "rootDir": "src/server",
    "skipLibCheck": true
  },
  "include": ["src/server/**/*"]
}
```

**Step 5.4 — Create `.env.example`**

```env
# Required: Google AI Studio API key for Gemma 4
# Get yours at https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Optional: Ollama for local/offline AI
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b

# Server
PORT=3000
NODE_ENV=development
```

**Step 5.5 — Commit**

```bash
git add -A
git commit -m "feat: add Express server with Gemma 4 AI adapter"
git push origin main
```

---

### Commit 6: `feat: add AI router with generate, OCR, and tutor endpoints`

**Step 6.1 — Create `src/server/aiRouter.ts`**

Reference: `trido-main/trido-main/server/aiRouter.ts` lines 1–60 for the router structure and mode-switching logic.

Endpoints to implement:

```
POST /api/ai/generate     — General AI text generation
POST /api/ai/ocr          — Image → code extraction (Gemma 4 Vision)
POST /api/ai/tutor        — Code tutoring with multi-turn chat
POST /api/ai/lesson-plan  — Generate structured lesson plan
POST /api/ai/quiz         — Generate quiz from topic
GET  /api/ai/status       — Check AI connection health
```

Each endpoint:
1. Validates request body
2. Calls the appropriate adapter function (gemma or ollama)
3. Returns structured JSON response
4. Has error handling with meaningful error codes

**Step 6.2 — Implement OCR endpoint logic**

Reference: `codebuddy-main/codebuddy-main/backend/services/llm_service.py` for the prompt engineering.

The OCR endpoint receives a base64 image and uses Gemma 4 Vision:

```typescript
// Prompt pattern for OCR (adapted from CodeBuddy's agent_service.py):
const OCR_SYSTEM_PROMPT = `You are a code OCR expert. You receive a photo of handwritten code.
Extract the code exactly as written. Preserve indentation.
Return ONLY the extracted code, no explanation.
If you cannot read parts, use [UNCLEAR] as placeholder.
Output format: raw code text only.`;
```

**Step 6.3 — Implement tutor endpoint logic**

Reference: `codebuddy-main/codebuddy-main/backend/services/llm_service.py` lines 73+ for the `GemmaService` tutoring patterns.

```typescript
// Tutor system prompt (adapted from CodeBuddy):
const TUTOR_SYSTEM_PROMPT = `You are KimiWise, a friendly AI coding tutor.
- Explain concepts in simple, encouraging language
- When reviewing code, identify errors and explain them step-by-step
- Provide hints before full solutions
- Adapt your language complexity to the student's level
- Use analogies and examples from everyday life`;
```

**Step 6.4 — Commit**

```bash
git add -A
git commit -m "feat: add AI router with generate, OCR, and tutor endpoints"
git push origin main
```

---

### Commit 7: `feat: add Ollama local adapter for offline AI support`

**Step 7.1 — Create `src/server/ollamaAdapter.ts`**

Reference: `trido-main/trido-main/server/ollamaAdapter.ts` — study the Ollama HTTP API calling pattern.

Key functions:
- `probeOllama()` — check if Ollama is running at the configured URL
- `generateText()` — call Ollama's `/api/generate` endpoint
- `generateWithImage()` — call with image for vision tasks

```typescript
// Ollama API pattern:
// POST http://localhost:11434/api/generate
// Body: { model: "gemma4:e2b", prompt: "...", images: ["base64..."], stream: false }
```

**Step 7.2 — Update aiRouter to support mode switching**

Reference: `trido-main/trido-main/server/aiRouter.ts` lines 40–57 for the auto-detection logic.

Add provider auto-detection:
1. If `GEMINI_API_KEY` exists → use Gemma cloud
2. Else if Ollama probe succeeds → use Ollama local
3. Else → return error "No AI provider available"

**Step 7.3 — Commit**

```bash
git add -A
git commit -m "feat: add Ollama local adapter for offline AI support"
git push origin main
```

---

### Commit 8: `feat: add AI tool router with function calling support`

**Step 8.1 — Create `src/server/aiTools.ts`**

Reference: `trido-main/trido-main/server/aiTools.ts` — study the tool declaration format and system instruction builder.

Define tools for canvas actions:

```typescript
export const tools = [
  {
    name: 'write_text',
    description: 'Write text on the whiteboard canvas at a position',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text content to write' },
        x: { type: 'NUMBER', description: 'X position' },
        y: { type: 'NUMBER', description: 'Y position' },
        fontSize: { type: 'NUMBER', description: 'Font size in px' },
        color: { type: 'STRING', description: 'Text color hex' },
      },
      required: ['text', 'x', 'y'],
    },
  },
  {
    name: 'create_shape',
    description: 'Create a shape on the whiteboard',
    parameters: { /* ... */ },
  },
  {
    name: 'create_svg',
    description: 'Create an SVG diagram (flowchart, mind map, etc.)',
    parameters: { /* ... */ },
  },
  {
    name: 'render_html',
    description: 'Render rich HTML content on the canvas (code blocks, tables)',
    parameters: { /* ... */ },
  },
];
```

**Step 8.2 — Build system instruction generator**

Reference: `trido-main/trido-main/server/aiTools.ts` `buildSystemInstruction()` function.

Create a function that generates the system instruction telling the AI about the canvas state, available tools, and how to use them.

**Step 8.3 — Commit**

```bash
git add -A
git commit -m "feat: add AI tool router with function calling support"
git push origin main
```

### Expected Outcome After Phase 5
- `npm run dev` starts Express server on port 3000
- `GET /api/ai/status` returns `{ status: 'online', provider: 'gemma' }`
- `POST /api/ai/generate` with `{ prompt: "Hello" }` returns AI response
- `POST /api/ai/ocr` with `{ image: "base64..." }` extracts code
- `POST /api/ai/tutor` with `{ code: "...", question: "..." }` returns tutoring
- Ollama fallback works when API key is not set
- Function calling tools defined and tested

---

## Phase 6 — Interactive Whiteboard (Commits 9–11)

**Owner:** Person A

### Commit 9: `feat: add Fabric.js canvas manager and drawing engine`

Reference: `trido-main/trido-main/components/CanvasManager.tsx` — study canvas init, pan, zoom, and tool handling.

**Step 9.1 — Create `src/components/board/CanvasManager.tsx`**

Core whiteboard component:
- Initialize Fabric.js canvas on mount
- Infinite canvas with pan (middle-click drag or Ctrl+drag)
- Zoom with scroll wheel (min 10%, max 500%)
- Background color support
- Canvas serialization (toJSON/loadFromJSON)

**Step 9.2 — Create `src/components/board/BoardView.tsx`**

Full board view containing:
- CanvasManager (full screen)
- DrawingToolbar (floating left)
- VoiceIsland placeholder (floating bottom)

**Step 9.3 — Commit**

### Commit 10: `feat: add drawing toolbar with shapes, pen, text, and eraser`

Reference: `trido-main/trido-main/components/DrawingToolbar.tsx`

**Step 10.1 — Create `src/components/board/DrawingToolbar.tsx`**

Floating toolbar with icons for:
- Select (pointer)
- Pencil (freehand draw)
- Text
- Rectangle, Circle
- Line, Arrow
- Eraser
- Color picker
- Stroke width

Use `lucide-react` icons. The toolbar should be vertical, floating on the left side of the canvas.

**Step 10.2 — Commit**

### Commit 11: `feat: add DOM overlay system for rich content on canvas`

Reference: `trido-main/trido-main/components/DomOverlay.tsx`

**Step 11.1 — Create `src/components/board/DomOverlay.tsx`**

System for rendering HTML elements on top of the canvas:
- Code blocks with syntax highlighting
- Rich text cards
- Math equations (KaTeX)
- These move/scale with canvas pan/zoom

**Step 11.2 — Commit**

### Expected Outcome After Phase 6
- Interactive whiteboard with drawing tools
- Freehand pen, shapes, text all work
- Canvas pan/zoom is smooth
- DOM overlay can render HTML on canvas
- The board looks premium with the design system

---

## Phase 7 — Voice-First Interaction (Commits 12–14)

**Owner:** Person A

### Commit 12: `feat: add voice recording hook with Web Speech API`

**Step 12.1 — Create `src/hooks/useVoice.ts`**

Custom React hook wrapping the Web Speech API:
```typescript
// Returns:
// { isRecording, transcript, startRecording, stopRecording, error }
// Uses window.SpeechRecognition || window.webkitSpeechRecognition
// Supports continuous mode and silence detection
```

### Commit 13: `feat: add Voice Island floating bar with audio waveform`

Reference: `trido-main/trido-main/components/ProcessingStatusHud.tsx` and `AudioVisualizer.tsx`

**Step 13.1 — Create `src/components/voice/VoiceIsland.tsx`**

Floating bar at bottom center:
- Mic button (tap to record)
- Real-time waveform during recording
- Transcript preview
- Send button (sends transcript to AI)
- Cancel button

**Step 13.2 — Create `src/components/voice/AudioVisualizer.tsx`**

Canvas-based audio waveform that reacts to microphone input. Reference: `trido-main/trido-main/components/AudioVisualizer.tsx`

### Commit 14: `feat: integrate voice commands with AI board generation`

**Step 14.1 — Connect the pipeline**

voice recording → transcript → POST /api/ai/generate (with tools) → parse function calls → execute on canvas

This is where the magic happens. When a teacher says "draw a flowchart about photosynthesis," the system:
1. Captures speech → text
2. Sends to Gemma 4 with function calling tools
3. Gets back tool calls (create_svg, write_text, etc.)
4. Executes them on the Fabric.js canvas

### Expected Outcome After Phase 7
- Teacher can speak and see transcript
- Audio waveform animates during recording
- Voice commands create content on the whiteboard
- "Draw a circle" → circle appears on canvas
- "Write the title: Introduction to Biology" → text appears

---

## Phase 8 — Code Lab: OCR + Editor + Tutor (Commits 15–18)

**Owner:** Person B

### Commit 15: `feat: add code editor component with syntax highlighting`

**Step 15.1 — Create `src/components/codelab/CodeEditor.tsx`**

A code editor using a `<textarea>` with monospace font and basic syntax highlighting via CSS. Keep it simple — don't add Monaco (too heavy). Use JetBrains Mono font, line numbers, and tab support.

Alternatively, use a lightweight lib like `react-simple-code-editor` with Prism.js.

### Commit 16: `feat: add OCR upload — photograph handwritten code for analysis`

This is the **showstopper feature for the demo**.

**Step 16.1 — Create `src/components/codelab/OCRUpload.tsx`**

Component with:
- Camera capture button (mobile) / file upload button (desktop)
- Image preview with crop area
- "Analyze" button → sends to `/api/ai/ocr`
- Extracted code populates the CodeEditor
- Loading state with animation

Reference: `codebuddy-main/codebuddy-main/backend/services/ocr_service.py` for the OCR logic (but we use Gemma 4 Vision server-side, not PaddleOCR — simpler and more powerful).

**Step 16.2 — Wire up to backend**

The OCR endpoint uses Gemma 4 Vision:
```typescript
// Server-side: src/server/aiRouter.ts - OCR endpoint
// Takes: { image: "data:image/jpeg;base64,..." }
// Sends to Gemma 4 with vision prompt
// Returns: { code: "extracted_code", confidence: 0.95 }
```

### Commit 17: `feat: add AI code tutor with multi-turn conversation`

**Step 17.1 — Create `src/components/codelab/CodeTutor.tsx`**

Split-pane layout:
- Left: CodeEditor with the student's code
- Right: Chat-style tutor conversation

The tutor:
- Analyzes the code
- Identifies errors
- Gives progressive hints (from CodeBuddy's hint_level 1→2→3 pattern)
- Reference: `codebuddy-main/codebuddy-main/backend/api/schemas.py` `PermintaanHint` model

### Commit 18: `feat: add sandboxed code execution with output display`

**Step 18.1 — Create `src/components/codelab/CodeOutput.tsx`**

For JavaScript code: use `eval()` in an iframe sandbox
For Python code: use an online sandbox API or show "output would be:" with AI simulation

**Step 18.2 — Create `src/components/codelab/CodeLabView.tsx`**

Full Code Lab page combining:
- OCR Upload (top)
- Code Editor (left)
- Code Output (right-bottom)
- Code Tutor chat (right-top)

### Expected Outcome After Phase 8
- Student photographs handwritten code → code appears in editor
- AI tutor explains errors and gives hints
- Code can be executed with output shown
- The OCR → Tutor pipeline demonstrates multimodal AI reasoning

---

## Phase 9 — AI Chat & Lesson Tools (Commits 19–22)

**Owner:** Both (Person A does UI, Person B does AI logic)

### Commit 19: `feat: add AI chat panel with multi-turn conversation`

**Step 19.1 — Create `src/components/chat/ChatPanel.tsx`**

Reference: `trido-main/trido-main/components/ChatInterface.tsx` for layout patterns.

Full-screen chat view with:
- Message list with scroll
- User messages (right, blue bubbles)
- AI messages (left, gray bubbles with markdown rendering)
- Input bar with text field + image attach button + voice button
- Typing indicator during AI response

**Step 19.2 — Create `src/components/chat/ChatMessage.tsx`**

Reference: `trido-main/trido-main/components/ChatMessageItem.tsx`

Individual message component with:
- Markdown rendering via `react-markdown` + `remark-gfm`
- Code block syntax highlighting
- Copy button on code blocks
- Timestamp + model name badge

**Step 19.3 — Create `src/components/chat/ChatInput.tsx`**

Input component with:
- Expandable textarea
- Image attachment (for multimodal queries)
- Voice input button (reuses useVoice hook)
- Send button with Ctrl+Enter shortcut

### Commit 20: `feat: add teacher dashboard with student progress tracking`

**Step 20.1 — Create `src/components/teacher/TeacherDashboard.tsx`**

Reference: `codebuddy-main/codebuddy-main/backend/api/teacher.py` for the data model.

Dashboard with:
- Student cards in a grid
- Each card shows: name, level, progress bar, recent activity
- AI insight panel: "3 students struggling with loops — try the staircase analogy"
- Add student button

Uses demo data initially (hardcoded students for the demo).

**Step 20.2 — Create `src/components/teacher/StudentCard.tsx`**

Card component with:
- Avatar (generated from name initials)
- Name, level badge
- Progress bar (animated)
- Last activity timestamp

### Commit 21: `feat: add AI-powered lesson plan generator`

**Step 21.1 — Create `src/components/teacher/LessonPlanner.tsx`**

Reference: `trido-main/trido-main/types.ts` `LessonPlan` and `LessonStep` types.

Form:
- Subject input
- Topic input
- Grade level select
- "Generate Plan" button → calls `/api/ai/lesson-plan`

Result:
- Structured lesson plan with phases
- Each step is clickable to generate that content on the whiteboard
- Progress tracking (planned → completed)

### Commit 22: `feat: add interactive quiz tool with AI question generation`

Reference: `trido-main/trido-main/components/QuizTool.tsx`

**Step 22.1 — Create `src/components/tools/QuizTool.tsx`**

- Topic input
- "Generate Quiz" button → AI creates 5 questions
- Multiple choice UI with answer checking
- Score display
- Can be embedded in board or shown as modal

### Expected Outcome After Phase 9
- Chat works with multi-turn conversation and markdown
- Teacher dashboard shows student progress
- Lesson plans are generated by AI
- Quiz tool creates and grades quizzes
- All features use Gemma 4

---

## Phase 10 — Polish, Deploy & README (Commits 23–27)

**Owner:** Both

### Commit 23: `feat: add Vercel serverless API routes for production`

**Step 23.1 — Create `api/ai/generate.ts`**

```typescript
// Vercel serverless function wrapper
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Import and call the same logic as the Express endpoint
```

Create equivalent files for: `api/ai/ocr.ts`, `api/ai/tutor.ts`, `api/ai/status.ts`

**Step 23.2 — Create `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### Commit 24: `feat: add session persistence with IndexedDB`

**Step 24.1 — Create `src/services/storageService.ts`**

Use `idb-keyval` or raw IndexedDB to save/load:
- Board sessions (canvas JSON + messages)
- User preferences (theme, voice config)
- Student data

### Commit 25: `style: add animations, transitions, and micro-interactions`

**Step 25.1 — Add GSAP / Motion animations**

- Page transition animations
- Button hover effects
- Loading skeleton screens
- Toast notifications with slide-in
- Canvas tool switch animations
- Voice waveform pulse effect

### Commit 26: `docs: add comprehensive README with setup, architecture, and demo`

**Step 26.1 — Write full README.md**

Sections:
- Hero: Project name, tagline, screenshot
- Features with icons
- Architecture diagram (Mermaid or ASCII)
- Quick start guide
- Environment variables
- Tech stack table
- Team credits
- License (MIT)

### Commit 27: `chore: add environment config, Vercel deployment, and final checks`

**Step 27.1 — Deploy to Vercel**

```bash
npx -y vercel --prod
```

Set environment variables in Vercel dashboard:
- `GEMINI_API_KEY` = your key

**Step 27.2 — Verify deployment**

- [ ] Live URL loads
- [ ] AI chat works
- [ ] OCR works
- [ ] Voice works (requires HTTPS — Vercel provides this)
- [ ] Teacher dashboard shows data

### Expected Outcome After Phase 10
- App deployed and live on `kimiwise.vercel.app`
- Animations and polish make it look premium
- README is comprehensive
- All features working in production

---

## Deployment Checklist

Before submission at **3:30 PM IST on October 18:**

- [ ] GitHub repo is **public**: `https://github.com/Prabhav-020108/KimiWise`
- [ ] Live URL works: `https://kimiwise.vercel.app` (or assigned URL)
- [ ] `.env.example` committed (no actual secrets)
- [ ] `codebuddy-main/` not in any commit
- [ ] `trido-main/` not in any commit
- [ ] `git log --oneline` shows meaningful commit messages
- [ ] README has architecture + setup + demo instructions
- [ ] OCR feature works (photo → code → tutoring)
- [ ] Voice feature works (speak → board content)
- [ ] Chat feature works (multi-turn with Gemma 4)
- [ ] Teacher dashboard shows data
- [ ] No console errors in production

---

## Reference Code Lookup Table

Quick reference for when you need to find a specific pattern:

| I need to... | Look at this file |
|-------------|-------------------|
| Initialize `@google/genai` SDK | `trido-main/trido-main/server/geminiAdapter.ts` line 1, line 7 |
| Parse base64 image for Vision API | `trido-main/trido-main/server/geminiAdapter.ts` lines 25-34 |
| Set up Express + Vite dev server | `trido-main/trido-main/server.ts` lines 1-30 |
| Define function calling tools | `trido-main/trido-main/server/aiTools.ts` lines 1-100 |
| Build AI system instruction | `trido-main/trido-main/server/aiTools.ts` → `buildSystemInstruction()` |
| Route AI requests with mode switching | `trido-main/trido-main/server/aiRouter.ts` lines 40-60 |
| Call Ollama HTTP API | `trido-main/trido-main/server/ollamaAdapter.ts` |
| Set up Zustand store | `trido-main/trido-main/store.ts` lines 1-60 |
| Configure Tailwind 4 CSS | `trido-main/trido-main/index.css` lines 1-37 |
| Set up Vite with Tailwind plugin | `trido-main/trido-main/vite.config.ts` |
| Fabric.js canvas initialization | `trido-main/trido-main/components/CanvasManager.tsx` |
| Chat message rendering | `trido-main/trido-main/components/ChatMessageItem.tsx` |
| Chat interface layout | `trido-main/trido-main/components/ChatInterface.tsx` |
| Voice/audio waveform | `trido-main/trido-main/components/AudioVisualizer.tsx` |
| Quiz tool pattern | `trido-main/trido-main/components/QuizTool.tsx` |
| Write OCR vision prompt | `codebuddy-main/codebuddy-main/backend/services/ocr_service.py` |
| Write tutor system prompt | `codebuddy-main/codebuddy-main/backend/services/llm_service.py` lines 73+ |
| Multi-language config object | `codebuddy-main/codebuddy-main/backend/services/llm_service.py` lines 22-61 |
| Agent pipeline (OCR→validate→exec→tutor) | `codebuddy-main/codebuddy-main/backend/services/agent_service.py` |
| Code execution sandbox | `codebuddy-main/codebuddy-main/backend/services/code_executor.py` |
| API request/response schemas | `codebuddy-main/codebuddy-main/backend/api/schemas.py` |
| Teacher dashboard endpoints | `codebuddy-main/codebuddy-main/backend/api/teacher.py` |
| Gradio frontend CSS tokens | `codebuddy-main/codebuddy-main/frontend/app.py` lines 50-120 |

---

*This build guide is self-contained. Any developer or AI agent can follow it step-by-step to build KimiWise from scratch.*
