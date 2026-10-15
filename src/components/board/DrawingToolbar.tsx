import React from 'react';
import {
  MousePointer,
  Pen,
  Type,
  Square,
  Circle,
  Triangle,
  MoveRight,
  Eraser,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useStore } from '../../store';
import type { CreatorTool } from '../../types';

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#ffffff', // White
  '#1e293b', // Slate Dark
];

const STROKE_WIDTHS = [2, 4, 8];

export const DrawingToolbar: React.FC = () => {
  const {
    canvas,
    setActiveTool,
    setStrokeColor,
    setStrokeWidth,
    setZoom,
  } = useStore();

  const tools: { id: CreatorTool; icon: React.ReactNode; label: string }[] = [
    { id: 'SELECT', icon: <MousePointer size={18} />, label: 'Select' },
    { id: 'PENCIL', icon: <Pen size={18} />, label: 'Pen / Draw' },
    { id: 'TEXT', icon: <Type size={18} />, label: 'Text' },
    { id: 'RECTANGLE', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'CIRCLE', icon: <Circle size={18} />, label: 'Circle' },
    { id: 'TRIANGLE', icon: <Triangle size={18} />, label: 'Triangle' },
    { id: 'ARROW', icon: <MoveRight size={18} />, label: 'Arrow' },
    { id: 'ERASER', icon: <Eraser size={18} />, label: 'Eraser' },
  ];

  const handleClearCanvas = () => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (fCanvas) {
      fCanvas.clear();
      fCanvas.backgroundColor = 'transparent';
      fCanvas.requestRenderAll();
    }
  };

  const handleZoom = (delta: number) => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (fCanvas) {
      let zoom = fCanvas.getZoom() + delta;
      zoom = Math.max(0.2, Math.min(4, zoom));
      fCanvas.setZoom(zoom);
      setZoom(zoom);
    }
  };

  const handleResetZoom = () => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    if (fCanvas) {
      fCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoom(1);
    }
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
      {/* Primary Tool Bar */}
      <div className="flex flex-col gap-1 p-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/80 shadow-2xl">
        {tools.map((t) => {
          const isActive = canvas.activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={t.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-indigo-500/25 scale-105'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {t.icon}
            </button>
          );
        })}

        <div className="w-full h-px bg-border my-1" />

        {/* Color Palette */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setStrokeColor(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border border-border transition-all ${
                canvas.strokeColor === c ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-card' : 'opacity-80 hover:opacity-100'
              }`}
            />
          ))}
        </div>

        <div className="w-full h-px bg-border my-1" />

        {/* Stroke Widths */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw}
              onClick={() => setStrokeWidth(sw)}
              className={`w-7 h-6 rounded-lg flex items-center justify-center transition-all ${
                canvas.strokeWidth === sw ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: sw * 2, height: sw * 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Utilities: Zoom & Clear */}
      <div className="flex flex-col gap-1 p-1.5 rounded-xl bg-card/80 backdrop-blur-xl border border-border/80 shadow-xl">
        <button
          onClick={() => handleZoom(0.2)}
          title="Zoom In"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset Zoom (100%)"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
        >
          <Maximize2 size={15} />
        </button>
        <button
          onClick={handleClearCanvas}
          title="Clear Whiteboard"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
