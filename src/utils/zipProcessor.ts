import JSZip from 'jszip';
import { ProcessedItem } from '../types';

/**
 * Extracts all supported image files from a ZIP archive
 */
export async function extractImagesFromZip(zipFile: File): Promise<File[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);
  const imageFiles: File[] = [];

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.svg', '.gif'];

  const entries = Object.keys(loadedZip.files);
  for (const filename of entries) {
    const fileEntry = loadedZip.files[filename];
    if (fileEntry.dir) continue;

    const lowerName = filename.toLowerCase();
    const isImage = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (isImage) {
      const blob = await fileEntry.async('blob');
      const cleanName = filename.split('/').pop() || filename;
      const mimeType = lowerName.endsWith('.png')
        ? 'image/png'
        : lowerName.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

      const file = new File([blob], cleanName, { type: mimeType });
      imageFiles.push(file);
    }
  }

  return imageFiles;
}

/**
 * Generates and downloads a ZIP containing all processed items
 */
export async function downloadAllAsZip(items: ProcessedItem[], zipName: string = 'decumopress_optimized.zip'): Promise<void> {
  const zip = new JSZip();

  items.forEach((item, index) => {
    if (item.processedBlob) {
      const ext = item.processedFormat === 'image/webp' ? 'webp' : item.processedFormat === 'image/png' ? 'png' : 'jpg';
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_optimized_${index + 1}.${ext}`;
      zip.file(filename, item.processedBlob);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
