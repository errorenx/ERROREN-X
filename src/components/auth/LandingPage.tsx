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
      icon: <Terminal className="w-5 h-5 accent-text" />,
      title: "Real-Time Code Engine",
      description:
        "Synthesis, debugging, refactoring, and automated multi-language source downloads with production precision.",
    },
    {
      icon: <Eye className="w-5 h-5" style={{ color: "#34d399" }} />,
      title: "Multimodal Vision & OCR",
      description:
        "Inspect diagrams, PDFs, CSV tables, charts, and high-resolution images for instant structural extraction.",
    },
    {
      icon: <Globe className="w-5 h-5" style={{ color: "#60a5fa" }} />,
      title: "Live Web Grounding",
      description:
        "Synthesize facts, verified citations, and current intelligence directly with real-time web grounding.",
    },
    {
      icon: <Mic className="w-5 h-5" style={{ color: "#f87171" }} />,
      title: "Voice & Speech Synthesis",
      description:
        "Hands-free voice recognition with natural speech playback and customizable audio speed control.",
    },
    {
      icon: <Palette className="w-5 h-5 accent-text" />,
      title: "Creative Image Studio",
      description:
        "Synthesize high-fidelity concept art, mockups, and digital visuals directly within your workspace on demand.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" style={{ color: "#fbbf24" }} />,
      title: "Private & Secure Architecture",
      description:
        "Isolated relational data storage, zero credential leakage, and full JSON session export options.",
    },
  ];

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        relative
        overflow-hidden
        selection:bg-[var(--accent-color)]
        selection:text-white
      "
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              var(--accent-color) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              var(--accent-color) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Accent Glow */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[700px]
          h-[350px]
          rounded-full
          blur-[140px]
          pointer-events-none
          -z-10
        "
        style={{
          backgroundColor: "rgba(var(--accent-rgb), 0.12)",
        }}
      />

      {/* Secondary Accent Glow */}
      <div
        className="
          absolute
          top-1/3
          left-1/4
          w-[350px]
          h-[250px]
          rounded-full
          blur-[120px]
          pointer-events-none
          -z-10
        "
        style={{
          backgroundColor: "rgba(var(--accent-rgb), 0.07)",
        }}
      />

      {/* Top Navbar */}
      <header
        className="
          h-20
          px-6
          lg:px-12
          flex
          items-center
          justify-between
          z-20
          backdrop-blur-xl
          border-b
        "
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
          borderColor:
            "color-mix(in srgb, var(--accent-color) 16%, var(--border-color))",
        }}
      >
        <Logo size="md" showTagline />

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenAbout}
            className="hidden md:inline-block text-xs font-medium transition-colors"
            style={{
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            About
          </button>

          <button
            onClick={onOpenHelp}
            className="hidden md:inline-block text-xs font-medium transition-colors"
            style={{
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Documentation
          </button>

          {/* Sign In */}
          <button
            onClick={() => onOpenAuth("login")}
            className="
              px-4
              py-2
              rounded-xl
              text-xs
              font-semibold
              border
              transition-all
            "
            style={{
              color: "var(--text-primary)",
              backgroundColor:
                "color-mix(in srgb, var(--bg-secondary) 65%, transparent)",
              borderColor:
                "color-mix(in srgb, var(--accent-color) 20%, var(--border-color))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-color)";
              e.currentTarget.style.borderColor =
                "color-mix(in srgb, var(--accent-color) 45%, var(--border-color))";
              e.currentTarget.style.backgroundColor =
                "color-mix(in srgb, var(--accent-color) 8%, var(--bg-secondary))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor =
                "color-mix(in srgb, var(--accent-color) 20%, var(--border-color))";
              e.currentTarget.style.backgroundColor =
                "color-mix(in srgb, var(--bg-secondary) 65%, transparent)";
            }}
          >
            Sign In
          </button>

          {/* Get Started */}
          <button
            onClick={() => onOpenAuth("register")}
            className="
              px-4
              py-2
              rounded-xl
              text-xs
              font-semibold
              text-white
              transition-all
              hover:scale-[1.02]
            "
            style={{
              background:
                "linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 65%, #000000))",
              boxShadow:
                "0 10px 25px rgba(var(--accent-rgb), 0.20)",
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main
        className="
          flex-1
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-4
          sm:px-6
          lg:px-8
          pt-8
          pb-16
          max-w-5xl
          mx-auto
          w-full
          z-10
        "
      >
        {/* Release Badge */}
        <div
          className="
            inline-flex
            items-center
            gap-2
            px-3.5
            py-1.5
            rounded-full
            text-xs
            font-bold
            font-display
            uppercase
            tracking-wider
            mb-6
            border
          "
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--accent-color) 10%, var(--bg-secondary))",
            borderColor:
              "color-mix(in srgb, var(--accent-color) 30%, var(--border-color))",
            color: "var(--accent-color)",
            boxShadow:
              "0 4px 15px rgba(var(--accent-rgb), 0.08)",
          }}
        >
          <Sparkles
            className="w-3.5 h-3.5"
            style={{ color: "var(--accent-color)" }}
          />

          <span>Next-Generation Autonomous Intelligence</span>
        </div>

        {/* Central Emblem */}
        <div className="mb-6 w-full flex justify-center">
          <FuturisticHeroEmblem
            size="large"
            showActivityPanel={true}
          />
        </div>

        {/* Subtitle */}
        <p
          className="
            text-sm
            sm:text-base
            max-w-2xl
            mx-auto
            leading-relaxed
            mb-8
            font-normal
          "
          style={{
            color: "var(--text-secondary)",
          }}
        >
          The premier AI workspace built for developers, analysts,
          and researchers. Experience instant streaming token
          throughput, multimodal inspection, and live web grounding.
        </p>

        {/* Main CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center mb-16">
          {/* Launch Workspace */}
          <button
            onClick={() => onOpenAuth("register")}
            className="
              w-full
              sm:w-auto
              flex
              items-center
              justify-center
              gap-2
              px-8
              py-3.5
              rounded-2xl
              text-white
              font-display
              font-bold
              text-sm
              transition-all
              hover:scale-[1.02]
              cursor-pointer
            "
            style={{
              background:
                "linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 65%, #000000))",
              boxShadow:
                "0 18px 40px rgba(var(--accent-rgb), 0.25)",
            }}
          >
            <span>LAUNCH WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Demo */}
          <button
            onClick={handleTestDrive}
            disabled={isLoading}
            className="
              w-full
              sm:w-auto
              flex
              items-center
              justify-center
              gap-2
              px-6
              py-3.5
              rounded-2xl
              border
              font-display
              font-bold
              text-sm
              transition-all
              cursor-pointer
            "
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--bg-secondary) 88%, transparent)",
              borderColor:
                "color-mix(in srgb, var(--accent-color) 30%, var(--border-color))",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "color-mix(in srgb, var(--accent-color) 9%, var(--bg-secondary))";
              e.currentTarget.style.borderColor =
                "color-mix(in srgb, var(--accent-color) 50%, var(--border-color))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "color-mix(in srgb, var(--bg-secondary) 88%, transparent)";
              e.currentTarget.style.borderColor =
                "color-mix(in srgb, var(--accent-color) 30%, var(--border-color))";
            }}
          >
            <Zap
              className="w-4 h-4"
              style={{ color: "var(--accent-color)" }}
            />
            <span>INSTANT DEMO</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="w-full space-y-6">
          <div className="text-center space-y-1">
            <h2
              className="
                text-xl
                sm:text-2xl
                font-display
                font-extrabold
                tracking-tight
              "
              style={{
                color: "var(--text-primary)",
              }}
            >
              Architected for High-Cognition Workflows
            </h2>

            <p
              className="text-xs max-w-lg mx-auto font-normal"
              style={{
                color: "var(--text-muted)",
              }}
            >
              Unified multimodal intelligence designed to accelerate
              complex engineering and analytical tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {featureCards.map((feat, idx) => (
              <div
                key={idx}
                className="
                  p-5
                  rounded-2xl
                  border
                  transition-all
                  text-left
                  space-y-2
                  shadow-sm
                  group
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--bg-secondary) 72%, transparent)",
                  borderColor:
                    "color-mix(in srgb, var(--accent-color) 15%, var(--border-color))",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "color-mix(in srgb, var(--accent-color) 7%, var(--bg-secondary))";
                  e.currentTarget.style.borderColor =
                    "color-mix(in srgb, var(--accent-color) 35%, var(--border-color))";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(var(--accent-rgb), 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "color-mix(in srgb, var(--bg-secondary) 72%, transparent)";
                  e.currentTarget.style.borderColor =
                    "color-mix(in srgb, var(--accent-color) 15%, var(--border-color))";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className="
                    p-2
                    rounded-xl
                    border
                    w-fit
                    group-hover:scale-105
                    transition-transform
                  "
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor:
                      "color-mix(in srgb, var(--accent-color) 20%, var(--border-color))",
                  }}
                >
                  {feat.icon}
                </div>

                <h3
                  className="
                    text-xs
                    font-display
                    font-bold
                    transition-colors
                    tracking-tight
                  "
                  style={{
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                >
                  {feat.title}
                </h3>

                <p
                  className="
                    text-xs
                    leading-relaxed
                    font-normal
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="
          border-t
          px-6
          lg:px-12
          py-8
          z-10
          text-xs
        "
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--bg-primary) 88%, transparent)",
          borderColor:
            "color-mix(in srgb, var(--accent-color) 15%, var(--border-color))",
          color: "var(--text-muted)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showTagline />

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenAbout}
              className="transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              About
            </button>

            <button
              onClick={onOpenAbout}
              className="transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              Terms & Privacy
            </button>

            <button
              onClick={onOpenHelp}
              className="transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              Documentation
            </button>
          </div>

          <div
            className="text-[11px]"
            style={{
              color: "var(--text-muted)",
            }}
          >
            © 2026 ERROREN X. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};