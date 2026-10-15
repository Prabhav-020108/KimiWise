import React, { useState } from 'react';
import {
  Mic, MicOff, Sparkles, Loader2, Plus, Undo2, Redo2,
  Trash2, ZoomIn, ZoomOut, Maximize2,
} from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { AudioVisualizer } from './AudioVisualizer';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';

declare const fabric: any;

// ── Utility: action executor on Fabric canvas ─────────────────────────────────
function executeActionsOnCanvas(actions: any[]) {
  const fCanvas = (window as any).__KIMIWISE_CANVAS__;
  const FabricClass = (window as any).fabric;
  if (!fCanvas || !FabricClass) return;

  actions.forEach((action, idx) => {
    const p = action.payload || {};
    setTimeout(() => {
      switch (action.type) {
        case 'CREATE_SHAPE': {
          const fill = p.fill || 'rgba(99,102,241,0.15)';
          const stroke = p.stroke || '#6366f1';
          const sw = p.strokeWidth || 2;
          const w = p.width || 180;
          const h = p.height || 100;
          const left = p.x || 200;
          const top = p.y || 200;
          let obj: any;
          if (p.shape === 'circle') {
            obj = new FabricClass.Circle({ radius: Math.round(w / 2), fill, stroke, strokeWidth: sw, left, top });
          } else if (p.shape === 'triangle') {
            obj = new FabricClass.Triangle({ width: w, height: h, fill, stroke, strokeWidth: sw, left, top });
          } else {
            obj = new FabricClass.Rect({ width: w, height: h, rx: 12, ry: 12, fill, stroke, strokeWidth: sw, left, top });
          }
          if (p.label) {
            const txt = new FabricClass.Text(p.label, {
              fontSize: 14, fill: '#1e1b4b', fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
              originX: 'center', originY: 'center', left: left + w / 2, top: top + h / 2,
            });
            fCanvas.add(new FabricClass.Group([obj, txt], { left, top, id: action.id }));
          } else {
            obj.id = action.id;
            fCanvas.add(obj);
          }
          break;
        }
        case 'WRITE_TEXT': {
          const txt = new FabricClass.IText(p.text || '', {
            left: p.x || 200, top: p.y || 150, fontSize: p.fontSize || 22,
            fill: p.color || '#0a1a3a', fontFamily: 'Inter, sans-serif',
            fontWeight: p.fontWeight || 'bold', id: action.id,
          });
          fCanvas.add(txt);
          break;
        }
        case 'DRAW_ARROW': {
          const fx = Number(p.fromX) || 100, fy = Number(p.fromY) || 100;
          const tx = Number(p.toX) || 250, ty = Number(p.toY) || 100;
          const line = new FabricClass.Line([fx, fy, tx, ty], { stroke: p.color || '#6366f1', strokeWidth: p.strokeWidth || 2 });
          const angle = Math.atan2(ty - fy, tx - fx);
          const head = new FabricClass.Triangle({
            left: tx, top: ty, originX: 'center', originY: 'center',
            angle: (angle * 180) / Math.PI + 90, width: 12, height: 12, fill: p.color || '#6366f1',
          });
          fCanvas.add(new FabricClass.Group([line, head], { id: action.id }));
          break;
        }
        case 'CREATE_MINDMAP': {
          const cx = p.centerX || 500, cy = p.centerY || 350;
          const centerRect = new FabricClass.Rect({ width: 200, height: 60, rx: 16, fill: '#6366f1', stroke: '#4f46e5', strokeWidth: 1.5, originX: 'center', originY: 'center' });
          const centerTxt = new FabricClass.Text(p.centralTopic || 'Core', { fontSize: 16, fill: '#fff', fontFamily: 'Inter', fontWeight: 'bold', originX: 'center', originY: 'center' });
          fCanvas.add(new FabricClass.Group([centerRect, centerTxt], { left: cx, top: cy, originX: 'center', originY: 'center' }));
          (p.branches || []).forEach((b: any, i: number) => {
            const angle = (i / (p.branches.length)) * 2 * Math.PI;
            const r = 220, bx = cx + Math.cos(angle) * r, by = cy + Math.sin(angle) * r;
            fCanvas.add(new FabricClass.Line([cx, cy, bx, by], { stroke: '#c7d2fe', strokeWidth: 1.5, opacity: 0.8 }));
            const bRect = new FabricClass.Rect({ width: 150, height: 48, rx: 10, fill: '#eff6ff', stroke: '#6366f1', strokeWidth: 1.5, originX: 'center', originY: 'center' });
            const bTxt = new FabricClass.Text(b.title, { fontSize: 13, fill: '#1e1b4b', fontFamily: 'Inter', originX: 'center', originY: 'center' });
            fCanvas.add(new FabricClass.Group([bRect, bTxt], { left: bx, top: by, originX: 'center', originY: 'center' }));
          });
          break;
        }
        case 'CLEAR_CANVAS':
          fCanvas.clear();
          fCanvas.backgroundColor = 'transparent';
          break;
        default: break;
      }
      fCanvas.requestRenderAll();
    }, idx * 140);
  });
}

// ── Bottom Action Bar (Trido style) ───────────────────────────────────────────
export const VoiceBar: React.FC = () => {
  const { isRecording, transcript, interimTranscript, audioData, startRecording, stopRecording, resetTranscript } = useVoice();
  const { agent, setAgentState, addChatMessage, canvas, setZoom } = useStore();

  const [customInput, setCustomInput] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [undoStack, setUndoStack] = useState<any[][]>([]);

  const displayText = transcript || interimTranscript || customInput;
  const isThinking = agent.isThinking;

  // ── Undo / Redo ──────────────────────────────────────────────────────────
  const handleUndo = () => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (!fCanvas) return;
    const objs = fCanvas.getObjects();
    if (objs.length > 0) {
      const removed = objs[objs.length - 1];
      setUndoStack((prev) => [...prev, [removed]]);
      fCanvas.remove(removed);
      fCanvas.requestRenderAll();
    }
  };

  const handleRedo = () => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (!fCanvas || undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    last.forEach((obj: any) => fCanvas.add(obj));
    fCanvas.requestRenderAll();
  };

  const handleDeleteSelected = () => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (!fCanvas) return;
    const active = fCanvas.getActiveObjects();
    if (active.length) {
      active.forEach((obj: any) => fCanvas.remove(obj));
      fCanvas.discardActiveObject();
      fCanvas.requestRenderAll();
    }
  };

  const handleZoom = (dir: 'in' | 'out' | 'reset') => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (!fCanvas) return;
    let zoom = fCanvas.getZoom();
    if (dir === 'in') zoom = Math.min(zoom * 1.25, 4);
    else if (dir === 'out') zoom = Math.max(zoom * 0.8, 0.2);
    else {
      fCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoom(1);
      return;
    }
    fCanvas.setZoom(zoom);
    setZoom(zoom);
  };

  const zoomPercent = Math.round((canvas.zoom ?? 1) * 100);

  // ── Submit voice / text command to AI ─────────────────────────────────────
  const handleSubmit = async (text: string) => {
    const cmd = text.trim();
    if (!cmd || isThinking) return;
    if (isRecording) stopRecording();

    setAgentState({ isThinking: true, isActing: true, agentMessage: `Gemma 4 generating: "${cmd}"` });
    addChatMessage({ id: `u_${Date.now()}`, role: 'user', text: cmd, timestamp: Date.now() });

    try {
      const resp = await aiService.generateBoardActions({ prompt: cmd, intent: 'creation' });
      if (resp.textResponse) {
        setAgentState({ agentMessage: resp.textResponse });
        addChatMessage({ id: `a_${Date.now()}`, role: 'model', text: resp.textResponse, timestamp: Date.now(), model: resp.model || 'Gemma 4' });
      }
      if (resp.actions?.length) executeActionsOnCanvas(resp.actions);
    } catch (err: any) {
      setAgentState({ agentMessage: `Error: ${err?.message || 'AI unavailable'}` });
    } finally {
      setAgentState({ isThinking: false, isActing: false });
      resetTranscript();
      setCustomInput('');
      setIsInputExpanded(false);
    }
  };

  return (
    <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pointer-events-auto select-none">

      {/* ── 1. Central Status & Voice Pill ─────────────────────────────────── */}
      <div className="flex items-center gap-3.5 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_12px_40px_rgb(0,0,0,0.08)] rounded-[2.2rem] px-4 py-2.5 min-w-[280px]">

        {/* Status / Sparkle Icon Box */}
        <div className={`relative w-11 h-11 rounded-[1.2rem] flex items-center justify-center shrink-0 ${
          isThinking ? 'bg-amber-50 border border-amber-200 text-amber-600' :
          isRecording ? 'bg-rose-50 border border-rose-200 text-rose-600' :
          'bg-blue-50/90 border border-blue-100 text-blue-600'
        } shadow-xs`}>
          {isThinking ? (
            <Loader2 size={18} className="animate-spin text-amber-500" />
          ) : isRecording ? (
            <AudioVisualizer isListening width={32} height={18} audioData={audioData} />
          ) : (
            <Sparkles size={18} className="text-blue-600" />
          )}
        </div>

        {/* Text / Input */}
        <div className="flex-1 min-w-[140px] max-w-[220px]">
          {isRecording ? (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-rose-600 animate-pulse">Mendengarkan...</span>
              <span className="text-[11px] text-slate-400 truncate">{displayText || 'Silakan bicara...'}</span>
            </div>
          ) : isThinking ? (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800 truncate">KimiWise AI Memproses</span>
              <span className="text-[11px] text-slate-400 truncate">
                {agent.agentMessage?.slice(0, 35) || 'Menyiapkan papan tulis...'}
              </span>
            </div>
          ) : isInputExpanded ? (
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(customInput);
                if (e.key === 'Escape') { setIsInputExpanded(false); setCustomInput(''); }
              }}
              placeholder="Ketik perintah papan..."
              className="bg-transparent border-none outline-none text-[12.5px] text-slate-800 placeholder:text-slate-400 w-full font-medium"
              autoFocus
            />
          ) : (
            <div onClick={() => setIsInputExpanded(true)} className="cursor-text">
              <div className="text-[13.5px] font-bold text-slate-800 tracking-tight leading-tight">
                All Systems Ready
              </div>
              <div className="text-[11.5px] font-normal text-slate-400 leading-tight mt-0.5">
                {displayText ? displayText.slice(0, 32) : 'Limited voice: use record or text'}
              </div>
            </div>
          )}
        </div>

        {/* Plus Button */}
        <button
          onClick={() => (displayText ? handleSubmit(displayText) : setIsInputExpanded(true))}
          disabled={isThinking}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 disabled:opacity-30"
          title="Tambah perintah"
        >
          <Plus size={18} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-slate-200/90" />

        {/* Vibrant Blue Mic Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isThinking}
          title={isRecording ? 'Hentikan rekaman' : 'Mulai bicara'}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
            isRecording
              ? 'bg-rose-500 shadow-rose-500/30 scale-105 animate-pulse'
              : 'bg-blue-600 shadow-blue-600/30 hover:scale-105 hover:bg-blue-500 active:scale-95'
          } disabled:opacity-40 shrink-0`}
        >
          {isThinking ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isRecording ? (
            <MicOff size={20} />
          ) : (
            <Mic size={20} />
          )}
        </button>
      </div>

      {/* ── 2. Undo / Redo / Trash Pill ────────────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-2.5 py-2">
        <button
          onClick={handleUndo}
          title="Undo"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors active:scale-90"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={handleRedo}
          title="Redo"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors active:scale-90"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <button
          onClick={handleDeleteSelected}
          title="Hapus elemen terpilih"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors active:scale-90"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* ── 3. Zoom Controls Pill ─────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-3.5 py-2">
        <button
          onClick={() => handleZoom('out')}
          title="Zoom out"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors active:scale-90"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={() => handleZoom('reset')}
          title="Reset zoom"
          className="min-w-[42px] px-1 text-center font-bold text-xs text-slate-700 hover:text-blue-600 transition-colors"
        >
          {zoomPercent}%
        </button>

        <button
          onClick={() => handleZoom('in')}
          title="Zoom in"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors active:scale-90"
        >
          <ZoomIn size={16} />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <button
          onClick={() => handleZoom('reset')}
          title="Fit screen"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors active:scale-90"
        >
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
};
