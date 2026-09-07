import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  X,
  HelpCircle,
  Mic,
  Paperclip,
  Globe,
  Code,
  Sparkles,
  Send,
  MessageSquare,
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSupportMessage("");
      setSupportEmail("");
      addToast("Support inquiry received. Our team will follow up!", "success");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-950 border border-violet-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-display font-bold text-white tracking-tight">Help & Knowledge Base</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-violet-950">
          {/* Quick Start Feature Guides */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Platform Guides & Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Mic className="w-4 h-4 text-red-400" />
                  <span>Voice Dictation & Speech</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click the microphone icon in the chat input to speak directly. Click the "Listen" speaker button on any response to hear it read aloud.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Paperclip className="w-4 h-4 text-emerald-400" />
                  <span>File & Vision Uploads</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Drag and drop or click the + button to attach PDFs, code files, CSV tables, or photos for multimodal visual inspection.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Live Web Grounding</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toggle "Web Search" in the chat input to connect ERROREN X to live Google Search for up-to-date news, citations, and research.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Code className="w-4 h-4 text-violet-400" />
                  <span>Code Intelligence & Export</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Copy snippets with one click or hit "Download" on code blocks to save files directly to your device with proper extensions.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-violet-500/15 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>Contact Support</span>
            </div>

            <form onSubmit={handleSubmitSupport} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Your Email (Optional)</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">How can we help?</label>
                <textarea
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe any question, feedback, or issue..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs focus:outline-none focus:border-violet-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
