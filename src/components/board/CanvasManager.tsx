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

  const {
    canvas: canvasState,
    setActiveTool,
    setZoom,
    setCanvasObjects,
  } = useStore();

  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeToolRef = useRef<CreatorTool>(canvasState.activeTool);
  activeToolRef.current = canvasState.activeTool;

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return;

    // Use window.fabric (from index.html CDN) or fallback to global fabric
    const FabricClass = (window as any).fabric || (typeof fabric !== 'undefined' ? fabric : null);
    if (!FabricClass) {
      console.warn('[CanvasManager] Fabric.js not yet loaded on window');
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

    // ── Mouse Wheel Zoom (centered around pointer) ──────────────────────────
    fCanvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = fCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 4) zoom = 4;
      if (zoom < 0.2) zoom = 0.2;

      fCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // ── Pan (Middle click or Alt/Space key drag) ──────────────────────────────
    fCanvas.on('mouse:down', (opt: any) => {
      const evt = opt.e;
      if (
        evt.button === 1 || // Middle mouse button
        evt.altKey ||
        evt.spaceKey ||
        activeToolRef.current === 'SELECT' && !opt.target && evt.shiftKey
      ) {
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

    // ── Track Object Changes in Zustand Store ───────────────────────────────
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

    // ── Window Resize Handler ────────────────────────────────────────────────
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

  // ── Sync Active Tool (Pencil, Eraser, Shapes, Select) ──────────────────────
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

    if (canvasState.activeTool === 'ERASER') {
      fCanvas.defaultCursor = 'crosshair';
    } else if (canvasState.activeTool === 'SELECT') {
      fCanvas.defaultCursor = 'default';
      fCanvas.selection = true;
    } else {
      fCanvas.defaultCursor = 'crosshair';
    }
  }, [
    canvasState.activeTool,
    canvasState.strokeColor,
    canvasState.strokeWidth,
  ]);

  // ── Manual Shape/Text Placement on Click ──────────────────────────────────
  useEffect(() => {
    const fCanvas = fabricRef.current;
    if (!fCanvas) return;
    const FabricClass = (window as any).fabric;
    if (!FabricClass) return;

    const handleCanvasClick = (opt: any) => {
      if (opt.target || isPanningRef.current) return;
      const pointer = fCanvas.getPointer(opt.e);
      const tool = activeToolRef.current;

      let newObj: any = null;

      if (tool === 'RECTANGLE') {
        newObj = new FabricClass.Rect({
          left: pointer.x - 75,
          top: pointer.y - 45,
          width: 150,
          height: 90,
          rx: 12,
          ry: 12,
          fill: canvasState.fillColor === 'transparent' ? 'rgba(99, 102, 241, 0.15)' : canvasState.fillColor,
          stroke: canvasState.strokeColor,
          strokeWidth: canvasState.strokeWidth,
          shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 15, offsetY: 6 }),
        });
      } else if (tool === 'CIRCLE') {
        newObj = new FabricClass.Circle({
          left: pointer.x - 50,
          top: pointer.y - 50,
          radius: 50,
          fill: canvasState.fillColor === 'transparent' ? 'rgba(99, 102, 241, 0.15)' : canvasState.fillColor,
          stroke: canvasState.strokeColor,
          strokeWidth: canvasState.strokeWidth,
          shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 15, offsetY: 6 }),
        });
      } else if (tool === 'TRIANGLE') {
        newObj = new FabricClass.Triangle({
          left: pointer.x - 50,
          top: pointer.y - 50,
          width: 100,
          height: 90,
          fill: canvasState.fillColor === 'transparent' ? 'rgba(99, 102, 241, 0.15)' : canvasState.fillColor,
          stroke: canvasState.strokeColor,
          strokeWidth: canvasState.strokeWidth,
        });
      } else if (tool === 'TEXT') {
        newObj = new FabricClass.IText('Double click to edit', {
          left: pointer.x,
          top: pointer.y,
          fontSize: canvasState.fontSize || 20,
          fill: canvasState.strokeColor || '#ffffff',
          fontFamily: 'Inter, sans-serif',
        });
      } else if (tool === 'ARROW' || tool === 'LINE') {
        const line = new FabricClass.Line([pointer.x, pointer.y, pointer.x + 120, pointer.y], {
          stroke: canvasState.strokeColor,
          strokeWidth: canvasState.strokeWidth || 3,
        });
        newObj = line;
      }

      if (newObj) {
        newObj.id = `obj_${Date.now()}`;
        fCanvas.add(newObj);
        fCanvas.setActiveObject(newObj);
        fCanvas.requestRenderAll();
        setActiveTool('SELECT');
      }
    };

    fCanvas.on('mouse:down', handleCanvasClick);
    return () => {
      fCanvas.off('mouse:down', handleCanvasClick);
    };
  }, [canvasState.fillColor, canvasState.strokeColor, canvasState.strokeWidth, canvasState.fontSize, setActiveTool]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-background select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-25 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      <canvas ref={canvasElRef} className="absolute inset-0" />
    </div>
  );
};
