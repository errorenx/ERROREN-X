import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const uuidv4 = () => randomUUID();

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  role: "admin" | "user";
  plan: "Free" | "Pro" | "Business";
  isBanned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
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
  dataUrl?: string; // base64 data for images or preview
  parsedText?: string; // extracted text for documents
  uploadedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  webSources?: Array<{ title: string; url: string; snippet?: string }>;
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
}

export interface SharedConversation {
  id: string;
  shareId: string;
  conversationId: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  views: number;
}

export interface UsageRecord {
  id: string;
  userId: string;
  model: string;
  promptTokensEstimate: number;
  responseTokensEstimate: number;
  type: "chat" | "image_generation" | "document_analysis";
  timestamp: string;
}

export interface ImageGenerationRecord {
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
  metadata?: Record<string, any>;
}

interface DatabaseSchema {
  users: User[];
  preferences: Record<string, UserPreferences>;
  conversations: Conversation[];
  messages: Message[];
  sharedConversations: SharedConversation[];
  usageRecords: UsageRecord[];
  images: ImageGenerationRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "erroren_x_db.json");

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// In-memory cache + persistent JSON write
let db: DatabaseSchema = {
  users: [],
  preferences: {},
  conversations: [],
  messages: [],
  sharedConversations: [],
  usageRecords: [],
  images: [],
};

function ensureDbLoaded() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(raw);
      if (!Array.isArray(db.images)) {
        db.images = [];
      }
    } else {
      initSeedData();
      saveDb();
    }
  } catch (err) {
    console.error("Database initialization error, creating fresh DB:", err);
    initSeedData();
    saveDb();
  }
}

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error persisting database to disk:", err);
  }
}

function initSeedData() {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync("Admin@ErrorenX2026!", adminSalt);

  const demoSalt = bcrypt.genSaltSync(10);
  const demoPass = bcrypt.hashSync("Demo@ErrorenX2026!", demoSalt);

  const adminId = "usr_admin_erroren_x";
  const demoUserId = "usr_demo_erroren_x";

  db.users = [
    {
      id: adminId,
      email: "admin@errorenx.ai",
      passwordHash: adminPass,
      name: "Commander X (Admin)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "admin",
      plan: "Business",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: demoUserId,
      email: "demo@errorenx.ai",
      passwordHash: demoPass,
      name: "Alex Vance",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      role: "user",
      plan: "Pro",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  db.preferences[adminId] = {
    userId: adminId,
    theme: "dark",
    defaultModel: "gemini-3.7-flash",
    responseStyle: "code_architect",
    customInstructions: "Provide concise, mathematically rigorous, and production-ready code.",
    speechVoice: "Zephyr",
    speechRate: 1,
    autoPlayAudio: false,
    webSearchDefault: true,
    saveHistory: true,
  };

  db.preferences[demoUserId] = {
    userId: demoUserId,
    theme: "dark",
    defaultModel: "gemini-3.7-flash",
    responseStyle: "balanced",
    customInstructions: "You are ERROREN X, a sharp, ultra-capable AI assistant with deep domain knowledge.",
    speechVoice: "Kore",
    speechRate: 1,
    autoPlayAudio: false,
    webSearchDefault: false,
    saveHistory: true,
  };

  const sampleConvId = "conv_welcome_demo";
  db.conversations = [
    {
      id: sampleConvId,
      userId: demoUserId,
      title: "Welcome to ERROREN X Intelligence",
      model: "gemini-3.7-flash",
      webSearchEnabled: false,
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  db.messages = [
    {
      id: "msg_1",
      conversationId: sampleConvId,
      role: "user",
      content: "Hello ERROREN X! What can you do?",
      createdAt: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
    },
    {
      id: "msg_2",
      conversationId: sampleConvId,
      role: "assistant",
      content: `Welcome to **ERROREN X** — *Intelligence Beyond Limits*.

I am your next-generation AI assistant built for deep reasoning, creative mastery, high-performance coding, and comprehensive multimodal analysis.

Here is what you can do right now:
- ⚡ **Real-time Reasoning & Conversations**: High-speed, context-aware answers powered by Google's Gemini models.
- 💻 **Full-Stack Code Assistant**: Debug, refactor, write, and download code in JavaScript, Python, Rust, SQL, TypeScript, C++, and more with syntax highlighting.
- 📄 **Document & File Analysis**: Upload and summarize PDFs, CSVs, Excel files, JSON, Word documents, and text files.
- 🖼️ **Multimodal Vision & Image Understanding**: Analyze screenshots, diagrams, UI layouts, OCR text, and visual problems.
- 🎙️ **Voice Interaction & Speech Synthesis**: Talk directly to ERROREN X via speech recognition and listen to AI answers.
- 🌐 **Live Web Search Grounding**: Toggle web search to query up-to-the-minute information with full source citations.
- 🎨 **Image Studio**: Generate high-definition visual assets directly from text prompts.

How can I help you conquer your goals today?`,
      model: "gemini-3.7-flash",
      feedback: "like",
      createdAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    },
  ];

  db.usageRecords = [
    {
      id: "usg_1",
      userId: demoUserId,
      model: "gemini-3.7-flash",
      promptTokensEstimate: 45,
      responseTokensEstimate: 210,
      type: "chat",
      timestamp: new Date().toISOString(),
    },
  ];
}

ensureDbLoaded();

// User management
export function getUserByEmail(email: string): User | undefined {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}

export function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): User {
  const newUser: User = {
    ...userData,
    id: `usr_${generateId()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  // default preferences
  db.preferences[newUser.id] = {
    userId: newUser.id,
    theme: "dark",
    defaultModel: "gemini-3.7-flash",
    responseStyle: "balanced",
    customInstructions: "",
    speechVoice: "Kore",
    speechRate: 1,
    autoPlayAudio: false,
    webSearchDefault: false,
    saveHistory: true,
  };

  saveDb();
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const user = db.users.find((u) => u.id === id);
  if (!user) return undefined;

  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  saveDb();
  return user;
}

export function getAllUsers(): User[] {
  return db.users;
}

export function deleteUser(id: string): boolean {
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  db.users.splice(index, 1);
  delete db.preferences[id];

  // delete user conversations and messages
  const userConvIds = db.conversations.filter((c) => c.userId === id).map((c) => c.id);
  db.conversations = db.conversations.filter((c) => c.userId !== id);
  db.messages = db.messages.filter((m) => !userConvIds.includes(m.conversationId));
  db.sharedConversations = db.sharedConversations.filter((s) => s.userId !== id);
  db.usageRecords = db.usageRecords.filter((u) => u.userId !== id);

  saveDb();
  return true;
}

// User Preferences
export function getUserPreferences(userId: string): UserPreferences {
  if (!db.preferences[userId]) {
    db.preferences[userId] = {
      userId,
      theme: "dark",
      defaultModel: "gemini-3.7-flash",
      responseStyle: "balanced",
      customInstructions: "",
      speechVoice: "Kore",
      speechRate: 1,
      autoPlayAudio: false,
      webSearchDefault: false,
      saveHistory: true,
    };
    saveDb();
  }
  return db.preferences[userId];
}

export function updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences(userId);
  db.preferences[userId] = { ...current, ...prefs };
  saveDb();
  return db.preferences[userId];
}

// Conversations
export function getUserConversations(userId: string): Conversation[] {
  return db.conversations
    .filter((c) => c.userId === userId && !c.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConversationById(id: string): Conversation | undefined {
  return db.conversations.find((c) => c.id === id);
}

export function createConversation(userId: string, data: { title?: string; model?: string; webSearchEnabled?: boolean }): Conversation {
  const newConv: Conversation = {
    id: `conv_${generateId()}`,
    userId,
    title: data.title || "New Chat",
    model: data.model || "gemini-3.7-flash",
    webSearchEnabled: !!data.webSearchEnabled,
    isPinned: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.conversations.unshift(newConv);
  saveDb();
  return newConv;
}

export function updateConversation(id: string, userId: string, updates: Partial<Conversation>): Conversation | undefined {
  const conv = db.conversations.find((c) => c.id === id && c.userId === userId);
  if (!conv) return undefined;

  Object.assign(conv, updates, { updatedAt: new Date().toISOString() });
  saveDb();
  return conv;
}

export function deleteConversation(id: string, userId: string): boolean {
  const index = db.conversations.findIndex((c) => c.id === id && c.userId === userId);
  if (index === -1) return false;

  db.conversations.splice(index, 1);
  db.messages = db.messages.filter((m) => m.conversationId !== id);
  db.sharedConversations = db.sharedConversations.filter((s) => s.conversationId !== id);
  saveDb();
  return true;
}

export function deleteAllUserConversations(userId: string): number {
  const userConvIds = db.conversations.filter((c) => c.userId === userId).map((c) => c.id);
  db.conversations = db.conversations.filter((c) => c.userId !== userId);
  db.messages = db.messages.filter((m) => !userConvIds.includes(m.conversationId));
  saveDb();
  return userConvIds.length;
}

// Messages
export function getConversationMessages(conversationId: string): Message[] {
  return db.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function createMessage(messageData: Omit<Message, "id" | "createdAt">): Message {
  const newMsg: Message = {
    ...messageData,
    id: `msg_${generateId()}`,
    createdAt: new Date().toISOString(),
  };
  db.messages.push(newMsg);

  // update conversation updatedAt
  const conv = db.conversations.find((c) => c.id === messageData.conversationId);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }

  saveDb();
  return newMsg;
}

export function updateMessageFeedback(messageId: string, feedback: "like" | "dislike" | null, comment?: string): boolean {
  const msg = db.messages.find((m) => m.id === messageId);
  if (!msg) return false;

  msg.feedback = feedback;
  if (comment !== undefined) msg.feedbackComment = comment;
  saveDb();
  return true;
}

export function clearConversationMessages(conversationId: string): boolean {
  db.messages = db.messages.filter((m) => m.conversationId !== conversationId);
  saveDb();
  return true;
}

// Search
export function searchUserHistory(userId: string, query: string): { conversations: Conversation[]; matchingMessages: Message[] } {
  const q = query.toLowerCase().trim();
  if (!q) return { conversations: [], matchingMessages: [] };

  const userConvMap = new Map(db.conversations.filter((c) => c.userId === userId).map((c) => [c.id, c]));

  const matchingConvs = Array.from(userConvMap.values()).filter((c) => c.title.toLowerCase().includes(q));

  const matchingMessages = db.messages
    .filter((m) => userConvMap.has(m.conversationId) && m.content.toLowerCase().includes(q))
    .slice(0, 20);

  // Add conversations of matching messages to matchingConvs if not already present
  for (const m of matchingMessages) {
    const conv = userConvMap.get(m.conversationId);
    if (conv && !matchingConvs.some((c) => c.id === conv.id)) {
      matchingConvs.push(conv);
    }
  }

  return { conversations: matchingConvs, matchingMessages };
}

// Shared Conversations
export function createSharedConversation(conversationId: string, userId: string): SharedConversation | undefined {
  const conv = db.conversations.find((c) => c.id === conversationId && c.userId === userId);
  if (!conv) return undefined;

  const messages = getConversationMessages(conversationId);
  const shareId = `share_${generateId()}`;

  const existingIndex = db.sharedConversations.findIndex((s) => s.conversationId === conversationId);
  const sharedItem: SharedConversation = {
    id: `sh_${generateId()}`,
    shareId,
    conversationId,
    userId,
    title: conv.title,
    messages,
    createdAt: new Date().toISOString(),
    views: 0,
  };

  if (existingIndex >= 0) {
    db.sharedConversations[existingIndex] = sharedItem;
  } else {
    db.sharedConversations.push(sharedItem);
  }

  saveDb();
  return sharedItem;
}

export function getSharedConversation(shareId: string): SharedConversation | undefined {
  const shared = db.sharedConversations.find((s) => s.shareId === shareId);
  if (shared) {
    shared.views = (shared.views || 0) + 1;
    saveDb();
  }
  return shared;
}

// Usage tracking & Admin Analytics
export function recordUsage(record: Omit<UsageRecord, "id" | "timestamp">) {
  db.usageRecords.push({
    ...record,
    id: `usg_${generateId()}`,
    timestamp: new Date().toISOString(),
  });
  saveDb();
}

export function getAdminStats() {
  const totalUsers = db.users.length;
  const activeUsers = db.users.filter((u) => !u.isBanned).length;
  const totalConversations = db.conversations.length;
  const totalMessages = db.messages.length;
  const totalFeedback = db.messages.filter((m) => m.feedback).length;
  const positiveFeedback = db.messages.filter((m) => m.feedback === "like").length;
  const totalUsageEvents = db.usageRecords.length;

  const recentUsers = db.users
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      isBanned: !!u.isBanned,
      createdAt: u.createdAt,
      conversationCount: db.conversations.filter((c) => c.userId === u.id).length,
    }))
    .slice(-15)
    .reverse();

  return {
    totalUsers,
    activeUsers,
    totalConversations,
    totalMessages,
    totalFeedback,
    feedbackSatisfactionRate: totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 100,
    totalUsageEvents,
    recentUsers,
    recentUsage: db.usageRecords.slice(-20).reverse(),
  };
}

export function exportUserData(userId: string) {
  const user = getUserById(userId);
  const preferences = getUserPreferences(userId);
  const conversations = getUserConversations(userId);
  const messagesByConv: Record<string, Message[]> = {};

  for (const conv of conversations) {
    messagesByConv[conv.id] = getConversationMessages(conv.id);
  }

  return {
    exportDate: new Date().toISOString(),
    user: user ? { id: user.id, name: user.name, email: user.email, plan: user.plan, createdAt: user.createdAt } : null,
    preferences,
    conversations: conversations.map((c) => ({
      ...c,
      messages: messagesByConv[c.id] || [],
    })),
  };
}

// --------------------------------------------------------
// IMAGE GENERATION HISTORY DATABASE OPERATIONS
// --------------------------------------------------------

export function saveImageRecord(
  record: Omit<ImageGenerationRecord, "id" | "createdAt">
): ImageGenerationRecord {
  ensureDbLoaded();
  const newRecord: ImageGenerationRecord = {
    ...record,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  db.images = db.images || [];
  db.images.unshift(newRecord);

  // Keep last 300 images per database to prevent unbounded growth
  if (db.images.length > 300) {
    db.images = db.images.slice(0, 300);
  }

  saveDb();
  return newRecord;
}

export function getUserImageRecords(userId: string, limit = 50): ImageGenerationRecord[] {
  ensureDbLoaded();
  db.images = db.images || [];
  return db.images
    .filter((img) => img.userId === userId)
    .slice(0, limit);
}

export function getImageRecordById(id: string): ImageGenerationRecord | undefined {
  ensureDbLoaded();
  db.images = db.images || [];
  return db.images.find((img) => img.id === id);
}

export function deleteImageRecord(id: string, userId: string): boolean {
  ensureDbLoaded();
  db.images = db.images || [];
  const initialLength = db.images.length;
  db.images = db.images.filter((img) => !(img.id === id && img.userId === userId));

  if (db.images.length !== initialLength) {
    saveDb();
    return true;
  }
  return false;
}

export function clearUserImageRecords(userId: string): number {
  ensureDbLoaded();
  db.images = db.images || [];
  const beforeCount = db.images.filter((img) => img.userId === userId).length;
  db.images = db.images.filter((img) => img.userId !== userId);
  saveDb();
  return beforeCount;
}

