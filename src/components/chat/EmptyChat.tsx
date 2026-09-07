import React from "react";
import { useChat } from "../../context/ChatContext";
import { FuturisticHeroEmblem } from "../ui/FuturisticHeroEmblem";
import {
  Code,
  Sparkles,
  FileSearch,
  Lightbulb,
  Cpu,
  Eye,
  Mic,
  Globe,
} from "lucide-react";

interface EmptyChatProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({ onSelectPrompt }) => {
  const { selectedModel } = useChat();

  const suggestionCards = [
    {
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      title: "Explain something",
      description: "Explain quantum computing principles with real-world analogies",
      prompt: "Explain the fundamental principles of quantum computing (superposition, entanglement) with clear real-world analogies.",
    },
    {
      icon: <Code className="w-4 h-4 text-violet-400" />,
      title: "Write & debug code",
      description: "Build a production REST API with TypeScript, auth & rate limiting",
      prompt: "Write a complete production-ready REST API in TypeScript with JWT authentication, rate limiting, and error handling middleware.",
    },
    {
      icon: <FileSearch className="w-4 h-4 text-emerald-400" />,
      title: "Analyze documents & data",
      description: "Extract insights, key takeaways, and tables from files",
      prompt: "How can I upload a PDF, CSV, or code file for you to summarize, inspect, and query?",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      title: "Brainstorm ideas",
      description: "Generate innovative software architecture & product concepts",
      prompt: "Brainstorm 5 disruptive software architecture ideas for next-generation developer tooling in 2026.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-4xl mx-auto w-full text-center select-none">
      {/* Central Futuristic ERROREN X Emblem with Energy Ring & Live AI Status */}
      <FuturisticHeroEmblem size="compact" showActivityPanel={true} className="mb-4" />

      <h2 className="text-xl md:text-2xl font-display font-extrabold text-slate-100 tracking-tight mb-5">
        How can I assist you today?
      </h2>

      {/* Suggestion Prompt Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-6">
        {suggestionCards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(card.prompt)}
            className="group flex flex-col items-start p-3.5 rounded-2xl border border-violet-500/20 bg-slate-900/60 hover:bg-slate-900/95 hover:border-violet-400/50 text-left transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-violet-500/10 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-xl bg-slate-950 border border-violet-500/20 group-hover:border-violet-400/50 transition-colors">
                {card.icon}
              </div>
              <span className="text-xs font-bold font-display text-slate-100 group-hover:text-violet-300 transition-colors tracking-tight">
                {card.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed font-normal">
              {card.description}
            </p>
          </button>
        ))}
      </div>

      {/* System Capabilities Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-violet-500/20 shadow-xs">
          <Cpu className="w-3 h-3 text-violet-400" />
          <span className="font-semibold text-slate-300">Multimodal Reasoning</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-violet-500/20 shadow-xs">
          <Eye className="w-3 h-3 text-emerald-400" />
          <span className="font-semibold text-slate-300">Vision & OCR</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-violet-500/20 shadow-xs">
          <Mic className="w-3 h-3 text-red-400" />
          <span className="font-semibold text-slate-300">Voice Interaction</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-violet-500/20 shadow-xs">
          <Globe className="w-3 h-3 text-blue-400" />
          <span className="font-semibold text-slate-300">Web Search Grounding</span>
        </div>
      </div>
    </div>
  );
};
