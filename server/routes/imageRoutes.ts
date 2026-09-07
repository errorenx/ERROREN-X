import { Router, Response } from "express";
import { optionalAuthMiddleware, AuthRequest } from "../auth.js";
import {
  recordUsage,
  saveImageRecord,
  getUserImageRecords,
  deleteImageRecord,
  clearUserImageRecords,
} from "../db.js";
import {
  generateWithOpenAIDallE3,
  generateImageWithProvider,
  isImageGenerationConfigured,
  mapToDallESize,
  normalizeAspectRatio,
  ARTISTIC_STYLES,
} from "../services/imageService.js";

const router = Router();

// GET /api/images/status - check configured image generation capabilities & available styles
router.get("/status", (req, res) => {
  const status = isImageGenerationConfigured();
  const hasOpenAi = Boolean(
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 8
  );
  return res.json({
    ...status,
    hasOpenAi,
    dalleAvailable: hasOpenAi,
    defaultModel: hasOpenAi ? "dall-e-3" : "FLUX.1 Neural Diffusion",
    styles: Object.keys(ARTISTIC_STYLES),
  });
});

// GET /api/images/history - retrieve generation history for the current user
router.get("/history", optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || "anonymous-user";
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const history = getUserImageRecords(userId, isNaN(limit) ? 50 : limit);

    return res.json({
      success: true,
      history,
    });
  } catch (err: any) {
    console.error("Error retrieving image history:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve image generation history.",
    });
  }
});

// DELETE /api/images/history/:id - delete a single image from user history
router.delete("/history/:id", optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || "anonymous-user";
    const { id } = req.params;

    const deleted = deleteImageRecord(id, userId);
    return res.json({
      success: deleted,
      message: deleted ? "Image deleted from history." : "Image not found or not owned by user.",
    });
  } catch (err: any) {
    console.error("Error deleting image from history:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete image record.",
    });
  }
});

// DELETE /api/images/history - clear all image history for current user
router.delete("/history", optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || "anonymous-user";
    const count = clearUserImageRecords(userId);

    return res.json({
      success: true,
      message: `Cleared ${count} image record(s) from history.`,
      count,
    });
  } catch (err: any) {
    console.error("Error clearing image history:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to clear image history.",
    });
  }
});

/**
 * POST /api/images/generate
 * Master image generation and photo editing handler.
 * Applies user prompt, artistic rendering style, aspect ratio, and optional reference image.
 * Saves result directly to the persistent database.
 */
router.post("/generate", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      prompt,
      size = "1024x1024",
      aspectRatio,
      quality = "standard",
      style = "Photorealistic",
      provider,
      inputImage,
      mode = "generate",
    } = req.body;

    const userId = req.user?.id || (req.body.userId as string) || "anonymous-user";

    // 1. Input validation & sanitization
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "A valid prompt is required for image generation.",
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length > 4000) {
      return res.status(400).json({
        success: false,
        error: "Prompt exceeds maximum allowed length of 4000 characters.",
      });
    }

    // 2. Aspect ratio mapping
    const normalizedAspect = normalizeAspectRatio(aspectRatio || size);
    const targetDallESize = mapToDallESize(aspectRatio || size);

    const hasOpenAiKey = Boolean(
      process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY !== "dummy-key" &&
        process.env.OPENAI_API_KEY.trim().length > 15
    );

    const isExplicitOpenAi =
      provider === "openai" ||
      provider === "dalle" ||
      provider === "dall-e-3" ||
      process.env.IMAGE_PROVIDER === "openai";

    let result: {
      imageUrl: string;
      prompt: string;
      revisedPrompt?: string;
      model: string;
      provider: string;
      aspectRatio: string;
      mode?: "generate" | "edit";
      fallbackUsed?: boolean;
    };

    // 3. Primary Branch: If OpenAI DALL-E 3 is explicitly requested and key exists
    if (hasOpenAiKey && isExplicitOpenAi && mode !== "edit") {
      try {
        const dalleResult = await generateWithOpenAIDallE3({
          prompt: trimmedPrompt,
          size: targetDallESize,
          quality: quality === "hd" ? "hd" : "standard",
          style: style === "natural" ? "natural" : "vivid",
        });

        result = {
          ...dalleResult,
          mode: "generate",
          fallbackUsed: false,
        };
      } catch (openAiError: any) {
        console.warn("Explicit OpenAI failed, falling back to multi-provider cascade:", openAiError?.message);
        result = await generateImageWithProvider({
          prompt: trimmedPrompt,
          size: targetDallESize,
          aspectRatio: normalizedAspect,
          style,
          inputImage,
          mode,
        });
      }
    } else {
      // 4. Default Multi-Provider Cascade (FLUX.1 / Gemini / DALL-E / Vector Core)
      result = await generateImageWithProvider({
        prompt: trimmedPrompt,
        size: targetDallESize,
        aspectRatio: normalizedAspect,
        style,
        inputImage,
        mode,
      });
    }

    // 5. Save generated image to database
    const savedRecord = saveImageRecord({
      userId,
      prompt: trimmedPrompt,
      enhancedPrompt: result.revisedPrompt,
      style: style || "Photorealistic",
      aspectRatio: result.aspectRatio || normalizedAspect,
      provider: result.provider,
      model: result.model,
      imageUrl: result.imageUrl,
      generationType: mode === "edit" ? "image_edit" : "text_to_image",
      referenceImage:
        mode === "edit" && typeof inputImage === "string"
          ? inputImage.slice(0, 500)
          : undefined,
      editInstructions: mode === "edit" ? trimmedPrompt : undefined,
      status: "completed",
    });

    // 6. Secure usage logging
    if (userId && userId !== "anonymous-user") {
      recordUsage({
        userId,
        model: result.model || "flux-ai",
        promptTokensEstimate: 60,
        responseTokensEstimate: 200,
        type: "image_generation",
      });
    }

    // 7. Standard JSON response with saved record
    return res.json({
      success: true,
      id: savedRecord.id,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      revisedPrompt: result.revisedPrompt,
      provider: result.provider,
      model: result.model,
      aspectRatio: result.aspectRatio,
      style: savedRecord.style,
      size: targetDallESize,
      mode: result.mode || mode,
      fallbackUsed: Boolean(result.fallbackUsed),
      record: savedRecord,
    });
  } catch (err: any) {
    console.error("Secure Image Generation Handler Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred while generating the image.",
      prompt: req.body?.prompt,
    });
  }
});

export default router;
