import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  exportUserData,
  deleteAllUserConversations,
} from "../db.js";
import { generateToken, authMiddleware, AuthRequest } from "../auth.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = createUser({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      role: "user",
      plan: "Free",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=180b38`,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to create account" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "This account has been suspended. Please contact support." });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

// Fast Demo Login
router.post("/demo-login", async (req, res) => {
  try {
    const { role = "user" } = req.body;
    const targetEmail = role === "admin" ? "admin@errorenx.ai" : "demo@errorenx.ai";
    const user = getUserByEmail(targetEmail);

    if (!user) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Demo login failed" });
  }
});

// Forgot Password / Password Reset Mock Flow
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const user = getUserByEmail(email);
  if (!user) {
    // Return friendly generic response for security
    return res.json({ message: "If an account exists with this email, password reset instructions have been sent." });
  }
  return res.json({
    message: "Password reset link generated. For this instance, you can use the Reset Password tab or demo credentials.",
    resetToken: `rst_${Date.now()}`,
  });
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Email and new password (min 6 chars) are required" });
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "Account not found" });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  updateUser(user.id, { passwordHash });

  return res.json({ message: "Password updated successfully. You can now log in." });
});

// Get Current User Profile
router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt,
  });
});

// Update Profile
router.patch("/profile", authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, avatar } = req.body;
  const updates: any = {};
  if (name && typeof name === "string") updates.name = name.trim();
  if (avatar && typeof avatar === "string") updates.avatar = avatar.trim();

  const updated = updateUser(req.user!.id, updates);
  if (!updated) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatar: updated.avatar,
    role: updated.role,
    plan: updated.plan,
  });
});

// Change Password
router.post("/change-password", authMiddleware, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Current password and new password (min 6 chars) are required" });
  }

  const user = getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  updateUser(user.id, { passwordHash });

  return res.json({ message: "Password changed successfully" });
});

// Export User Data
router.get("/export", authMiddleware, (req: AuthRequest, res: Response) => {
  const data = exportUserData(req.user!.id);
  res.setHeader("Content-Disposition", `attachment; filename=erroren_x_export_${req.user!.id}.json`);
  res.setHeader("Content-Type", "application/json");
  return res.json(data);
});

// Delete All Conversations
router.post("/delete-all-chats", authMiddleware, (req: AuthRequest, res: Response) => {
  const count = deleteAllUserConversations(req.user!.id);
  return res.json({ message: `Successfully deleted ${count} conversations`, count });
});

export default router;
