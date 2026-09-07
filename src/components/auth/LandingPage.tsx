import React from "react";
import { Logo } from "../ui/Logo";
import { FuturisticHeroEmblem } from "../ui/FuturisticHeroEmblem";
import { useAuth } from "../../context/AuthContext";
import {
  Zap,
  Globe,
  Mic,
  ShieldCheck,
  Eye,
  ArrowRight,
  Palette,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: (mode?: "login" | "register") => void;
  onOpenAbout: () => void;
  onOpenHelp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenAbout,
  onOpenHelp,
}) => {
  const { demoLogin, isLoading } = useAuth();

  const handleTestDrive = () => {
    demoLogin("user");
  };

  const featureCards = [
    {
      icon: <Terminal className="w-5 h-5 text-violet-400" />,
      title: "Real-Time Code Engine",
      description: "Synthesis, debugging, refactoring, and automated multi-language source downloads with production precision.",
    },
    {
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      title: "Multimodal Vision & OCR",
      description: "Inspect diagrams, PDFs, CSV tables, charts, and high-resolution images for instant structural extraction.",
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      title: "Live Web Grounding",
      description: "Synthesize facts, verified citations, and current intelligence directly with real-time web grounding.",
    },
    {
      icon: <Mic className="w-5 h-5 text-red-400" />,
      title: "Voice & Speech Synthesis",
      description: "Hands-free voice recognition with natural speech playback and customizable audio speed control.",
    },
    {
      icon: <Palette className="w-5 h-5 text-purple-400" />,
      title: "Creative Image Studio",
      description: "Synthesize high-fidelity concept art, mockups, and digital visuals directly within your workspace on demand.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      title: "Private & Secure Architecture",
      description: "Isolated relational data storage, zero credential leakage, and full JSON session export options.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white relative overflow-hidden">
      {/* Background Subtle Futuristic Grid & Neon Ambient Glows */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="h-20 border-b border-violet-500/15 px-6 lg:px-12 flex items-center justify-between z-20 backdrop-blur-xl bg-slate-950/70">
        <Logo size="md" showTagline />

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenAbout}
            className="hidden md:inline-block text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            About
          </button>
          <button
            onClick={onOpenHelp}
            className="hidden md:inline-block text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Documentation
          </button>

          <button
            onClick={() => onOpenAuth("login")}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 border border-violet-500/20 transition-all"
          >
            Sign In
          </button>

          <button
            onClick={() => onOpenAuth("register")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Futuristic Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-5xl mx-auto w-full z-10">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-bold font-display uppercase tracking-wider mb-6 shadow-sm shadow-violet-500/10">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Next-Generation Autonomous Intelligence</span>
        </div>

        {/* Central Futuristic Holographic Emblem with Energy Ring & Live AI Status */}
        <div className="mb-6 w-full flex justify-center">
          <FuturisticHeroEmblem size="large" showActivityPanel={true} />
        </div>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          The premier AI workspace built for developers, analysts, and researchers. Experience instant streaming token throughput, multimodal inspection, and live web grounding.
        </p>

        {/* Main CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center mb-16">
          <button
            onClick={() => onOpenAuth("register")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-purple-500 text-white font-display font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>LAUNCH WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleTestDrive}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-violet-500/30 text-slate-200 hover:text-white font-display font-bold text-sm transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-violet-400" />
            <span>INSTANT DEMO</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="w-full space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
              Architected for High-Cognition Workflows
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto font-normal">
              Unified multimodal intelligence designed to accelerate complex engineering and analytical tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {featureCards.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-violet-500/15 hover:border-violet-500/35 transition-all text-left space-y-2 shadow-sm group"
              >
                <div className="p-2 rounded-xl bg-slate-950 border border-violet-500/20 w-fit group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xs font-display font-bold text-white group-hover:text-violet-300 transition-colors tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-500/15 bg-slate-950/80 px-6 lg:px-12 py-8 z-10 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showTagline />

          <div className="flex items-center gap-4 text-xs">
            <button onClick={onOpenAbout} className="hover:text-white transition-colors">
              About
            </button>
            <button onClick={onOpenAbout} className="hover:text-white transition-colors">
              Terms & Privacy
            </button>
            <button onClick={onOpenHelp} className="hover:text-white transition-colors">
              Documentation
            </button>
          </div>

          <div className="text-[11px] text-slate-500">© 2026 ERROREN X. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
