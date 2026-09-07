import React from "react";
import { Logo } from "../ui/Logo";
import { X, ShieldCheck, Cpu, Zap, Lock, Globe } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] rounded-3xl bg-slate-950 border border-violet-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15">
          <Logo size="sm" showTagline />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-violet-950 text-xs text-slate-300 leading-relaxed">
          {/* Mission */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/40 to-slate-900/60 border border-violet-500/20">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>Intelligence Beyond Limits</span>
            </h3>
            <p className="text-slate-300">
              ERROREN X is a next-generation AI assistant platform engineered for developers, researchers, and creators. Designed to provide instant reasoning, multi-language code generation, document synthesis, and live web search grounding.
            </p>
          </div>

          {/* Architecture Highlights */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] text-violet-400">
              Platform Architecture
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-violet-500/15">
                <div className="font-semibold text-slate-100 mb-0.5 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>ERROREN X Core Engine</span>
                </div>
                <div className="text-[10px] text-slate-400">Server-side secure inference engine</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-violet-500/15">
                <div className="font-semibold text-slate-100 mb-0.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero Key Exposure</span>
                </div>
                <div className="text-[10px] text-slate-400">All credentials proxied securely</div>
              </div>
            </div>
          </div>

          {/* Privacy & Terms */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] text-violet-400">
              Privacy & Security
            </h4>
            <p className="text-slate-400">
              Your conversations are stored in a dedicated secure relational schema. We do not sell your personal data or use your confidential prompts for public training models. You can export or delete your conversations at any time in Settings.
            </p>
          </div>

          <div className="pt-3 border-t border-violet-500/15 flex items-center justify-between text-[11px] text-slate-500">
            <span>ERROREN X v2.5.0 Enterprise</span>
            <span>© 2026 ERROREN X Inc. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
