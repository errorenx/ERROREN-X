import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showTagline = false, className = "" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-base font-bold tracking-wider",
    md: "text-lg font-bold tracking-wider",
    lg: "text-2xl font-black tracking-widest",
    xl: "text-4xl font-black tracking-widest",
  };

  const taglineSizes = {
    sm: "text-[8px] tracking-[0.25em] font-semibold",
    md: "text-[9px] tracking-[0.25em] font-semibold",
    lg: "text-xs tracking-[0.25em] font-semibold",
    xl: "text-sm tracking-[0.25em] font-semibold",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Angular Metallic ERROREN X Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-violet-400/40 shadow-md shadow-violet-600/25 ${iconSizes[size]}`}>
        <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path
            d="M20 20 L40 50 L20 80 L32 80 L48 56 L64 80 L76 80 L56 50 L76 20 L64 20 L48 44 L32 20 Z"
            fill="url(#logoXGrad)"
          />
          <path
            d="M48 32 L56 32 M48 50 L62 50 M48 68 L56 68"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="48" cy="50" r="3.5" fill="#ffffff" />
          <circle cx="48" cy="50" r="1.5" fill="#7c3aed" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none">
          <span className={`text-white tracking-tight font-display font-black ${textSizes[size]}`}>
            ERROR
          </span>
          <span className={`text-violet-400 font-display font-black tracking-normal ${textSizes[size]}`}>
            X
          </span>
        </div>
        {showTagline && (
          <span className={`text-violet-300/90 uppercase mt-1 font-bold font-mono ${taglineSizes[size]}`}>
            INTELLIGENCE BEYOND LIMITS
          </span>
        )}
      </div>
    </div>
  );
};

