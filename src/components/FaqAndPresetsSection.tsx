import React from 'react';
import { ShieldCheck, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export const FaqAndPresetsSection: React.FC = () => {
  return (
    <section id="features" className="flex flex-col gap-8 pt-8 border-t border-slate-800">
      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h4 className="text-sm font-semibold text-white">Target Exact KB Sizes</h4>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Many government recruitment portals and university forms reject uploads exceeding 20KB or 50KB. Our iterative binary search tests image qualities to ensure the output file strictly stays within your chosen threshold without unnecessary blur.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h4 className="text-sm font-semibold text-white">Lossless Decompression & Restorer</h4>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Unpack compressed archives, inspect full 32-bit RGBA pixel buffers, and run unsharp deconvolution filters to recover edge acuity and remove lossy compression halos from over-compressed photos.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h4 className="text-sm font-semibold text-white">Document Scanning & PDF Export</h4>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Eliminate phone camera shadows on paper photos. Turn grayish document photos into clean white backgrounds with crisp black text, and export single or multi-page bundles to PDF with one click.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Common Questions & Guidance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-200">
              Why does my portal demand photos under 20 KB or 50 KB?
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Official exam boards and legacy database systems have strict payload caps to store millions of records cheaply. Selecting the "Gov / Exam (&lt; 20 KB)" preset automatically applies optimum dimension boundaries and quantizes the file to satisfy the portal.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-200">
              Are my photos or confidential documents uploaded anywhere?
            </h5>
            <p className="text-slate-400 leading-relaxed">
              No. All operations run 100% on your device using your browser's HTML5 Canvas and Web API. Your photos, IDs, signatures, and certificates never touch an external server.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-200">
              What does the Photo Decompressor mode do?
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Lossy formats discard high-frequency data. Our decompressor unpacks bundled ZIP archives, loads images into raw 32-bit bitmap buffers, and runs adaptive sharpness kernels to reverse perceptual blur.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-200">
              Which format should I pick: WebP, JPEG, or PNG?
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Choose <strong>WebP</strong> for modern web apps (saves up to 35% more space than JPEG). Choose <strong>JPEG</strong> for government/passport forms with rigid legacy upload requirements. Choose <strong>PNG</strong> when transparent backgrounds or pixel-crisp vector lines are essential.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
