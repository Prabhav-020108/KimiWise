// ─── KimiWise — Multi-Page PDF Lesson Deck Export Service ─────────────────────
// Phase E: High-utility multi-page PDF generation compiling all classroom slides
// into a unified presentation deck with metadata headers, footers, and page numbers.

import { jsPDF } from 'jspdf';
import { fabric } from 'fabric';
import type { SlideData } from '../store';

const FabricClass = (fabric as any)?.fabric || fabric || (typeof window !== 'undefined' ? (window as any).fabric : null);

export interface PdfExportOptions {
  slides: SlideData[];
  currentSlideIndex: number;
  lessonTitle?: string;
  roomPin?: string | null;
  teacherName?: string | null;
  onProgress?: (current: number, total: number, message: string) => void;
}

export interface PdfExportResult {
  success: boolean;
  pageCount: number;
  fileName: string;
  error?: string;
}

/**
 * Render a slide's serialized JSON onto an off-screen HTML canvas using Fabric StaticCanvas
 */
async function renderSlideToDataUrl(
  slide: SlideData,
  isCurrentSlide: boolean,
  targetWidth = 1920,
  targetHeight = 1080
): Promise<string> {
  // If it's the active live slide, we can grab it directly from window.__KIMIWISE_CANVAS__
  if (isCurrentSlide && typeof window !== 'undefined' && (window as any).__KIMIWISE_CANVAS__) {
    try {
      const fCanvas = (window as any).__KIMIWISE_CANVAS__;
      return fCanvas.toDataURL({
        format: 'png',
        multiplier: 2,
        quality: 1,
      });
    } catch (e) {
      console.warn('[pdfExportService] Failed to export live canvas, falling back to JSON:', e);
    }
  }

  // If no canvas JSON or empty objects, return a clean blank white slide
  if (!slide.canvasJson || !slide.canvasJson.objects || slide.canvasJson.objects.length === 0) {
    const blank = document.createElement('canvas');
    blank.width = targetWidth;
    blank.height = targetHeight;
    const ctx = blank.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(slide.name || 'Empty Slide', targetWidth / 2, targetHeight / 2);
    }
    return blank.toDataURL('image/png');
  }

  // Offscreen static canvas rendering for saved slides
  return new Promise<string>((resolve) => {
    try {
      const tempCanvasEl = document.createElement('canvas');
      tempCanvasEl.width = targetWidth;
      tempCanvasEl.height = targetHeight;

      const staticCanvas = new FabricClass.StaticCanvas(tempCanvasEl, {
        width: targetWidth,
        height: targetHeight,
        backgroundColor: '#ffffff',
        renderOnAddRemove: false,
      });

      staticCanvas.loadFromJSON(slide.canvasJson, () => {
        try {
          staticCanvas.backgroundColor = '#ffffff';
          staticCanvas.renderAll();
          const dataUrl = staticCanvas.toDataURL({
            format: 'png',
            multiplier: 2,
            quality: 1,
          });
          staticCanvas.dispose();
          resolve(dataUrl);
        } catch (renderErr) {
          console.warn('[pdfExportService] Error rendering slide objects:', renderErr);
          staticCanvas.dispose();
          resolve(createFallbackSlideDataUrl(slide.name, targetWidth, targetHeight));
        }
      });
    } catch (err) {
      console.error('[pdfExportService] Offscreen canvas initialization error:', err);
      resolve(createFallbackSlideDataUrl(slide.name, targetWidth, targetHeight));
    }
  });
}

function createFallbackSlideDataUrl(slideName?: string, width = 1920, height = 1080): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(slideName || 'Slide', width / 2, height / 2);
  }
  return canvas.toDataURL('image/png');
}

export const pdfExportService = {
  /**
   * Export all classroom whiteboard slides into a single multi-page PDF presentation deck
   */
  async exportLessonDeck(options: PdfExportOptions): Promise<PdfExportResult> {
    const {
      slides,
      currentSlideIndex,
      lessonTitle = 'Classroom Whiteboard Lesson',
      roomPin,
      teacherName = 'KimiWise Teacher',
      onProgress,
    } = options;

    if (!slides || slides.length === 0) {
      throw new Error('No slides available to export.');
    }

    const totalSlides = slides.length;
    const safeTitle = (lessonTitle || 'KimiWise_Lesson').trim();
    const cleanFileName = `${safeTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_deck_${Date.now()}.pdf`;

    onProgress?.(0, totalSlides, `Initializing PDF presentation deck (${totalSlides} slides)...`);

    // Create A4 Landscape PDF: 841.89 pt width x 595.28 pt height (standard 16:9 lecture format)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Margins
    const marginX = 24;
    const headerHeight = 36;
    const footerHeight = 28;

    // Usable image area
    const contentX = marginX;
    const contentY = headerHeight + 6;
    const contentWidth = pageWidth - marginX * 2;
    const contentHeight = pageHeight - contentY - footerHeight;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    for (let i = 0; i < totalSlides; i++) {
      const slide = slides[i];
      const slideNum = i + 1;
      const isCurrent = i === currentSlideIndex;

      onProgress?.(
        slideNum,
        totalSlides,
        `Rendering Slide ${slideNum} of ${totalSlides}: "${slide.name || `Slide ${slideNum}`}"...`
      );

      // Render slide image
      const dataUrl = await renderSlideToDataUrl(slide, isCurrent, 1920, 1080);

      // If not the first page, add a new landscape page
      if (i > 0) {
        pdf.addPage('a4', 'landscape');
      }

      // ── Header Bar ──────────────────────────────────────────────────────────
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');

      // Top accent strip (KimiWise Blue)
      pdf.setFillColor(37, 99, 235); // blue-600
      pdf.rect(0, 0, pageWidth, 3, 'F');

      // Lesson Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 41, 59); // slate-800
      const titleText = `${safeTitle} — ${slide.name || `Slide ${slideNum}`}`;
      pdf.text(titleText, marginX, 22);

      // Right metadata: Date & Room PIN
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139); // slate-500
      const metaRight = `${formattedDate}${roomPin ? ` • Room: ${roomPin}` : ''}`;
      pdf.text(metaRight, pageWidth - marginX, 22, { align: 'right' });

      // Subtle border line beneath header
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.75);
      pdf.line(0, headerHeight, pageWidth, headerHeight);

      // ── Main Slide Content ──────────────────────────────────────────────────
      try {
        pdf.addImage(
          dataUrl,
          'PNG',
          contentX,
          contentY,
          contentWidth,
          contentHeight,
          undefined,
          'FAST'
        );
      } catch (imgErr) {
        console.error('[pdfExportService] Error placing slide image into PDF:', imgErr);
      }

      // ── Footer Bar ──────────────────────────────────────────────────────────
      const footerY = pageHeight - footerHeight;

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.75);
      pdf.line(0, footerY, pageWidth, footerY);

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, footerY, pageWidth, footerHeight, 'F');

      // Left: Teacher Name / KimiWise
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text(
        `KimiWise AI Classroom • ${teacherName || 'Instructor Deck'}`,
        marginX,
        footerY + 17
      );

      // Center: Gemma 4 badge
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        'Generated with Gemma 4 Multimodal Classroom AI',
        pageWidth / 2,
        footerY + 17,
        { align: 'center' }
      );

      // Right: Slide X of Y
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.text(
        `Slide ${slideNum} of ${totalSlides}`,
        pageWidth - marginX,
        footerY + 17,
        { align: 'right' }
      );
    }

    onProgress?.(totalSlides, totalSlides, 'Compiling and saving PDF file...');

    // Save PDF directly to user's downloads
    pdf.save(cleanFileName);

    return {
      success: true,
      pageCount: totalSlides,
      fileName: cleanFileName,
    };
  },
};
