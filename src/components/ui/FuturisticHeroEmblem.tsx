import React, { useState, useEffect } from "react";
import { Sparkles, Activity } from "lucide-react";

interface FuturisticHeroEmblemProps {
  size?: "compact" | "large";
  className?: string;
  showActivityPanel?: boolean;
}

export const FuturisticHeroEmblem: React.FC<FuturisticHeroEmblemProps> = ({
  size = "large",
  className = "",
  showActivityPanel = true,
}) => {
  const [activeStateIndex, setActiveStateIndex] = useState(0);

  const rotatingStates = [
    "ERROREN X is ready...",
    "Understanding...",
    "Reasoning...",
    "Analyzing...",
    "Creating...",
    "Ready to assist.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStateIndex((prev) => (prev + 1) % rotatingStates.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingStates.length]);

  const isLarge = size === "large";

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Central Futuristic Holographic Emblem Container */}
      <div className={`relative flex items-center justify-center ${isLarge ? "w-48 h-48 sm:w-56 sm:h-56 my-2" : "w-28 h-28 my-1"}`}>
        {/* Soft Violet Neon Ambient Glow Layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600/30 via-purple-600/25 to-indigo-600/20 blur-2xl animate-erroren-pulse-glow -z-10" />

        {/* Outer Circular Energy Orbit Ring (Slow rotation) */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full animate-erroren-spin-slow pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#outerEnergyGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 12 24 16"
            strokeOpacity="0.6"
          />
          <circle cx="100" cy="10" r="3" fill="#c084fc" filter="drop-shadow(0 0 4px #a855f7)" />
          <circle cx="10" cy="100" r="2" fill="#818cf8" />
          <circle cx="190" cy="100" r="2.5" fill="#e879f9" />
          <defs>
            <linearGradient id="outerEnergyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner Counter-Rotating Precision Grid Ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-erroren-spin-reverse pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="75"
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="4 8"
            strokeOpacity="0.35"
          />
          {/* Subtle Data Wave Marks */}
          <path
            d="M50 100 Q75 80 100 100 T150 100"
            stroke="#c084fc"
            strokeWidth="1"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>

        {/* Angular Metallic Core Emblem Card */}
        <div className={`relative flex items-center justify-center rounded-3xl backdrop-blur-xl border border-violet-400/40 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 shadow-2xl shadow-violet-600/30 ${
          isLarge ? "w-28 h-28 sm:w-32 sm:h-32" : "w-16 h-16 rounded-2xl"
        }`}>
          {/* Metallic Top-Edge Specular Highlight */}
          <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent opacity-80" />

          {/* Primary Angular ERROREN X Glyph */}
          <svg
            viewBox="0 0 100 100"
            className={`${isLarge ? "w-16 h-16 sm:w-20 sm:h-20" : "w-9 h-9"}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Silver-Violet Gradient */}
              <linearGradient id="metallicXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#e9d5ff" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="metallicEGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              {/* Core Illumination Filter */}
              <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Angular Faceted Outer Wings */}
            <path
              d="M20 20 L40 50 L20 80 L32 80 L48 56 L64 80 L76 80 L56 50 L76 20 L64 20 L48 44 L32 20 Z"
              fill="url(#metallicXGrad)"
              filter="url(#coreGlow)"
            />

            {/* Integrated Angular 'E' / Circuit Accent Lines */}
            <path
              d="M48 30 L58 30 M48 50 L64 50 M48 70 L58 70"
              stroke="url(#metallicEGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />

            {/* Central Pure Luminescence Node */}
            <circle cx="48" cy="50" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 6px #c084fc)" />
            <circle cx="48" cy="50" r="2" fill="#7c3aed" />

            {/* Micro Compass Points */}
            <path
              d="M48 10 L48 16 M48 84 L48 90 M8 50 L14 50 M82 50 L88 50"
              stroke="#e9d5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.75"
            />
          </svg>
        </div>
      </div>

      {/* Brand Title & Tagline */}
      <div className="flex flex-col items-center mt-3 mb-4 text-center">
        <div className="flex items-center gap-2">
          <span className={`font-display font-black text-white tracking-tight ${isLarge ? "text-3xl sm:text-4xl" : "text-xl"}`}>
            ERROR
          </span>
          <span className={`font-display font-black text-violet-400 tracking-tight ${isLarge ? "text-3xl sm:text-4xl" : "text-xl"}`}>
            X
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-extrabold text-violet-400 mt-1 font-mono">
          INTELLIGENCE BEYOND LIMITS
        </p>
      </div>

      {/* Small Status Indicators: ● AI ONLINE ● READY ● MULTIMODAL ● REAL-TIME */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5 text-[10px] sm:text-[11px] font-semibold text-slate-300">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-violet-500/25 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-3" />
          <span className="text-slate-200">AI ONLINE</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-violet-500/25 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-slate-200">READY</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-violet-500/25 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span className="text-slate-200">MULTIMODAL</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-violet-500/25 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-slate-200">REAL-TIME</span>
        </div>
      </div>

      {/* Elegant Live AI Activity Panel */}
      {showActivityPanel && (
        <div className="w-full max-w-sm px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-violet-500/30 backdrop-blur-md shadow-lg shadow-violet-950/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-violet-300 font-medium">
            <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse shrink-0" />
            <span className="font-mono text-slate-200 transition-all duration-300">
              {rotatingStates[activeStateIndex]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
            <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse delay-100" />
            <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse delay-200" />
          </div>
        </div>
      )}
    </div>
  );
};
