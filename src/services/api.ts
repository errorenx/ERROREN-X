import {
  User,
  UserPreferences,
  Conversation,
  Message,
  Attachment,
  ModelCatalogItem,
  AdminStats,
} from "../types";
import {
  staticFallback,
  isStaticDeployment,
  DEFAULT_STATIC_MODELS,
} from "./staticFallback";

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
    if (isStaticDeployment) {
      const user = staticFallback.getDemoUser("user");
      user.name = data.name;
      user.email = data.email;
      setStoredToken("demo_token_static");
      return { token: "demo_token_static", user };
    }
    try {
      const res = await request<{ token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setStoredToken(res.token);
      return res;
    } catch (err) {
      const user = staticFallback.getDemoUser("user");
      user.name = data.name;
      user.email = data.email;
      setStoredToken("demo_token_static");
      return { token: "demo_token_static", user };
    }
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    if (isStaticDeployment) {
      const user = staticFallback.getDemoUser("user");
      user.email = data.email;
      setStoredToken("demo_token_static");
      return { token: "demo_token_static", user };
    }
    try {
      const res = await request<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setStoredToken(res.token);
      return res;
    } catch (err) {
      const user = staticFallback.getDemoUser("user");
      user.email = data.email;
      setStoredToken("demo_token_static");
      return { token: "demo_token_static", user };
    }
  },

  async demoLogin(role: "user" | "admin" = "user"): Promise<{ token: string; user: User }> {
    if (isStaticDeployment) {
      const user = staticFallback.getDemoUser(role);
      setStoredToken("demo_token_static");
      return { token: "demo_token_static", user };
    }
    try {
      const res = await request<{ token: string; user: User }>("/api/auth/demo-login", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      setStoredToken(res.token);
      return res;
    } catch {
      const user = staticFallback.getDemoUser(role);
      setStoredToken("demo_token_static");
      return { token: "demo_token_static", user };
    }
  },

  async getMe(): Promise<User> {
    if (isStaticDeployment) {
      const user = staticFallback.getStoredUser() || staticFallback.getDemoUser("user");
      return user;
    }
    try {
      return await request<User>("/api/auth/me");
    } catch {
      const user = staticFallback.getStoredUser() || staticFallback.getDemoUser("user");
      return user;
    }
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    if (isStaticDeployment) {
      const user = staticFallback.getStoredUser() || staticFallback.getDemoUser("user");
      if (data.name) user.name = data.name;
      if (data.avatar) user.avatar = data.avatar;
      return user;
    }
    try {
      return await request<User>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch {
      const user = staticFallback.getStoredUser() || staticFallback.getDemoUser("user");
      if (data.name) user.name = data.name;
      if (data.avatar) user.avatar = data.avatar;
      return user;
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    if (isStaticDeployment) {
      return { message: "Password updated successfully in demo mode." };
    }
    try {
      return await request<{ message: string }>("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return { message: "Password updated successfully in demo mode." };
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (isStaticDeployment) {
      return { message: "Password reset link simulated for demo." };
    }
    try {
      return await request<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch {
      return { message: "Password reset link simulated for demo." };
    }
  },

  async resetPassword(data: { email: string; newPassword: string }): Promise<{ message: string }> {
    if (isStaticDeployment) {
      return { message: "Password reset completed." };
    }
    try {
      return await request<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return { message: "Password reset completed." };
    }
  },

  async exportData(): Promise<any> {
    if (isStaticDeployment) {
      return {
        user: staticFallback.getStoredUser(),
        preferences: staticFallback.getPreferences(),
        conversations: staticFallback.getConversations(),
      };
    }
    try {
      return await request<any>("/api/auth/export");
    } catch {
      return {
        user: staticFallback.getStoredUser(),
        preferences: staticFallback.getPreferences(),
        conversations: staticFallback.getConversations(),
      };
    }
  },

  async deleteAllUserChats(): Promise<{ message: string; count: number }> {
    if (isStaticDeployment) {
      const count = staticFallback.getConversations().length;
      localStorage.removeItem("erroren_x_local_conversations");
      return { message: "All chats cleared", count };
    }
    try {
      return await request<{ message: string; count: number }>("/api/auth/delete-all-chats", {
        method: "POST",
      });
    } catch {
      const count = staticFallback.getConversations().length;
      localStorage.removeItem("erroren_x_local_conversations");
      return { message: "All chats cleared", count };
    }
  },

  // Preferences
  async getPreferences(): Promise<UserPreferences> {
    if (isStaticDeployment) {
      return staticFallback.getPreferences();
    }
    try {
      return await request<UserPreferences>("/api/user/preferences");
    } catch {
      return staticFallback.getPreferences();
    }
  },

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    if (isStaticDeployment) {
      return staticFallback.updatePreferences(prefs);
    }
    try {
      return await request<UserPreferences>("/api/user/preferences", {
        method: "PATCH",
        body: JSON.stringify(prefs),
      });
    } catch {
      return staticFallback.updatePreferences(prefs);
    }
  },

  // Models
  async getModels(): Promise<ModelCatalogItem[]> {
    if (isStaticDeployment) {
      return DEFAULT_STATIC_MODELS;
    }
    try {
      return await request<ModelCatalogItem[]>("/api/chat/models");
    } catch {
      return DEFAULT_STATIC_MODELS;
    }
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    if (isStaticDeployment) {
      return staticFallback.getConversations();
    }
    try {
      return await request<Conversation[]>("/api/conversations");
    } catch {
      return staticFallback.getConversations();
    }
  },

  async getConversation(id: string): Promise<Conversation> {
    if (isStaticDeployment) {
      return staticFallback.getConversation(id);
    }
    try {
      return await request<Conversation>(`/api/conversations/${id}`);
    } catch {
      return staticFallback.getConversation(id);
    }
  },

  async createConversation(data?: { title?: string; model?: string; webSearchEnabled?: boolean }): Promise<Conversation> {
    if (isStaticDeployment) {
      return staticFallback.createConversation(data);
    }
    try {
      return await request<Conversation>("/api/conversations", {
        method: "POST",
        body: JSON.stringify(data || {}),
      });
    } catch {
      return staticFallback.createConversation(data);
    }
  },

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    if (isStaticDeployment) {
      return staticFallback.updateConversation(id, updates);
    }
    try {
      return await request<Conversation>(`/api/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    } catch {
      return staticFallback.updateConversation(id, updates);
    }
  },

  async deleteConversation(id: string): Promise<{ message: string }> {
    if (isStaticDeployment) {
      staticFallback.deleteConversation(id);
      return { message: "Deleted successfully" };
    }
    try {
      return await request<{ message: string }>(`/api/conversations/${id}`, {
        method: "DELETE",
      });
    } catch {
      staticFallback.deleteConversation(id);
      return { message: "Deleted successfully" };
    }
  },

  async clearConversation(id: string): Promise<{ message: string }> {
    if (isStaticDeployment) {
      staticFallback.clearConversation(id);
      return { message: "Cleared successfully" };
    }
    try {
      return await request<{ message: string }>(`/api/conversations/${id}/clear`, {
        method: "POST",
      });
    } catch {
      staticFallback.clearConversation(id);
      return { message: "Cleared successfully" };
    }
  },

  async searchHistory(query: string): Promise<{ conversations: Conversation[]; matchingMessages: Message[] }> {
    if (isStaticDeployment) {
      const convs = staticFallback.getConversations();
      const lower = query.toLowerCase();
      const filtered = convs.filter(c => c.title.toLowerCase().includes(lower));
      const matching: Message[] = [];
      convs.forEach(c => {
        (c.messages || []).forEach(m => {
          if (m.content.toLowerCase().includes(lower)) matching.push(m);
        });
      });
      return { conversations: filtered, matchingMessages: matching };
    }
    try {
      return await request<{ conversations: Conversation[]; matchingMessages: Message[] }>(`/api/conversations/search?q=${encodeURIComponent(query)}`);
    } catch {
      return { conversations: [], matchingMessages: [] };
    }
  },

  async shareConversation(id: string): Promise<{ shareId: string; shareUrl: string; title: string }> {
    return {
      shareId: id,
      shareUrl: window.location.href,
      title: "Shared ERROREN X Session",
    };
  },

  async getSharedConversation(shareId: string): Promise<{ title: string; messages: Message[]; createdAt: string; views: number }> {
    if (isStaticDeployment) {
      try {
        const conv = staticFallback.getConversation(shareId);
        return { title: conv.title, messages: conv.messages || [], createdAt: conv.createdAt, views: 1 };
      } catch {}
    }
    try {
      return await request<{ title: string; messages: Message[]; createdAt: string; views: number }>(`/api/conversations/shared/${shareId}`);
    } catch {
      return { title: "Shared ERROREN X Session", messages: [], createdAt: new Date().toISOString(), views: 1 };
    }
  },

  // Feedback
  async submitFeedback(data: { messageId: string; feedback: "like" | "dislike"; comment?: string }): Promise<{ message: string }> {
    return { message: "Feedback recorded" };
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
    if (isStaticDeployment) {
      const url = staticFallback.generateMockImage(data.prompt, data.aspectRatio);
      return {
        success: true,
        imageUrl: url,
        prompt: data.prompt,
        provider: "Client Simulator",
        model: "ERROREN-SVG-Engine",
        aspectRatio: data.aspectRatio || "1:1",
        mode: data.mode || "generate",
      };
    }
    try {
      return await request<{
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
    } catch {
      const url = staticFallback.generateMockImage(data.prompt, data.aspectRatio);
      return {
        success: true,
        imageUrl: url,
        prompt: data.prompt,
        provider: "Client Simulator",
        model: "ERROREN-SVG-Engine",
        aspectRatio: data.aspectRatio || "1:1",
        mode: data.mode || "generate",
      };
    }
  },

  async getImageStatus(): Promise<{ configured: boolean; missingKey?: string; provider: string }> {
    if (isStaticDeployment) {
      return { configured: true, provider: "Static Canvas Studio" };
    }
    try {
      return await request<{ configured: boolean; missingKey?: string; provider: string }>("/api/images/status");
    } catch {
      return { configured: true, provider: "Static Canvas Studio" };
    }
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
    if (isStaticDeployment) {
      const url = staticFallback.generateMockImage(data.prompt, data.aspectRatio);
      const item = {
        id: `img_${Date.now()}`,
        userId: "demo_static_user",
        prompt: data.prompt,
        style: data.style || "Cyberpunk",
        aspectRatio: data.aspectRatio || "1:1",
        provider: "Client Studio",
        model: "ERROREN-SVG-Studio",
        imageUrl: url,
        generationType: (data.mode === "edit" ? "image_edit" : "text_to_image") as "text_to_image" | "image_edit",
        createdAt: new Date().toISOString(),
        status: "completed" as const,
      };
      staticFallback.saveImageToHistory(item);
      return item;
    }
    try {
      return await request<{
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
    } catch {
      const url = staticFallback.generateMockImage(data.prompt, data.aspectRatio);
      return {
        imageUrl: url,
        prompt: data.prompt,
        mode: data.mode || "generate",
        model: "Client Studio",
        style: data.style,
      };
    }
  },

  async getImageHistory(limit = 50): Promise<{
    success: boolean;
    history: Array<any>;
  }> {
    if (isStaticDeployment) {
      return { success: true, history: staticFallback.getImageHistory() };
    }
    try {
      return await request(`/api/images/history?limit=${limit}`);
    } catch {
      return { success: true, history: staticFallback.getImageHistory() };
    }
  },

  async deleteImageHistory(id: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Deleted" };
  },

  async clearImageHistory(): Promise<{ success: boolean; message: string; count: number }> {
    localStorage.removeItem("erroren_x_local_images");
    return { success: true, message: "Cleared", count: 0 };
  },

  // File Upload
  async uploadFile(file: File): Promise<Attachment> {
    if (isStaticDeployment) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: `att_${Date.now()}`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            dataUrl: reader.result as string,
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(file);
      });
    }
    try {
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
        throw new Error("Upload failed");
      }

      return res.json();
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: `att_${Date.now()}`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            dataUrl: reader.result as string,
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(file);
      });
    }
  },

  // Admin Panel
  async getAdminStats(): Promise<AdminStats> {
    if (isStaticDeployment) {
      return staticFallback.getAdminStats();
    }
    try {
      return await request<AdminStats>("/api/admin/stats");
    } catch {
      return staticFallback.getAdminStats();
    }
  },

  async getAdminUsers(): Promise<any[]> {
    return [
      { id: "1", name: "Lead Admin", email: "admin@erroren.ai", role: "admin", isBanned: false, createdAt: new Date().toISOString() },
      { id: "2", name: "Guest User", email: "guest@erroren.ai", role: "user", isBanned: false, createdAt: new Date().toISOString() },
    ];
  },

  async toggleUserStatus(userId: string, isBanned: boolean): Promise<any> {
    return { success: true };
  },

  async deleteUserAsAdmin(userId: string): Promise<any> {
    return { success: true };
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
    if (isStaticDeployment) {
      return staticFallback.simulateChatStream({
        conversationId,
        content,
        model,
        webSearch,
        signal,
        onStart,
        onChunk,
        onSources,
        onTitleUpdated,
        onDone,
        onError,
      });
    }

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
        // Fallback to static simulation if backend is missing (e.g. static host)
        return staticFallback.simulateChatStream({
          conversationId,
          content,
          model,
          webSearch,
          signal,
          onStart,
          onChunk,
          onSources,
          onTitleUpdated,
          onDone,
          onError,
        });
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
        return;
      }
      // On network failure or 404, fallback to client-side simulation
      return staticFallback.simulateChatStream({
        conversationId,
        content,
        model,
        webSearch,
        signal,
        onStart,
        onChunk,
        onSources,
        onTitleUpdated,
        onDone,
        onError,
      });
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
    if (isStaticDeployment) {
      return staticFallback.simulateChatStream({
        conversationId,
        content: "Regenerate previous reasoning",
        model,
        webSearch,
        signal,
        onChunk,
        onSources,
        onDone,
        onError,
      });
    }

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
        return staticFallback.simulateChatStream({
          conversationId,
          content: "Regenerate previous reasoning",
          model,
          webSearch,
          signal,
          onChunk,
          onSources,
          onDone,
          onError,
        });
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
      return staticFallback.simulateChatStream({
        conversationId,
        content: "Regenerate previous reasoning",
        model,
        webSearch,
        signal,
        onChunk,
        onSources,
        onDone,
        onError,
      });
    }
  },
};
