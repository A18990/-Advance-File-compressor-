import React, { useState } from 'react';
import {
  Download,
  Trash2,
  FileArchive,
  FileCheck,
  Loader2,
  FilePlus,
  Layers,
  ChevronDown,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { downloadBatchAsSpecificFormat } from '../utils/exporter';
import { exportToPdf } from '../utils/pdfProcessor';

interface BatchQueueProps {
  items: ProcessedItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onAddMore: () => void;
  onOpenDownloadFormatModal: (item: ProcessedItem) => void;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onRemoveItem,
  onClearAll,
  onAddMore,
  onOpenDownloadFormatModal,
}) => {
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState<boolean>(false);
  const [batchLoading, setBatchLoading] = useState<string | null>(null);

  if (items.length === 0) return null;

  const totalOrigSize = items.reduce((acc, it) => acc + it.originalSize, 0);
  const totalProcessedSize = items.reduce(
    (acc, it) => acc + (it.processedSize || it.originalSize),
    0
  );
  const totalSaved = totalOrigSize - totalProcessedSize;
  const totalSavedPercent =
    totalOrigSize > 0 ? Math.round((totalSaved / totalOrigSize) * 100) : 0;

  const handleBatchDownload = async (format: 'match' | 'jpeg' | 'webp' | 'png' | 'pdf') => {
    setIsBatchDropdownOpen(false);
    setBatchLoading(format);

    try {
      if (format === 'pdf') {
        await exportToPdf(items, 'decumopress_all_documents.pdf');
      } else {
        await downloadBatchAsSpecificFormat(items, format);
      }
    } catch (err) {
      console.error('Batch download failed:', err);
    } finally {
      setBatchLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Batch Queue</h4>
              <span className="font-mono text-xs tabular-nums text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                {items.length} {items.length === 1 ? 'file' : 'files'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Original: {formatBytes(totalOrigSize)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-400 font-medium">
                Optimized: {formatBytes(totalProcessedSize)}
              </span>
              {totalSaved > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold font-mono tabular-nums">
                    Saved {formatBytes(totalSaved)} ({totalSavedPercent}%)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddMore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <FilePlus className="h-3.5 w-3.5" />
            <span>Add More</span>
          </button>

          {/* Multi-Format Batch Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
              disabled={!!batchLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{batchLoading ? 'Preparing Download...' : 'Download All As...'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {isBatchDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-1.5 shadow-2xl space-y-1">
                <button
                  type="button"
                  onClick={() => handleBatchDownload('pdf')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Combined PDF (.pdf)</span>
                    <span className="text-[10px] text-slate-400">All photos in one A4 document</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchDownload('jpeg')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>All as JPEG (ZIP)</span>
                    <span className="text-[10px] text-slate-400">Universal portal upload standard</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchDownload('webp')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>All as WebP (ZIP)</span>
                    <span className="text-[10px] text-slate-400">Ultra compact web payload</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchDownload('png')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>All as PNG (ZIP)</span>
                    <span className="text-[10px] text-slate-400">Crisp lossless graphics</span>
                  </div>
                </button>
                <div className="border-t border-slate-800 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleBatchDownload('match')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-left transition-colors"
                  >
                    <FileArchive className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Download as Optimized ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClearAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-900/40"
            title="Clear all photos"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* High-Density Item Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3 font-semibold">Image</th>
              <th className="py-2.5 px-3 font-semibold">Dimensions</th>
              <th className="py-2.5 px-3 font-semibold text-right">Original</th>
              <th className="py-2.5 px-3 font-semibold text-right">Optimized</th>
              <th className="py-2.5 px-3 font-semibold text-right">Reduction</th>
              <th className="py-2.5 px-3 font-semibold text-right">Download Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {items.map((item) => {
              const isSelected = item.id === selectedItemId;
              const savedPct =
                item.processedSize && item.originalSize > item.processedSize
                  ? Math.round(
                      ((item.originalSize - item.processedSize) / item.originalSize) * 100
                    )
                  : 0;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-950/30 text-white'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  {/* Thumbnail & Name */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                        <img
                          src={item.processedUrl || item.originalUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/30 border-2 border-indigo-500 rounded-lg" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[180px] sm:max-w-[280px]">
                        <span className="truncate font-sans font-medium text-xs text-slate-200">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {item.processedFormat.split('/')[1] || item.originalType.split('/')[1] || 'IMAGE'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Dimensions */}
                  <td className="py-2 px-3 tabular-nums text-slate-400">
                    {item.processedWidth || item.originalWidth} ×{' '}
                    {item.processedHeight || item.originalHeight}
                  </td>

                  {/* Original Size */}
                  <td className="py-2 px-3 text-right tabular-nums text-slate-400">
                    {formatBytes(item.originalSize)}
                  </td>

                  {/* Processed Size */}
                  <td className="py-2 px-3 text-right tabular-nums font-semibold text-indigo-400">
                    {item.isProcessing ? (
                      <span className="flex items-center justify-end gap-1 text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Working...</span>
                      </span>
                    ) : (
                      formatBytes(item.processedSize || item.originalSize)
                    )}
                  </td>

                  {/* Reduction % */}
                  <td className="py-2 px-3 text-right tabular-nums">
                    {savedPct > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        -{savedPct}%
                      </span>
                    ) : (
                      <span className="text-slate-500">0%</span>
                    )}
                  </td>

                  {/* Multi-Format Actions */}
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDownloadFormatModal(item);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 transition-colors"
                        title="Download in different formats (PDF, JPG, PNG, WebP)"
                      >
                        <Download className="h-3 w-3 text-indigo-400" />
                        <span>Format...</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
