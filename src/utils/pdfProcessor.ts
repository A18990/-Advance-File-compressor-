import { jsPDF } from 'jspdf';
import { ProcessedItem } from '../types';

/**
 * Creates a combined PDF from processed photos/documents with automatic orientation detection
 */
export async function exportToPdf(items: ProcessedItem[], filename: string = 'document_scan.pdf'): Promise<void> {
  const validItems = items.filter((item) => item.processedUrl || item.originalUrl);
  if (validItems.length === 0) return;

  // Initialize with first item orientation
  const firstItem = validItems[0];
  const firstW = firstItem.processedWidth || firstItem.originalWidth;
  const firstH = firstItem.processedHeight || firstItem.originalHeight;
  const firstIsLandscape = firstW > firstH;

  const pdf = new jsPDF({
    orientation: firstIsLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < validItems.length; i++) {
    const item = validItems[i];
    const imgUrl = item.processedUrl || item.originalUrl;
    const imgW = item.processedWidth || item.originalWidth;
    const imgH = item.processedHeight || item.originalHeight;
    const isLandscape = imgW > imgH;

    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;
    const margin = 8; // mm

    if (i > 0) {
      pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
    }

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
