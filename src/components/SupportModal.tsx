import React, { useState } from 'react';
import { X, Mail, User, Check, Copy, ExternalLink, ShieldCheck, MessageSquare } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [feedbackSubject, setFeedbackSubject] = useState<string>('DecumoPress Support Request');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  if (!isOpen) return null;

  const supportEmail = 'ramrajjnk75@gmail.com';
  const developerName = 'Aakash Pathak';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
      feedbackSubject
    )}&body=${encodeURIComponent(
      `${feedbackMessage}\n\n---\nSent from Photo DecumoPress Studio\nDeveloper: ${developerName}`
    )}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Developer & Support</h3>
              <p className="text-xs text-slate-400">Get in touch for questions, presets, or feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Developer Card */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shrink-0">
            AP
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{developerName}</span>
              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Developer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Creator of DecumoPress Smart Photo & Document Compression Engine
            </p>
          </div>
        </div>

        {/* Support Email Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Official Support Gmail</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Email'}</span>
              </button>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Open Mail</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-sm text-indigo-300 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 select-all">
            <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="truncate">{supportEmail}</span>
          </div>
        </div>

        {/* Quick Message / Feedback Composer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <span>Direct Message to Developer</span>
          </div>

          <div className="space-y-2 text-xs">
            <input
              type="text"
              placeholder="Subject (e.g. Help with Exam Portal Upload / Feature Idea)"
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Describe your question or message for Aakash..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSendEmail}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email to {supportEmail}</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>All files remain completely confidential on your device.</span>
        </div>
      </div>
    </div>
  );
};
