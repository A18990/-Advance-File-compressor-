import React from 'react';
import { X, FileCode, Check, Copy } from 'lucide-react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface MetadataInspectorModalProps {
  item: ProcessedItem | null;
  onClose: () => void;
}

export const MetadataInspectorModal: React.FC<MetadataInspectorModalProps> = ({
  item,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const rawPixels = item.originalWidth * item.originalHeight;
  const rawBytes = rawPixels * 4;
  const compressionRatio = ((1 - item.originalSize / rawBytes) * 100).toFixed(1);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(item.originalWidth, item.originalHeight);
  const aspectW = item.originalWidth / divisor;
  const aspectH = item.originalHeight / divisor;

  const metadataJson = JSON.stringify(
    {
      filename: item.name,
      originalType: item.originalType,
      processedFormat: item.processedFormat,
      dimensions: {
        original: `${item.originalWidth}x${item.originalHeight}`,
        processed: `${item.processedWidth || item.originalWidth}x${
          item.processedHeight || item.originalHeight
        }`,
        aspectRatio: `${aspectW}:${aspectH}`,
        megapixels: (rawPixels / 1000000).toFixed(2),
      },
      fileSizes: {
        originalBytes: item.originalSize,
        processedBytes: item.processedSize,
        uncompressedMemoryBufferBytes: rawBytes,
        compressionRatioVsRaw: `${compressionRatio}%`,
      },
      colorDepth: '32-bit RGBA (8-bit per channel)',
      engine: 'In-Memory Canvas 2D Direct Pipeline',
    },
    null,
    2
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(metadataJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Image Metadata & Memory Footprint</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 text-xs">
          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Filename</span>
            <span className="font-semibold text-slate-200 truncate block mt-0.5">{item.name}</span>
          </div>
          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Aspect Ratio</span>
            <span className="font-mono text-slate-200 block mt-0.5">
              {aspectW}:{aspectH} ({item.originalWidth} × {item.originalHeight})
            </span>
          </div>
          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Original File Size</span>
            <span className="font-mono text-slate-200 block mt-0.5">
              {formatBytes(item.originalSize)} ({item.originalSize.toLocaleString()} bytes)
            </span>
          </div>
          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Raw 32-bit Memory Buffer</span>
            <span className="font-mono text-emerald-400 block mt-0.5">
              {formatBytes(rawBytes)} (Uncompressed)
            </span>
          </div>
        </div>

        {/* Raw JSON Code block */}
        <div className="relative mt-2">
          <pre className="h-44 overflow-y-auto rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300 border border-slate-800/80">
            {metadataJson}
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-medium text-slate-300 transition-colors border border-slate-700"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
