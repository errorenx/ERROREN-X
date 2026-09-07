import React, { useEffect, useState } from "react";
import { Message } from "../../types";
import { api } from "../../services/api";
import { Logo } from "../ui/Logo";
import { ChatMessage } from "./ChatMessage";
import { Loader2, ArrowLeft, MessageSquare, Globe, AlertCircle } from "lucide-react";

interface SharedChatViewProps {
  shareId: string;
  onExit: () => void;
  onStartChat: () => void;
}

export const SharedChatView: React.FC<SharedChatViewProps> = ({
  shareId,
  onExit,
  onStartChat,
}) => {
  const [data, setData] = useState<{
    title: string;
    messages: Message[];
    createdAt: string;
    views: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSharedConversation(shareId);
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load shared conversation");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
        <span className="text-xs text-slate-400">Loading shared conversation...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Conversation Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          This shared link may have expired, been deleted, or is invalid.
        </p>
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
        >
          Return to ERROREN X
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Shared View Nav Header */}
      <header className="h-14 border-b border-violet-500/15 bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-violet-500/15 transition-colors"
            title="Return"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-slate-400">
            Shared on {new Date(data.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={onStartChat}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20"
          >
            Start Your Own Chat
          </button>
        </div>
      </header>

      {/* Main Conversation Viewer */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Shared Thread Title Card */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-violet-500/20 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Shared Thread</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{data.title}</h1>
        </div>

        {/* Message History */}
        <div className="space-y-4">
          {data.messages.map((msg, idx) => (
            <ChatMessage key={msg.id || idx} message={msg} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-violet-500/10 text-center text-xs text-slate-500">
        Powered by <strong className="text-violet-400">ERROREN X</strong> — Intelligence Beyond Limits
      </footer>
    </div>
  );
};
