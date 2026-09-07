import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Conversation, Message, Attachment, ModelCatalogItem } from "../types";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  messages: Message[];
  isGenerating: boolean;
  streamingContent: string;
  streamingSources: any[];
  selectedModel: string;
  availableModels: ModelCatalogItem[];
  webSearchEnabled: boolean;
  activeAttachments: Attachment[];
  searchQuery: string;
  searchResults: { conversations: Conversation[]; matchingMessages: Message[] } | null;
  isSidebarOpen: boolean;
  generationError: string | null;
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createNewChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastMessage: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  clearCurrentConversation: () => Promise<void>;
  setFeedback: (messageId: string, feedback: "like" | "dislike", comment?: string) => Promise<void>;
  addAttachment: (att: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  setSelectedModel: (model: string) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setSearchQuery: (query: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, preferences } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingSources, setStreamingSources] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.7-flash");
  const [availableModels, setAvailableModels] = useState<ModelCatalogItem[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [activeAttachments, setActiveAttachments] = useState<Attachment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{ conversations: Conversation[]; matchingMessages: Message[] } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load models once
  useEffect(() => {
    api.getModels().then(setAvailableModels).catch(console.warn);
  }, []);

  // Update default preferences
  useEffect(() => {
    if (preferences) {
      if (preferences.defaultModel) setSelectedModel(preferences.defaultModel);
      if (preferences.webSearchDefault !== undefined) setWebSearchEnabled(preferences.webSearchDefault);
    }
  }, [preferences]);

  // Load conversations when authenticated
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
      return;
    }
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !currentConversationId) {
        // Select first conversation by default if none selected
        await selectConversation(convs[0].id);
      }
    } catch (err) {
      console.warn("Failed to load conversations:", err);
    }
  }, [isAuthenticated, currentConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Select conversation
  const selectConversation = async (id: string) => {
    if (isGenerating) {
      stopGeneration();
    }
    try {
      setCurrentConversationId(id);
      setStreamingContent("");
      setStreamingSources([]);
      setGenerationError(null);
      const conv = await api.getConversation(id);
      setMessages(conv.messages || []);
      if (conv.model) setSelectedModel(conv.model);
      setWebSearchEnabled(conv.webSearchEnabled);
      // Close sidebar on mobile
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to load conversation", "error");
    }
  };

  // Create new chat
  const createNewChat = () => {
    if (isGenerating) {
      stopGeneration();
    }
    setCurrentConversationId(null);
    setMessages([]);
    setStreamingContent("");
    setStreamingSources([]);
    setGenerationError(null);
    setActiveAttachments([]);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Live Search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchHistory(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults(null);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Send message
  const sendMessage = async (text: string) => {
    if ((!text.trim() && activeAttachments.length === 0) || isGenerating) return;

    setGenerationError(null);
    setIsGenerating(true);
    setStreamingContent("");
    setStreamingSources([]);

    const attachmentsToSend = [...activeAttachments];
    setActiveAttachments([]); // Clear input attachments

    abortControllerRef.current = new AbortController();

    let targetConvId = currentConversationId;

    await api.streamChat({
      conversationId: targetConvId || undefined,
      content: text,
      attachments: attachmentsToSend,
      model: selectedModel,
      webSearch: webSearchEnabled,
      signal: abortControllerRef.current.signal,
      onStart: (data) => {
        targetConvId = data.conversationId;
        setCurrentConversationId(data.conversationId);
        // Add user message to UI
        setMessages((prev) => [...prev, data.userMessage]);
      },
      onChunk: (chunk) => {
        setStreamingContent((prev) => prev + chunk);
      },
      onSources: (sources) => {
        setStreamingSources(sources);
      },
      onTitleUpdated: (newTitle) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === targetConvId ? { ...c, title: newTitle } : c))
        );
      },
      onDone: (assistantMessage) => {
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
        setStreamingSources([]);
        setIsGenerating(false);
        // Refresh conversation list to get updated titles and timestamps
        api.getConversations().then(setConversations).catch(() => {});
      },
      onError: (err) => {
        setGenerationError(err);
        setIsGenerating(false);
        addToast(err, "error");
      },
    });
  };

  // Stop Generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingContent) {
      // Keep whatever text was accumulated as a partial message
      const partialMsg: Message = {
        id: `msg_partial_${Date.now()}`,
        conversationId: currentConversationId || "temp",
        role: "assistant",
        content: streamingContent + " *(Generation stopped)*",
        webSources: streamingSources.length > 0 ? streamingSources : undefined,
        model: selectedModel,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, partialMsg]);
    }
    setIsGenerating(false);
    setStreamingContent("");
    setStreamingSources([]);
  };

  // Regenerate last message
  const regenerateLastMessage = async () => {
    if (!currentConversationId || isGenerating || messages.length === 0) return;

    // Pop the last assistant message if one is shown
    const newMessages = [...messages];
    if (newMessages[newMessages.length - 1].role === "assistant") {
      newMessages.pop();
      setMessages(newMessages);
    }

    setGenerationError(null);
    setIsGenerating(true);
    setStreamingContent("");
    setStreamingSources([]);

    abortControllerRef.current = new AbortController();

    await api.streamRegenerate({
      conversationId: currentConversationId,
      model: selectedModel,
      webSearch: webSearchEnabled,
      signal: abortControllerRef.current.signal,
      onChunk: (chunk) => {
        setStreamingContent((prev) => prev + chunk);
      },
      onSources: (sources) => {
        setStreamingSources(sources);
      },
      onDone: (assistantMessage) => {
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
        setStreamingSources([]);
        setIsGenerating(false);
      },
      onError: (err) => {
        setGenerationError(err);
        setIsGenerating(false);
        addToast(err, "error");
      },
    });
  };

  // Delete Conversation
  const deleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        createNewChat();
      }
      addToast("Conversation deleted", "info");
    } catch (err: any) {
      addToast(err.message || "Failed to delete conversation", "error");
    }
  };

  // Rename Conversation
  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const updated = await api.updateConversation(id, { title: newTitle.trim() });
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c)));
      addToast("Conversation renamed", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to rename conversation", "error");
    }
  };

  // Clear current conversation
  const clearCurrentConversation = async () => {
    if (!currentConversationId) return;
    try {
      await api.clearConversation(currentConversationId);
      setMessages([]);
      addToast("Conversation cleared", "info");
    } catch (err: any) {
      addToast(err.message || "Failed to clear conversation", "error");
    }
  };

  // Submit Feedback
  const setFeedback = async (messageId: string, feedback: "like" | "dislike", comment?: string) => {
    try {
      await api.submitFeedback({ messageId, feedback, comment });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback, feedbackComment: comment } : m))
      );
      addToast(feedback === "like" ? "Thank you for the positive feedback!" : "Feedback recorded. We will improve.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to submit feedback", "error");
    }
  };

  // Attachments
  const addAttachment = (att: Attachment) => {
    setActiveAttachments((prev) => [...prev, att]);
  };

  const removeAttachment = (id: string) => {
    setActiveAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAttachments = () => {
    setActiveAttachments([]);
  };

  const currentConversation = conversations.find((c) => c.id === currentConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        currentConversation,
        messages,
        isGenerating,
        streamingContent,
        streamingSources,
        selectedModel,
        availableModels,
        webSearchEnabled,
        activeAttachments,
        searchQuery,
        searchResults,
        isSidebarOpen,
        generationError,
        loadConversations,
        selectConversation,
        createNewChat,
        sendMessage,
        stopGeneration,
        regenerateLastMessage,
        deleteConversation,
        renameConversation,
        clearCurrentConversation,
        setFeedback,
        addAttachment,
        removeAttachment,
        clearAttachments,
        setSelectedModel,
        setWebSearchEnabled,
        setSearchQuery,
        setIsSidebarOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
