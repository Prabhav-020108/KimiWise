import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  HelpCircle,
  Bug,
  Zap,
  CheckCircle,
  Trash2,
  Compass,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import type { CodeTutorMessage } from '../../types';

interface CodeTutorProps {
  code: string;
  language: string;
  messages: CodeTutorMessage[];
  onAddMessage: (message: CodeTutorMessage) => void;
  onClearMessages: () => void;
  lastExecutionError?: string | null;
}

export const CodeTutor: React.FC<CodeTutorProps> = ({
  code,
  language,
  messages,
  onAddMessage,
  onClearMessages,
  lastExecutionError,
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeHintLevel, setActiveHintLevel] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (userPrompt: string, customSystemNote?: string) => {
    const text = userPrompt.trim();
    if (!text || isTyping) return;

    setInput('');
    const userMsgId = `u_${Date.now()}`;
    onAddMessage({
      id: userMsgId,
      role: 'user',
      text,
      timestamp: Date.now(),
    });

    setIsTyping(true);

    try {
      // Build conversation history for multi-turn reasoning
      const history = messages.slice(-10).map((m) => ({
        role: m.role as 'user' | 'model',
        text: m.text,
      }));

      let contextualQuery = text;
      if (customSystemNote) {
        contextualQuery = `[Context: ${customSystemNote}]\n\nStudent Query: ${text}`;
      }

      if (lastExecutionError && !text.includes(lastExecutionError)) {
        contextualQuery += `\n\nRuntime Error on execution: "${lastExecutionError}"`;
      }

      const res = await aiService.askTutor({
        message: contextualQuery,
        code,
        language,
        history,
      });

      onAddMessage({
        id: `a_${Date.now()}`,
        role: 'model',
        text: res.response || 'I analyzed your code. Let me know if you would like more hints or explanations!',
        timestamp: Date.now(),
        model: 'Gemma 4 Tutor',
      });
    } catch (err: any) {
      onAddMessage({
        id: `e_${Date.now()}`,
        role: 'model',
        text: `Tutor connection notice: ${err?.message || 'Unable to reach AI tutor. Please check your network or Ollama status.'}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  // ── CodeBuddy Progressive Hint System (Levels 1 → 2 → 3) ───────────────────
  const requestHint = (level: 1 | 2 | 3) => {
    setActiveHintLevel(level);

    const hintPrompts = {
      1: {
        label: 'Level 1 Hint (Guiding Question)',
        prompt:
          'Give me a Level 1 Hint: provide ONLY one Socratic guiding question that encourages me to discover the problem on my own. DO NOT disclose the solution, the fix, or the error location.',
      },
      2: {
        label: 'Level 2 Hint (Error Location)',
        prompt:
          'Give me a Level 2 Hint: point out the EXACT location of the issue (variable, function, or line) and briefly explain WHY it is incorrect, but DO NOT provide the full fixed code yet.',
      },
      3: {
        label: 'Level 3 Hint (Full Solution)',
        prompt:
          'Give me a Level 3 Hint: provide the COMPLETE CORRECTED CODE with a step-by-step walkthrough explaining each fix and encourage me to keep practicing.',
      },
    };

    sendMessage(hintPrompts[level].prompt, hintPrompts[level].label);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Gemma 4 AI Code Tutor</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.2 rounded-full">
                Interactive
              </span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearMessages}
            title="Clear tutor conversation"
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* CodeBuddy Progressive Hint Bar (Level 1, Level 2, Level 3) */}
      <div className="px-3 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-1.5 overflow-x-auto select-none shrink-0 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1 shrink-0 mr-1">
          <Lightbulb size={12} className="text-amber-500" />
          Hints:
        </span>

        <button
          onClick={() => requestHint(1)}
          disabled={isTyping}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
            activeHintLevel === 1
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'
          }`}
          title="Level 1: Socratic guiding question"
        >
          <HelpCircle size={11} />
          <span>Lvl 1: Nudge</span>
        </button>

        <button
          onClick={() => requestHint(2)}
          disabled={isTyping}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
            activeHintLevel === 2
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'
          }`}
          title="Level 2: Locate bug"
        >
          <Compass size={11} />
          <span>Lvl 2: Location</span>
        </button>

        <button
          onClick={() => requestHint(3)}
          disabled={isTyping}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
            activeHintLevel === 3
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'
          }`}
          title="Level 3: Full solution with code"
        >
          <CheckCircle size={11} />
          <span>Lvl 3: Solution</span>
        </button>

        <div className="w-px h-4 bg-blue-200 mx-1 shrink-0" />

        <button
          onClick={() => sendMessage('Find bugs in my code and explain why they happen.')}
          disabled={isTyping}
          className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <Bug size={11} className="text-rose-500" />
          <span>Find Bugs</span>
        </button>

        <button
          onClick={() => sendMessage('Explain this code step-by-step for a student.')}
          disabled={isTyping}
          className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <Zap size={11} className="text-amber-500" />
          <span>Explain</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-400 select-none">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Sparkles size={22} />
            </div>
            <h4 className="text-xs font-bold text-slate-700 mb-1">AI Tutor Ready</h4>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              Ask questions about your code, get progressive hints, or request a bug diagnosis.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.role === 'user' ? 'You' : msg.model || 'Gemma 4 Tutor'}
              </span>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit text-xs text-slate-500">
            <Loader2 size={14} className="text-blue-600 animate-spin" />
            <span>Gemma 4 Tutor is thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-xs"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about syntax, logic, or request a hint..."
            disabled={isTyping}
            className="flex-1 px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white flex items-center justify-center transition-colors shrink-0"
            title="Send query"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
