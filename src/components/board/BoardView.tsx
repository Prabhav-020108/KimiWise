import React from 'react';
import { Sparkles, PenTool, Volume2 } from 'lucide-react';
import { useStore } from '../../store';

export const BoardView: React.FC = () => {
  const { voice, setRecording, agent } = useStore();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-background/50 overflow-hidden select-none">
      {/* Canvas Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Board Canvas Placeholder / Container */}
      <div className="z-10 text-center max-w-lg p-8 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/80 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
          <PenTool size={28} />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Sparkles size={12} />
            <span>Interactive Smart Whiteboard</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Welcome to KimiWise Whiteboard</h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Speak to generate lesson diagrams, code blocks, and dynamic visual aids.
            Powered by Gemma 4 Multimodal Intelligence.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setRecording(!voice.isRecording)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
              voice.isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            <Volume2 size={16} />
            <span>{voice.isRecording ? 'Listening...' : 'Voice Command'}</span>
          </button>
        </div>

        {agent.isThinking && (
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Gemma 4 is reasoning...</span>
          </div>
        )}
      </div>
    </div>
  );
};
