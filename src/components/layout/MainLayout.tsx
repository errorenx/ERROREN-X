import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { Sidebar } from "./Sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatArea } from "../chat/ChatArea";
import { ChatInput } from "../chat/ChatInput";
import { SharedChatView } from "../chat/SharedChatView";
import { LandingPage } from "../auth/LandingPage";
import { AuthModal } from "../auth/AuthModal";
import { SettingsModal } from "../modals/SettingsModal";
import { ImageStudioModal } from "../modals/ImageStudioModal";
import { HelpModal } from "../modals/HelpModal";
import { AboutModal } from "../modals/AboutModal";
import { ShareChatModal } from "../modals/ShareChatModal";
import { AdminDashboardModal } from "../modals/AdminDashboardModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import { Conversation } from "../../types";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader2 } from "lucide-react";

export const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    currentConversation,
    createNewChat,
    sendMessage,
    deleteConversation,
    clearCurrentConversation,
    loadConversations,
  } = useChat();

  const { addToast } = useToast();

  // URL state for public shared chats (e.g. ?share=share_123 or /shared/share_123)
  const [shareParamId, setShareParamId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("share");
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [conversationToShare, setConversationToShare] = useState<Conversation | null>(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    type: "single" | "clear" | "all";
    conversation?: Conversation;
  }>({
    isOpen: false,
    type: "single",
  });

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && (e.key === "n" || e.key === "N" || e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (isAuthenticated) {
          createNewChat();
        }
      } else if (isCtrlOrCmd && e.key === ",") {
        e.preventDefault();
        if (isAuthenticated) {
          setIsSettingsOpen(true);
        }
      } else if (e.key === "Escape") {
        setIsSettingsOpen(false);
        setIsImageStudioOpen(false);
        setIsHelpOpen(false);
        setIsAboutOpen(false);
        setIsShareModalOpen(false);
        setIsAdminOpen(false);
        setIsAuthModalOpen(false);
        setDeleteTarget({ isOpen: false, type: "single" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, createNewChat]);

  // Handle prompt selected from EmptyChat suggestion cards
  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  // Trigger share modal for active or selected conversation
  const handleOpenShare = (conv?: Conversation) => {
    const target = conv || currentConversation;
    if (!target) return;
    setConversationToShare(target);
    setIsShareModalOpen(true);
  };

  // Trigger delete request
  const handleDeleteRequest = (conv: Conversation) => {
    setDeleteTarget({
      isOpen: true,
      type: "single",
      conversation: conv,
    });
  };

  const handleClearRequest = () => {
    if (!currentConversation) return;
    setDeleteTarget({
      isOpen: true,
      type: "clear",
      conversation: currentConversation,
    });
  };

  const handleDeleteAllChatsRequest = () => {
    setDeleteTarget({
      isOpen: true,
      type: "all",
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "single" && deleteTarget.conversation) {
      await deleteConversation(deleteTarget.conversation.id);
    } else if (deleteTarget.type === "clear") {
      await clearCurrentConversation();
    } else if (deleteTarget.type === "all") {
      try {
        const res = await api.deleteAllUserChats();
        await loadConversations();
        createNewChat();
        addToast(res.message, "info");
      } catch (err: any) {
        addToast(err.message || "Failed to delete all conversations", "error");
      }
    }
  };

  // If public shared link is opened
  if (shareParamId) {
    return (
      <SharedChatView
        shareId={shareParamId}
        onExit={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setShareParamId(null);
        }}
        onStartChat={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setShareParamId(null);
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          }
        }}
      />
    );
  }

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-3" />
        <span className="text-xs font-mono tracking-wider text-violet-300">INITIALIZING ERROREN X...</span>
      </div>
    );
  }

  // Unauthenticated landing page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode = "login") => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </>
    );
  }

  // Authenticated Application Workspace Layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImageStudio={() => setIsImageStudioOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenShare={(conv) => handleOpenShare(conv)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Main Chat Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Top Header */}
        <ChatHeader
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
          onOpenShare={() => handleOpenShare()}
          onClearChat={handleClearRequest}
        />

        {/* Chat Messages Body */}
        <ChatArea onSelectPrompt={handleSelectPrompt} />

        {/* Bottom Input Box */}
        <ChatInput onOpenImageStudio={() => setIsImageStudioOpen(true)} />
      </div>

      {/* Modals & Dialogs */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDeleteAllChats={handleDeleteAllChatsRequest}
      />

      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ShareChatModal
        conversation={conversationToShare || currentConversation}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setConversationToShare(null);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget.isOpen}
        title={
          deleteTarget.type === "all"
            ? "Purge All Conversations"
            : deleteTarget.type === "clear"
            ? "Clear Message History"
            : "Delete Conversation"
        }
        message={
          deleteTarget.type === "all"
            ? "Are you sure you want to permanently delete all your conversation history and associated attachments? This cannot be reversed."
            : deleteTarget.type === "clear"
            ? "Are you sure you want to erase all messages from this conversation?"
            : `Are you sure you want to delete "${deleteTarget.conversation?.title || "this conversation"}"?`
        }
        confirmLabel={deleteTarget.type === "all" ? "Purge Everything" : "Delete"}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, type: "single" })}
      />
    </div>
  );
};
