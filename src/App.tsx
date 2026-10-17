import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProcessMode,
  CompressionSettings,
  DocumentSettings,
  DecompressSettings,
  ProcessedItem,
  QuickPreset,
} from './types';
import { TopBar } from './components/TopBar';
import { DropZone } from './components/DropZone';
import { ImageComparisonSlider } from './components/ImageComparisonSlider';
import { CompressorControls } from './components/CompressorControls';
import { DocumentProcessorView } from './components/DocumentProcessorView';
import { DecompressorView } from './components/DecompressorView';
import { BatchQueue } from './components/BatchQueue';
import { MetadataInspectorModal } from './components/MetadataInspectorModal';
import { FaqAndPresetsSection } from './components/FaqAndPresetsSection';
import { processImage, formatBytes } from './utils/imageProcessor';
import { extractImagesFromZip } from './utils/zipProcessor';

// Sample assets generated
import samplePortrait from './assets/images/sample_portrait_id_1792250935623.jpg';
import sampleDoc from './assets/images/sample_official_document_1792250935500.jpg';
import sampleLandscape from './assets/images/sample_landscape_detail_1792250936078.jpg';

import {
  SlidersHorizontal,
  FileText,
  Cpu,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<ProcessMode>('compress');
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inspectorItem, setInspectorItem] = useState<ProcessedItem | null>(null);

  // Settings
  const [compSettings, setCompSettings] = useState<CompressionSettings>({
    targetMode: 'exact-kb',
    targetKb: 50,
    quality: 0.75,
    format: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    dpi: 300,
    maintainAspect: true,
    grayscale: false,
    stripMetadata: true,
  });

  const [docSettings, setDocSettings] = useState<DocumentSettings>({
    filter: 'clean-paper',
    threshold: 140,
    contrast: 25,
    brightness: 10,
    rotation: 0,
    flipH: false,
    flipV: false,
    sharpenAmount: 35,
  });

  const [decompressSettings, setDecompressSettings] = useState<DecompressSettings>({
    sharpness: 40,
    denoise: 15,
    contrastRecovery: 25,
    upscaleFactor: 1,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active selected item
  const selectedItem = items.find((i) => i.id === selectedId) || items[0] || null;

  // Process a single item with active settings
  const processSingleItem = useCallback(
    async (item: ProcessedItem, mode: ProcessMode = currentMode): Promise<ProcessedItem> => {
      try {
        const result = await processImage(
          item.originalUrl,
          compSettings,
          mode === 'document' ? docSettings : undefined,
          mode === 'decompress' ? decompressSettings : undefined
        );

        const processedUrl = URL.createObjectURL(result.blob);
        const ratio =
          item.originalSize > 0
            ? Math.round(((result.blob.size - item.originalSize) / item.originalSize) * 100)
            : 0;

        return {
          ...item,
          processedBlob: result.blob,
          processedUrl,
          processedSize: result.blob.size,
          processedWidth: result.width,
          processedHeight: result.height,
          processedFormat: compSettings.format,
          compressionRatio: ratio,
          isProcessing: false,
          error: undefined,
        };
      } catch (err: any) {
        console.error('Processing error:', err);
        return {
          ...item,
          isProcessing: false,
          error: err.message || 'Processing failed',
        };
      }
    },
    [currentMode, compSettings, docSettings, decompressSettings]
  );

  // Re-process active item whenever user adjusts settings (debounced)
  useEffect(() => {
    if (!selectedItem) return;

    const timer = setTimeout(async () => {
      setIsProcessing(true);
      const updated = await processSingleItem(selectedItem, currentMode);
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      setIsProcessing(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [compSettings, docSettings, decompressSettings, currentMode, selectedId]);

  // Handle uploaded files
  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);
    const newItems: ProcessedItem[] = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);
      // Read dimensions
      const img = new Image();
      img.src = url;
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const item: ProcessedItem = {
        id,
        name: file.name,
        originalFile: file,
        originalUrl: url,
        originalSize: file.size,
        originalWidth: img.naturalWidth || img.width || 800,
        originalHeight: img.naturalHeight || img.height || 600,
        originalType: file.type || 'image/jpeg',
        processedBlob: null,
        processedUrl: null,
        processedSize: 0,
        processedWidth: 0,
        processedHeight: 0,
        processedFormat: compSettings.format,
        compressionRatio: 0,
        isProcessing: true,
        rawUncompressedBytes: (img.naturalWidth || 800) * (img.naturalHeight || 600) * 4,
      };

      newItems.push(item);
    }

    // Append to existing items
    setItems((prev) => [...prev, ...newItems]);
    if (!selectedId && newItems.length > 0) {
      setSelectedId(newItems[0].id);
    }

    // Process all newly added items
    const processedNewItems: ProcessedItem[] = [];
    for (const it of newItems) {
      const p = await processSingleItem(it);
      processedNewItems.push(p);
    }

    setItems((prev) =>
      prev.map((item) => {
        const found = processedNewItems.find((p) => p.id === item.id);
        return found || item;
      })
    );
    setIsProcessing(false);
  };

  // Load sample demo image
  const handleLoadSample = async (sampleType: 'portrait' | 'document' | 'landscape') => {
    setIsProcessing(true);
    const sampleSrc =
      sampleType === 'portrait'
        ? samplePortrait
        : sampleType === 'document'
        ? sampleDoc
        : sampleLandscape;

    const sampleName =
      sampleType === 'portrait'
        ? 'passport_portrait_sample.jpg'
        : sampleType === 'document'
        ? 'certificate_document_sample.jpg'
        : 'landscape_mountain_sample.jpg';

    // If document is clicked, switch mode to document mode
    if (sampleType === 'document' && currentMode !== 'document') {
      setCurrentMode('document');
    }

    try {
      const res = await fetch(sampleSrc);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'image/jpeg' });
      await handleFilesSelected([file]);
    } catch (e) {
      console.error('Failed to load sample image:', e);
      setIsProcessing(false);
    }
  };

  // Apply Quick Preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setCompSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    if (preset.docSettings) {
      setDocSettings((prev) => ({
        ...prev,
        ...preset.docSettings,
      }));
      if (preset.category === 'document') {
        setCurrentMode('document');
      }
    }
  };

  // Apply settings to ALL items in queue
  const handleApplyToAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const updatedItems: ProcessedItem[] = [];
    for (const item of items) {
      const res = await processSingleItem(item);
      updatedItems.push(res);
    }
    setItems(updatedItems);
    setIsProcessing(false);
  };

  // Clear all files
  const handleClearAll = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.originalUrl);
      if (it.processedUrl) URL.revokeObjectURL(it.processedUrl);
    });
    setItems([]);
    setSelectedId(null);
  };

  // Remove single file
  const handleRemoveItem = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (it) {
      URL.revokeObjectURL(it.originalUrl);
      if (it.processedUrl) URL.revokeObjectURL(it.processedUrl);
    }
    const remaining = items.filter((i) => i.id !== id);
    setItems(remaining);
    if (selectedId === id) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hidden global input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.zip"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const finalFiles: File[] = [];
            for (const f of files) {
              if (f.name.toLowerCase().endsWith('.zip') || f.type === 'application/zip') {
                const unzipped = await extractImagesFromZip(f);
                finalFiles.push(...unzipped);
              } else {
                finalFiles.push(f);
              }
            }
            if (finalFiles.length > 0) handleFilesSelected(finalFiles);
          }
        }}
        className="hidden"
      />

      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onUploadClick={() => fileInputRef.current?.click()}
        itemCount={items.length}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section if no items loaded */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center space-y-6 pt-6 pb-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Zero Server Uploads · 100% Client-Side Privacy
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl text-balance">
              Smart Photo Compressor, Decompressor & Document Scanner
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl text-balance leading-relaxed">
              Target exact file sizes (<span className="text-indigo-400 font-medium">≤ 20KB, 50KB, 100KB</span>) for exam and job portals, restore compressed details, clean phone shadows on document scans, and batch-export in seconds.
            </p>

            {/* Drop Zone */}
            <div className="w-full max-w-3xl mt-4">
              <DropZone
                onFilesSelected={handleFilesSelected}
                onLoadSample={handleLoadSample}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        ) : (
          /* Active Workspace Layout */
          <div className="space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setCurrentMode('compress')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    currentMode === 'compress'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Compressor (Target KB)</span>
                </button>
                <button
                  onClick={() => setCurrentMode('decompress')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    currentMode === 'decompress'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="h-4 w-4" />
                  <span>Decompressor & Restorer</span>
                </button>
                <button
                  onClick={() => setCurrentMode('document')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    currentMode === 'document'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Document & Scan Mode</span>
                </button>
              </div>

              {/* Item Metadata Inspector Trigger */}
              {selectedItem && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInspectorItem(selectedItem)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                  >
                    <Info className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Inspect Raw Buffer</span>
                  </button>
                </div>
              )}
            </div>

            {/* Split Grid: Left Preview Canvas / Slider, Right Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Canvas & Comparison Slider) */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                {selectedItem ? (
                  <ImageComparisonSlider
                    item={selectedItem}
                    labelOriginal="Original Photo"
                    labelProcessed={
                      currentMode === 'document'
                        ? 'Scanned Document'
                        : currentMode === 'decompress'
                        ? 'Decompressed & Restored'
                        : `Target ≤ ${compSettings.targetKb} KB`
                    }
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-500 text-xs">
                    No image selected
                  </div>
                )}
              </div>

              {/* Right Column (Contextual Mode Controls) */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                {currentMode === 'compress' && (
                  <CompressorControls
                    settings={compSettings}
                    onChange={setCompSettings}
                    onApplyPreset={handleApplyPreset}
                    onRecompress={handleApplyToAll}
                    isProcessing={isProcessing}
                  />
                )}

                {currentMode === 'document' && selectedItem && (
                  <DocumentProcessorView
                    item={selectedItem}
                    allItems={items}
                    settings={docSettings}
                    onChange={setDocSettings}
                    onApply={handleApplyToAll}
                    isProcessing={isProcessing}
                  />
                )}

                {currentMode === 'decompress' && selectedItem && (
                  <DecompressorView
                    item={selectedItem}
                    settings={decompressSettings}
                    onChange={setDecompressSettings}
                    onApply={handleApplyToAll}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            </div>

            {/* Batch Queue & Downloads */}
            <BatchQueue
              items={items}
              selectedItemId={selectedItem?.id || null}
              onSelectItem={setSelectedId}
              onRemoveItem={handleRemoveItem}
              onClearAll={handleClearAll}
              onAddMore={() => fileInputRef.current?.click()}
            />
          </div>
        )}

        {/* Informational Guidance, Presets & FAQ Section */}
        <FaqAndPresetsSection />
      </main>

      {/* Metadata Inspector Modal */}
      <MetadataInspectorModal
        item={inspectorItem}
        onClose={() => setInspectorItem(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>DecumoPress Studio · Professional Photo & Document Compression Engine</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">100% In-Browser Canvas Pipeline</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">RFC 2046 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
