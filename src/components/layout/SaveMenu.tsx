import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  HardDrive,
  FileJson,
  Download,
  FilePlus,
  ChevronDown,
  Check,
  Clock,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import { useStore } from '../../store';
import { toast } from '../../utils/toast';
import { pdfExportService } from '../../services/pdfExportService';

export const SaveMenu: React.FC = () => {
  const { session, setCurrentSession } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(session.currentSession?.title || 'Classroom Whiteboard');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedDone, setIsSavedDone] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);

      // Global Ctrl+S / Cmd+S handler
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveToDb();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [title]);

  // Sync latest Fabric canvas objects into active slide
  const syncCurrentSlide = () => {
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;
    const store = useStore.getState();
    const slides = [...store.canvas.slides];
    const idx = store.canvas.currentPageIndex;

    if (fCanvas && slides[idx]) {
      slides[idx] = {
        ...slides[idx],
        canvasJson: fCanvas.toJSON(),
      };
      useStore.setState((s) => ({
        canvas: { ...s.canvas, slides },
      }));
    }
    return slides;
  };

  // ── 1. Save to Browser Storage ──────────────────────────────────────────────
  const handleSaveToDb = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSaving(true);

    try {
      const slides = syncCurrentSlide();
      const currentIdx = useStore.getState().canvas.currentPageIndex;
      const exportData = {
        app: 'KimiWise',
        version: '1.0.0',
        savedAt: Date.now(),
        title: title || 'Classroom Whiteboard',
        slides,
        currentPageIndex: currentIdx,
      };

      localStorage.setItem('kimiwise_saved_session', JSON.stringify(exportData));

      setCurrentSession({
        id: `sess_${Date.now()}`,
        title: title || 'Classroom Whiteboard',
        createdAt: session.currentSession?.createdAt || Date.now(),
        updatedAt: Date.now(),
        thumbnail: '',
        sizeBytes: JSON.stringify(exportData).length,
        pages: slides.map((s) => ({
          canvas: s.canvasJson || {},
          dom: {},
        })),
      });

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      setIsSaving(false);
      setIsSavedDone(true);
      toast.success(`Board "${title}" saved to local storage!`);
      setTimeout(() => setIsSavedDone(false), 2500);
    } catch (err: any) {
      setIsSaving(false);
      toast.error('Failed to save to local storage: ' + (err.message || ''));
    }
  };

  // ── 2. Download Project File (.kimiwise.json) ────────────────────────────────
  const handleDownloadProject = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const slides = syncCurrentSlide();
      const currentIdx = useStore.getState().canvas.currentPageIndex;

      const projectData = {
        app: 'KimiWise',
        version: '1.0.0',
        exportedAt: Date.now(),
        title: title || 'Classroom Whiteboard',
        slides,
        currentPageIndex: currentIdx,
        chatMessages: useStore.getState().chat.messages,
        lessonPlan: useStore.getState().lesson.activeLessonPlan,
      };

      const safeName = (title || 'kimiwise_board').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${safeName}_${Date.now()}.kimiwise.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Project file "${safeName}.kimiwise.json" downloaded!`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Failed to download project file.');
    }
  };

  // ── 3. Export All Slides as Multi-Page PDF Deck (Phase E) ───────────────────
  const handleExportPdfDeck = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const slides = syncCurrentSlide();
    const store = useStore.getState();

    if (!slides || slides.length === 0) {
      toast.error('No whiteboard slides found to export.');
      return;
    }

    setIsExportingPdf(true);
    setPdfProgressText(`Preparing ${slides.length} slide(s)...`);

    try {
      const result = await pdfExportService.exportLessonDeck({
        slides,
        currentSlideIndex: store.canvas.currentPageIndex,
        lessonTitle: title || 'Classroom Whiteboard Lesson',
        roomPin: store.collab.roomId,
        teacherName: store.collab.myUser?.name || 'KimiWise Instructor',
        onProgress: (_current, _total, message) => {
          setPdfProgressText(message);
        },
      });

      toast.success(`Lesson Deck exported as PDF (${result.pageCount} slide${result.pageCount === 1 ? '' : 's'})!`);
      setIsOpen(false);
    } catch (err: any) {
      console.error('[SaveMenu] PDF export failed:', err);
      toast.error('Failed to export PDF deck: ' + (err.message || ''));
    } finally {
      setIsExportingPdf(false);
      setPdfProgressText(null);
    }
  };

  // ── 4. Export Active Slide as High-Res PNG (2x) ─────────────────────────────
  const handleExportPng = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const fCanvas = (window as any).__KIMIWISE_CANVAS__;
      if (!fCanvas) {
        toast.error('Whiteboard canvas is not ready.');
        return;
      }

      const dataUrl = fCanvas.toDataURL({
        format: 'png',
        multiplier: 2,
        quality: 1,
      });

      const safeName = (title || 'whiteboard_slide').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const currentIdx = useStore.getState().canvas.currentPageIndex;
      const link = document.createElement('a');
      link.download = `${safeName}_slide_${currentIdx + 1}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('High-resolution PNG image exported!');
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Failed to export PNG: ' + (err.message || ''));
    }
  };

  // ── 4. Export Active Slide as Vector SVG ────────────────────────────────────
  const handleExportSvg = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const fCanvas = (window as any).__KIMIWISE_CANVAS__;
      if (!fCanvas) {
        toast.error('Whiteboard canvas is not ready.');
        return;
      }

      const svgData = fCanvas.toSVG();
      const safeName = (title || 'whiteboard_slide').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const currentIdx = useStore.getState().canvas.currentPageIndex;

      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${safeName}_slide_${currentIdx + 1}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Scalable vector SVG exported!');
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Failed to export SVG: ' + (err.message || ''));
    }
  };

  // ── 5. Import / Open Project File (.kimiwise.json / .trido.json) ────────────
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data || (!data.slides && !data.pages)) {
          toast.error('Invalid KimiWise project file format.');
          return;
        }

        const incomingSlides = data.slides || data.pages || [];
        const newTitle = data.title || file.name.replace(/\.[^/.]+$/, '');
        setTitle(newTitle);

        const fCanvas = (window as any).__KIMIWISE_CANVAS__;
        useStore.setState((s) => ({
          canvas: {
            ...s.canvas,
            slides: incomingSlides,
            currentPageIndex: 0,
            totalPages: incomingSlides.length,
          },
        }));

        if (fCanvas && incomingSlides[0]?.canvasJson) {
          fCanvas.loadFromJSON(incomingSlides[0].canvasJson, () => {
            fCanvas.backgroundColor = '#ffffff';
            fCanvas.requestRenderAll();
          });
        }

        toast.success(`Project "${newTitle}" loaded with ${incomingSlides.length} slides!`);
        setIsOpen(false);
      } catch (err: any) {
        toast.error('Failed to parse project file: ' + (err.message || ''));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── 6. New Whiteboard Session ───────────────────────────────────────────────
  const handleNewSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fCanvas = (window as any).__KIMIWISE_CANVAS__;

    if (fCanvas) {
      fCanvas.clear();
      fCanvas.backgroundColor = '#ffffff';
      fCanvas.requestRenderAll();
    }

    useStore.setState((s) => ({
      canvas: {
        ...s.canvas,
        slides: [{ id: `slide_${Date.now()}`, name: 'Slide 1', canvasJson: null }],
        currentPageIndex: 0,
        totalPages: 1,
        canvasObjects: [],
      },
    }));

    setTitle('Classroom Whiteboard');
    setLastSavedTime(null);
    setIsOpen(false);
    toast.info('New clean whiteboard session initialized.');
  };

  return (
    <div className="relative font-sans" ref={menuRef}>
      {/* ── Top Bar Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer select-none"
        title="Save & Export Whiteboard (Ctrl+S)"
      >
        <Save
          size={13}
          className={
            isSaving
              ? 'animate-pulse text-blue-600'
              : isSavedDone
              ? 'text-emerald-600'
              : 'text-slate-500'
          }
        />
        <span>{isSavedDone ? 'Saved!' : 'Save'}</span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header with Title Input */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Lesson Board Title
              </label>
              {lastSavedTime && (
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={10} /> {lastSavedTime}
                </span>
              )}
            </div>

            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title..."
                className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveToDb();
                }}
              />
            </div>
          </div>

          {/* Action Options */}
          <div className="p-2.5 space-y-1 text-xs">
            {/* Option 1: Save to Browser Storage */}
            <button
              type="button"
              onClick={handleSaveToDb}
              disabled={isSaving}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <HardDrive size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>Quick Save to Browser</span>
                    {isSavedDone && <Check size={13} className="text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    LocalStorage session • Instant reload
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Ctrl+S
              </span>
            </button>

            {/* Option 2: Download .kimiwise Project File */}
            <button
              type="button"
              onClick={handleDownloadProject}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileJson size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800">
                    Download Project File (.kimiwise)
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Save all slides & diagrams to USB / drive
                  </div>
                </div>
              </div>
              <Download size={14} className="text-slate-400" />
            </button>

            {/* Option 3: Export Full Lesson as Multi-Page PDF Deck (Phase E) */}
            <button
              type="button"
              onClick={handleExportPdfDeck}
              disabled={isExportingPdf}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-rose-50/50 border border-transparent hover:border-rose-200 transition-all cursor-pointer text-left group disabled:opacity-60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  {isExportingPdf ? (
                    <Loader2 size={16} className="animate-spin text-rose-600" />
                  ) : (
                    <FileText size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>Export Full Lesson as PDF Deck</span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100/70 border border-rose-200/80 px-1.5 py-0.2 rounded-full">
                      All Slides
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">
                    {isExportingPdf && pdfProgressText
                      ? pdfProgressText
                      : `Compile all ${useStore.getState().canvas.slides?.length || 1} slide(s) into multi-page presentation deck`}
                  </div>
                </div>
              </div>
              <Download size={14} className="text-slate-400 shrink-0 ml-2" />
            </button>

            {/* Option 4: Export as High-Res PNG Image */}
            <button
              type="button"
              onClick={handleExportPng}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800">
                    Export Slide as PNG Image (2x)
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    High-resolution image for presentations
                  </div>
                </div>
              </div>
              <Download size={14} className="text-slate-400" />
            </button>

            {/* Option 4: Export as Vector SVG */}
            <button
              type="button"
              onClick={handleExportSvg}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Download size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800">
                    Export Slide as Vector SVG
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Lossless vector format for print & Figma
                  </div>
                </div>
              </div>
              <Download size={14} className="text-slate-400" />
            </button>

            <div className="h-px w-full bg-slate-100 my-1" />

            {/* Option 5: Open / Import Project File */}
            <label className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FolderOpen size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800">
                    Open / Import Project File
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Load saved .kimiwise or .trido file
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.kimiwise,.trido"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {/* Option 6: New Whiteboard */}
            <button
              type="button"
              onClick={handleNewSession}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 border border-transparent hover:border-rose-100 transition-all cursor-pointer text-left text-slate-700 hover:text-rose-700 font-bold"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <FilePlus size={16} />
              </div>
              <span>Start New Whiteboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
