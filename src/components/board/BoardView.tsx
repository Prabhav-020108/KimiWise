import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { CanvasManager } from './CanvasManager';
import { DrawingToolbar } from './DrawingToolbar';
import { DomOverlay } from './DomOverlay';
import { VoiceBar } from './VoiceBar';
import { PageBar } from './PageBar';
import { AgentCursor } from './AgentCursor';
import { useStore } from '../../store';

export const BoardView: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const { setActiveView } = useStore();

  const handleCanvasReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-50">
      {/* 1. Fullscreen Fabric.js Canvas */}
      <CanvasManager onCanvasReady={handleCanvasReady} />

      {/* 2. Rich HTML Overlays (code blocks, cards) */}
      <DomOverlay />

      {/* 2.5 Live AI Drawing Agent HUD & Cursor */}
      <AgentCursor />

      {/* 3. Floating Left Toolbar (Trido pill style) */}
      <DrawingToolbar />

      {/* 4. Left Edge Floating Chevron */}
      <button
        onClick={() => {}}
        title="Whiteboard Tools"
        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors pointer-events-auto"
      >
        <ChevronLeft size={16} />
      </button>

      {/* 5. Right Edge Floating Chevron (Opens KimiWise AI Chat) */}
      <button
        onClick={() => setActiveView('chat')}
        title="Open KimiWise AI Chat"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors pointer-events-auto group"
      >
        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 6. Page indicator bottom left */}
      <PageBar />

      {/* 7. Bottom Action Bar: AI Pill + Mic + Controls (Trido style) */}
      <VoiceBar />

      {/* 8. Bottom-Right Corner Fullscreen Button */}
      <button
        onClick={handleToggleFullscreen}
        title="Toggle Fullscreen"
        className="absolute bottom-4 lg:bottom-6 right-3 lg:right-6 z-40 w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors pointer-events-auto"
      >
        <Maximize2 size={16} />
      </button>

      {/* Canvas loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-0 pointer-events-none">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
            Initializing canvas...
          </div>
        </div>
      )}
    </div>
  );
};

