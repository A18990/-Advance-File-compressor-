import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Check,
  FileArchive,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { downloadItemAsFormat, DOWNLOAD_FORMAT_OPTIONS, DownloadFormat } from '../utils/exporter';

interface DownloadFormatModalProps {
  item: ProcessedItem | null;
  onClose: () => void;
}

export const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({ item, onClose }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState<string>('');

  if (!item) return null;

  const baseName = item.name.replace(/\.[^/.]+$/, '');
  const activeName = customFilename.trim() || baseName;

  const handleDownload = async (format: DownloadFormat) => {
    try {
      setDownloadingFormat(format);
      await downloadItemAsFormat(item, format, activeName);
      setTimeout(() => {
        setDownloadingFormat(null);
      }, 700);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Download in Custom Format</h3>
              <p className="text-[11px] text-slate-400">Choose the file format you require</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Item Brief */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
          <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
            <img
              src={item.processedUrl || item.originalUrl}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-200 truncate">{item.name}</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <span>{item.processedWidth || item.originalWidth} × {item.processedHeight || item.originalHeight} px</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-400 font-semibold">{formatBytes(item.processedSize || item.originalSize)}</span>
            </div>
          </div>
        </div>

        {/* Custom Filename Field */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            File Name (optional)
          </label>
          <input
            type="text"
            placeholder={baseName}
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Format Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 block">Select Output Format:</label>

          <div className="grid grid-cols-1 gap-2">
            {DOWNLOAD_FORMAT_OPTIONS.map((opt) => {
              const isLoading = downloadingFormat === opt.format;

              return (
                <button
                  key={opt.format}
                  type="button"
                  onClick={() => handleDownload(opt.format)}
                  disabled={!!downloadingFormat}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/60 hover:bg-slate-800/60 text-left transition-all group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 text-slate-300 group-hover:text-indigo-400 transition-colors">
                      {opt.format === 'pdf' ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300">
                          {opt.label} (.{opt.ext})
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isLoading ? (
                      <span className="text-xs text-indigo-400 animate-pulse font-medium">Exporting...</span>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
