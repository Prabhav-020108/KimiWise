import React from 'react';
import { Terminal, Trash2, CheckCircle, AlertTriangle, Clock, Play, Copy, Check } from 'lucide-react';

interface CodeOutputProps {
  output: string;
  error?: string | null;
  executionTimeMs?: number | null;
  isRunning?: boolean;
  engine?: string | null;
  onClear: () => void;
  onRun?: () => void;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({
  output,
  error,
  executionTimeMs,
  isRunning,
  engine,
  onClear,
  onRun,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const textToCopy = error ? `${error}\n${output}` : output;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Terminal size={14} className="text-emerald-400" />
          <span className="font-semibold">Terminal</span>

          {engine && (
            <span className="text-[10px] text-slate-400 font-sans bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md hidden sm:inline-block">
              {engine}
            </span>
          )}

          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-sans ml-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Running...
            </span>
          )}

          {!isRunning && executionTimeMs != null && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono ml-1">
              <Clock size={10} />
              {executionTimeMs}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {error ? (
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full">
              <AlertTriangle size={11} /> Error
            </span>
          ) : output ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              <CheckCircle size={11} /> Completed
            </span>
          ) : null}

          {onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              title="Run code"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40"
            >
              <Play size={11} fill="currentColor" />
              <span>Run</span>
            </button>
          )}

          {(output || error) && (
            <>
              <button
                onClick={handleCopy}
                title="Copy console output"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <button
                onClick={onClear}
                title="Clear console"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Console Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-auto leading-relaxed select-text">
        {isRunning ? (
          <div className="flex items-center gap-2 text-slate-400 italic">
            <span className="animate-spin text-emerald-400 font-bold">⠋</span>
            <span>Executing code in isolated sandbox...</span>
          </div>
        ) : error ? (
          <div className="text-rose-400 whitespace-pre-wrap font-mono">
            <div className="text-[11px] uppercase tracking-wider text-rose-500 font-bold mb-1">
              Runtime Error:
            </div>
            {error}
          </div>
        ) : output ? (
          <pre className="text-emerald-300 whitespace-pre-wrap font-mono">{output}</pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-1.5 select-none py-8">
            <Terminal size={24} className="opacity-40" />
            <p className="text-xs">No output yet</p>
            <p className="text-[11px] text-slate-700">Click &ldquo;Run Code&rdquo; to execute your solution</p>
          </div>
        )}
      </div>
    </div>
  );
};
