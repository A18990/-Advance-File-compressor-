import { CompressionSettings, DocumentSettings, DecompressSettings } from '../types';

/**
 * Loads an image from a URL or Blob into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Format bytes into human readable format (KB, MB, B)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculate target dimensions based on settings
 */
export function calculateDimensions(
  origW: number,
  origH: number,
  maxW: number,
  maxH: number,
  maintainAspect: boolean = true
): { width: number; height: number } {
  let width = origW;
  let height = origH;

  if (maxW > 0 && maxH > 0) {
    if (maintainAspect) {
      const ratio = Math.min(maxW / origW, maxH / origH);
      if (ratio < 1) {
        width = Math.round(origW * ratio);
        height = Math.round(origH * ratio);
      }
    } else {
      width = maxW;
      height = maxH;
    }
  } else if (maxW > 0 && origW > maxW) {
    const ratio = maxW / origW;
    width = maxW;
    height = maintainAspect ? Math.round(origH * ratio) : origH;
  } else if (maxH > 0 && origH > maxH) {
    const ratio = maxH / origH;
    height = maxH;
    width = maintainAspect ? Math.round(origW * ratio) : origW;
  }

  return { width: Math.max(1, width), height: Math.max(1, height) };
}

/**
 * Apply 3x3 convolution kernel to canvas ImageData (used for unsharp mask / sharpening)
 */
function applyConvolution(ctx: CanvasRenderingContext2D, width: number, height: number, kernel: number[], factor: number = 1) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const output = ctx.createImageData(width, height);
  const outData = output.data;

  // Copy alpha by default
  for (let i = 0; i < data.length; i += 4) {
    outData[i + 3] = data[i + 3];
  }

  const kSize = 3;
  const half = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const kVal = kernel[ky * kSize + kx];

          r += data[idx] * kVal;
          g += data[idx + 1] * kVal;
          b += data[idx + 2] * kVal;
        }
      }

      const outIdx = (y * width + x) * 4;
      outData[outIdx] = Math.min(255, Math.max(0, r * factor));
      outData[outIdx + 1] = Math.min(255, Math.max(0, g * factor));
      outData[outIdx + 2] = Math.min(255, Math.max(0, b * factor));
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Apply document filters (Clean Paper, B&W Scan, Contrast, Grayscale)
 */
function applyDocumentFilters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  docSettings: DocumentSettings,
  grayscale: boolean
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const contrastFactor = (259 * (docSettings.contrast + 255)) / (255 * (259 - docSettings.contrast));
  const brightnessOffset = docSettings.brightness * 1.5;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness & Contrast
    if (docSettings.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }
    if (docSettings.brightness !== 0) {
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;
    }

    // Luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (docSettings.filter === 'scan-bw') {
      const threshold = docSettings.threshold || 140;
      const val = lum >= threshold ? 255 : 0;
      r = val;
      g = val;
      b = val;
    } else if (docSettings.filter === 'clean-paper') {
      // Whiten shadows on paper: if lum is above moderate threshold, boost to 255; if dark, keep text sharp
      if (lum > 155) {
        r = Math.min(255, lum * 1.35);
        g = Math.min(255, lum * 1.35);
        b = Math.min(255, lum * 1.35);
      } else {
        r = Math.max(0, lum * 0.75);
        g = Math.max(0, lum * 0.75);
        b = Math.max(0, lum * 0.75);
      }
    } else if (docSettings.filter === 'high-contrast') {
      r = lum > 128 ? Math.min(255, r * 1.2) : Math.max(0, r * 0.8);
      g = lum > 128 ? Math.min(255, g * 1.2) : Math.max(0, g * 0.8);
      b = lum > 128 ? Math.min(255, b * 1.2) : Math.max(0, b * 0.8);
    } else if (grayscale) {
      r = lum;
      g = lum;
      b = lum;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Apply sharpening if configured
  if (docSettings.sharpenAmount > 0 || docSettings.filter === 'sharpen') {
    const intensity = (docSettings.sharpenAmount || 40) / 50;
    const k = [
      0, -intensity, 0,
      -intensity, 1 + 4 * intensity, -intensity,
      0, -intensity, 0
    ];
    applyConvolution(ctx, width, height, k);
  }
}

/**
 * Apply decompressor enhancement filters (recovering details, edge sharpness)
 */
function applyDecompressEnhancement(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: DecompressSettings
) {
  if (settings.sharpness > 0) {
    const s = (settings.sharpness / 100) * 1.2;
    const kernel = [
      -s * 0.5, -s, -s * 0.5,
      -s, 1 + 6 * s, -s,
      -s * 0.5, -s, -s * 0.5
    ];
    applyConvolution(ctx, width, height, kernel);
  }

  if (settings.contrastRecovery > 0) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const factor = (259 * (settings.contrastRecovery * 0.4 + 255)) / (255 * (259 - settings.contrastRecovery * 0.4));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
    ctx.putImageData(imgData, 0, 0);
  }
}

/**
 * Render image to canvas with rotations, flips, and filters
 */
function renderToCanvas(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  rotation: number = 0,
  flipH: boolean = false,
  flipV: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const isRotated = rotation === 90 || rotation === 270;
  canvas.width = isRotated ? targetH : targetW;
  canvas.height = isRotated ? targetW : targetH;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Fill with pure white background for transparent PNG converted to JPEG/WebP
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();

  return canvas;
}

/**
 * Convert canvas to Blob with given format & quality
 */
function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob conversion failed'));
      },
      format,
      quality
    );
  });
}

/**
 * Main Compression / Processing Function
 */
export async function processImage(
  imgSrc: string,
  compSettings: CompressionSettings,
  docSettings?: DocumentSettings,
  decompressSettings?: DecompressSettings
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  rawUncompressedBytes: number;
}> {
  const img = await loadImage(imgSrc);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // 1. Calculate Target Dimensions
  let { width, height } = calculateDimensions(
    origW,
    origH,
    compSettings.maxWidth,
    compSettings.maxHeight,
    compSettings.maintainAspect
  );

  // If upscale is requested in decompress mode
  if (decompressSettings && decompressSettings.upscaleFactor > 1) {
    width = Math.round(width * decompressSettings.upscaleFactor);
    height = Math.round(height * decompressSettings.upscaleFactor);
  }

  // 2. Render initial canvas
  const rotation = docSettings ? docSettings.rotation : 0;
  const flipH = docSettings ? docSettings.flipH : false;
  const flipV = docSettings ? docSettings.flipV : false;

  let canvas = renderToCanvas(img, width, height, rotation, flipH, flipV);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // 3. Apply Document Filters if provided
  if (docSettings) {
    applyDocumentFilters(ctx, canvas.width, canvas.height, docSettings, compSettings.grayscale);
  } else if (compSettings.grayscale) {
    const dummyDoc: DocumentSettings = {
      filter: 'none',
      threshold: 128,
      contrast: 0,
      brightness: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      sharpenAmount: 0,
    };
    applyDocumentFilters(ctx, canvas.width, canvas.height, dummyDoc, true);
  }

  // 4. Apply Decompress Restoration Filters if provided
  if (decompressSettings) {
    applyDecompressEnhancement(ctx, canvas.width, canvas.height, decompressSettings);
  }

  const rawUncompressedBytes = canvas.width * canvas.height * 4;

  // 5. Target Size Mode: EXACT KB BINARY SEARCH
  if (compSettings.targetMode === 'exact-kb' && compSettings.format !== 'image/png') {
    const targetBytes = compSettings.targetKb * 1024;
    let minQuality = 0.05;
    let maxQuality = 0.98;
    let bestBlob: Blob | null = null;
    let bestQuality = compSettings.quality;

    // Binary search for optimal quality
    for (let iter = 0; iter < 7; iter++) {
      const testQuality = (minQuality + maxQuality) / 2;
      const testBlob = await canvasToBlob(canvas, compSettings.format, testQuality);

      if (testBlob.size <= targetBytes) {
        bestBlob = testBlob;
        bestQuality = testQuality;
        minQuality = testQuality; // Try higher quality still under limit
      } else {
        maxQuality = testQuality; // File too large, decrease quality
      }
    }

    // If even lowest quality (0.05) exceeds target KB, incrementally scale down resolution!
    if (!bestBlob || bestBlob.size > targetBytes) {
      let currentScale = 0.9;
      let scaleIterations = 0;

      while ((!bestBlob || bestBlob.size > targetBytes) && scaleIterations < 6) {
        const scaledW = Math.max(80, Math.round(width * currentScale));
        const scaledH = Math.max(80, Math.round(height * currentScale));

        const scaledCanvas = renderToCanvas(img, scaledW, scaledH, rotation, flipH, flipV);
        const scaledCtx = scaledCanvas.getContext('2d', { willReadFrequently: true })!;
        if (docSettings) {
          applyDocumentFilters(scaledCtx, scaledCanvas.width, scaledCanvas.height, docSettings, compSettings.grayscale);
        }

        const testBlob = await canvasToBlob(scaledCanvas, compSettings.format, 0.4);
        if (testBlob.size <= targetBytes) {
          bestBlob = testBlob;
          canvas = scaledCanvas;
          break;
        }

        currentScale *= 0.8;
        scaleIterations++;
      }
    }

    if (bestBlob) {
      return {
        blob: bestBlob,
        width: canvas.width,
        height: canvas.height,
        rawUncompressedBytes: canvas.width * canvas.height * 4,
      };
    }
  }

  // Standard Quality Compression Mode
  const finalQuality = compSettings.format === 'image/png' ? undefined : compSettings.quality;
  const finalBlob = await canvasToBlob(canvas, compSettings.format, finalQuality ?? 0.8);

  return {
    blob: finalBlob,
    width: canvas.width,
    height: canvas.height,
    rawUncompressedBytes,
  };
}
