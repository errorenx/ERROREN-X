import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

import authRoutes from "./server/routes/authRoutes.js";
import conversationRoutes from "./server/routes/conversationRoutes.js";
import chatRoutes from "./server/routes/chatRoutes.js";
import imageRoutes from "./server/routes/imageRoutes.js";
import fileRoutes from "./server/routes/fileRoutes.js";
import userRoutes from "./server/routes/userRoutes.js";
import adminRoutes from "./server/routes/adminRoutes.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      name: "ERROREN X API",
      tagline: "Intelligence Beyond Limits",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/conversations", conversationRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/images", imageRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/admin", adminRoutes);

  // Vite middleware for development / Static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ERROREN X server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting ERROREN X server:", err);
});
