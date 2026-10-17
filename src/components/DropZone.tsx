import React, { useRef, useState } from 'react';
import { UploadCloud, FileArchive, Image as ImageIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { extractImagesFromZip } from '../utils/zipProcessor';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (sampleType: 'portrait' | 'document' | 'landscape') => void;
  isProcessing?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onLoadSample,
  isProcessing = false,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = async (files: File[]) => {
    const finalFiles: File[] = [];

    for (const file of files) {
      if (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip') {
        try {
          const extracted = await extractImagesFromZip(file);
          finalFiles.push(...extracted);
        } catch (err) {
          console.error('Failed to unpack zip:', err);
        }
      } else if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|svg)$/i.test(file.name)) {
        finalFiles.push(file);
      }
    }

    if (finalFiles.length > 0) {
      onFilesSelected(finalFiles);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.zip"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Drag & Drop Card */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/30 ring-4 ring-indigo-500/20'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 group-hover:bg-indigo-600/20 transition-transform">
          <UploadCloud className="h-7 w-7" />
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-base font-semibold text-white">
            Drop your photos, documents, or ZIP archive here
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Supports JPEG, PNG, WebP, BMP, and compressed .ZIP bundles. Everything is processed 100% locally in your browser.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors pointer-events-none"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Select Photos from Computer</span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Zero Server Uploads</span>
          <span aria-hidden="true">·</span>
          <span>Target Exact KB</span>
          <span aria-hidden="true">·</span>
          <span>Batch ZIP Export</span>
        </div>
      </div>

      {/* Instant Demo Samples Loader */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Quick Test with Sample Imagery:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('portrait');
            }}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700/60"
          >
            Passport / Portrait
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('document');
            }}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700/60"
          >
            Official Certificate Doc
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('landscape');
            }}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700/60"
          >
            High-Res Landscape
          </button>
        </div>
      </div>
    </div>
  );
};
