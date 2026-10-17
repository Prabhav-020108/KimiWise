import React, { useState, useEffect } from 'react';
import {
  MousePointer2,
  Pencil,
  Eraser,
  Square,
  Circle,
  Triangle,
  Type,
  MoveRight,
  Minus,
  ImageIcon,
  MoreHorizontal,
  ChevronRight,
  PaintBucket,
  Star,
  Highlighter,
  GitBranch,
} from 'lucide-react';
import { useStore } from '../../store';
import type { CreatorTool } from '../../types';

// ── Color palette (same curated Trido palette, adapted for KimiWise) ──────────
const PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b', '#6366f1',
];

const BRUSH_SIZES = [2, 5, 10, 18];

const SHAPES: { tool: CreatorTool; icon: React.ElementType; label: string }[] = [
  { tool: 'RECTANGLE', icon: Square,   label: 'Rectangle' },
  { tool: 'CIRCLE',    icon: Circle,   label: 'Circle' },
  { tool: 'TRIANGLE',  icon: Triangle, label: 'Triangle' },
  { tool: 'LINE',      icon: Minus,    label: 'Line' },
  { tool: 'ARROW',     icon: MoveRight,label: 'Arrow' },
  { tool: 'STAR',      icon: Star,     label: 'Star' },
];

type PanelId = 'draw' | 'shapes' | 'text' | 'image';

// ── Flyout panel (slides in from the right of toolbar) ─────────────────────
const Flyout: React.FC<{
  open: boolean;
  children: React.ReactNode;
  align?: 'top' | 'center' | 'bottom';
}> = ({ open, children, align = 'top' }) => {
  const positionClass =
    align === 'bottom' ? 'bottom-0' : align === 'center' ? 'top-1/2 -translate-y-1/2' : 'top-0';

  if (!open) return null;

  return (
    <div
      className={`absolute left-full ml-3.5 z-50 bg-white/97 backdrop-blur-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 rounded-3xl p-4 w-56 ${positionClass}`}
      style={{ animation: 'flyoutIn 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      {children}
    </div>
  );
};

// ── Squircle toolbar button ───────────────────────────────────────────────
const Btn: React.FC<{
  icon: React.ElementType;
  active?: boolean;
  title?: string;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ icon: Icon, active, title, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    className={`relative w-10 h-10 flex items-center justify-center rounded-[1.1rem] transition-all cursor-pointer select-none ${
      active
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300/40'
        : 'text-slate-600 hover:bg-slate-100/90 hover:text-blue-600'
    }`}
  >
    <Icon size={19} strokeWidth={active ? 2.5 : 2} />
    {children}
  </button>
);

export const DrawingToolbar: React.FC = () => {
  const { canvas, setActiveTool, setStrokeColor, setStrokeWidth, setFillColor, setDiagramModalOpen } = useStore();
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const [isShapeFilled, setIsShapeFilled] = useState(false);

  const toggle = (p: PanelId) => setOpenPanel((prev) => (prev === p ? null : p));
  const close = () => setOpenPanel(null);

  const activeTool = canvas.activeTool;
  const brushColor = canvas.strokeColor;
  const brushWidth = canvas.strokeWidth;

  const activeShape = SHAPES.find((s) => s.tool === activeTool);
  const ShapeIcon = activeShape?.icon ?? Square;
  const isDrawingMode = activeTool === 'PENCIL' || activeTool === 'ERASER';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName || ''))
        return;
      if (e.key === 'Escape') { close(); setActiveTool('SELECT'); }
      else if (e.key === 'v' || e.key === 'V') { close(); setActiveTool('SELECT'); }
      else if (e.key === 'p' || e.key === 'P') { close(); setActiveTool('PENCIL'); }
      else if (e.key === 'e' || e.key === 'E') { close(); setActiveTool('ERASER'); }
      else if (e.key === 't' || e.key === 'T') { close(); setActiveTool('TEXT'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setActiveTool]);

  return (
    <>
      {/* Click-outside backdrop */}
      {openPanel && (
        <div className="fixed inset-0 z-40 bg-transparent pointer-events-auto" onClick={close} />
      )}

      <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 pointer-events-auto z-50">
        {/* Vertical Pill Toolbar */}
        <div
          className="relative flex flex-col items-center gap-1.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-900/8 rounded-full p-2"
          style={{ animation: 'slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* 1. SELECT */}
          <Btn
            icon={MousePointer2}
            active={activeTool === 'SELECT'}
            title="Select (V)"
            onClick={() => { setActiveTool('SELECT'); close(); }}
          />

          <div className="w-5 h-px bg-slate-200" />

          {/* 2. DRAW (Pencil + Eraser + Color + Size flyout) */}
          <div className="relative">
            <Btn
              icon={activeTool === 'ERASER' ? Eraser : Pencil}
              active={openPanel === 'draw' || isDrawingMode}
              title="Draw & Eraser (P)"
              onClick={() => {
                if (!isDrawingMode) setActiveTool('PENCIL');
                toggle('draw');
              }}
            >
              <ChevronRight size={7} className="absolute right-0.5 bottom-0.5 opacity-40" />
            </Btn>
            <Flyout open={openPanel === 'draw'}>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">DRAW MODE</div>
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => { setActiveTool('PENCIL'); setStrokeWidth(3); }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    activeTool === 'PENCIL' && brushWidth <= 6 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Pencil size={12} /> Pen
                </button>
                <button
                  onClick={() => {
                    setActiveTool('PENCIL');
                    setStrokeWidth(18);
                    if (brushColor === '#000000' || brushColor === '#1e1b4b') {
                      setStrokeColor('#f59e0b');
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    activeTool === 'PENCIL' && brushWidth > 6 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Highlighter size={12} /> Marker
                </button>
                <button
                  onClick={() => setActiveTool('ERASER')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    activeTool === 'ERASER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Eraser size={12} /> Erase
                </button>
              </div>

              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">COLOR</div>
              <div className="grid grid-cols-6 gap-1 mb-2">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStrokeColor(c)}
                    className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 ${
                      brushColor === c ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : 'ring-1 ring-slate-200'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-8 rounded-xl cursor-pointer border border-slate-200 mb-3"
              />

              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">SIZE</div>
              <div className="flex gap-1">
                {BRUSH_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrokeWidth(s)}
                    className={`flex-1 h-8 flex items-center justify-center rounded-xl transition-colors ${
                      brushWidth === s ? 'bg-blue-600' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <div
                      className={`rounded-full ${brushWidth === s ? 'bg-white' : 'bg-slate-500'}`}
                      style={{ width: Math.min(s + 3, 14), height: Math.min(s + 3, 14) }}
                    />
                  </button>
                ))}
              </div>
            </Flyout>
          </div>

          {/* 3. SHAPES flyout */}
          <div className="relative">
            <Btn
              icon={ShapeIcon}
              active={openPanel === 'shapes' || !!activeShape}
              title="Shapes"
              onClick={() => toggle('shapes')}
            >
              <ChevronRight size={7} className="absolute right-0.5 bottom-0.5 opacity-40" />
            </Btn>
            <Flyout open={openPanel === 'shapes'} align="center">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">SHAPES</div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {SHAPES.map((s) => (
                  <button
                    key={s.tool}
                    title={s.label}
                    onClick={() => { setActiveTool(s.tool); close(); }}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                      activeTool === s.tool ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <s.icon size={15} />
                  </button>
                ))}
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">FILL STYLE</div>
              <button
                onClick={() => {
                  const next = !isShapeFilled;
                  setIsShapeFilled(next);
                  setFillColor(next ? brushColor : 'transparent');
                }}
                className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isShapeFilled ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <PaintBucket size={12} />
                {isShapeFilled ? 'Fill On' : 'Outline Only'}
              </button>
            </Flyout>
          </div>

          {/* 4. TEXT */}
          <Btn
            icon={Type}
            active={activeTool === 'TEXT'}
            title="Text (T)"
            onClick={() => { setActiveTool('TEXT'); close(); }}
          />

          {/* 5. IMAGE */}
          <Btn
            icon={ImageIcon}
            title="Insert Image"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = () => {
                const file = input.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const fCanvas = (window as any).__KIMIWISE_CANVAS__;
                  const FabricClass = (window as any).fabric;
                  if (!fCanvas || !FabricClass) return;
                  FabricClass.Image.fromURL(ev.target?.result as string, (img: any) => {
                    if (!img) return;
                    const center = fCanvas.getVpCenter ? fCanvas.getVpCenter() : { x: 500, y: 350 };
                    const maxDim = 450;
                    if (img.width > maxDim || img.height > maxDim) {
                      img.scaleToWidth(Math.min(img.width, maxDim));
                    }
                    img.set({
                      left: center.x,
                      top: center.y,
                      originX: 'center',
                      originY: 'center',
                      cornerColor: '#3b82f6',
                      cornerSize: 9,
                      transparentCorners: false,
                    });
                    fCanvas.add(img);
                    fCanvas.setActiveObject(img);
                    fCanvas.requestRenderAll();
                  });
                };
                reader.readAsDataURL(file);
              };
              input.click();
            }}
          />

          {/* 6. DIAGRAM BUILDER */}
          <Btn
            icon={GitBranch}
            title="AI Diagram Builder"
            onClick={() => setDiagramModalOpen(true)}
          />

          <div className="w-5 h-px bg-slate-200" />

          {/* 6. MORE / overflow placeholder */}
          <Btn
            icon={MoreHorizontal}
            active={openPanel === 'image'}
            title="More Tools"
            onClick={() => toggle('image')}
          >
            <ChevronRight size={7} className="absolute right-0.5 bottom-0.5 opacity-40" />
          </Btn>
          <Flyout open={openPanel === 'image'} align="bottom">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">CANVAS COLORS</div>
            <div className="grid grid-cols-6 gap-1">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  title={`Fill: ${c}`}
                  onClick={() => {
                    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
                    if (fCanvas) {
                      fCanvas.backgroundColor = c;
                      fCanvas.requestRenderAll();
                    }
                  }}
                  className="w-6 h-6 rounded-lg ring-1 ring-slate-200 hover:scale-110 transition-transform"
                  style={{ background: c }}
                />
              ))}
            </div>
          </Flyout>
        </div>
      </div>
    </>
  );
};
