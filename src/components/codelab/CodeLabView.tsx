import React, { useState, useCallback } from 'react';
import {
  Code2,
  Camera,
  Play,
  Terminal,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { useStore } from '../../store';
import { CodeEditor } from './CodeEditor';
import { OCRUpload } from './OCRUpload';
import { CodeTutor } from './CodeTutor';
import { CodeOutput } from './CodeOutput';
import type { OcrResponse } from '../../services/aiService';
import { codeSandboxService } from '../../services/codeSandboxService';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML/CSS' },
];

export const CodeLabView: React.FC = () => {
  const {
    codeLab,
    setCode,
    setLanguage,
    setOutput,
    setIsRunning,
    setOcrResult,
    addTutorMessage,
    clearTutorChat,
  } = useStore();

  const [showOcr, setShowOcr] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const [rightPaneTab, setRightPaneTab] = useState<'tutor' | 'output' | 'split'>('split');

  // ── Sandboxed Execution (Host Python 3.12 / Web Worker JS Sandbox) ───────────
  const handleRunCode = useCallback(async () => {
    const rawCode = codeLab.code?.trim() || '';
    if (!rawCode) return;

    setIsRunning(true);
    setExecutionError(null);
    setOutput('');

    try {
      const result = await codeSandboxService.execute(rawCode, codeLab.language || 'javascript');
      setActiveEngine(result.engine);
      setExecutionTime(result.executionTimeMs);

      if (result.error || result.exitCode !== 0) {
        setExecutionError(result.error || result.stderr || 'Execution failed');
        const formattedOutput = result.stderr
          ? `${result.stdout ? result.stdout + '\n' : ''}${result.stderr}`
          : (result.stdout || 'Execution failed');
        setOutput(formattedOutput);
      } else {
        setOutput(result.stdout);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Execution failed';
      setExecutionError(errMsg);
      setOutput(`Runtime Error: ${errMsg}`);
    } finally {
      setIsRunning(false);
    }
  }, [codeLab.code, codeLab.language, setIsRunning, setOutput]);

  // ── Handle OCR Result ───────────────────────────────────────────────────────
  const handleOcrExtracted = (result: OcrResponse) => {
    setOcrResult(result);
    setCode(result.extractedCode);

    if (result.language) {
      setLanguage(result.language.toLowerCase());
    }

    setShowOcr(false);

    // Add proactive message from Gemma 4 tutor
    addTutorMessage({
      id: `ocr_${Date.now()}`,
      role: 'model',
      text: `📸 **Gemma 4 Vision extracted your code!**\n\nI detected **${result.language || 'Code'}** (confidence: ${(
        (result.confidence || 0.95) * 100
      ).toFixed(0)}%).\n\n${result.explanation || 'The code is now loaded in your editor.'}\n\nYou can now run it or ask me for progressive hints!`,
      timestamp: Date.now(),
      model: 'Gemma 4 Vision',
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* ── Top Action Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200/90 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            <Code2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Code Lab
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                OCR & Tutor
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Interactive code editor, Gemma 4 Vision OCR, and Socratic AI tutor
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={codeLab.language || 'javascript'}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Photograph Code (OCR) Button */}
          <button
            onClick={() => setShowOcr((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              showOcr
                ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <Camera size={14} />
            <span>OCR Photo</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={codeLab.isRunning || !codeLab.code?.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/25 active:scale-95"
          >
            <Play size={13} fill="currentColor" />
            <span>{codeLab.isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Pane View Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setRightPaneTab('split')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                rightPaneTab === 'split' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Split View (Tutor + Terminal)"
            >
              <Layers size={13} />
            </button>
            <button
              onClick={() => setRightPaneTab('tutor')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                rightPaneTab === 'tutor' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tutor Only"
            >
              <MessageSquare size={13} />
            </button>
            <button
              onClick={() => setRightPaneTab('output')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                rightPaneTab === 'output' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Terminal Only"
            >
              <Terminal size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Collapsible Vision OCR Scanner Panel ───────────────────────────── */}
      {showOcr && (
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 shrink-0">
          <OCRUpload onExtracted={handleOcrExtracted} onClose={() => setShowOcr(false)} />
        </div>
      )}

      {/* ── Main Split Pane: Editor Left | Tutor/Output Right ──────────────── */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 min-h-0">
        {/* Left Pane: Code Editor */}
        <div className="flex-1 flex flex-col min-w-[340px] h-full">
          <CodeEditor
            code={codeLab.code || ''}
            language={codeLab.language || 'javascript'}
            onChange={setCode}
            onClear={() => setCode('')}
            onRun={handleRunCode}
          />
        </div>

        {/* Right Pane: Code Tutor + Output Console */}
        <div className="w-[45%] min-w-[320px] max-w-[560px] flex flex-col gap-3 h-full">
          {rightPaneTab === 'split' ? (
            <>
              {/* Top Half: Code Tutor */}
              <div className="flex-1 min-h-[260px] flex flex-col">
                <CodeTutor
                  code={codeLab.code || ''}
                  language={codeLab.language || 'javascript'}
                  messages={codeLab.tutorMessages}
                  onAddMessage={addTutorMessage}
                  onClearMessages={clearTutorChat}
                  lastExecutionError={executionError}
                />
              </div>

              {/* Bottom Half: Console Output */}
              <div className="h-[210px] shrink-0 flex flex-col">
                <CodeOutput
                  output={codeLab.output || ''}
                  error={executionError}
                  executionTimeMs={executionTime}
                  isRunning={codeLab.isRunning}
                  engine={activeEngine}
                  onClear={() => {
                    setOutput('');
                    setExecutionError(null);
                  }}
                  onRun={handleRunCode}
                />
              </div>
            </>
          ) : rightPaneTab === 'tutor' ? (
            <div className="flex-1 flex flex-col h-full">
              <CodeTutor
                code={codeLab.code || ''}
                language={codeLab.language || 'javascript'}
                messages={codeLab.tutorMessages}
                onAddMessage={addTutorMessage}
                onClearMessages={clearTutorChat}
                lastExecutionError={executionError}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <CodeOutput
                output={codeLab.output || ''}
                error={executionError}
                executionTimeMs={executionTime}
                isRunning={codeLab.isRunning}
                engine={activeEngine}
                onClear={() => {
                  setOutput('');
                  setExecutionError(null);
                }}
                onRun={handleRunCode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
