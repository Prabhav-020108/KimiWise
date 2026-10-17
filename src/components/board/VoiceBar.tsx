import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Sparkles, Loader2, Send, Undo2, Redo2,
  Trash2, ZoomIn, ZoomOut, Maximize2, Plus,
} from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { AudioVisualizer } from './AudioVisualizer';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';
import { agentDrawingService, parseEducationalPrompt } from '../../services/agentDrawingService';

// ── Action executor on Fabric canvas ──────────────────────────────────────────
function executeActionsOnCanvas(actions: any[]) {
  const fCanvas = (window as any).__KIMIWISE_CANVAS__;
  const FabricClass = (window as any).fabric;
  if (!fCanvas || !FabricClass || !actions || !actions.length) return;

  const cx = fCanvas.width ? fCanvas.width / 2 : 550;

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
          const left = p.x || cx;
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
            const grp = new FabricClass.Group([obj, txt], { left, top, id: action.id });
            grp.setCoords();
            fCanvas.add(grp);
          } else {
            obj.id = action.id;
            fCanvas.add(obj);
          }
          break;
        }
        case 'WRITE_TEXT': {
          const txt = new FabricClass.IText(p.text || '', {
            left: p.x || cx, top: p.y || 150, fontSize: p.fontSize || 22,
            fill: p.color || '#0a1a3a', fontFamily: 'Inter, sans-serif',
            fontWeight: p.fontWeight || 'bold', id: action.id,
          });
          fCanvas.add(txt);
          break;
        }
        case 'DRAW_ARROW': {
          const fx = Number(p.fromX ?? p.x1) || cx, fy = Number(p.fromY ?? p.y1) || 100;
          const tx = Number(p.toX ?? p.x2) || cx, ty = Number(p.toY ?? p.y2) || 200;
          const line = new FabricClass.Line([fx, fy, tx, ty], { stroke: p.color || '#6366f1', strokeWidth: p.strokeWidth || 2.5, selectable: false });
          const angle = Math.atan2(ty - fy, tx - fx);
          const head = new FabricClass.Triangle({
            left: tx, top: ty, originX: 'center', originY: 'center',
            angle: (angle * 180) / Math.PI + 90, width: 12, height: 12, fill: p.color || '#6366f1', selectable: false,
          });
          fCanvas.add(line);
          fCanvas.add(head);
          break;
        }
        case 'CREATE_MINDMAP': {
          const centerRect = new FabricClass.Rect({ left: 0, top: 0, width: 220, height: 60, rx: 16, fill: '#6366f1', stroke: '#4f46e5', strokeWidth: 1.5, originX: 'center', originY: 'center' });
          const centerTxt = new FabricClass.Text(p.topic || 'Core Subject', { left: 0, top: 0, fontSize: 15, fill: '#fff', fontFamily: 'Inter', fontWeight: 'bold', originX: 'center', originY: 'center' });
          const grp = new FabricClass.Group([centerRect, centerTxt], { left: cx, top: p.centerY || 350, originX: 'center', originY: 'center' });
          grp.setCoords();
          fCanvas.add(grp);
          const branches = p.subtopics || p.branches || [];
          branches.forEach((b: any, i: number) => {
            const bTitle = typeof b === 'string' ? b : b.title || `Node ${i + 1}`;
            const angle = (i / branches.length) * 2 * Math.PI - Math.PI / 2;
            const r = 210, bx = cx + Math.cos(angle) * r, by = (p.centerY || 350) + Math.sin(angle) * r;
            fCanvas.add(new FabricClass.Line([cx, p.centerY || 350, bx, by], { stroke: '#c7d2fe', strokeWidth: 1.8, opacity: 0.8, selectable: false }));
            const bRect = new FabricClass.Rect({ left: 0, top: 0, width: 160, height: 48, rx: 12, fill: '#eff6ff', stroke: '#6366f1', strokeWidth: 1.5, originX: 'center', originY: 'center' });
            const bTxt = new FabricClass.Text(bTitle, { left: 0, top: 0, fontSize: 12.5, fill: '#1e1b4b', fontFamily: 'Inter', fontWeight: 'bold', originX: 'center', originY: 'center' });
            const bGrp = new FabricClass.Group([bRect, bTxt], { left: bx, top: by, originX: 'center', originY: 'center' });
            bGrp.setCoords();
            fCanvas.add(bGrp);
          });
          break;
        }
        case 'CREATE_FLOWCHART': {
          const nodes = p.nodes || [];
          const startX = cx;
          const startY = p.startY || 120;
          nodes.forEach((node: any, i: number) => {
            const nx = startX;
            const ny = startY + i * 115;
            let group: any;
            if (node.type === 'start' || node.type === 'end') {
              const pill = new FabricClass.Rect({
                left: 0, top: 0, width: 260, height: 50, rx: 25, ry: 25,
                fill: node.type === 'start' ? '#059669' : '#4f46e5',
                stroke: '#ffffff', strokeWidth: 2, originX: 'center', originY: 'center',
              });
              const txt = new FabricClass.Text(node.label || 'Step', {
                left: 0, top: 0, fontSize: 13, fill: '#ffffff', fontFamily: 'Inter', fontWeight: 'bold', originX: 'center', originY: 'center',
              });
              group = new FabricClass.Group([pill, txt], { left: nx, top: ny, originX: 'center', originY: 'center' });
            } else if (node.type === 'decision') {
              const diamond = new FabricClass.Polygon(
                [{ x: 0, y: -38 }, { x: 130, y: 0 }, { x: 0, y: 38 }, { x: -130, y: 0 }],
                { left: 0, top: 0, fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 2, originX: 'center', originY: 'center' }
              );
              const txt = new FabricClass.Text(node.label || 'Decision', {
                left: 0, top: 0, fontSize: 12, fill: '#78350f', fontFamily: 'Inter', fontWeight: 'bold', originX: 'center', originY: 'center',
              });
              group = new FabricClass.Group([diamond, txt], { left: nx, top: ny, originX: 'center', originY: 'center' });
            } else {
              const rect = new FabricClass.Rect({
                left: 0, top: 0, width: 280, height: 52, rx: 12, ry: 12,
                fill: '#f0f7ff', stroke: '#3b82f6', strokeWidth: 1.8, originX: 'center', originY: 'center',
              });
              const txt = new FabricClass.Text(node.label || 'Process', {
                left: 0, top: 0, fontSize: 12.5, fill: '#1e3a8a', fontFamily: 'Inter', fontWeight: 'bold', originX: 'center', originY: 'center',
              });
              group = new FabricClass.Group([rect, txt], { left: nx, top: ny, originX: 'center', originY: 'center' });
            }
            group.setCoords();
            fCanvas.add(group);

            if (i > 0) {
              const prevY = startY + (i - 1) * 115 + 26;
              const curY = ny - 26;
              const line = new FabricClass.Line([nx, prevY, nx, curY], { stroke: '#3b82f6', strokeWidth: 2.2, selectable: false });
              const head = new FabricClass.Triangle({
                left: nx, top: curY, originX: 'center', originY: 'center', angle: 180, width: 12, height: 12, fill: '#3b82f6', selectable: false,
              });
              fCanvas.add(line);
              fCanvas.add(head);
            }
          });
          break;
        }
        case 'CLEAR_CANVAS':
          fCanvas.clear();
          fCanvas.backgroundColor = '#ffffff';
          break;
        default: break;
      }
      fCanvas.requestRenderAll();
    }, idx * 100);
  });
}

// ── Bottom Action Bar (Trido & CodeBuddy style) ───────────────────────────────
export const VoiceBar: React.FC = () => {
  const { isRecording, transcript, interimTranscript, audioData, startRecording, stopRecording, resetTranscript } = useVoice();
  const { agent, setAgentState, addChatMessage, canvas, setZoom } = useStore();

  const [customInput, setCustomInput] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [undoStack, setUndoStack] = useState<any[][]>([]);
  const prevRecordingRef = useRef(false);

  const displayText = transcript || interimTranscript || customInput;
  const isThinking = agent.isThinking;

  // ── Auto-submit voice transcript when recording stops ─────────────────────
  useEffect(() => {
    if (prevRecordingRef.current && !isRecording) {
      const spoken = transcript.trim() || interimTranscript.trim();
      if (spoken && !isThinking) {
        handleSubmit(spoken);
      }
    }
    prevRecordingRef.current = isRecording;
  }, [isRecording, transcript, interimTranscript]);

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

    const isVisual = /(flowchart|roadmap|diagram|mindmap|draw|create|make|lesson|algorithm|cycle|architecture|workflow|chart|teach|explain|concept|pipeline|process|steps|breakdown)/i.test(cmd);

    setAgentState({ isThinking: true, isActing: true, agentMessage: `Teaching: "${cmd.slice(0, 32)}..."` });
    addChatMessage({ id: `u_${Date.now()}`, role: 'user', text: cmd, timestamp: Date.now() });

    try {
      if (isVisual) {
        // Run animated Whiteboard Drawing Agent!
        await agentDrawingService.drawOnCanvas(cmd);
        const diagramData = parseEducationalPrompt(cmd);
        addChatMessage({
          id: `a_${Date.now()}`,
          role: 'model',
          text: `I've created the whiteboard visual lesson for "${diagramData.title}". Take a look at the interactive canvas!`,
          timestamp: Date.now(),
          model: 'KimiWise Agent',
        });
      } else {
        const resp = await aiService.generateBoardActions({ prompt: cmd, intent: 'auto' }).catch(async () => {
          const chatRes = await aiService.chat(cmd);
          return {
            textResponse: chatRes.textResponse,
            actions: [],
            mode: chatRes.mode,
            model: 'KimiWise AI',
          };
        });

        if (resp?.actions && resp.actions.length > 0) {
          executeActionsOnCanvas(resp.actions);
        }

        const textResponse = resp?.textResponse || `I have processed your request for: "${cmd}".`;
        setAgentState({ agentMessage: textResponse });
        addChatMessage({
          id: `a_${Date.now()}`,
          role: 'model',
          text: textResponse,
          timestamp: Date.now(),
          model: resp?.model || 'Gemma 4',
        });
      }
    } catch (err: any) {
      setAgentState({ agentMessage: `AI Tutor: ${err?.message || 'Processing completed.'}` });
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
        <div className="flex-1 min-w-[150px] max-w-[240px]">
          {isRecording ? (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-rose-600 animate-pulse">Listening...</span>
              <span className="text-[11px] text-slate-500 truncate">{displayText || 'Speak to AI tutor...'}</span>
            </div>
          ) : isThinking ? (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800 truncate">KimiWise AI Teaching</span>
              <span className="text-[11px] text-slate-400 truncate">
                {agent.agentMessage?.slice(0, 35) || 'Preparing whiteboard...'}
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
              placeholder="Ask AI tutor, e.g. 'Explain binary search'..."
              className="bg-transparent border-none outline-none text-[12.5px] text-slate-800 placeholder:text-slate-400 w-full font-medium"
              autoFocus
            />
          ) : (
            <div onClick={() => setIsInputExpanded(true)} className="cursor-text">
              <div className="text-[13.5px] font-bold text-slate-800 tracking-tight leading-tight">
                {displayText ? displayText.slice(0, 28) : 'Ask AI Tutor / Click Mic'}
              </div>
              <div className="text-[11.5px] font-normal text-slate-400 leading-tight mt-0.5">
                {displayText ? 'Click Send or Enter' : 'Type or speak to teach on board'}
              </div>
            </div>
          )}
        </div>

        {/* Send / Expand Button */}
        {displayText ? (
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              handleSubmit(displayText);
            }}
            disabled={isThinking}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-colors shrink-0 disabled:opacity-30 shadow-xs"
            title="Send to AI Tutor"
          >
            <Send size={15} />
          </button>
        ) : (
          <button
            onClick={() => setIsInputExpanded(true)}
            disabled={isThinking}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 disabled:opacity-30"
            title="Type a command"
          >
            <Plus size={18} />
          </button>
        )}

        {/* Separator */}
        <div className="w-px h-6 bg-slate-200/90" />

        {/* Vibrant Blue Mic Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isThinking}
          title={isRecording ? 'Stop voice recording' : 'Start speaking to AI Tutor'}
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
          title="Delete selected item"
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
