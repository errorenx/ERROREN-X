import React, { useState, useEffect } from "react";
import { AdminStats } from "../../types";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  X,
  Shield,
  Users,
  MessageSquare,
  Activity,
  ThumbsUp,
  Cpu,
  Trash2,
  UserX,
  UserCheck,
  RefreshCw,
  Search,
} from "lucide-react";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err: any) {
      addToast(err.message || "Failed to load admin stats", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleStatus = async (userId: string, currentBanned: boolean) => {
    try {
      await api.toggleUserStatus(userId, !currentBanned);
      addToast(!currentBanned ? "User account suspended" : "User account activated", "success");
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || "Failed to update user status", "error");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteUserAsAdmin(userId);
      addToast(`User ${userName} purged from database`, "success");
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || "Failed to delete user", "error");
    }
  };

  const filteredUsers = stats?.recentUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] rounded-3xl bg-slate-950 border border-violet-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">ERROREN X Admin Console</h2>
              <p className="text-[11px] text-amber-300/80">Platform telemetry, user registry, and system management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-violet-950">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.totalUsers || 0}</div>
              <div className="text-[10px] text-emerald-400">{stats?.activeUsers || 0} active accounts</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Conversations</span>
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.totalConversations || 0}</div>
              <div className="text-[10px] text-slate-400">{stats?.totalMessages || 0} messages sent</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Satisfaction Rate</span>
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.feedbackSatisfactionRate || 100}%</div>
              <div className="text-[10px] text-slate-400">{stats?.totalFeedback || 0} user ratings</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-violet-500/15 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>AI Invocations</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.totalUsageEvents || 0}</div>
              <div className="text-[10px] text-violet-300">Gemini 3.7 Core Online</div>
            </div>
          </div>

          {/* User Management Registry */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Registered Users & Permissions
              </h3>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Filter users by name or email..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-violet-500/20 text-xs text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-violet-500/20 bg-slate-900/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-violet-500/15 bg-slate-900/80 text-slate-400">
                    <th className="py-2.5 px-4 font-semibold">User</th>
                    <th className="py-2.5 px-4 font-semibold">Role</th>
                    <th className="py-2.5 px-4 font-semibold">Plan</th>
                    <th className="py-2.5 px-4 font-semibold">Chats</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            user.role === "admin"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-violet-300 font-medium">{user.plan}</td>
                      <td className="py-3 px-4 text-slate-300">{user.conversationCount}</td>
                      <td className="py-3 px-4">
                        {user.isBanned ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-semibold">
                            SUSPENDED
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.role !== "admin" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(user.id, user.isBanned)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                user.isBanned
                                  ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/80"
                                  : "bg-amber-950/60 border-amber-500/30 text-amber-400 hover:bg-amber-900/80"
                              }`}
                              title={user.isBanned ? "Reactivate User" : "Suspend User"}
                            >
                              {user.isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-400 hover:bg-red-900/80 transition-colors"
                              title="Purge User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
