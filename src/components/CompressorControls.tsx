import React from 'react';
import { Sliders, Target, FileType, Maximize, Palette, Sparkles, RefreshCw } from 'lucide-react';
import { CompressionSettings, OutputFormat, QuickPreset } from '../types';
import { QUICK_PRESETS } from '../utils/presets';

interface CompressorControlsProps {
  settings: CompressionSettings;
  onChange: (newSettings: CompressionSettings) => void;
  onApplyPreset: (preset: QuickPreset) => void;
  onRecompress: () => void;
  isProcessing: boolean;
}

export const CompressorControls: React.FC<CompressorControlsProps> = ({
  settings,
  onChange,
  onApplyPreset,
  onRecompress,
  isProcessing,
}) => {
  const updateSetting = <K extends keyof CompressionSettings>(
    key: K,
    value: CompressionSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-white">Compression Parameters</h4>
        </div>
        <button
          onClick={onRecompress}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Apply</span>
        </button>
      </div>

      {/* Quick Presets Row */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400">Popular Quick Presets</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="flex flex-col items-start p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-800/60 text-left transition-colors group"
            >
              <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                {preset.label}
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Mode: Exact KB vs Quality */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-slate-400">Optimization Goal</label>
        <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-1">
          <button
            type="button"
            onClick={() => updateSetting('targetMode', 'exact-kb')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              settings.targetMode === 'exact-kb'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Target Exact File Size (KB)
          </button>
          <button
            type="button"
            onClick={() => updateSetting('targetMode', 'quality')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              settings.targetMode === 'quality'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quality Percentage (%)
          </button>
        </div>

        {/* Exact KB Input */}
        {settings.targetMode === 'exact-kb' ? (
          <div className="space-y-3 rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Strict Target File Size</span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">
                ≤ {settings.targetKb} KB
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={1000}
              step={5}
              value={settings.targetKb}
              onChange={(e) => updateSetting('targetKb', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            {/* Quick KB jump tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[15, 20, 50, 100, 200, 500].map((kb) => (
                <button
                  key={kb}
                  type="button"
                  onClick={() => updateSetting('targetKb', kb)}
                  className={`px-2 py-1 text-xs font-mono tabular-nums rounded border transition-colors ${
                    settings.targetKb === kb
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {kb} KB
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Image Compression Quality</span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">
                {Math.round(settings.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={settings.quality}
              onChange={(e) => updateSetting('quality', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Smallest Size (5%)</span>
              <span>Balanced (70%)</span>
              <span>Lossless-like (95%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Output Format */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <FileType className="h-3.5 w-3.5" />
          <span>Output Format</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { format: 'image/jpeg' as OutputFormat, label: 'JPEG / JPG', desc: 'Universal' },
            { format: 'image/webp' as OutputFormat, label: 'WebP', desc: 'Best Ratio' },
            { format: 'image/png' as OutputFormat, label: 'PNG', desc: 'Sharp Graphics' },
          ].map((item) => (
            <button
              key={item.format}
              type="button"
              onClick={() => updateSetting('format', item.format)}
              className={`flex flex-col items-center p-2 rounded-lg border text-xs transition-colors ${
                settings.format === item.format
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="font-semibold">{item.label}</span>
              <span className="text-[10px] text-slate-400">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution & Dimensions */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Maximize className="h-3.5 w-3.5" />
          <span>Resize Dimensions</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-slate-400">Max Width (px)</span>
            <input
              type="number"
              placeholder="Original"
              value={settings.maxWidth === 0 ? '' : settings.maxWidth}
              onChange={(e) => updateSetting('maxWidth', Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Max Height (px)</span>
            <input
              type="number"
              placeholder="Original"
              value={settings.maxHeight === 0 ? '' : settings.maxHeight}
              onChange={(e) => updateSetting('maxHeight', Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Dimension presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {[
            { label: 'Original', w: 0, h: 0 },
            { label: 'Passport 600×600', w: 600, h: 600 },
            { label: '1080p FHD', w: 1920, h: 1080 },
            { label: '720p HD', w: 1280, h: 720 },
            { label: 'Avatar 300×300', w: 300, h: 300 },
          ].map((dim) => (
            <button
              key={dim.label}
              type="button"
              onClick={() => {
                updateSetting('maxWidth', dim.w);
                updateSetting('maxHeight', dim.h);
              }}
              className="px-2 py-0.5 text-[11px] font-mono rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              {dim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grayscale Toggle */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-300 font-medium">Convert to Grayscale (B&W)</span>
        </div>
        <button
          type="button"
          onClick={() => updateSetting('grayscale', !settings.grayscale)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            settings.grayscale ? 'bg-indigo-600' : 'bg-slate-800'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              settings.grayscale ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
