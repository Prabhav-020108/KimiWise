<div align="center">

# 🎓 KimiWise

### AI-Powered Smart Classroom Platform

*Teachers speak — the board builds itself.*
*Students photograph handwritten code — the AI tutors them.*

[![Gemma 4](https://img.shields.io/badge/Powered%20by-Gemma%204-6366f1?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

**🏆 Hacktoberfest Hack Day Bengaluru 2026**
**Track 01 — Best Use of Gemma 4 · Problem G3: Multimodal AI Intelligence**

---

</div>

## ✨ What is KimiWise?

KimiWise is a multimodal AI classroom platform that combines **three modalities simultaneously**:

| Modality | Feature | Gemma 4 Capability |
|----------|---------|-------------------|
| 🖼️ **Image** | Photograph handwritten code → AI reads and understands it | Vision (multimodal input) |
| 🎙️ **Voice** | Teacher speaks → whiteboard builds itself | Speech → structured output + function calling |
| 💬 **Text** | Chat, tutoring, quiz generation, lesson planning | Multi-turn conversation, structured JSON output |

**Cross-modal reasoning in action:** A teacher says *"explain what's wrong with this student's code"* while showing a photo of handwritten code. KimiWise sees the image (Vision), understands the spoken context (Voice→Text), and generates a visual explanation on the whiteboard (Function Calling → Canvas actions).

---

## 🚀 Features

### 🖌️ Smart Whiteboard
- Infinite Fabric.js canvas with pan & zoom
- Freehand drawing, shapes, text, arrows
- **AI board generation** — speak a command, watch diagrams appear
- DOM overlay system for code blocks and math equations (KaTeX)
- AI agent draws flowcharts, mind maps, and diagrams on command

### 🔬 Code Lab (Showstopper Feature)
- 📸 **OCR** — photograph handwritten code → Gemma 4 Vision extracts it
- 🧑‍🏫 **AI Tutor** — multi-turn coding assistance with progressive hints
- 💻 **Code Editor** — syntax-highlighted editor with tab support
- ▶️ **Code Output** — sandboxed JavaScript execution

### 🎙️ Voice Island
- Floating voice bar with real-time audio waveform
- Web Speech API integration
- Transcript preview before sending
- Voice commands control the entire whiteboard

### 💬 AI Chat Panel
- Multi-turn conversation with Gemma 4
- Markdown + code block rendering (react-markdown)
- Image attachment for multimodal queries
- Voice input via microphone

### 👩‍🏫 Teacher Dashboard
- Student progress tracking with animated progress bars
- AI-generated insights: *"3 students struggling with loops"*
- **Lesson Planner** — AI generates structured 45-minute lesson plans
- Each lesson step has a ready-to-use board AI prompt

### 🧩 Quiz Tool
- AI generates topic-specific multiple-choice + essay quizzes
- Real-time answer checking with explanations
- Score display with celebration animations

### 🛠️ Classroom Tools
- ⏱️ Floating countdown timer (for timed exercises)
- 🧮 Scientific calculator
- 📊 Diagram generator modal

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    KimiWise Frontend                     │
│  React 19 + Vite 6 + TypeScript + Tailwind CSS 4         │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Board    │  │ Code Lab │  │  Chat    │  │Teacher  │  │
│  │ View     │  │ View     │  │  View    │  │Dashboard│  │
│  │          │  │          │  │          │  │         │  │
│  │Fabric.js │  │OCR Upload│  │ChatPanel │  │LessonPl.│  │
│  │DrawTools │  │CodeEditor│  │ReactMD   │  │Students │  │
│  │VoiceBar  │  │CodeTutor │  │VoiceInput│  │QuizTool │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│                                                           │
│            Zustand Global Store                           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / Socket.IO
┌────────────────────────┴────────────────────────────────┐
│                   Express 5 Backend                      │
│  (local dev) / Vercel Serverless Functions (prod)         │
│                                                           │
│  /api/ai/generate   — Board agent (function calling)      │
│  /api/ai/ocr        — Image → code (Gemma 4 Vision)       │
│  /api/ai/tutor      — Code tutoring (multi-turn)          │
│  /api/ai/chat       — General conversation                │
│  /api/ai/lesson-plan — Structured lesson generation       │
│  /api/ai/quiz       — Quiz generation                     │
│  /api/ai/status     — Health check                        │
│                                                           │
│  ┌─────────────────┐    ┌──────────────────────────────┐ │
│  │  gemmaAdapter   │    │      ollamaAdapter           │ │
│  │  @google/genai  │    │  (offline fallback)          │ │
│  │  Gemma 4 Vision │    │  gemma4:e2b via HTTP API     │ │
│  └─────────────────┘    └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
              Google AI (Gemma 4 Cloud)
              or Ollama (Local / Offline)
```

---

## ⚡ Quick Start

### Prerequisites

```
Node.js >= 20 LTS
npm >= 10
Google Chrome (for Web Speech API)
```

### 1. Clone & Install

```bash
git clone https://github.com/Prabhav-020108/KimiWise.git
cd KimiWise
npm install
```

### 2. Configure API Key

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

Get your free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Start Development

```bash
# Start both Express server (port 3000) + Vite client (port 5173):
npm run dev        # starts the Express server
npm run dev:client # starts Vite in another terminal

# Or frontend-only (no AI features):
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Demo the Key Features

1. **Whiteboard** → Click mic → Say *"Draw a mind map about machine learning"*
2. **Code Lab** → Upload a photo of handwritten Python code → Click Analyze
3. **Chat** → Ask *"Explain recursion with a visual example"*
4. **Teacher** → Generate a lesson plan for *"Sorting Algorithms, Grade 9"*

---

## 🌐 Deploy to Vercel

```bash
npx -y vercel --prod
```

Set these environment variables in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Google AI API key |
| `GEMMA_MODEL` | `gemma-4` (optional, this is the default) |

The `vercel.json` config handles routing so `/api/*` calls hit the serverless functions.

---

## 🔧 Environment Variables

```env
# Required — Google AI Studio API key
GEMINI_API_KEY=your_key_here

# Optional — Gemma model override
GEMMA_MODEL=gemma-4

# Optional — Ollama for offline AI
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b

# Server
PORT=3000
NODE_ENV=development
```

> **Offline mode:** If no `GEMINI_API_KEY` is set and Ollama is running locally, KimiWise automatically uses it as a fallback.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **UI Framework** | React 19 + Vite 6 | Fast dev, streaming RSC |
| **Language** | TypeScript 5.8 | Full type safety |
| **Styling** | Tailwind CSS 4 + custom HSL system | Design tokens, dark mode |
| **State** | Zustand 5 | Simple, powerful, minimal |
| **Canvas** | Fabric.js 5.3 | Professional interactive canvas |
| **AI (Cloud)** | `@google/genai` + Gemma 4 | Vision, function calling, text |
| **AI (Local)** | Ollama (gemma4:e2b) | Offline fallback |
| **Backend** | Express 5 | Modern routing, streaming |
| **Serverless** | Vercel functions | Zero-config production |
| **Realtime** | Socket.IO 4 | Live classroom sync (ready) |
| **Storage** | IndexedDB (raw IDB) | Local session persistence |
| **Animations** | Motion + GSAP | Micro-interactions |
| **Markdown** | react-markdown + remark-gfm | Rich AI responses |
| **Math** | KaTeX (CDN) | Equation rendering |
| **Voice** | Web Speech API | Zero-dependency STT |
| **Icons** | Lucide React | Consistent icon set |

---

## 📁 Project Structure

```
KimiWise/
├── src/
│   ├── components/
│   │   ├── board/           # Whiteboard (Fabric.js, tools, voice bar)
│   │   ├── chat/            # AI chat panel + message rendering
│   │   ├── codelab/         # OCR upload, editor, tutor, output
│   │   ├── teacher/         # Dashboard, lesson planner, student cards
│   │   ├── voice/           # Voice island, audio visualizer
│   │   ├── tools/           # Quiz tool
│   │   ├── classroom/       # Timer, calculator, diagram modal
│   │   ├── layout/          # Header, sidebar, settings
│   │   └── shared/          # Error boundary
│   ├── server/
│   │   ├── server.ts        # Express entry point
│   │   ├── aiRouter.ts      # All AI API routes
│   │   ├── gemmaAdapter.ts  # Gemma 4 / Google AI SDK
│   │   ├── ollamaAdapter.ts # Local Ollama fallback
│   │   └── toolRouter.ts    # Function calling executor
│   ├── services/
│   │   ├── aiService.ts     # Frontend AI service layer
│   │   ├── agentDrawingService.ts # Canvas agent actions
│   │   └── storageService.ts      # IndexedDB persistence
│   ├── hooks/
│   │   └── useVoice.ts      # Web Speech API hook
│   ├── store.ts             # Zustand global store
│   ├── types.ts             # All TypeScript types
│   ├── constants.ts         # Model config, system prompts
│   └── index.css            # Design system + animations
├── api/
│   └── ai/                  # Vercel serverless functions
│       ├── status.ts
│       ├── ocr.ts
│       ├── tutor.ts
│       ├── chat.ts
│       ├── quiz.ts
│       └── lesson-plan.ts
├── public/
│   └── favicon.svg
├── vercel.json              # Vercel deployment config
├── vite.config.ts
└── .env.example
```

---

## 📊 Multimodal Demonstration

The hackathon demo flow that showcases all three modalities:

```
👩‍🏫 Teacher opens KimiWise on projector

STEP 1 — Voice + Board (voice + text modalities)
  Teacher: "Draw a flowchart of the bubble sort algorithm"
  → KimiWise transcribes → Gemma 4 function calling →
  → Fabric.js canvas renders animated flowchart in real-time

STEP 2 — OCR + Tutor (image + text modalities)  
  Student: photographs handwritten Python code on paper
  → Uploads in Code Lab → Gemma 4 Vision reads image →
  → Code appears in editor → AI tutor identifies errors →
  → Progressive hints guide student to fix code

STEP 3 — Chat + Lesson (text + structured output)
  Teacher: opens Teacher Dashboard → generates lesson plan →
  "Sorting Algorithms, Grade 10, 45 minutes"
  → Gemma 4 generates 5 structured phases with board prompts →
  → Teacher clicks each phase → whiteboard auto-builds that section
```

---

## 👥 Team

Built by **Prabhav** for Hacktoberfest Hack Day Bengaluru 2026 in 48 hours.

---

## 📄 License

MIT — See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ and Gemma 4**

*KimiWise — Where AI meets the classroom*

</div>