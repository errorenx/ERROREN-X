import { Router, Response } from "express";
import {
  getConversationById,
  createConversation,
  updateConversation,
  getConversationMessages,
  createMessage,
  updateMessageFeedback,
  getUserPreferences,
  recordUsage,
} from "../db.js";
import {
  AVAILABLE_MODELS,
  streamGeminiChat,
  generateChatTitle,
  generateImageStudio,
  formatGeminiErrorMessage,
} from "../gemini.js";
import { authMiddleware, AuthRequest } from "../auth.js";

const router = Router();

// List models
router.get("/models", (req, res) => {
  return res.json(AVAILABLE_MODELS);
});

// Stream Chat Response via SSE
router.post("/stream", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { conversationId, content, attachments = [], model, webSearch } = req.body;
  const userId = req.user!.id;

  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: "Message content or attachments required" });
  }

  // Ensure conversation exists or create one
  let activeConvId = conversationId;
  let isFirstMessage = false;

  if (!activeConvId) {
    const newConv = createConversation(userId, {
      title: "New Conversation",
      model: model || "gemini-3.7-flash",
      webSearchEnabled: !!webSearch,
    });
    activeConvId = newConv.id;
    isFirstMessage = true;
  } else {
    const existing = getConversationById(activeConvId);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const priorMsgs = getConversationMessages(activeConvId);
    if (priorMsgs.length === 0) {
      isFirstMessage = true;
    }
  }

  // Save user message to database
  const userMsg = createMessage({
    conversationId: activeConvId,
    role: "user",
    content: content || "",
    attachments,
  });

  // Fetch full conversation message history
  const allMessages = getConversationMessages(activeConvId);

  // User preferences for personality/system prompt
  const prefs = getUserPreferences(userId);

  // Set SSE Headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Notify client of conversation details and user message id
  res.write(`data: ${JSON.stringify({ type: "start", conversationId: activeConvId, userMessage: userMsg })}\n\n`);

  let accumulatedResponse = "";
  let detectedSources: Array<{ title: string; url: string; snippet?: string }> = [];

  try {
    const formattedHistory = allMessages.map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    const responseText = await streamGeminiChat({
      messages: formattedHistory,
      model: model || prefs.defaultModel || "gemini-3.7-flash",
      webSearch: webSearch !== undefined ? webSearch : prefs.webSearchDefault,
      responseStyle: prefs.responseStyle,
      customInstructions: prefs.customInstructions,
      onChunk: (chunk: string) => {
        accumulatedResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: "chunk", chunk })}\n\n`);
      },
      onSources: (sources) => {
        detectedSources = sources;
        res.write(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`);
      },
    });

    // Save assistant message to database
    const assistantMsg = createMessage({
      conversationId: activeConvId,
      role: "assistant",
      content: responseText || accumulatedResponse || "I am here to help.",
      webSources: detectedSources.length > 0 ? detectedSources : undefined,
      model: model || "gemini-3.7-flash",
    });

    // Record usage
    recordUsage({
      userId,
      model: model || "gemini-3.7-flash",
      promptTokensEstimate: Math.max(10, Math.ceil((content || "").length / 4)),
      responseTokensEstimate: Math.max(10, Math.ceil((responseText || "").length / 4)),
      type: "chat",
    });

    // Auto-generate title if this is the first message
    if (isFirstMessage && content) {
      generateChatTitle(content)
        .then((newTitle) => {
          updateConversation(activeConvId, userId, { title: newTitle });
          res.write(`data: ${JSON.stringify({ type: "title_updated", title: newTitle })}\n\n`);
        })
        .catch(() => {});
    }

    // Send complete event with the saved assistant message
    res.write(`data: ${JSON.stringify({ type: "done", message: assistantMsg })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Chat generation failed:", err);
    const cleanError = formatGeminiErrorMessage(err);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: cleanError,
      })}\n\n`
    );
    res.end();
  }
});

// Regenerate response
router.post("/regenerate", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { conversationId, model, webSearch } = req.body;
  const userId = req.user!.id;

  const conv = getConversationById(conversationId);
  if (!conv || conv.userId !== userId) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const messages = getConversationMessages(conversationId);
  if (messages.length === 0) {
    return res.status(400).json({ error: "No messages to regenerate" });
  }

  // Remove the last assistant message if one exists, or keep history up to last user message
  let history = [...messages];
  if (history[history.length - 1].role === "assistant") {
    history.pop();
  }

  const prefs = getUserPreferences(userId);

  // Set SSE Headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.write(`data: ${JSON.stringify({ type: "start", conversationId })}\n\n`);

  let accumulatedResponse = "";
  let detectedSources: Array<{ title: string; url: string; snippet?: string }> = [];

  try {
    const formattedHistory = history.map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    const responseText = await streamGeminiChat({
      messages: formattedHistory,
      model: model || conv.model || "gemini-3.7-flash",
      webSearch: webSearch !== undefined ? webSearch : conv.webSearchEnabled,
      responseStyle: prefs.responseStyle,
      customInstructions: prefs.customInstructions,
      onChunk: (chunk: string) => {
        accumulatedResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: "chunk", chunk })}\n\n`);
      },
      onSources: (sources) => {
        detectedSources = sources;
        res.write(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`);
      },
    });

    const assistantMsg = createMessage({
      conversationId,
      role: "assistant",
      content: responseText || accumulatedResponse || "I am ready.",
      webSources: detectedSources.length > 0 ? detectedSources : undefined,
      model: model || conv.model || "gemini-3.7-flash",
    });

    recordUsage({
      userId,
      model: model || conv.model || "gemini-3.7-flash",
      promptTokensEstimate: 20,
      responseTokensEstimate: Math.max(10, Math.ceil((responseText || "").length / 4)),
      type: "chat",
    });

    res.write(`data: ${JSON.stringify({ type: "done", message: assistantMsg })}\n\n`);
    res.end();
  } catch (err: any) {
    const cleanError = formatGeminiErrorMessage(err);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: cleanError,
      })}\n\n`
    );
    res.end();
  }
});

// Feedback endpoint
router.post("/feedback", authMiddleware, (req: AuthRequest, res: Response) => {
  const { messageId, feedback, comment } = req.body;
  if (!messageId || !feedback || !["like", "dislike"].includes(feedback)) {
    return res.status(400).json({ error: "Invalid feedback payload" });
  }

  const success = updateMessageFeedback(messageId, feedback, comment);
  if (!success) {
    return res.status(404).json({ error: "Message not found" });
  }

  return res.json({ message: "Feedback saved successfully" });
});

// Image Generation Studio & Photo Editor
router.post("/image-studio/generate", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { prompt, aspectRatio = "1:1", style = "Photorealistic", inputImage, mode = "generate" } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const result = await generateImageStudio({
      prompt: prompt.trim(),
      aspectRatio,
      style,
      inputImage,
      mode,
    });

    recordUsage({
      userId: req.user!.id,
      model: mode === "edit" ? "gemini-3.1-flash-image" : "gemini-3.1-flash-lite-image",
      promptTokensEstimate: 50,
      responseTokensEstimate: 120,
      type: "image_generation",
    });

    return res.json(result);
  } catch (err: any) {
    console.error("Image generation studio error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate or edit image" });
  }
});

export default router;
