export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user";
  plan: "Free" | "Pro" | "Business";
  createdAt?: string;
}

export interface UserPreferences {
  userId?: string;
  theme: "dark" | "light" | "system";
  defaultModel: string;
  responseStyle: "balanced" | "concise" | "detailed" | "creative" | "code_architect";
  customInstructions: string;
  speechVoice: string;
  speechRate: number;
  autoPlayAudio: boolean;
  webSearchDefault: boolean;
  saveHistory: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl?: string;
  parsedText?: string;
  uploadedAt?: string;
}

export interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  webSources?: WebSource[];
  model?: string;
  feedback?: "like" | "dislike" | null;
  feedbackComment?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  systemPrompt?: string;
  webSearchEnabled: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface ModelCatalogItem {
  id: string;
  name: string;
  category: "Fast" | "Balanced" | "Advanced";
  description: string;
  badge?: string;
  contextWindow: string;
  features: string[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalFeedback: number;
  feedbackSatisfactionRate: number;
  totalUsageEvents: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    plan: string;
    isBanned: boolean;
    createdAt: string;
    conversationCount: number;
  }>;
  recentUsage: Array<{
    id: string;
    userId: string;
    model: string;
    type: string;
    promptTokensEstimate: number;
    responseTokensEstimate: number;
    timestamp: string;
  }>;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
