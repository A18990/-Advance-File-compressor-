import React from 'react';
import { Layers, ArrowDownToLine, Zap } from 'lucide-react';
import { ProcessMode } from '../types';

interface TopBarProps {
  currentMode: ProcessMode;
  onModeChange: (mode: ProcessMode) => void;
  onUploadClick: () => void;
  itemCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  onModeChange,
  onUploadClick,
  itemCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            DecumoPress
          </span>
        </div>

        {/* Zone 2: Concise navigation links with click handlers */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onModeChange('compress')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentMode === 'compress'
                ? 'text-white border-indigo-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Compressor
          </button>
          <button
            onClick={() => onModeChange('decompress')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentMode === 'decompress'
                ? 'text-white border-indigo-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Decompressor
          </button>
          <button
            onClick={() => onModeChange('document')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentMode === 'document'
                ? 'text-white border-indigo-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            DocuScan
          </button>
          <a
            href="#presets"
            className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Exam & Gov Presets
          </a>
          <a
            href="#features"
            className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Fidelity Specs
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors active:scale-95 whitespace-nowrap shrink-0"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>Add Photos / Zip</span>
            {itemCount > 0 && (
              <span className="font-mono text-xs tabular-nums bg-indigo-700/80 px-1.5 py-0.5 rounded">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
