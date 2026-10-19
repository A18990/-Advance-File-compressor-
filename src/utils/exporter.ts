import { ProcessedItem } from '../types';
import { loadImage } from './imageProcessor';
import { exportToPdf } from './pdfProcessor';
import JSZip from 'jszip';

export type DownloadFormat = 'jpeg' | 'png' | 'webp' | 'pdf';

export interface DownloadFormatOption {
  format: DownloadFormat;
  label: string;
  ext: string;
  mime: string;
  description: string;
  badge: string;
}

export const DOWNLOAD_FORMAT_OPTIONS: DownloadFormatOption[] = [
  {
    format: 'pdf',
    label: 'PDF Document',
    ext: 'pdf',
    mime: 'application/pdf',
    description: 'A4 print-ready document, perfect for official portal uploads & emails',
    badge: 'Universal Doc',
  },
  {
    format: 'jpeg',
    label: 'JPEG / JPG',
    ext: 'jpg',
    mime: 'image/jpeg',
    description: 'Standard compressed format accepted by all government exam portals',
    badge: 'Gov & Exam Standard',
  },
  {
    format: 'webp',
    label: 'WebP',
    ext: 'webp',
    mime: 'image/webp',
    description: 'Modern high-efficiency format with superior compression ratio',
    badge: 'Smallest Web Size',
  },
  {
    format: 'png',
    label: 'PNG',
    ext: 'png',
    mime: 'image/png',
    description: 'Lossless quality preserving crisp text, signatures, and transparency',
    badge: 'Lossless & Crisp',
  },
];

/**
 * Converts a processed item to the requested format on the fly and triggers download
 */
export async function downloadItemAsFormat(
  item: ProcessedItem,
  format: DownloadFormat,
  customName?: string
): Promise<void> {
  const baseName = (customName || item.name).replace(/\.[^/.]+$/, '');
  const sourceUrl = item.processedUrl || item.originalUrl;

  if (format === 'pdf') {
    await exportToPdf([item], `${baseName}_decumopress.pdf`);
    return;
  }

  const mimeMap: Record<'jpeg' | 'png' | 'webp', string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  const extMap: Record<'jpeg' | 'png' | 'webp', string> = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
  };

  const targetMime = mimeMap[format];
  const targetExt = extMap[format];

  // If already matches processed format, download directly
  if (item.processedBlob && item.processedFormat === targetMime) {
    triggerBlobDownload(item.processedBlob, `${baseName}_optimized.${targetExt}`);
    return;
  }

  // Otherwise, load into canvas and convert to target format
  const img = await loadImage(sourceUrl);
  const canvas = document.createElement('canvas');
  canvas.width = item.processedWidth || img.naturalWidth || img.width;
  canvas.height = item.processedHeight || img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const quality = targetMime === 'image/jpeg' ? 0.9 : targetMime === 'image/webp' ? 0.88 : undefined;

  canvas.toBlob(
    (blob) => {
      if (blob) {
        triggerBlobDownload(blob, `${baseName}_converted.${targetExt}`);
      }
    },
    targetMime,
    quality
  );
}

/**
 * Downloads a Blob directly
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Batch download all items converted to a specific format wrapped in a ZIP
 */
export async function downloadBatchAsSpecificFormat(
  items: ProcessedItem[],
  format: 'jpeg' | 'png' | 'webp' | 'match',
  zipName?: string
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const sourceUrl = item.processedUrl || item.originalUrl;

    if (format === 'match' && item.processedBlob) {
      const ext =
        item.processedFormat === 'image/webp'
          ? 'webp'
          : item.processedFormat === 'image/png'
          ? 'png'
          : 'jpg';
      zip.file(`${baseName}_${i + 1}.${ext}`, item.processedBlob);
      continue;
    }

    const mimeMap: Record<'jpeg' | 'png' | 'webp', string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const extMap: Record<'jpeg' | 'png' | 'webp', string> = {
      jpeg: 'jpg',
      png: 'png',
      webp: 'webp',
    };

    const targetFormat = format === 'match' ? 'jpeg' : format;
    const targetMime = mimeMap[targetFormat];
    const targetExt = extMap[targetFormat];

    const img = await loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = item.processedWidth || img.naturalWidth || img.width;
    canvas.height = item.processedHeight || img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d')!;

    if (targetMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, targetMime, targetMime === 'image/jpeg' ? 0.9 : 0.88)
    );

    if (blob) {
      zip.file(`${baseName}_${i + 1}.${targetExt}`, blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const finalZipName = zipName || `decumopress_${format}_batch.zip`;
  triggerBlobDownload(content, finalZipName);
}
