import React from 'react';
import {
  FileText,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  SunMedium,
  Contrast,
  Sparkles,
  Download,
  FileCheck,
} from 'lucide-react';
import { DocumentSettings, ProcessedItem } from '../types';
import { exportToPdf } from '../utils/pdfProcessor';

interface DocumentProcessorViewProps {
  item: ProcessedItem;
  allItems: ProcessedItem[];
  settings: DocumentSettings;
  onChange: (newSettings: DocumentSettings) => void;
  onApply: () => void;
  isProcessing: boolean;
}

export const DocumentProcessorView: React.FC<DocumentProcessorViewProps> = ({
  item,
  allItems,
  settings,
  onChange,
  onApply,
  isProcessing,
}) => {
  const updateSetting = <K extends keyof DocumentSettings>(key: K, value: DocumentSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handleRotate90 = () => {
    const nextRot = (settings.rotation + 90) % 360;
    updateSetting('rotation', nextRot);
  };

  const handleExportPdf = async () => {
    await exportToPdf([item], `${item.name.replace(/\.[^/.]+$/, '')}_doc.pdf`);
  };

  const handleExportAllPdf = async () => {
    await exportToPdf(allItems, `decumopress_documents_bundle.pdf`);
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-white">Document Scanning & Cleanup</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onApply}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            <span>Update Document</span>
          </button>
        </div>
      </div>

      {/* Preset Filters for Scans */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400">Document Scan Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: 'none' as const,
              label: 'Original Color',
              desc: 'Natural lighting',
            },
            {
              id: 'clean-paper' as const,
              label: 'Paper Whiten',
              desc: 'Removes phone shadows',
            },
            {
              id: 'scan-bw' as const,
              label: 'B&W Scan',
              desc: 'Crisp black text & seal',
            },
            {
              id: 'high-contrast' as const,
              label: 'High Contrast',
              desc: 'Punchy text clarity',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => updateSetting('filter', mode.id)}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors ${
                settings.filter === mode.id
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-semibold">{mode.label}</span>
              <span className="text-[10px] text-slate-400">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rotation & Orientation Controls */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400">Orientation & Deskew</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRotate90}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Rotate 90° ({settings.rotation}°)</span>
          </button>
          <button
            type="button"
            onClick={() => updateSetting('flipH', !settings.flipH)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              settings.flipH
                ? 'border-indigo-500 bg-indigo-600/20 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white'
            }`}
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
            <span>Flip Horizontal</span>
          </button>
          <button
            type="button"
            onClick={() => updateSetting('flipV', !settings.flipV)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              settings.flipV
                ? 'border-indigo-500 bg-indigo-600/20 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white'
            }`}
          >
            <FlipVertical className="h-3.5 w-3.5" />
            <span>Flip Vertical</span>
          </button>
        </div>
      </div>

      {/* Scan Threshold slider when in B&W mode */}
      {settings.filter === 'scan-bw' && (
        <div className="space-y-2 rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/70">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">B&W Ink Threshold</span>
            <span className="font-mono tabular-nums text-indigo-400 font-bold">
              {settings.threshold} / 255
            </span>
          </div>
          <input
            type="range"
            min={40}
            max={220}
            value={settings.threshold}
            onChange={(e) => updateSetting('threshold', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Faint Ink (Thin)</span>
            <span>Balanced Scan</span>
            <span>Dark Heavy Ink</span>
          </div>
        </div>
      )}

      {/* Contrast & Brightness Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 rounded-xl bg-slate-950/40 p-3 border border-slate-800/70">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Contrast className="h-3 w-3" /> Contrast
            </span>
            <span className="font-mono tabular-nums text-slate-300">{settings.contrast}</span>
          </div>
          <input
            type="range"
            min={-50}
            max={100}
            value={settings.contrast}
            onChange={(e) => updateSetting('contrast', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-1.5 rounded-xl bg-slate-950/40 p-3 border border-slate-800/70">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <SunMedium className="h-3 w-3" /> Brightness
            </span>
            <span className="font-mono tabular-nums text-slate-300">{settings.brightness}</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={settings.brightness}
            onChange={(e) => updateSetting('brightness', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* Sharpening for Document Legibility */}
      <div className="space-y-2 rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/70">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Edge Unsharp Mask (Text Sharpening)</span>
          </span>
          <span className="font-mono tabular-nums text-indigo-400 font-bold">
            {settings.sharpenAmount}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.sharpenAmount}
          onChange={(e) => updateSetting('sharpenAmount', Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Document PDF Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <div className="text-xs text-slate-400">
          Export cleaned document pages directly to standard A4 PDF format
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export This Page as PDF</span>
          </button>
          {allItems.length > 1 && (
            <button
              type="button"
              onClick={handleExportAllPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Export All ({allItems.length}) as Combined PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
