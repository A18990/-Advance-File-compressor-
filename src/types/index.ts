export type ProcessMode = 'compress' | 'decompress' | 'document';

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface CompressionSettings {
  targetMode: 'quality' | 'exact-kb';
  quality: number; // 0.05 to 1.0
  targetKb: number; // e.g. 20, 50, 100, 200, 500
  format: OutputFormat;
  maxWidth: number; // 0 = original
  maxHeight: number; // 0 = original
  dpi: number; // 72, 96, 150, 300
  maintainAspect: boolean;
  grayscale: boolean;
  stripMetadata: boolean;
}

export interface DocumentSettings {
  filter: 'none' | 'clean-paper' | 'scan-bw' | 'high-contrast' | 'sharpen';
  threshold: number; // 0 to 255 for scan b&w
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  sharpenAmount: number; // 0 to 100
}

export interface DecompressSettings {
  sharpness: number; // 0 to 100
  denoise: number; // 0 to 100
  contrastRecovery: number; // 0 to 100
  upscaleFactor: number; // 1x, 1.5x, 2x
}

export interface ProcessedItem {
  id: string;
  name: string;
  originalFile: File | Blob;
  originalUrl: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;

  // Processed results
  processedBlob: Blob | null;
  processedUrl: string | null;
  processedSize: number;
  processedWidth: number;
  processedHeight: number;
  processedFormat: string;
  compressionRatio: number; // e.g. -65%
  isProcessing: boolean;
  error?: string;

  // Metadata
  dpi?: number;
  rawUncompressedBytes: number;
}

export interface QuickPreset {
  id: string;
  label: string;
  description: string;
  category: 'government' | 'web' | 'document' | 'quality';
  settings: Partial<CompressionSettings>;
  docSettings?: Partial<DocumentSettings>;
}
