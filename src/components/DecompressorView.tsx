import React from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Activity,
  Download,
  Info,
  Zap,
} from 'lucide-react';
import { DecompressSettings, ProcessedItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface DecompressorViewProps {
  item: ProcessedItem;
  settings: DecompressSettings;
  onChange: (newSettings: DecompressSettings) => void;
  onApply: () => void;
  isProcessing: boolean;
}

export const DecompressorView: React.FC<DecompressorViewProps> = ({
  item,
  settings,
  onChange,
  onApply,
  isProcessing,
}) => {
  const updateSetting = <K extends keyof DecompressSettings>(
    key: K,
    value: DecompressSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const rawPixels = item.originalWidth * item.originalHeight;
  const rawBytes = rawPixels * 4; // 32-bit RGBA
  const compressionRatio = ((1 - item.originalSize / rawBytes) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-white">Lossless Decompression & Detail Restoration</h4>
        </div>
        <button
          onClick={onApply}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
        >
          <span>Apply Restoration</span>
        </button>
      </div>

      {/* Raw Uncompressed Bitmap Telemetry */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>Uncompressed Memory Buffer Breakdown</span>
          </div>
          <span className="font-mono text-xs tabular-nums text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            {compressionRatio}% Compressed Ratio
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Pixels</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold mt-0.5 block">
              {(rawPixels / 1000000).toFixed(2)} MP
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Color Depth</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold mt-0.5 block">
              32-bit (RGBA)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Compressed File</span>
            <span className="font-mono tabular-nums text-amber-400 font-semibold mt-0.5 block">
              {formatBytes(item.originalSize)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Raw Bitmap Buffer</span>
            <span className="font-mono tabular-nums text-emerald-400 font-semibold mt-0.5 block">
              {formatBytes(rawBytes)}
            </span>
          </div>
        </div>
      </div>

      {/* Upscale Resampling */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400">Decompression Upscale Factor</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { factor: 1, label: '1.0× Native', desc: 'Preserve pixel geometry' },
            { factor: 1.5, label: '1.5× Smooth', desc: 'Enhanced pixel sampling' },
            { factor: 2, label: '2.0× Super-Res', desc: 'Sub-pixel reconstruction' },
          ].map((itemOption) => (
            <button
              key={itemOption.factor}
              type="button"
              onClick={() => updateSetting('upscaleFactor', itemOption.factor)}
              className={`flex flex-col items-center p-2 rounded-lg border text-xs transition-colors ${
                settings.upscaleFactor === itemOption.factor
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="font-semibold">{itemOption.label}</span>
              <span className="text-[10px] text-slate-400">{itemOption.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edge & De-blocking Restoration */}
      <div className="space-y-2 rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/70">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>High-Frequency Edge De-blurring</span>
          </span>
          <span className="font-mono tabular-nums text-indigo-400 font-bold">
            {settings.sharpness}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.sharpness}
          onChange={(e) => updateSetting('sharpness', Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Soft Natural</span>
          <span>Crisp Contours</span>
          <span>Maximum Punch</span>
        </div>
      </div>

      {/* Contrast Recovery */}
      <div className="space-y-2 rounded-xl bg-slate-950/40 p-3.5 border border-slate-800/70">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Dynamic Range Recovery</span>
          <span className="font-mono tabular-nums text-indigo-400 font-bold">
            {settings.contrastRecovery}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.contrastRecovery}
          onChange={(e) => updateSetting('contrastRecovery', Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Notice info */}
      <div className="flex items-start gap-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40 p-3 text-xs text-indigo-200/80">
        <Info className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
        <p>
          Decompressing uncompresses the pixel canvas into full uncompressed 32-bit RGBA channel buffers and applies inverse de-ringing filters to counteract JPEG quantization blur.
        </p>
      </div>
    </div>
  );
};
