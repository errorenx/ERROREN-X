import React from "react";
import { useChat } from "../../context/ChatContext";
import { ModelSelector } from "../chat/ModelSelector";
import {
  Menu,
  Share2,
  Trash2,
  Palette,
  Globe,
  Settings,
  Sparkles,
} from "lucide-react";

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onOpenImageStudio: () => void;
  onOpenShare: () => void;
  onClearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenSettings,
  onOpenImageStudio,
  onOpenShare,
  onClearChat,
}) => {
  const {
    currentConversation,
    currentConversationId,
    messages,
    webSearchEnabled,
    setIsSidebarOpen,
  } = useChat();

  return (
    <header className="h-14 border-b border-violet-500/15 bg-slate-950/80 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
      {/* Left: Mobile menu toggle + Model selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-violet-500/15"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <ModelSelector />

        {webSearchEnabled && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-[11px] font-medium shadow-sm">
            <Globe className="w-3 h-3 text-violet-400 animate-pulse" />
            <span>Search Grounding Active</span>
          </div>
        )}
      </div>

      {/* Center: Conversation Title (on larger screens) */}
      <div className="hidden md:flex items-center gap-2 max-w-sm truncate text-xs text-slate-400">
        <span className="truncate font-medium text-slate-300">
          {currentConversation?.title || "New Conversation"}
        </span>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onOpenImageStudio}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-950/50 hover:bg-violet-900/80 text-violet-300 border border-violet-500/20 text-xs font-semibold transition-colors"
          title="Open Image Generation Studio"
        >
          <Palette className="w-3.5 h-3.5 text-violet-400" />
          <span>Image Studio</span>
        </button>

        {currentConversationId && messages.length > 0 && (
          <>
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-violet-500/20 text-xs font-medium transition-colors"
              title="Share this conversation"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/20 transition-colors"
              title="Clear conversation messages"
              aria-label="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-violet-500/15 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
