import React from 'react';
import { Sparkles, Bot, PenTool } from 'lucide-react';
import { useStore } from '../../store';

export const AgentCursor: React.FC = () => {
  const { agent, canvas } = useStore();
  const { isActing, isThinking, cursorPosition, agentMessage } = agent;

  const isActive = isActing || isThinking;
  const zoom = canvas.zoom ?? 1;

  // Screen coordinates for cursor (default center if 0,0)
  const x = cursorPosition.x ? cursorPosition.x * zoom : 500;
  const y = cursorPosition.y ? cursorPosition.y * zoom : 250;

  return (
    <>
      {/* ── 1. Top HUD Status Pill ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none transition-all duration-300">
        {isActive ? (
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xl border border-blue-200/80 shadow-[0_12px_36px_rgba(59,130,246,0.16)] rounded-full px-4 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 relative" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Bot size={15} className="text-blue-600 animate-bounce" />
                KimiWise Drawing Agent
              </span>
              <span className="text-[11px] text-slate-300">•</span>
              <span className="text-xs font-medium text-blue-600 truncate max-w-[260px] sm:max-w-[400px]">
                {agentMessage || 'Generating visual elements...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xs rounded-full px-3.5 py-1.5 opacity-70 hover:opacity-100 transition-opacity">
            <Sparkles size={13} className="text-blue-500" />
            <span className="text-[11px] font-semibold text-slate-500">
              KimiWise AI Tutor Ready
            </span>
            <span className="text-[10px] text-slate-400">
              • Speak or chat to draw on board
            </span>
          </div>
        )}
      </div>

      {/* ── 2. Live Moving Drawing Agent Cursor on Canvas ───────────────────── */}
      {isActive && (
        <div
          className="absolute z-30 pointer-events-none select-none"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.35s cubic-bezier(0.25, 1, 0.5, 1), top 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Glowing radar ping ring around cursor tip */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-blue-400/25 animate-ping" />
            <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-pulse" />

            {/* Stylized Agent Cursor Icon */}
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 border-2 border-white scale-110">
              {isActing ? (
                <PenTool size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
              ) : (
                <Bot size={17} />
              )}
            </div>

            {/* Speech Bubble Tooltip beside cursor */}
            <div className="absolute left-10 top-0 -translate-y-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-white/10 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1 duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{agentMessage || 'Drawing...'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
