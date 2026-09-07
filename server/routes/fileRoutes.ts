import { Router, Response } from "express";
import multer from "multer";
import { authMiddleware, AuthRequest } from "../auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
});

router.post("/upload", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    let dataUrl: string | undefined = undefined;
    let parsedText: string | undefined = undefined;

    if (mimetype.startsWith("image/")) {
      const base64 = buffer.toString("base64");
      dataUrl = `data:${mimetype};base64,${base64}`;
    } else if (
      mimetype.includes("text") ||
      mimetype.includes("json") ||
      mimetype.includes("csv") ||
      originalname.endsWith(".txt") ||
      originalname.endsWith(".csv") ||
      originalname.endsWith(".json") ||
      originalname.endsWith(".md") ||
      originalname.endsWith(".ts") ||
      originalname.endsWith(".js") ||
      originalname.endsWith(".py") ||
      originalname.endsWith(".html") ||
      originalname.endsWith(".css") ||
      originalname.endsWith(".sql")
    ) {
      parsedText = buffer.toString("utf-8");
    } else if (mimetype.includes("pdf") || originalname.endsWith(".pdf")) {
      // Extract printable ascii/utf-8 lines from PDF buffer or format as text document
      const rawText = buffer.toString("latin1");
      const cleanParts = rawText
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .split(/\s{2,}/)
        .filter((s) => s.trim().length > 3)
        .join(" ");
      parsedText = cleanParts.slice(0, 50000) || `[PDF Document: ${originalname} (Binary Processed)]`;
    } else {
      // Other document types (docx, xlsx, etc.)
      const preview = buffer.toString("utf-8", 0, Math.min(buffer.length, 10000));
      parsedText = `[File: ${originalname}, Type: ${mimetype}, Size: ${(size / 1024).toFixed(1)} KB]\n${preview.replace(/[^\x20-\x7E\n\r\t]/g, "")}`;
    }

    return res.json({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      dataUrl,
      parsedText,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("File upload error:", err);
    return res.status(500).json({ error: "Failed to process file attachment" });
  }
});

export default router;
