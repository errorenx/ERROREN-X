import {
  User,
  UserPreferences,
  Conversation,
  Message,
  Attachment,
  ModelCatalogItem,
  AdminStats,
} from "../types";

const TOKEN_KEY = "erroren_x_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async demoLogin(role: "user" | "admin" = "user"): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>("/api/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>("/api/auth/me");
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    return request<User>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return request<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: { email: string; newPassword: string }): Promise<{ message: string }> {
    return request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async exportData(): Promise<any> {
    return request<any>("/api/auth/export");
  },

  async deleteAllUserChats(): Promise<{ message: string; count: number }> {
    return request<{ message: string; count: number }>("/api/auth/delete-all-chats", {
      method: "POST",
    });
  },

  // Preferences
  async getPreferences(): Promise<UserPreferences> {
    return request<UserPreferences>("/api/user/preferences");
  },

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    return request<UserPreferences>("/api/user/preferences", {
      method: "PATCH",
      body: JSON.stringify(prefs),
    });
  },

  // Models
  async getModels(): Promise<ModelCatalogItem[]> {
    return request<ModelCatalogItem[]>("/api/chat/models");
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return request<Conversation[]>("/api/conversations");
  },

  async getConversation(id: string): Promise<Conversation> {
    return request<Conversation>(`/api/conversations/${id}`);
  },

  async createConversation(data?: { title?: string; model?: string; webSearchEnabled?: boolean }): Promise<Conversation> {
    return request<Conversation>("/api/conversations", {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  },

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    return request<Conversation>(`/api/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteConversation(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/conversations/${id}`, {
      method: "DELETE",
    });
  },

  async clearConversation(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/conversations/${id}/clear`, {
      method: "POST",
    });
  },

  async searchHistory(query: string): Promise<{ conversations: Conversation[]; matchingMessages: Message[] }> {
    return request<{ conversations: Conversation[]; matchingMessages: Message[] }>(`/api/conversations/search?q=${encodeURIComponent(query)}`);
  },

  async shareConversation(id: string): Promise<{ shareId: string; shareUrl: string; title: string }> {
    return request<{ shareId: string; shareUrl: string; title: string }>(`/api/conversations/${id}/share`, {
      method: "POST",
    });
  },

  async getSharedConversation(shareId: string): Promise<{ title: string; messages: Message[]; createdAt: string; views: number }> {
    return request<{ title: string; messages: Message[]; createdAt: string; views: number }>(`/api/conversations/shared/${shareId}`);
  },

  // Feedback
  async submitFeedback(data: { messageId: string; feedback: "like" | "dislike"; comment?: string }): Promise<{ message: string }> {
    return request<{ message: string }>("/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Dedicated Real Image Generation API
  async generateImage(data: {
    prompt: string;
    size?: string;
    aspectRatio?: string;
    style?: string;
    inputImage?: string | { data: string; mimeType: string };
    mode?: "generate" | "edit";
  }): Promise<{
    success: boolean;
    imageUrl: string;
    prompt: string;
    provider?: string;
    model?: string;
    aspectRatio?: string;
    mode?: string;
    fallbackUsed?: boolean;
  }> {
    return request<{
      success: boolean;
      imageUrl: string;
      prompt: string;
      provider?: string;
      model?: string;
      aspectRatio?: string;
      mode?: string;
      fallbackUsed?: boolean;
    }>("/api/images/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getImageStatus(): Promise<{ configured: boolean; missingKey?: string; provider: string }> {
    return request<{ configured: boolean; missingKey?: string; provider: string }>("/api/images/status");
  },

  // Image Studio & Photo Editor
  async generateImageStudio(data: {
    prompt: string;
    aspectRatio?: string;
    style?: string;
    inputImage?: string | { data: string; mimeType: string };
    mode?: "generate" | "edit";
  }): Promise<{
    imageUrl: string;
    prompt: string;
    revisedPrompt?: string;
    mode?: string;
    fallbackUsed?: boolean;
    model?: string;
    provider?: string;
    id?: string;
    style?: string;
  }> {
    return request<{
      imageUrl: string;
      prompt: string;
      revisedPrompt?: string;
      mode?: string;
      fallbackUsed?: boolean;
      model?: string;
      provider?: string;
      id?: string;
      style?: string;
    }>("/api/images/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getImageHistory(limit = 50): Promise<{
    success: boolean;
    history: Array<{
      id: string;
      userId: string;
      prompt: string;
      enhancedPrompt?: string;
      style: string;
      aspectRatio: string;
      provider: string;
      model: string;
      imageUrl: string;
      generationType: "text_to_image" | "image_edit";
      referenceImage?: string;
      editInstructions?: string;
      createdAt: string;
      status: "completed" | "failed";
    }>;
  }> {
    return request(`/api/images/history?limit=${limit}`);
  },

  async deleteImageHistory(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/images/history/${id}`, {
      method: "DELETE",
    });
  },

  async clearImageHistory(): Promise<{ success: boolean; message: string; count: number }> {
    return request(`/api/images/history`, {
      method: "DELETE",
    });
  },

  // File Upload
  async uploadFile(file: File): Promise<Attachment> {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "File upload failed" }));
      throw new Error(err.error || "File upload failed");
    }

    return res.json();
  },

  // Admin Panel
  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>("/api/admin/stats");
  },

  async getAdminUsers(): Promise<any[]> {
    return request<any[]>("/api/admin/users");
  },

  async toggleUserStatus(userId: string, isBanned: boolean): Promise<any> {
    return request<any>(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isBanned }),
    });
  },

  async deleteUserAsAdmin(userId: string): Promise<any> {
    return request<any>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  // SSE Chat Stream Reader
  async streamChat({
    conversationId,
    content,
    attachments,
    model,
    webSearch,
    signal,
    onStart,
    onChunk,
    onSources,
    onTitleUpdated,
    onDone,
    onError,
  }: {
    conversationId?: string;
    content: string;
    attachments?: Attachment[];
    model?: string;
    webSearch?: boolean;
    signal?: AbortSignal;
    onStart?: (data: { conversationId: string; userMessage: Message }) => void;
    onChunk: (chunk: string) => void;
    onSources?: (sources: any[]) => void;
    onTitleUpdated?: (newTitle: string) => void;
    onDone: (message: Message) => void;
    onError: (error: string) => void;
  }) {
    const token = getStoredToken();
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversationId,
          content,
          attachments,
          model,
          webSearch,
        }),
        signal,
      });

      if (!response.ok) {
        let errText = `Generation failed (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson.error) errText = errJson.error;
        } catch {}
        onError(errText);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError("Stream reader unavailable");
        return;
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.substring(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "start" && onStart) {
              onStart(parsed);
            } else if (parsed.type === "chunk") {
              onChunk(parsed.chunk);
            } else if (parsed.type === "sources" && onSources) {
              onSources(parsed.sources);
            } else if (parsed.type === "title_updated" && onTitleUpdated) {
              onTitleUpdated(parsed.title);
            } else if (parsed.type === "done") {
              onDone(parsed.message);
            } else if (parsed.type === "error") {
              onError(parsed.error);
            }
          } catch (e) {
            console.warn("Failed to parse SSE payload:", jsonStr);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // User explicitly cancelled stream
      }
      onError(err.message || "Network connection interrupted");
    }
  },

  // SSE Regenerate Reader
  async streamRegenerate({
    conversationId,
    model,
    webSearch,
    signal,
    onChunk,
    onSources,
    onDone,
    onError,
  }: {
    conversationId: string;
    model?: string;
    webSearch?: boolean;
    signal?: AbortSignal;
    onChunk: (chunk: string) => void;
    onSources?: (sources: any[]) => void;
    onDone: (message: Message) => void;
    onError: (error: string) => void;
  }) {
    const token = getStoredToken();
    try {
      const response = await fetch("/api/chat/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversationId,
          model,
          webSearch,
        }),
        signal,
      });

      if (!response.ok) {
        let errText = `Regeneration failed (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson.error) errText = errJson.error;
        } catch {}
        onError(errText);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError("Stream reader unavailable");
        return;
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.substring(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "chunk") {
              onChunk(parsed.chunk);
            } else if (parsed.type === "sources" && onSources) {
              onSources(parsed.sources);
            } else if (parsed.type === "done") {
              onDone(parsed.message);
            } else if (parsed.type === "error") {
              onError(parsed.error);
            }
          } catch (e) {
            console.warn("Failed to parse SSE payload:", jsonStr);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      onError(err.message || "Failed to regenerate response");
    }
  },
};
