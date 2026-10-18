// Integration test for jsPDF multi-page deck export
import { jsPDF } from 'jspdf';

async function testPdfGeneration() {
  console.log('--- Testing jsPDF Multi-Page Deck Generation ---');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  console.log(`Page dimensions: ${pageWidth} x ${pageHeight}`);

  const mockSlides = [
    { name: 'Introduction to Binary Trees', num: 1 },
    { name: 'Binary Search Tree Operations', num: 2 },
    { name: 'Tree Traversal Algorithms', num: 3 },
  ];

  for (let i = 0; i < mockSlides.length; i++) {
    const s = mockSlides[i];
    if (i > 0) pdf.addPage('a4', 'landscape');

    // Header
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, 36, 'F');
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 3, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`Computer Science 101 — ${s.name}`, 24, 22);

    // Footer
    const footerY = pageHeight - 28;
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.75);
    pdf.line(0, footerY, pageWidth, footerY);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Slide ${s.num} of ${mockSlides.length}`, pageWidth - 24, footerY + 17, { align: 'right' });
  }

  const outputArrayBuffer = pdf.output('arraybuffer');
  console.log(`✓ Successfully compiled ${mockSlides.length}-page PDF buffer: ${outputArrayBuffer.byteLength} bytes.`);
}

testPdfGeneration().catch(console.error);
