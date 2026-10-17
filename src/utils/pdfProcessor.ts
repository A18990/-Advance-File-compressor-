import { jsPDF } from 'jspdf';
import { ProcessedItem } from '../types';

/**
 * Creates a combined PDF from processed photos/documents
 */
export async function exportToPdf(items: ProcessedItem[], filename: string = 'document_scan.pdf'): Promise<void> {
  const validItems = items.filter((item) => item.processedUrl || item.originalUrl);
  if (validItems.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210; // mm for A4
  const pageHeight = 297; // mm for A4
  const margin = 10; // mm

  for (let i = 0; i < validItems.length; i++) {
    if (i > 0) pdf.addPage('a4', 'portrait');

    const item = validItems[i];
    const imgUrl = item.processedUrl || item.originalUrl;
    const imgW = item.processedWidth || item.originalWidth;
    const imgH = item.processedHeight || item.originalHeight;

    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const ratio = Math.min(printableWidth / imgW, printableHeight / imgH);
    const renderW = imgW * ratio;
    const renderH = imgH * ratio;

    const posX = margin + (printableWidth - renderW) / 2;
    const posY = margin + (printableHeight - renderH) / 2;

    const format = item.processedFormat === 'image/png' ? 'PNG' : 'JPEG';
    pdf.addImage(imgUrl, format, posX, posY, renderW, renderH, undefined, 'FAST');
  }

  pdf.save(filename);
}
