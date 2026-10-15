import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import type { CreatorTool } from '../../types';

declare const fabric: any;

interface CanvasManagerProps {
  onCanvasReady?: (canvas: any) => void;
}

export const CanvasManager: React.FC<CanvasManagerProps> = ({ onCanvasReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);

  const { canvas: canvasState, setActiveTool, setZoom, setCanvasObjects } = useStore();

  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeToolRef = useRef<CreatorTool>(canvasState.activeTool);
  activeToolRef.current = canvasState.activeTool;

  // ── Initialize Fabric Canvas ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return;

    const FabricClass = (window as any).fabric || (typeof fabric !== 'undefined' ? fabric : null);
    if (!FabricClass) {
      console.warn('[CanvasManager] Fabric.js not loaded');
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;

    const fCanvas = new FabricClass.Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = fCanvas;
    (window as any).__KIMIWISE_CANVAS__ = fCanvas;

    // ── Scroll Wheel Zoom ──────────────────────────────────────────────────
    fCanvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = fCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 4) zoom = 4;
      if (zoom < 0.1) zoom = 0.1;
      fCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // ── Pan (middle click or Alt drag) ─────────────────────────────────────
    fCanvas.on('mouse:down', (opt: any) => {
      const evt = opt.e;
      if (evt.button === 1 || evt.altKey) {
        isPanningRef.current = true;
        fCanvas.selection = false;
        lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
        fCanvas.defaultCursor = 'grab';
      }
    });

    fCanvas.on('mouse:move', (opt: any) => {
      if (isPanningRef.current) {
        const evt = opt.e;
        const vpt = fCanvas.viewportTransform;
        vpt[4] += evt.clientX - lastMousePosRef.current.x;
        vpt[5] += evt.clientY - lastMousePosRef.current.y;
        fCanvas.requestRenderAll();
        lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
      }
    });

    fCanvas.on('mouse:up', () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        fCanvas.selection = true;
        fCanvas.defaultCursor = 'default';
      }
    });

    // ── Sync objects to store ──────────────────────────────────────────────
    const syncObjects = () => {
      const objects = fCanvas.getObjects().map((obj: any) => ({
        id: obj.id || String(Math.random()),
        type: obj.type,
        left: obj.left,
        top: obj.top,
        width: obj.width * (obj.scaleX || 1),
        height: obj.height * (obj.scaleY || 1),
        fill: obj.fill || '#ffffff',
        angle: obj.angle || 0,
      }));
      setCanvasObjects(objects);
    };

    fCanvas.on('object:added', syncObjects);
    fCanvas.on('object:modified', syncObjects);
    fCanvas.on('object:removed', syncObjects);

    // ── Resize handler ─────────────────────────────────────────────────────
    const handleResize = () => {
      if (!containerRef.current || !fabricRef.current) return;
      fabricRef.current.setWidth(containerRef.current.clientWidth);
      fabricRef.current.setHeight(containerRef.current.clientHeight);
      fabricRef.current.renderAll();
    };

    window.addEventListener('resize', handleResize);
    if (onCanvasReady) onCanvasReady(fCanvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      fCanvas.dispose();
      fabricRef.current = null;
      delete (window as any).__KIMIWISE_CANVAS__;
    };
  }, [onCanvasReady, setZoom, setCanvasObjects]);

  // ── Sync active tool drawing mode ─────────────────────────────────────────
  useEffect(() => {
    const fCanvas = fabricRef.current;
    if (!fCanvas) return;

    if (canvasState.activeTool === 'PENCIL') {
      fCanvas.isDrawingMode = true;
      fCanvas.freeDrawingBrush.color = canvasState.strokeColor;
      fCanvas.freeDrawingBrush.width = canvasState.strokeWidth;
    } else {
      fCanvas.isDrawingMode = false;
    }

    if (canvasState.activeTool === 'SELECT') {
      fCanvas.defaultCursor = 'default';
      fCanvas.selection = true;
    } else if (canvasState.activeTool === 'ERASER') {
      fCanvas.defaultCursor = 'crosshair';
    } else {
      fCanvas.defaultCursor = 'crosshair';
    }
  }, [canvasState.activeTool, canvasState.strokeColor, canvasState.strokeWidth]);

  // ── Shape / Text placement on click ───────────────────────────────────────
  useEffect(() => {
    const fCanvas = fabricRef.current;
    if (!fCanvas) return;
    const FabricClass = (window as any).fabric;
    if (!FabricClass) return;

    const handleClick = (opt: any) => {
      if (opt.target || isPanningRef.current) return;
      const pointer = fCanvas.getPointer(opt.e);
      const tool = activeToolRef.current;
      let obj: any = null;
      const fill = canvasState.fillColor === 'transparent' ? 'rgba(99,102,241,0.08)' : canvasState.fillColor;
      const stroke = canvasState.strokeColor;
      const sw = canvasState.strokeWidth;

      if (tool === 'RECTANGLE') {
        obj = new FabricClass.Rect({ left: pointer.x - 75, top: pointer.y - 45, width: 150, height: 90, rx: 12, ry: 12, fill, stroke, strokeWidth: sw });
      } else if (tool === 'CIRCLE') {
        obj = new FabricClass.Circle({ left: pointer.x - 50, top: pointer.y - 50, radius: 50, fill, stroke, strokeWidth: sw });
      } else if (tool === 'TRIANGLE') {
        obj = new FabricClass.Triangle({ left: pointer.x - 50, top: pointer.y - 50, width: 100, height: 90, fill, stroke, strokeWidth: sw });
      } else if (tool === 'TEXT') {
        obj = new FabricClass.IText('Double-click to edit', { left: pointer.x, top: pointer.y, fontSize: canvasState.fontSize || 20, fill: canvasState.strokeColor || '#1e293b', fontFamily: 'Inter, sans-serif' });
      } else if (tool === 'ARROW' || tool === 'LINE') {
        obj = new FabricClass.Line([pointer.x, pointer.y, pointer.x + 120, pointer.y], { stroke, strokeWidth: sw || 2 });
      } else if (tool === 'STAR') {
        // Create star using polygon points
        const cx = pointer.x, cy = pointer.y;
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 50 : 22;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
        }
        obj = new FabricClass.Polygon(points, { fill: fill || '#fbbf24', stroke, strokeWidth: sw });
      }

      if (obj) {
        obj.id = `obj_${Date.now()}`;
        fCanvas.add(obj);
        fCanvas.setActiveObject(obj);
        fCanvas.requestRenderAll();
        setActiveTool('SELECT');
      }
    };

    fCanvas.on('mouse:down', handleClick);
    return () => fCanvas.off('mouse:down', handleClick);
  }, [canvasState.fillColor, canvasState.strokeColor, canvasState.strokeWidth, canvasState.fontSize, setActiveTool]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ touchAction: 'none', cursor: canvasState.activeTool === 'SELECT' ? 'default' : 'crosshair' }}
    >
      {/* Dot grid background — exactly like Trido */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.65,
        }}
      />

      <canvas ref={canvasElRef} className="absolute inset-0" />
    </div>
  );
};
