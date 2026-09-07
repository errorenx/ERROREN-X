import { Router, Response } from "express";
import {
  getUserConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getConversationMessages,
  clearConversationMessages,
  searchUserHistory,
  createSharedConversation,
  getSharedConversation,
} from "../db.js";
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from "../auth.js";

const router = Router();

// List user conversations
router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const convs = getUserConversations(req.user!.id);
  return res.json(convs);
});

// Create new conversation
router.post("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, model, webSearchEnabled } = req.body;
  const newConv = createConversation(req.user!.id, {
    title: title || "New Chat",
    model: model || "gemini-3.7-flash",
    webSearchEnabled: !!webSearchEnabled,
  });
  return res.status(201).json(newConv);
});

// Search history
router.get("/search", authMiddleware, (req: AuthRequest, res: Response) => {
  const q = String(req.query.q || "");
  const results = searchUserHistory(req.user!.id, q);
  return res.json(results);
});

// Get single conversation with its messages
router.get("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const conv = getConversationById(req.params.id);
  if (!conv || conv.userId !== req.user!.id) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const messages = getConversationMessages(conv.id);
  return res.json({
    ...conv,
    messages,
  });
});

// Update conversation (rename, pin, etc.)
router.patch("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, isPinned, isArchived, model, webSearchEnabled } = req.body;
  const updates: any = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);
  if (isArchived !== undefined) updates.isArchived = Boolean(isArchived);
  if (model !== undefined) updates.model = String(model);
  if (webSearchEnabled !== undefined) updates.webSearchEnabled = Boolean(webSearchEnabled);

  const updated = updateConversation(req.params.id, req.user!.id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Conversation not found or unauthorized" });
  }

  return res.json(updated);
});

// Delete conversation
router.delete("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const success = deleteConversation(req.params.id, req.user!.id);
  if (!success) {
    return res.status(404).json({ error: "Conversation not found or unauthorized" });
  }
  return res.json({ message: "Conversation deleted successfully" });
});

// Clear conversation messages
router.post("/:id/clear", authMiddleware, (req: AuthRequest, res: Response) => {
  const conv = getConversationById(req.params.id);
  if (!conv || conv.userId !== req.user!.id) {
    return res.status(404).json({ error: "Conversation not found or unauthorized" });
  }

  clearConversationMessages(conv.id);
  return res.json({ message: "Conversation cleared successfully" });
});

// Generate share link
router.post("/:id/share", authMiddleware, (req: AuthRequest, res: Response) => {
  const shared = createSharedConversation(req.params.id, req.user!.id);
  if (!shared) {
    return res.status(404).json({ error: "Conversation not found or unauthorized" });
  }

  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const shareUrl = `${protocol}://${host}/share/${shared.shareId}`;

  return res.json({
    shareId: shared.shareId,
    shareUrl,
    title: shared.title,
    createdAt: shared.createdAt,
  });
});

// Public shared chat view
router.get("/shared/:shareId", optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const shared = getSharedConversation(req.params.shareId);
  if (!shared) {
    return res.status(404).json({ error: "Shared conversation not found or expired" });
  }

  return res.json({
    title: shared.title,
    messages: shared.messages,
    createdAt: shared.createdAt,
    views: shared.views,
  });
});

export default router;
