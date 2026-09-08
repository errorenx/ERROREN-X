import {
  User,
  UserPreferences,
  Conversation,
  Message,
  Attachment,
  ModelCatalogItem,
  AdminStats,
} from "../types";

export const isStaticDeployment =
  typeof window !== "undefined" &&
  (window.location.hostname.endsWith("github.io") ||
    window.location.protocol === "file:" ||
    window.location.hostname.includes("pages.dev") ||
    window.location.hostname.endsWith("vercel.app") ||
    window.location.hostname.endsWith("netlify.app") ||
    window.location.hostname.endsWith("web.app") ||
    window.location.hostname.endsWith("firebaseapp.com") ||
    window.location.hostname.endsWith("gitlab.io") ||
    window.location.hostname.endsWith("surge.sh"));

export const DEFAULT_STATIC_MODELS: ModelCatalogItem[] = [
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    category: "Fast",
    badge: "Fast & Multimodal",
    contextWindow: "1M Tokens",
    description: "Ultra-high speed reasoning model optimized for code synthesis, multimodal inspection, and low-latency interaction.",
    features: ["Streaming", "Multimodal", "Low Latency"],
  },
  {
    id: "gemini-3.7-pro",
    name: "Gemini 3.7 Pro",
    category: "Advanced",
    badge: "Deep Reasoning",
    contextWindow: "2M Tokens",
    description: "Flagship intelligence for complex multi-step reasoning, mathematical proof, and deep system architecture.",
    features: ["Deep Reasoning", "Code Synthesis", "2M Tokens"],
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    category: "Balanced",
    badge: "Low Latency",
    contextWindow: "1M Tokens",
    description: "Compact high-efficiency model for rapid conversational tasks and summary generation.",
    features: ["Vision", "Balanced", "Quick Summaries"],
  },
];

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },
  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {}
  }
};

const LOCAL_STORAGE_CONVERSATIONS = "erroren_x_local_conversations";
const LOCAL_STORAGE_USER = "erroren_x_local_user";
const LOCAL_STORAGE_PREFS = "erroren_x_local_prefs";
const LOCAL_STORAGE_IMAGE_HISTORY = "erroren_x_local_images";

export const staticFallback = {
  getDemoUser(role: "admin" | "user" = "user"): User {
    const saved = safeStorage.getItem(LOCAL_STORAGE_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const user: User = {
      id: "demo_static_user",
      name: role === "admin" ? "Admin Explorer" : "Demo Explorer",
      email: role === "admin" ? "admin@erroren.ai" : "demo@erroren.ai",
      role: role,
      plan: role === "admin" ? "Business" : "Pro",
      avatar: "",
      createdAt: new Date().toISOString(),
    };
    safeStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
    return user;
  },

  getStoredUser(): User | null {
    const saved = safeStorage.getItem(LOCAL_STORAGE_USER);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  getPreferences(): UserPreferences {
    const defaultPrefs: UserPreferences = {
      userId: "demo_static_user",
      theme: "dark",
      defaultModel: "gemini-3.7-flash",
      responseStyle: "balanced",
      customInstructions: "",
      speechVoice: "Aoede",
      speechRate: 1,
      autoPlayAudio: false,
      webSearchDefault: false,
      saveHistory: true,
    };
    const saved = safeStorage.getItem(LOCAL_STORAGE_PREFS);
    if (!saved) return defaultPrefs;
    try {
      return { ...defaultPrefs, ...JSON.parse(saved) };
    } catch {
      return defaultPrefs;
    }
  },

  updatePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    safeStorage.setItem(LOCAL_STORAGE_PREFS, JSON.stringify(updated));
    return updated;
  },

  getConversations(): Conversation[] {
    const saved = safeStorage.getItem(LOCAL_STORAGE_CONVERSATIONS);
    if (!saved) {
      const welcomeConv: Conversation = {
        id: "conv_welcome",
        userId: "demo_static_user",
        title: "Welcome to ERROREN X",
        model: "gemini-3.7-flash",
        webSearchEnabled: false,
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: "msg_welcome_1",
            conversationId: "conv_welcome",
            role: "assistant",
            content:
              "Welcome to **ERROREN X** on GitHub Pages!\n\nThis client-side deployment is fully active with theme customizations, code syntax highlighting, conversation management, and multimodal interaction. Explore the features or click anywhere to begin.",
            createdAt: new Date().toISOString(),
            model: "gemini-3.7-flash",
          },
        ],
      };
      safeStorage.setItem(LOCAL_STORAGE_CONVERSATIONS, JSON.stringify([welcomeConv]));
      return [welcomeConv];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },

  getConversation(id: string): Conversation {
    const list = this.getConversations();
    const found = list.find((c) => c.id === id);
    if (found) return found;
    throw new Error("Conversation not found");
  },

  createConversation(data?: { title?: string; model?: string; webSearchEnabled?: boolean }): Conversation {
    const list = this.getConversations();
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      userId: "demo_static_user",
      title: data?.title || "New Session",
      model: data?.model || "gemini-3.7-flash",
      webSearchEnabled: data?.webSearchEnabled ?? false,
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    list.unshift(newConv);
    safeStorage.setItem(LOCAL_STORAGE_CONVERSATIONS, JSON.stringify(list));
    return newConv;
  },

  updateConversation(id: string, updates: Partial<Conversation>): Conversation {
    const list = this.getConversations();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Conversation not found");
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    safeStorage.setItem(LOCAL_STORAGE_CONVERSATIONS, JSON.stringify(list));
    return updated;
  },

  deleteConversation(id: string): void {
    const list = this.getConversations().filter((c) => c.id !== id);
    safeStorage.setItem(LOCAL_STORAGE_CONVERSATIONS, JSON.stringify(list));
  },

  clearConversation(id: string): void {
    const list = this.getConversations();
    const conv = list.find((c) => c.id === id);
    if (conv) {
      conv.messages = [];
      conv.updatedAt = new Date().toISOString();
      safeStorage.setItem(LOCAL_STORAGE_CONVERSATIONS, JSON.stringify(list));
    }
  },

  saveMessage(conversationId: string, message: Message): void {
    const list = this.getConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (conv) {
      if (!conv.messages) conv.messages = [];
      conv.messages.push(message);
      conv.updatedAt = new Date().toISOString();
      safeStorage.setItem(LOCAL_STORAGE_CONVERSATIONS, JSON.stringify(list));
    }
  },

  async simulateChatStream({
    conversationId,
    content,
    model = "gemini-3.7-flash",
    webSearch,
    signal,
    onStart,
    onChunk,
    onSources,
    onDone,
  }: {
    conversationId?: string;
    content: string;
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
    let targetConvId = conversationId;
    if (!targetConvId) {
      const newConv = this.createConversation({
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        model,
        webSearchEnabled: webSearch,
      });
      targetConvId = newConv.id;
    }

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      conversationId: targetConvId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    this.saveMessage(targetConvId, userMsg);

    if (onStart) {
      onStart({ conversationId: targetConvId, userMessage: userMsg });
    }

    if (webSearch && onSources) {
      onSources([
        {
          title: "GitHub Pages Static Architecture",
          url: "https://pages.github.com",
          snippet: "GitHub Pages is designed for hosting static web applications with seamless client-side SPA routing.",
        },
      ]);
    }

    const replyText = `I have processed your inquiry regarding **"${content.slice(0, 40)}"**.\n\n### System Overview\n- **Host**: GitHub Pages (Client-Side)\n- **Selected Model**: \`${model}\`\n- **Web Grounding**: ${webSearch ? "Active" : "Off"}\n\nHere is a code snippet demonstrating modern TypeScript reactive state:\n\n\`\`\`typescript\ninterface IntelligenceNode {\n  id: string;\n  status: 'active' | 'processing';\n  timestamp: number;\n}\n\nexport const inspectSystem = (): IntelligenceNode => ({\n  id: 'node_alpha',\n  status: 'active',\n  timestamp: Date.now()\n});\n\`\`\`\n\nAll themes, settings, and modal controls are responsive and fully interactive.`;

    const chunks = replyText.split(" ");
    let full = "";

    for (let i = 0; i < chunks.length; i++) {
      if (signal?.aborted) return;
      const piece = (i > 0 ? " " : "") + chunks[i];
      full += piece;
      onChunk(piece);
      await new Promise((resolve) => setTimeout(resolve, 24));
    }

    const assistantMsg: Message = {
      id: `msg_assistant_${Date.now()}`,
      conversationId: targetConvId,
      role: "assistant",
      content: full,
      createdAt: new Date().toISOString(),
      model,
    };
    this.saveMessage(targetConvId, assistantMsg);
    onDone(assistantMsg);
  },

  generateMockImage(prompt: string, aspectRatio = "1:1"): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#grad)" />
      <circle cx="400" cy="360" r="160" fill="#8b5cf6" opacity="0.25" filter="blur(20px)" />
      <circle cx="400" cy="360" r="110" fill="none" stroke="#a78bfa" stroke-width="3" stroke-dasharray="8 8" />
      <text x="400" y="370" fill="#ffffff" font-size="22" font-family="system-ui, sans-serif" font-weight="700" text-anchor="middle">ERROREN X STUDIO</text>
      <text x="400" y="410" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" text-anchor="middle">${prompt.slice(0, 45)}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  },

  getImageHistory(): Array<any> {
    const saved = safeStorage.getItem(LOCAL_STORAGE_IMAGE_HISTORY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },

  saveImageToHistory(item: any): void {
    const list = this.getImageHistory();
    list.unshift(item);
    safeStorage.setItem(LOCAL_STORAGE_IMAGE_HISTORY, JSON.stringify(list.slice(0, 50)));
  },

  getAdminStats(): AdminStats {
    return {
      totalUsers: 142,
      activeUsers: 28,
      totalConversations: 890,
      totalMessages: 4320,
      totalFeedback: 94,
      feedbackSatisfactionRate: 98,
      totalUsageEvents: 5400,
      recentUsers: [
        {
          id: "1",
          name: "Admin Explorer",
          email: "admin@erroren.ai",
          role: "admin",
          plan: "Business",
          isBanned: false,
          createdAt: new Date().toISOString(),
          conversationCount: 12,
        },
      ],
      recentUsage: [
        {
          id: "u1",
          userId: "demo_static_user",
          model: "gemini-3.7-flash",
          type: "chat",
          promptTokensEstimate: 320,
          responseTokensEstimate: 680,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },
};
