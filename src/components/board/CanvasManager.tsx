import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useStore } from '../../store';
import type { CreatorTool } from '../../types';

interface CanvasManagerProps {
  onCanvasReady?: (canvas: any) => void;
}

export const CanvasManager: React.FC<CanvasManagerProps> = ({ onCanvasReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);

  const { canvas: canvasState, setActiveTool, setZoom, ui } = useStore();

  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeToolRef = useRef<CreatorTool>(canvasState.activeTool);
  activeToolRef.current = canvasState.activeTool;
  const onCanvasReadyRef = useRef(onCanvasReady);
  onCanvasReadyRef.current = onCanvasReady;

  // ── Initialize Fabric Canvas (Stable: only run once on mount) ───────────
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return;

    const FabricClass = (fabric as any)?.fabric || fabric || (window as any).fabric;
    if (!FabricClass) {
      console.warn('[CanvasManager] Fabric.js not loaded');
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;

    // High visual fidelity: disable bitmap raster caching for razor-sharp vector rendering
    FabricClass.Object.prototype.objectCaching = false;

    const fCanvas = new FabricClass.Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
      enableRetinaScaling: true,
    });

    fabricRef.current = fCanvas;
    (window as any).__KIMIWISE_CANVAS__ = fCanvas;

    // ── Sync background dotted mesh with canvas viewport ───────────────────
    const syncGrid = () => {
      if (!containerRef.current || !fCanvas) return;
      const vpt = fCanvas.viewportTransform;
      if (!vpt) return;
      const zoom = fCanvas.getZoom() || 1;
      const size = Math.max(14, Math.round(28 * zoom));
      const posX = Math.round(vpt[4]);
      const posY = Math.round(vpt[5]);
      containerRef.current.style.backgroundSize = `${size}px ${size}px`;
      containerRef.current.style.backgroundPosition = `${posX}px ${posY}px`;
    };
    (window as any).__KIMIWISE_SYNC_GRID__ = syncGrid;
    syncGrid();

    // ── Global Pan helper for toolbar / arrow buttons ───────────────────────
    (window as any).__KIMIWISE_PAN__ = (dx: number, dy: number) => {
      if (!fCanvas) return;
      if (FabricClass.Point) {
        fCanvas.relativePan(new FabricClass.Point(dx, dy));
      } else {
        const vpt = fCanvas.viewportTransform;
        if (vpt) {
          vpt[4] += dx;
          vpt[5] += dy;
          fCanvas.requestRenderAll();
        }
      }
      syncGrid();
    };

    // ── Scroll Wheel Zoom ──────────────────────────────────────────────────
    fCanvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = fCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 4) zoom = 4;
      if (zoom < 0.1) zoom = 0.1;
      fCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(zoom);
      syncGrid();
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // ── Pan (middle click, Space+drag, Alt+drag, or PAN tool) ──────────────
    fCanvas.on('mouse:down', (opt: any) => {
      const evt = opt.e;
      const currentTool = activeToolRef.current;
      if (evt.button === 1 || evt.altKey || currentTool === 'PAN') {
        isPanningRef.current = true;
        fCanvas.selection = false;
        lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
        fCanvas.defaultCursor = 'grabbing';
        fCanvas.setCursor('grabbing');
      }
    });

    fCanvas.on('mouse:move', (opt: any) => {
      if (isPanningRef.current) {
        const evt = opt.e;
        const vpt = fCanvas.viewportTransform;
        vpt[4] += evt.clientX - lastMousePosRef.current.x;
        vpt[5] += evt.clientY - lastMousePosRef.current.y;
        fCanvas.requestRenderAll();
        syncGrid();
        lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
      }
    });

    fCanvas.on('mouse:up', () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        fCanvas.selection = activeToolRef.current !== 'PAN';
        fCanvas.defaultCursor = activeToolRef.current === 'PAN' ? 'grab' : 'default';
        syncGrid();
      }
    });

    // ── Sync objects to store without triggering loop ─────────────────────
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
      useStore.getState().setCanvasObjects(objects);
    };

    fCanvas.on('object:added', syncObjects);
    fCanvas.on('object:modified', syncObjects);
    fCanvas.on('object:removed', syncObjects);

    // ── Resize handler ─────────────────────────────────────────────────────
    const handleResize = () => {
      if (!containerRef.current || !fabricRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      fabricRef.current.setWidth(w);
      fabricRef.current.setHeight(h);
      fabricRef.current.calcOffset();
      fabricRef.current.renderAll();
    };

    window.addEventListener('resize', handleResize);
    if (onCanvasReadyRef.current) onCanvasReadyRef.current(fCanvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      fCanvas.dispose();
      fabricRef.current = null;
      delete (window as any).__KIMIWISE_CANVAS__;
    };
  }, [setZoom]);

  // ── Sync viewport dimensions when activeView becomes board ──────────────
  useEffect(() => {
    if (ui.activeView === 'board' && fabricRef.current && containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        fabricRef.current.setWidth(w);
        fabricRef.current.setHeight(h);
        fabricRef.current.calcOffset();
        fabricRef.current.renderAll();
      }
    }
  }, [ui.activeView]);

  // ── Sync active tool drawing & shape creation ───────────────────────────
  useEffect(() => {
    const fCanvas = fabricRef.current;
    if (!fCanvas) return;
    const FabricClass = (window as any).fabric;
    if (!FabricClass) return;

    if (canvasState.activeTool === 'PAN') {
      fCanvas.isDrawingMode = false;
      fCanvas.selection = false;
      fCanvas.defaultCursor = 'grab';
      fCanvas.getObjects().forEach((o: any) => { o.selectable = false; o.evented = false; });
      fCanvas.requestRenderAll();
    } else if (canvasState.activeTool === 'PENCIL') {
      fCanvas.isDrawingMode = true;
      fCanvas.selection = false;
      fCanvas.freeDrawingBrush = new FabricClass.PencilBrush(fCanvas);
      fCanvas.freeDrawingBrush.color = canvasState.strokeColor;
      fCanvas.freeDrawingBrush.width = canvasState.strokeWidth;
      fCanvas.freeDrawingBrush.decimate = 2.0;
      fCanvas.defaultCursor = 'crosshair';
      fCanvas.discardActiveObject();
      fCanvas.requestRenderAll();
    } else if (canvasState.activeTool === 'ERASER') {
      fCanvas.isDrawingMode = true;
      fCanvas.selection = false;
      fCanvas.freeDrawingBrush = new FabricClass.PencilBrush(fCanvas);
      fCanvas.freeDrawingBrush.color = 'rgba(255,255,255,1)';
      fCanvas.freeDrawingBrush.width = Math.max(canvasState.strokeWidth * 4, 24);
      fCanvas.freeDrawingBrush.decimate = 2.0;
      fCanvas.defaultCursor = 'cell';
      fCanvas.discardActiveObject();
      fCanvas.requestRenderAll();
    } else if (canvasState.activeTool === 'SELECT') {
      fCanvas.isDrawingMode = false;
      fCanvas.selection = true;
      fCanvas.defaultCursor = 'default';
      fCanvas.getObjects().forEach((o: any) => { o.selectable = true; o.evented = true; });
      fCanvas.requestRenderAll();
    } else {
      // Shape / Text tool triggered from toolbar:
      // Instantly spawn at viewport center (like Trido), select it, and reset to SELECT
      fCanvas.isDrawingMode = false;
      fCanvas.selection = true;
      fCanvas.getObjects().forEach((o: any) => { o.selectable = true; o.evented = true; });
      const center = fCanvas.getVpCenter ? fCanvas.getVpCenter() : { x: fCanvas.width / 2, y: fCanvas.height / 2 };
      const fill = canvasState.fillColor === 'transparent' ? 'rgba(99,102,241,0.08)' : canvasState.fillColor;
      const stroke = canvasState.strokeColor;
      const sw = canvasState.strokeWidth;
      let obj: any = null;

      if (canvasState.activeTool === 'RECTANGLE') {
        obj = new FabricClass.Rect({
          left: center.x, top: center.y, width: 150, height: 95, rx: 12, ry: 12,
          fill, stroke, strokeWidth: sw, originX: 'center', originY: 'center',
          shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.08)', blur: 10, offsetY: 3 }),
        });
      } else if (canvasState.activeTool === 'CIRCLE') {
        obj = new FabricClass.Circle({
          left: center.x, top: center.y, radius: 52,
          fill, stroke, strokeWidth: sw, originX: 'center', originY: 'center',
          shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.08)', blur: 10, offsetY: 3 }),
        });
      } else if (canvasState.activeTool === 'TRIANGLE') {
        obj = new FabricClass.Triangle({
          left: center.x, top: center.y, width: 110, height: 100,
          fill, stroke, strokeWidth: sw, originX: 'center', originY: 'center',
          shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.08)', blur: 10, offsetY: 3 }),
        });
      } else if (canvasState.activeTool === 'TEXT') {
        obj = new FabricClass.IText('Double-click to edit', {
          left: center.x, top: center.y, fontSize: canvasState.fontSize || 22,
          fill: canvasState.strokeColor || '#1e293b', fontFamily: 'Inter, sans-serif',
          originX: 'center', originY: 'center',
        });
      } else if (canvasState.activeTool === 'LINE') {
        obj = new FabricClass.Line([center.x - 70, center.y, center.x + 70, center.y], {
          stroke, strokeWidth: sw || 3, originX: 'center', originY: 'center',
        });
      } else if (canvasState.activeTool === 'ARROW') {
        const arrowLine = new FabricClass.Line([center.x - 70, center.y, center.x + 70, center.y], {
          stroke, strokeWidth: sw || 3, selectable: false, evented: false,
        });
        const arrowHead = new FabricClass.Polygon([{ x: 0, y: -9 }, { x: 16, y: 0 }, { x: 0, y: 9 }], {
          fill: stroke, left: center.x + 70, top: center.y, originX: 'center', originY: 'center', selectable: false, evented: false,
        });
        obj = new FabricClass.Group([arrowLine, arrowHead], { left: center.x, top: center.y, originX: 'center', originY: 'center' });
      } else if (canvasState.activeTool === 'STAR') {
        const points = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 50 : 22;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          points.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
        }
        obj = new FabricClass.Polygon(points, {
          left: center.x, top: center.y, fill, stroke, strokeWidth: sw, originX: 'center', originY: 'center',
          shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.08)', blur: 10, offsetY: 3 }),
        });
      }

      if (obj) {
        obj.id = `obj_${Date.now()}`;
        fCanvas.add(obj);
        fCanvas.setActiveObject(obj);
        if (canvasState.activeTool === 'TEXT') {
          obj.enterEditing?.();
          obj.selectAll?.();
        }
        fCanvas.requestRenderAll();
        setActiveTool('SELECT');
      }
    }
  }, [canvasState.activeTool, canvasState.strokeColor, canvasState.strokeWidth, canvasState.fillColor, canvasState.fontSize, setActiveTool]);

  // ── Eraser & Keyboard handlers ─────────────────────────────────────────────
  useEffect(() => {
    const fCanvas = fabricRef.current;
    if (!fCanvas) return;

    let isMouseDown = false;
    const handleMouseDown = (opt: any) => {
      isMouseDown = true;
      if (activeToolRef.current === 'ERASER' && opt.target) {
        fCanvas.remove(opt.target);
        fCanvas.discardActiveObject();
        fCanvas.requestRenderAll();
      }
    };

    const handleMouseMove = (opt: any) => {
      if (isMouseDown && activeToolRef.current === 'ERASER' && opt.target) {
        fCanvas.remove(opt.target);
        fCanvas.discardActiveObject();
        fCanvas.requestRenderAll();
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    // Keyboard navigation & delete
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName || '')) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = fCanvas.getActiveObjects();
        if (active && active.length > 0) {
          active.forEach((o: any) => fCanvas.remove(o));
          fCanvas.discardActiveObject();
          fCanvas.requestRenderAll();
        }
      }
      // H → PAN tool shortcut
      if (e.key === 'h' || e.key === 'H') {
        useStore.getState().setActiveTool('PAN');
      }
      // V → SELECT tool shortcut
      if (e.key === 'v' || e.key === 'V') {
        useStore.getState().setActiveTool('SELECT');
      }
      // Arrow keys: move / pan across the whiteboard smoothly!
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && !fCanvas.getActiveObject()) {
        e.preventDefault();
        const step = e.shiftKey ? 250 : 100;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = step;
        else if (e.key === 'ArrowRight') dx = -step;
        else if (e.key === 'ArrowUp') dy = step;
        else if (e.key === 'ArrowDown') dy = -step;
        if (typeof (window as any).__KIMIWISE_PAN__ === 'function') {
          (window as any).__KIMIWISE_PAN__(dx, dy);
        }
      }
    };

    fCanvas.on('mouse:down', handleMouseDown);
    fCanvas.on('mouse:move', handleMouseMove);
    fCanvas.on('mouse:up', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      fCanvas.off('mouse:down', handleMouseDown);
      fCanvas.off('mouse:move', handleMouseMove);
      fCanvas.off('mouse:up', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle, #94a3b8 1.4px, transparent 1.4px)',
        backgroundSize: '28px 28px',
        backgroundPosition: '0px 0px',
        touchAction: 'none',
        cursor: canvasState.activeTool === 'PAN' ? 'grab' : canvasState.activeTool === 'SELECT' ? 'default' : 'crosshair',
      }}
    >
      {/* Fabric.js canvas — transparent background so dynamic grid shows through */}
      <canvas
        ref={canvasElRef}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};
