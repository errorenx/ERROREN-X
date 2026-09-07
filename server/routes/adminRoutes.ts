import { Router, Response } from "express";
import { getAdminStats, getAllUsers, updateUser, deleteUser } from "../db.js";
import { authMiddleware, adminOnlyMiddleware, AuthRequest } from "../auth.js";

const router = Router();

// Protect all admin routes with auth and adminOnly check
router.use(authMiddleware);
router.use(adminOnlyMiddleware);

// Get platform analytics & stats
router.get("/stats", (req: AuthRequest, res: Response) => {
  const stats = getAdminStats();
  return res.json(stats);
});

// List all registered users
router.get("/users", (req: AuthRequest, res: Response) => {
  const users = getAllUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    plan: u.plan,
    isBanned: !!u.isBanned,
    createdAt: u.createdAt,
  }));
  return res.json(users);
});

// Toggle user status (suspend / reactivate)
router.patch("/users/:id/status", (req: AuthRequest, res: Response) => {
  const { isBanned } = req.body;
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: "Cannot suspend your own administrator account" });
  }

  const updated = updateUser(req.params.id, { isBanned: Boolean(isBanned) });
  if (!updated) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    message: isBanned ? "User account suspended" : "User account activated",
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      isBanned: updated.isBanned,
    },
  });
});

// Delete user account as admin
router.delete("/users/:id", (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: "Cannot delete your own administrator account" });
  }

  const success = deleteUser(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ message: "User account and all associated data purged" });
});

export default router;
