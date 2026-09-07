import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { ChevronDown, Sparkles, Zap, ShieldAlert, Check, Cpu } from "lucide-react";

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel, availableModels } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModelObj = availableModels.find((m) => m.id === selectedModel) || {
    id: "gemini-3.7-flash",
    name: "ERROREN X Balanced",
    category: "Balanced",
    badge: "Recommended",
    description: "Ultra-fast hybrid reasoning model for high-speed coding, chatting, and research.",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-violet-500/20 hover:border-violet-500/40 text-slate-200 text-xs md:text-sm font-semibold transition-all shadow-sm"
        aria-expanded={isOpen}
      >
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        <span className="truncate max-w-[130px] sm:max-w-none">{currentModelObj.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-violet-500/30 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-violet-500/10 mb-1">
            Select Intelligence Engine
          </div>

          <div className="space-y-1">
            {availableModels.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? "bg-violet-950/80 border border-violet-500/40 text-white"
                      : "hover:bg-slate-900 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-semibold text-xs text-slate-100">{model.name}</span>
                      {model.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-900/90 text-violet-300 border border-violet-500/30 font-medium">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                      {model.description}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
