import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, SplitSquareVertical, Columns, Eye } from 'lucide-react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface ImageComparisonSliderProps {
  item: ProcessedItem;
  labelOriginal?: string;
  labelProcessed?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  item,
  labelOriginal = 'Original',
  labelProcessed = 'Optimized',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'processed-only'>('slider');

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking slider handle or near it in slider mode
    if (viewMode === 'slider') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
      setIsDragging(true);
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Dedicated Mobile Touch Handlers to strictly prevent page scroll/movement while sliding
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      if (viewMode === 'slider' && zoom <= 1 && e.touches.length === 1) {
        e.preventDefault(); // Stop mobile viewport scrolling
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pct);
        setIsDragging(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && viewMode === 'slider') {
        e.preventDefault(); // Stop mobile viewport scrolling
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          const rect = container.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
          setSliderPos(pct);
        }
      }
    };

    const onTouchEnd = () => {
      setIsDragging(false);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging, viewMode, zoom]);

  // Pan handlers when zoomed
  const handlePanStart = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPos(50);
  };

  const currentProcessedUrl = item.processedUrl || item.originalUrl;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">
            {item.name}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-300">
            {item.originalWidth} × {item.originalHeight} px
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-indigo-400">
            {formatBytes(item.processedSize || item.originalSize)}
          </span>
        </div>

        {/* View Mode Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('slider')}
              title="Split Slider View"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'slider'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SplitSquareVertical className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side-by-Side Comparison"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewMode('processed-only')}
              title="Optimized Result Only"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'processed-only'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Result</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-xs tabular-nums text-slate-300 px-2 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={resetTransform}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors border-l border-slate-800"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          className="relative w-full h-[460px] sm:h-[540px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 select-none cursor-ew-resize flex items-center justify-center touch-none"
          style={{ touchAction: 'none' }}
        >
          {/* Inner zoom container */}
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'ew-resize',
            }}
          >
            {/* Processed (Right / Background Layer) */}
            <img
              src={currentProcessedUrl}
              alt={labelProcessed}
              referrerPolicy="no-referrer"
              className="absolute max-h-full max-w-full object-contain pointer-events-none"
            />

            {/* Original (Left / Clipped Layer) */}
            <div
              className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              <img
                src={item.originalUrl}
                alt={labelOriginal}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Vertical Divider Line with Grab Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none z-20 flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-xl text-white">
              <SplitSquareVertical className="h-4 w-4 text-indigo-400" />
            </div>
          </div>

          {/* Floating Labels */}
          <div className="absolute top-3 left-3 z-10 rounded-md bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-slate-200 border border-slate-800/80 pointer-events-none">
            {labelOriginal} ({formatBytes(item.originalSize)})
          </div>
          <div className="absolute top-3 right-3 z-10 rounded-md bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-indigo-300 border border-slate-800/80 pointer-events-none">
            {labelProcessed} ({formatBytes(item.processedSize || item.originalSize)})
          </div>

          {/* Drag instruction helper */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-md bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] text-slate-400 border border-slate-800 pointer-events-none">
            Drag slider left or right to inspect compression fidelity
          </div>
        </div>
      )}

      {/* Side-by-Side View */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">{labelOriginal}</span>
              <span className="font-mono tabular-nums">{formatBytes(item.originalSize)}</span>
            </div>
            <div className="relative h-[400px] w-full rounded-lg bg-slate-950/60 overflow-hidden flex items-center justify-center">
              <img
                src={item.originalUrl}
                alt={labelOriginal}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-indigo-400">{labelProcessed}</span>
              <span className="font-mono tabular-nums text-indigo-300">
                {formatBytes(item.processedSize || item.originalSize)}
              </span>
            </div>
            <div className="relative h-[400px] w-full rounded-lg bg-slate-950/60 overflow-hidden flex items-center justify-center">
              <img
                src={currentProcessedUrl}
                alt={labelProcessed}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Result Only View */}
      {viewMode === 'processed-only' && (
        <div className="relative w-full h-[460px] sm:h-[540px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 flex items-center justify-center">
          <img
            src={currentProcessedUrl}
            alt={labelProcessed}
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain"
          />
          <div className="absolute top-3 right-3 rounded-md bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-indigo-300 border border-slate-800/80">
            {labelProcessed} ({formatBytes(item.processedSize || item.originalSize)})
          </div>
        </div>
      )}

      {/* Compression Stats Footer Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="rounded-lg bg-slate-900/70 border border-slate-800/80 p-3">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Original Size</div>
          <div className="text-sm font-semibold font-mono tabular-nums text-slate-200 mt-0.5">
            {formatBytes(item.originalSize)}
          </div>
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-slate-800/80 p-3">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Optimized Size</div>
          <div className="text-sm font-semibold font-mono tabular-nums text-indigo-400 mt-0.5">
            {formatBytes(item.processedSize || item.originalSize)}
          </div>
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-slate-800/80 p-3">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Space Saved</div>
          <div className="text-sm font-semibold font-mono tabular-nums text-emerald-400 mt-0.5">
            {item.processedSize && item.originalSize > item.processedSize
              ? `${Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)}% reduction`
              : '0%'}
          </div>
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-slate-800/80 p-3">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Output Dimensions</div>
          <div className="text-sm font-semibold font-mono tabular-nums text-slate-200 mt-0.5">
            {item.processedWidth || item.originalWidth} × {item.processedHeight || item.originalHeight}
          </div>
        </div>
      </div>
    </div>
  );
};
