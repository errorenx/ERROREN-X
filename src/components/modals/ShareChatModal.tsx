import React, { useState } from "react";
import { Conversation } from "../../types";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { X, Share2, Copy, Check, ExternalLink, Globe } from "lucide-react";

interface ShareChatModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareChatModal: React.FC<ShareChatModalProps> = ({
  conversation,
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const handleCreateShareLink = async () => {
    setIsSharing(true);
    try {
      const res = await api.shareConversation(conversation.id);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      setShareUrl(fullUrl);
      addToast("Public link generated!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to generate share link", "error");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast("Share link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy link", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-violet-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Share Conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Conversation Title</div>
            <div className="text-sm font-semibold text-white bg-slate-900/80 p-3 rounded-xl border border-violet-500/15 truncate">
              {conversation.title}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Anyone with this link will be able to read this conversation thread in a public read-only view. Messages you send after sharing will not be automatically synced unless re-shared.
          </p>

          {shareUrl ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-violet-300">Public Shareable URL</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/30 text-white text-xs font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-violet-600 hover:bg-violet-500 text-white"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <span>Open preview in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCreateShareLink}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>{isSharing ? "Generating..." : "Create Public Share Link"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
