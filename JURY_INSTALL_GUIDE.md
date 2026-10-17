# 🏆 KimiWise — AI Digital Classroom Judge Installation & Evaluation Guide

Welcome to the **KimiWise** evaluation guide. KimiWise is an AI-powered smart digital classroom designed specifically for interactive whiteboards, hybrid classroom environments, and next-generation pedagogical instruction.

This guide provides clean, step-by-step instructions in English on how to install, configure, launch, and evaluate KimiWise.

---

## ✨ Key Capabilities & Architectural Highlights

1. **Dual-Pane Interactive Whiteboard & Visible AI Drawing Agent:**
   - Prompts for visual concepts (e.g., algorithms, processes, roadmaps) automatically spawn a visible **AI Drawing Agent**.
   - Watch the agent glide across the canvas, drawing sequential flowchart nodes, decision diamonds, and arrowheads.
   - Simultaneously writes a structured **Blackboard Lesson Note Card** on the right pane containing **Conceptual Overview**, **Core Theoretical Principles**, **Intuitive Real-World Analogy**, and **Key Exam Takeaways**.

2. **Gemma 4 & Gemini Cloud Intelligence + 100% Offline Resilience:**
   - Powered by Google Gemma 4 / Gemini via Google AI Studio with high-speed JSON schema generation.
   - Built-in 30+ domain offline knowledge catalog with universal pedagogical synthesizers, guaranteeing accurate diagrams and lesson cards even when offline.

3. **Natural Continuous Voice Input (Voice Island):**
   - High-fidelity microphone input with real-time audio waveform visualizer.
   - Reconnection resilience: handles natural pauses and breaths without premature sentence cutoffs.
   - Instant Send button allowing teachers to speak fluidly and submit on demand.

4. **Multi-Slide Whiteboard Canvas with Fabric.js:**
   - Multi-slide deck support with dynamic slide addition (`+`), thumbnail switcher, and per-slide JSON persistence.
   - Full whiteboard toolset: shapes, text, arrows, pan/zoom, undo/redo, and interactive object selection.

---

## 🛠️ Step-by-Step Installation & Run

### Option 1: Fast Launch with `start.bat` (Windows — Recommended)
Double-clicking the smart launcher handles everything automatically:
1. Locate the file **`start.bat`** in the root directory.
2. **Double-click `start.bat`**.
3. The script will:
   - Check if **Node.js** is installed (will prompt to install if missing).
   - Install dependencies automatically if `node_modules` is not yet built.
   - Start the server on port `3030`.
   - Automatically launch Google Chrome or Microsoft Edge in clean App Mode at `http://localhost:3030`.

---

### Option 2: Manual Terminal Start (All Operating Systems)
If you prefer running commands manually in your terminal (PowerShell, Command Prompt, or Bash):

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build frontend assets (optional for production):**
   ```bash
   npm run build
   ```

3. **Start the KimiWise server:**
   ```bash
   npx tsx src/server/server.ts
   ```

4. **Open your browser:**
   Navigate to:
   ```
   http://localhost:3030
   ```

---

## ⚙️ Environment Variables Configuration (`.env`)

KimiWise works out-of-the-box with built-in fallbacks. To connect directly to Google Gemma 4 or Gemini Cloud, ensure your `.env` file in the root directory contains your API key:

```bash
# ── Google AI Studio / Gemini API Key ─────────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Gemma 4 / Gemini Model Selection ──────────────────────────────────────────
# Default: gemma-4-26b-a4b-it | Fallbacks: gemini-3.5-flash-lite, gemini-3.8-flash
GEMMA_MODEL=gemma-4-26b-a4b-it

# ── Server Port ───────────────────────────────────────────────────────────────
SERVER_PORT=3030
PORT=3030
```

> **Note:** A free API key can be obtained instantly at [Google AI Studio](https://aistudio.google.com/apikey).

---

## 🧭 Step-by-Step Evaluation Checklist for Judges

### 1. Test the AI Whiteboard Drawing Agent & Dual-Pane Lesson
1. In the bottom action bar, click the **Plus (+)** or click the input field, or speak via the **Mic** button.
2. Enter one of the following prompts to observe the visible AI Drawing Agent in action:
   - `Explain binary search algorithm`
   - `Draw a flowchart of TCP 3-way handshake`
   - `AI and machine learning roadmap`
   - `How does photosynthesis work`
   - `Operating system process scheduling lifecycle`
3. **What to Observe:**
   - The status bar displays the active step the agent is drawing (e.g. `Drawing Step 1/5: ...`).
   - The AI cursor visibly travels across the whiteboard, creating cards, diamond decision gates, and directional arrows on the left pane.
   - The agent then glides to the right pane and writes the **Blackboard Lesson Note Card** with:
     - 📖 **Conceptual Overview & Mechanism**
     - ⚡ **Core Principles & Theoretical Invariants**
     - 💡 **Intuitive Classroom Analogy** (e.g. walkie-talkies, phone books, factories)
     - 🎯 **Core Exam & Engineering Takeaway**

### 2. Test Continuous Voice Input (Voice Island)
1. Click the vibrant blue **Microphone** button in the bottom bar.
2. Allow microphone access when prompted by the browser.
3. Speak a command naturally:
   - Notice the live audio frequency waveform.
   - Speak with pauses between thoughts — notice that natural 1–2 second silences **do not cut you off prematurely**.
4. When finished speaking, click the **Send** button or click the **Mic** button to complete the prompt.
5. The AI will process the spoken transcript and illustrate the lesson directly onto the canvas.

### 3. Test Whiteboard Tools & Multi-Slide Deck
1. At the bottom-right of the canvas, test the **Zoom controls** (`-`, `%`, `+`, `Fit Screen`).
2. Test **Undo / Redo / Trash** to manipulate whiteboard elements.
3. Use the slide navigation at the bottom left:
   - Click the **`+`** icon to add a new clean slide.
   - Switch back and forth between slides — observe that each slide independently persists its drawings and notes.

### 4. Test Chat & Vision Assistant
1. Switch to the **Chat** tab on the navigation bar.
2. Ask any curriculum question (e.g. "What is the difference between TCP and UDP?").
3. Upload an image of handwritten notes or a diagram — observe the vision model performing OCR extraction and answering based on the visual input.

---

## 🏁 Summary
KimiWise delivers a production-grade, highly engaging AI smartboard classroom environment where teachers and students experience dynamic, visually stunning, and pedagogically sound digital lessons in real-time.
