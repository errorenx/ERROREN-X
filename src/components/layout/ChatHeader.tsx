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
    <header
      className="h-14 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0"
      style={{
        background:
          "color-mix(in srgb, var(--bg-secondary) 88%, transparent)",
        borderBottom:
          "1px solid rgba(var(--accent-rgb), 0.15)",
        color: "var(--text-primary)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl border transition-colors"
          style={{
            color: "var(--text-secondary)",
            background: "transparent",
            borderColor: "rgba(var(--accent-rgb), 0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.background =
              "rgba(var(--accent-rgb), 0.10)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              "var(--text-secondary)";
            e.currentTarget.style.background = "transparent";
          }}
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <ModelSelector />

        {webSearchEnabled && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shadow-sm"
            style={{
              background:
                "rgba(var(--accent-rgb), 0.12)",
              border:
                "1px solid rgba(var(--accent-rgb), 0.30)",
              color: "var(--accent-color)",
            }}
          >
            <Globe
              className="w-3 h-3 animate-pulse"
              style={{
                color: "var(--accent-color)",
              }}
            />

            <span>Search Grounding Active</span>
          </div>
        )}
      </div>

      {/* Center */}
      <div
        className="hidden md:flex items-center gap-2 max-w-sm truncate text-xs"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        <span
          className="truncate font-medium"
          style={{
            color: "var(--text-primary)",
          }}
        >
          {currentConversation?.title || "New Conversation"}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onOpenImageStudio}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          style={{
            background:
              "rgba(var(--accent-rgb), 0.10)",
            color: "var(--accent-color)",
            border:
              "1px solid rgba(var(--accent-rgb), 0.20)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "rgba(var(--accent-rgb), 0.18)";
            e.currentTarget.style.borderColor =
              "rgba(var(--accent-rgb), 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "rgba(var(--accent-rgb), 0.10)";
            e.currentTarget.style.borderColor =
              "rgba(var(--accent-rgb), 0.20)";
          }}
          title="Open Image Generation Studio"
        >
          <Palette
            className="w-3.5 h-3.5"
            style={{
              color: "var(--accent-color)",
            }}
          />

          <span>Image Studio</span>
        </button>

        {currentConversationId && messages.length > 0 && (
          <>
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border:
                  "1px solid rgba(var(--accent-rgb), 0.20)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(var(--accent-rgb), 0.12)";
                e.currentTarget.style.borderColor =
                  "rgba(var(--accent-rgb), 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "var(--bg-tertiary)";
                e.currentTarget.style.borderColor =
                  "rgba(var(--accent-rgb), 0.20)";
              }}
              title="Share this conversation"
            >
              <Share2
                className="w-3.5 h-3.5"
                style={{
                  color: "var(--accent-color)",
                }}
              />

              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClearChat}
              className="p-2 rounded-xl border border-transparent transition-colors"
              style={{
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.background =
                  "rgba(239, 68, 68, 0.10)";
                e.currentTarget.style.borderColor =
                  "rgba(239, 68, 68, 0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--text-secondary)";
                e.currentTarget.style.background =
                  "transparent";
                e.currentTarget.style.borderColor =
                  "transparent";
              }}
              title="Clear conversation messages"
              aria-label="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl border transition-colors"
          style={{
            color: "var(--text-secondary)",
            borderColor:
              "rgba(var(--accent-rgb), 0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              "var(--text-primary)";
            e.currentTarget.style.background =
              "rgba(var(--accent-rgb), 0.10)";
            e.currentTarget.style.borderColor =
              "rgba(var(--accent-rgb), 0.30)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              "var(--text-secondary)";
            e.currentTarget.style.background =
              "transparent";
            e.currentTarget.style.borderColor =
              "rgba(var(--accent-rgb), 0.15)";
          }}
          title="Settings"
          aria-label="Settings"
        >
          <Settings
            className="w-4 h-4"
            style={{
              color: "var(--accent-color)",
            }}
          />
        </button>
      </div>
    </header>
  );
};