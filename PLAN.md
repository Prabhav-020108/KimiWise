# KimiWise — Project Plan

> **Hacktoberfest Hack Day Bengaluru 2026**
> Track 01: Best Use of Gemma 4 | **G3. Multimodal AI Intelligence**
> Team: *Your Team Name*
> Development Window: 13–18 October 2026

---

## 1. Project Vision

**KimiWise** is an AI-powered smart classroom platform that uses **Gemma 4** to deliver multimodal, inclusive education. Teachers speak — the board builds itself. Students photograph handwritten code — the AI tutors them. Everything works across text, voice, and images.

### Why G3 — Multimodal AI Intelligence?

Our solution combines **three input modalities** and reasons across all of them:

| Modality | Feature | Gemma 4 Usage |
|----------|---------|---------------|
| 🖼️ **Image** | Handwritten code OCR → analysis → tutoring | Gemma 4 Vision reads photos of handwritten code from notebooks |
| 🎙️ **Voice** | Voice-first teaching & learning | Speech-to-text transcription → Gemma 4 processes intent → generates board content / tutoring response |
| 📝 **Text** | AI chat, code editor, lesson planning | Direct Gemma 4 text generation for explanations, quizzes, feedback |

The AI doesn't just handle these modalities in isolation — it **reasons across them**. A teacher can speak a lesson, the AI generates visual content on the whiteboard, and students can photograph their work for instant AI-powered feedback.

### Elevator Pitch

> *"KimiWise is where a teacher's voice becomes a living whiteboard, and a student's notebook photo becomes an AI tutor. Powered by Gemma 4 multimodal intelligence."*

---

## 2. Feature Map — What We Take From Each Reference

> **IMPORTANT:** The two reference projects (`codebuddy-main/` and `trido-main/`) are **private references only**. They will NOT be committed to the GitHub repository. All code in the final `KimiWise` repo is written from scratch, inspired by these projects.

### From CodeBuddy (Reference A — Python/FastAPI/Gradio)

| Feature | What We Adapt | How We Rebuild |
|---------|---------------|----------------|
| **Handwritten Code OCR** | Photo → Gemma 4 Vision → code extraction | Rewrite as a TypeScript Express API route using `@google/genai` SDK |
| **AI Tutor Chat** | Multi-turn coding tutor with context | Rewrite as React chat component + Express AI endpoint |
| **Code Executor Sandbox** | Safe Python code execution + output | Implement client-side sandboxed execution (JS) or server-side isolated runner |
| **Voice Mode (STT/TTS)** | Record question → AI answers with audio | Use Web Speech API (browser-native) + Gemma 4 for processing |
| **Teacher Dashboard** | Track student progress, AI insights | Rewrite as React dashboard view with Zustand state |
| **Multi-language Support** | Regional language explanations | Gemma 4 multilingual prompting in the AI service layer |

### From Trido (Reference B — React/Vite/Express/TypeScript)

| Feature | What We Adapt | How We Rebuild |
|---------|---------------|----------------|
| **Interactive Whiteboard Canvas** | Fabric.js canvas with drawing tools | Build our own canvas component inspired by the patterns |
| **Voice Island UI** | Floating voice control with waveform | Build a similar voice interaction bar component |
| **AI Agent System** | Multi-agent orchestrator + tool calling | Create our own agent architecture with Gemma 4 function calling |
| **Smart Board Tools** | Quiz, Timer, Calculator, Mermaid diagrams | Selectively implement the most impactful tools |
| **Real-time Collaboration** | Socket.IO room sync for live teaching | Implement basic room sharing |
| **Lesson Planning** | AI-generated lesson plans with phases | Build lesson flow engine |
| **Premium UI/UX** | Dark theme, glassmorphism, GSAP animations, Inter font | Adopt the design language and polish level |
| **Vercel Deployment** | Serverless API routes + static frontend | Use same pattern for deployability |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        KimiWise                             │
├──────────────────────┬──────────────────────────────────────┤
│     FRONTEND         │           BACKEND (Express)          │
│  (React + Vite + TS) │                                      │
│                      │  ┌────────────────────────────────┐  │
│  ┌────────────────┐  │  │  AI Service Layer              │  │
│  │ Smart Board    │  │  │  ├─ Gemma 4 Adapter (primary)  │  │
│  │ (Fabric.js     │  │  │  ├─ Gemini Flash (fallback)    │  │
│  │  Canvas)       │──┼──│  └─ Ollama Local (offline)     │  │
│  ├────────────────┤  │  ├────────────────────────────────┤  │
│  │ Voice Island   │  │  │  Feature Endpoints             │  │
│  │ (Web Speech +  │──┼──│  ├─ /api/ai/generate           │  │
│  │  Waveform)     │  │  │  ├─ /api/ai/ocr               │  │
│  ├────────────────┤  │  │  ├─ /api/ai/tutor              │  │
│  │ Code Lab       │  │  │  ├─ /api/ai/transcribe         │  │
│  │ (Editor +      │──┼──│  ├─ /api/ai/lesson-plan        │  │
│  │  Sandbox)      │  │  │  └─ /api/ai/quiz               │  │
│  ├────────────────┤  │  ├────────────────────────────────┤  │
│  │ AI Chat Panel  │  │  │  Tool Router                   │  │
│  │ (Multi-turn)   │──┼──│  (Function calling for canvas  │  │
│  ├────────────────┤  │  │   actions, code gen, diagrams) │  │
│  │ Teacher View   │  │  └────────────────────────────────┘  │
│  │ (Dashboard +   │  │                                      │
│  │  Analytics)    │  │  Vercel Serverless: api/*.ts         │
│  └────────────────┘  │                                      │
├──────────────────────┴──────────────────────────────────────┤
│  State: Zustand  │  Styling: Tailwind CSS 4                 │
│  Deploy: Vercel  │  Fonts: Inter, JetBrains Mono            │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 19 + Vite + TypeScript | Modern, fast, great DX |
| Styling | Tailwind CSS 4 | Rapid premium UI development |
| Canvas | Fabric.js 5 | Proven interactive whiteboard library |
| State | Zustand | Lightweight, scalable global state |
| Backend | Express 5 + TypeScript | API routes, AI orchestration |
| AI Primary | Gemma 4 via `@google/genai` SDK | **Track requirement** — meaningful Gemma 4 usage |
| AI Fallback | Gemini Flash via same SDK | Cloud reliability |
| Voice | Web Speech API (browser-native) | Zero-dependency, works everywhere |
| Realtime | Socket.IO | Live board collaboration |
| Deploy | Vercel (frontend + serverless API) | Free tier, instant deploys, required by rules |
| Code Editor | Monaco Editor or CodeMirror | Rich code editing in Code Lab |

---

## 4. Page & Component Structure

```
src/
├── index.html                    # Entry point
├── index.tsx                     # React root
├── index.css                     # Global styles + Tailwind
├── App.tsx                       # Root app with router
├── constants.ts                  # AI model config, defaults
├── store.ts                      # Zustand global store
├── types.ts                      # TypeScript interfaces
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Top bar with logo, nav, AI status
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── MobileNav.tsx         # Responsive nav
│   │
│   ├── board/
│   │   ├── CanvasManager.tsx     # Fabric.js whiteboard engine
│   │   ├── DrawingToolbar.tsx    # Pen, shapes, text, eraser
│   │   └── DomOverlay.tsx        # HTML overlays on canvas
│   │
│   ├── voice/
│   │   ├── VoiceIsland.tsx       # Floating voice bar + waveform
│   │   ├── AudioVisualizer.tsx   # Real-time audio waveform
│   │   └── useVoice.ts           # Voice recording hook
│   │
│   ├── chat/
│   │   ├── ChatPanel.tsx         # AI chat drawer
│   │   ├── ChatMessage.tsx       # Individual message bubble
│   │   └── ChatInput.tsx         # Input with file/image attach
│   │
│   ├── codelab/
│   │   ├── CodeEditor.tsx        # Code editor component
│   │   ├── CodeOutput.tsx        # Execution output panel
│   │   ├── OCRUpload.tsx         # Photo upload → OCR → editor
│   │   └── CodeTutor.tsx         # AI tutoring for code
│   │
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx  # Student progress overview
│   │   ├── LessonPlanner.tsx     # AI lesson plan generator
│   │   └── StudentCard.tsx       # Individual student stats
│   │
│   ├── tools/
│   │   ├── QuizTool.tsx          # Interactive quiz generator
│   │   ├── TimerTool.tsx         # Classroom timer
│   │   └── DiagramTool.tsx       # Mermaid/flowchart renderer
│   │
│   └── shared/
│       ├── Toast.tsx             # Notification toasts
│       ├── Modal.tsx             # Reusable modal
│       ├── Button.tsx            # Design system button
│       └── ErrorBoundary.tsx     # React error boundary
│
├── hooks/
│   ├── useAiStatus.ts            # AI connection health
│   ├── useVoice.ts               # Voice recording & STT
│   └── useCanvas.ts              # Canvas state management
│
├── services/
│   ├── aiService.ts              # Frontend AI API client
│   ├── canvasService.ts          # Canvas serialization
│   └── storageService.ts         # Local storage / IndexedDB
│
├── server/
│   ├── aiRouter.ts               # Express AI routes
│   ├── gemmaAdapter.ts           # Gemma 4 / Gemini adapter
│   ├── ollamaAdapter.ts          # Ollama local adapter
│   ├── ocrService.ts             # Image → code extraction
│   ├── tutorService.ts           # AI tutoring logic
│   └── toolRouter.ts             # Function calling / tool use
│
├── api/                          # Vercel serverless functions
│   └── ai/
│       ├── generate.ts
│       ├── ocr.ts
│       ├── tutor.ts
│       └── transcribe.ts
│
└── public/
    ├── favicon.svg
    └── assets/
```

---

## 5. Commit Strategy — Meaningful History

> **IMPORTANT:** Each commit below is a logical, meaningful unit of work. When building, make these commits in order to create a clean, professional Git history that looks like natural development.

### Phase 1: Project Foundation (Commits 1–4)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **1** | `feat: initialize project with Vite, React, TypeScript` | `npm create vite`, base config, `package.json`, `tsconfig.json`, `.gitignore`, `README.md` |
| **2** | `feat: add Tailwind CSS, design tokens, and global styles` | Tailwind setup, `index.css` with custom tokens (colors, fonts, spacing), Inter + JetBrains Mono fonts |
| **3** | `feat: add project structure, types, constants, and Zustand store` | `types.ts`, `constants.ts`, `store.ts` — core data models, AI config, global state |
| **4** | `feat: add layout shell — header, sidebar, responsive navigation` | `Header.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `App.tsx` with basic routing |

### Phase 2: Core AI Backend (Commits 5–8)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **5** | `feat: add Express server with Gemma 4 AI adapter` | `server.ts`, `server/gemmaAdapter.ts` — Gemma 4 via `@google/genai` SDK, model config, generate endpoint |
| **6** | `feat: add AI router with generate, OCR, and tutor endpoints` | `server/aiRouter.ts` — `/api/ai/generate`, `/api/ai/ocr`, `/api/ai/tutor` routes |
| **7** | `feat: add Ollama local adapter for offline AI support` | `server/ollamaAdapter.ts` — local Gemma 4 via Ollama as fallback |
| **8** | `feat: add AI tool router with function calling support` | `server/toolRouter.ts` — Gemma 4 function calling for canvas actions, code generation, diagram creation |

### Phase 3: Interactive Whiteboard (Commits 9–11)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **9** | `feat: add Fabric.js canvas manager and drawing engine` | `components/board/CanvasManager.tsx` — whiteboard with pan, zoom, basic drawing |
| **10** | `feat: add drawing toolbar with shapes, pen, text, and eraser` | `components/board/DrawingToolbar.tsx` — full toolbar with tool selection |
| **11** | `feat: add DOM overlay system for rich content on canvas` | `components/board/DomOverlay.tsx` — HTML elements (charts, code blocks, images) overlaid on canvas |

### Phase 4: Voice-First AI Interaction (Commits 12–14)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **12** | `feat: add voice recording hook with Web Speech API` | `hooks/useVoice.ts` — recording, STT transcription, silence detection |
| **13** | `feat: add Voice Island floating bar with audio waveform` | `components/voice/VoiceIsland.tsx`, `AudioVisualizer.tsx` — floating voice control UI |
| **14** | `feat: integrate voice commands with AI board generation` | Connect voice → transcribe → Gemma 4 → canvas actions pipeline |

### Phase 5: Code Lab — Multimodal Code Tutoring (Commits 15–18)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **15** | `feat: add code editor component with syntax highlighting` | `components/codelab/CodeEditor.tsx` — Monaco or CodeMirror integration |
| **16** | `feat: add OCR upload — photograph handwritten code for analysis` | `components/codelab/OCRUpload.tsx` — camera/file upload → Gemma 4 Vision → extracted code |
| **17** | `feat: add AI code tutor with multi-turn conversation` | `components/codelab/CodeTutor.tsx` — tutoring chat scoped to the code context |
| **18** | `feat: add sandboxed code execution with output display` | `components/codelab/CodeOutput.tsx` — safe JS execution, output rendering |

### Phase 6: AI Chat & Lesson Tools (Commits 19–22)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **19** | `feat: add AI chat panel with multi-turn conversation` | `components/chat/ChatPanel.tsx`, `ChatMessage.tsx`, `ChatInput.tsx` |
| **20** | `feat: add teacher dashboard with student progress tracking` | `components/teacher/TeacherDashboard.tsx`, `StudentCard.tsx` |
| **21** | `feat: add AI-powered lesson plan generator` | `components/teacher/LessonPlanner.tsx` — Gemma 4 creates structured lesson flows |
| **22** | `feat: add interactive quiz tool with AI question generation` | `components/tools/QuizTool.tsx` — auto-generate quizzes from lesson content |

### Phase 7: Polish & Deploy (Commits 23–27)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **23** | `feat: add Vercel serverless API routes for production` | `api/ai/*.ts` — serverless wrappers for all AI endpoints |
| **24** | `feat: add session persistence with IndexedDB` | `services/storageService.ts` — save/load board sessions locally |
| **25** | `style: add animations, transitions, and micro-interactions` | GSAP/Motion animations, hover effects, loading states, skeleton screens |
| **26** | `docs: add comprehensive README with setup, architecture, and demo` | Full `README.md` with screenshots, architecture diagram, setup guide |
| **27** | `chore: add environment config, Vercel deployment, and CI` | `.env.example`, `vercel.json`, deployment configuration |

### Bonus Commits (if time permits)

| # | Commit Message | What's Included |
|---|---------------|-----------------|
| **28** | `feat: add Socket.IO real-time board collaboration` | Live room sharing for teacher-student sync |
| **29** | `feat: add multilingual AI support for regional languages` | Language selector, Gemma 4 multilingual prompting |
| **30** | `feat: add diagram tool with Mermaid.js rendering` | AI generates diagrams from text/voice descriptions |

---

## 6. Deployment Plan

### Live URL Requirement
The hackathon requires a **working live deployment URL**. Plan:

```
Production Deploy:
├── Frontend: Vercel (static build from dist/)
├── API: Vercel Serverless Functions (api/ai/*.ts)
├── AI: Google AI Studio API (Gemma 4 cloud endpoint)
└── Domain: kimiwise.vercel.app (auto-assigned)
```

### Environment Variables (Production)

```env
# Google AI Studio (Gemma 4)
GOOGLE_AI_API_KEY=your_api_key_here

# Optional: Ollama for local dev
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b

# App
NODE_ENV=production
PORT=3000
```

### Vercel Configuration

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

---

## 7. How Gemma 4 Is Meaningfully Used

> **CRITICAL:** The judging panel will evaluate "meaningful use of Gemma 4." Here's how we demonstrate it deeply across all features.

| Feature | Gemma 4 Capability | Depth |
|---------|--------------------|----|
| **Handwritten Code OCR** | Gemma 4 Vision — reads photos of handwritten code | Image understanding, not just OCR — it understands code structure |
| **Voice → Board Generation** | Text generation from transcribed speech | Generates structured canvas content (shapes, text, diagrams) from natural language |
| **AI Code Tutoring** | Multi-turn conversation with code context | Explains errors, suggests fixes, adapts to student level |
| **Function Calling** | Gemma 4 tool use for canvas actions | AI calls structured functions to create shapes, write text, generate diagrams |
| **Lesson Plan Generation** | Structured output generation | Creates phased lesson plans with content types and suggestions |
| **Quiz Generation** | Content-aware question creation | Generates contextually relevant quiz questions from lesson material |
| **Multilingual Support** | Gemma 4's 140+ language capability | Explanations in regional languages for inclusive education |
| **Teacher Insights** | Analytical reasoning over student data | AI suggests teaching strategies based on student progress patterns |

---

## 8. File Protection — Reference Projects

> **CAUTION:** The reference projects MUST NOT be committed to GitHub.

### .gitignore Entries

```gitignore
# Reference projects — DO NOT COMMIT
codebuddy-main/
trido-main/
```

### Verification Checklist
- [ ] `codebuddy-main/` is in `.gitignore`
- [ ] `trido-main/` is in `.gitignore`
- [ ] `git status` shows neither directory
- [ ] No import/require paths reference these directories
- [ ] All code in the repo is original work

---

## 9. Pre-Arrival Checklist

- [ ] GitHub repo is **public** with clean commit history
- [ ] Live deployment URL is working on Vercel
- [ ] Gemma 4 Vision OCR demo works (photo → code)
- [ ] Voice → board generation demo works
- [ ] AI chat with code tutoring demo works
- [ ] Teacher dashboard shows meaningful data
- [ ] `.env.example` is committed (no secrets)
- [ ] `README.md` has architecture, setup, and demo instructions
- [ ] All reference project folders are gitignored

---

## 10. Demo Script (3 min)

### 0:00–0:30 — Hook
> *"What if a teacher could just speak, and the whiteboard comes alive? What if a student could photograph their notebook, and an AI tutor appears?"*
> Show: Teacher speaks → board auto-generates a math lesson with diagrams.

### 0:30–1:15 — Multimodal: Voice + Board
> Demonstrate voice-first interaction: Teacher says "Create a flowchart explaining photosynthesis" → Gemma 4 processes → canvas renders the flowchart.

### 1:15–2:00 — Multimodal: Image + Code Tutoring
> Student photographs handwritten Python code → Gemma 4 Vision reads it → identifies a loop error → AI tutor explains the fix with an interactive code editor.

### 2:00–2:30 — Teacher Intelligence
> Show teacher dashboard: Student progress tracking, AI-generated insights ("3 students are struggling with loops — try explaining with a staircase analogy").

### 2:30–3:00 — Closing
> *"KimiWise: Where every voice becomes a lesson, and every notebook becomes a tutor. Powered by Gemma 4 multimodal intelligence."*

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Gemma 4 API rate limits | Fallback to Gemini Flash; cache common responses |
| Voice recognition browser support | Graceful degradation to text input; test on Chrome |
| OCR accuracy on messy handwriting | Use Gemma 4 Vision with detailed prompts; provide "try again" option |
| Large canvas performance | Virtualize off-screen elements; debounce re-renders |
| Vercel serverless cold starts | Keep functions lightweight; use edge runtime where possible |
| Internet at venue | Pre-cache static assets; Ollama local fallback documented |

---

## 12. Build Order (For the Developer)

Execute in this exact order. Each step maps to the commit groups above.

1. **`npm create vite`** → scaffold → push Commit 1
2. **Tailwind + design system** → push Commit 2
3. **Types + Store + Constants** → push Commit 3
4. **Layout shell** → push Commit 4
5. **Express server + Gemma adapter** → push Commits 5–8
6. **Whiteboard canvas** → push Commits 9–11
7. **Voice system** → push Commits 12–14
8. **Code Lab (OCR + Editor + Tutor)** → push Commits 15–18
9. **Chat + Teacher + Tools** → push Commits 19–22
10. **Polish + Deploy** → push Commits 23–27

> **TIP:** You have until **3:30 PM IST on October 18** to submit. Start with the highest-impact features (Canvas + Voice + OCR) and add teacher tools later if time allows.

---

*KimiWise — Built for Hacktoberfest Hack Day Bengaluru 2026*
*Track 01: Best Use of Gemma 4 | G3: Multimodal AI Intelligence*
