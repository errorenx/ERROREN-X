import { Router, Response } from "express";
import { getUserPreferences, updateUserPreferences } from "../db.js";
import { authMiddleware, AuthRequest } from "../auth.js";

const router = Router();

// Get user preferences / settings
router.get("/preferences", authMiddleware, (req: AuthRequest, res: Response) => {
  const prefs = getUserPreferences(req.user!.id);
  return res.json(prefs);
});

// Update user preferences / settings
router.patch("/preferences", authMiddleware, (req: AuthRequest, res: Response) => {
  const {
    theme,
    defaultModel,
    responseStyle,
    customInstructions,
    speechVoice,
    speechRate,
    autoPlayAudio,
    webSearchDefault,
    saveHistory,
  } = req.body;

  const updates: any = {};
  if (theme !== undefined) updates.theme = theme;
  if (defaultModel !== undefined) updates.defaultModel = defaultModel;
  if (responseStyle !== undefined) updates.responseStyle = responseStyle;
  if (customInstructions !== undefined) updates.customInstructions = String(customInstructions);
  if (speechVoice !== undefined) updates.speechVoice = speechVoice;
  if (speechRate !== undefined) updates.speechRate = Number(speechRate);
  if (autoPlayAudio !== undefined) updates.autoPlayAudio = Boolean(autoPlayAudio);
  if (webSearchDefault !== undefined) updates.webSearchDefault = Boolean(webSearchDefault);
  if (saveHistory !== undefined) updates.saveHistory = Boolean(saveHistory);

  const updated = updateUserPreferences(req.user!.id, updates);
  return res.json(updated);
});

export default router;
