import React from 'react';
import { ShieldCheck, HelpCircle, FileText, CheckCircle2, Mail, User, Download, ExternalLink } from 'lucide-react';

interface FaqAndPresetsSectionProps {
  onOpenSupport?: () => void;
}

export const FaqAndPresetsSection: React.FC<FaqAndPresetsSectionProps> = ({ onOpenSupport }) => {
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
          <h4 className="text-sm font-semibold text-white">Document Scanning & Multi-Format Export</h4>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Eliminate phone camera shadows on paper photos. Turn grayish document photos into clean white backgrounds with crisp black text, and export in any format you require: PDF Document, JPG, PNG, or WebP.
          </p>
        </div>
      </div>

      {/* Developer & Support Contact Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Developed by Aakash Pathak</h4>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Have questions, need custom government portal presets, or experiencing issues? Contact support directly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:ramrajjnk75@gmail.com?subject=DecumoPress%20Inquiry%20/%20Support"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>ramrajjnk75@gmail.com</span>
          </a>

          {onOpenSupport && (
            <button
              onClick={onOpenSupport}
              className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Support Center
            </button>
          )}
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
            <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              <span>How do I download my document in a different format?</span>
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Click the <strong>"Format..."</strong> or <strong>"Download in Format"</strong> button. You can select between <strong>PDF Document (.pdf)</strong> for official form submissions and A4 printouts, <strong>JPEG (.jpg)</strong> for exam portal upload limits, <strong>PNG (.png)</strong> for lossless text & signatures, or <strong>WebP (.webp)</strong> for modern websites.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-200">
              Why does my portal demand photos under 20 KB or 50 KB?
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Official exam boards and government portals have strict payload caps to store millions of records. Selecting the "Gov / Exam (&lt; 20 KB)" preset automatically applies optimum dimension boundaries and quantizes the file to satisfy the portal.
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
              Who developed this application and how do I contact support?
            </h5>
            <p className="text-slate-400 leading-relaxed">
              DecumoPress was developed by <strong>Aakash Pathak</strong>. For any support inquiries, suggestions, or issues, please email <strong>ramrajjnk75@gmail.com</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
