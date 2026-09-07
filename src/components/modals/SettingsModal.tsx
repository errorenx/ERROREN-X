import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  X,
  User,
  Sliders,
  Volume2,
  Lock,
  Database,
  Moon,
  Sun,
  Laptop,
  Sparkles,
  Download,
  Trash2,
  Check,
  ShieldCheck,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDeleteAllChats,
}) => {
  const { user, preferences, updateUserProfile, updateUserPreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "account" | "appearance" | "ai" | "speech" | "data" | "security"
  >("account");

  // Profile Form state
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // AI Preferences state
  const [defaultModel, setDefaultModel] = useState(preferences?.defaultModel || "gemini-3.7-flash");
  const [responseStyle, setResponseStyle] = useState(preferences?.responseStyle || "balanced");
  const [customInstructions, setCustomInstructions] = useState(preferences?.customInstructions || "");
  const [webSearchDefault, setWebSearchDefault] = useState(preferences?.webSearchDefault || false);

  // Speech state
  const [speechRate, setSpeechRate] = useState(preferences?.speechRate || 1.0);
  const [autoPlayAudio, setAutoPlayAudio] = useState(preferences?.autoPlayAudio || false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || "");
    }
    if (preferences) {
      setDefaultModel(preferences.defaultModel);
      setResponseStyle(preferences.responseStyle);
      setCustomInstructions(preferences.customInstructions);
      setWebSearchDefault(preferences.webSearchDefault);
      setSpeechRate(preferences.speechRate);
      setAutoPlayAudio(preferences.autoPlayAudio);
    }
  }, [user, preferences]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({ name, avatar });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAiPrefs = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences({
        defaultModel,
        responseStyle: responseStyle as any,
        customInstructions,
        webSearchDefault,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSpeechPrefs = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences({
        speechRate,
        autoPlayAudio,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      addToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      addToast(err.message || "Failed to update password", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `erroren_x_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast("Export downloaded successfully", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to export data", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-950 border border-violet-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">Settings & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Navigation Tabs + Tab Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-48 bg-slate-900/50 p-2 md:p-3 border-b md:border-b-0 md:border-r border-violet-500/15 flex md:flex-col gap-1 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "account"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "appearance"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "ai"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Personality</span>
            </button>

            <button
              onClick={() => setActiveTab("speech")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "speech"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice & Audio</span>
            </button>

            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "data"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Privacy & Data</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-950">
            {/* Account Tab */}
            {activeTab === "account" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Account Information</h3>
                  <p className="text-xs text-slate-400">Manage your profile details and current plan.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-violet-500/10 text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-violet-200">Account Plan</div>
                      <div className="text-xs text-violet-300/80">{user?.plan || "Pro Tier"} Unlimited Access</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-violet-600 text-white font-semibold shadow-sm">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </form>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Appearance & Interface</h3>
                  <p className="text-xs text-slate-400">Customize the visual theme of ERROREN X.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-xs font-medium transition-all ${
                      theme === "dark"
                        ? "bg-violet-950/80 border-violet-400 text-white shadow-md shadow-violet-500/20"
                        : "bg-slate-900/60 border-violet-500/15 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Moon className="w-5 h-5 text-violet-400" />
                    <span>Dark Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-xs font-medium transition-all ${
                      theme === "light"
                        ? "bg-violet-950/80 border-violet-400 text-white shadow-md shadow-violet-500/20"
                        : "bg-slate-900/60 border-violet-500/15 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span>Light Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-xs font-medium transition-all ${
                      theme === "system"
                        ? "bg-violet-950/80 border-violet-400 text-white shadow-md shadow-violet-500/20"
                        : "bg-slate-900/60 border-violet-500/15 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Laptop className="w-5 h-5 text-blue-400" />
                    <span>System Sync</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Preferences Tab */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">AI Behavior & Persona</h3>
                  <p className="text-xs text-slate-400">Configure default models, tone, and system directives.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Default Engine</label>
                    <select
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                    >
                      <option value="gemini-3.7-flash">ERROREN X Balanced (Fast & Smart)</option>
                      <option value="gemini-3.1-flash-lite">ERROREN X Fast (Instant Responses)</option>
                      <option value="gemini-3.1-pro">ERROREN X Advanced (Deep Logic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Response Style</label>
                    <select
                      value={responseStyle}
                      onChange={(e) => setResponseStyle(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                    >
                      <option value="balanced">Balanced & Professional (Default)</option>
                      <option value="concise">Concise & Direct (No fluff)</option>
                      <option value="detailed">Detailed & Comprehensive (Deep explanations)</option>
                      <option value="code_architect">Code Architect (Clean, structured snippets)</option>
                      <option value="creative">Creative & Brainstorming (Exploratory)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Custom System Directives</label>
                    <textarea
                      rows={3}
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Always respond in TypeScript when discussing code. Address me by my title."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs leading-relaxed focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-violet-500/15">
                    <div>
                      <div className="text-xs font-medium text-white">Enable Web Search by default</div>
                      <div className="text-[11px] text-slate-400">Ground all new conversations with Google Search</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={webSearchDefault}
                      onChange={(e) => setWebSearchDefault(e.target.checked)}
                      className="w-4 h-4 accent-violet-600 rounded"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAiPrefs}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {isSaving ? "Saving..." : "Save AI Preferences"}
                </button>
              </div>
            )}

            {/* Voice & Audio Tab */}
            {activeTab === "speech" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Voice & Text-to-Speech</h3>
                  <p className="text-xs text-slate-400">Configure speech synthesis and playback speeds.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Speech Playback Rate</span>
                      <span className="font-semibold text-violet-400">{speechRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full accent-violet-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-violet-500/15">
                    <div>
                      <div className="text-xs font-medium text-white">Auto-play audio responses</div>
                      <div className="text-[11px] text-slate-400">Automatically read aloud assistant replies</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPlayAudio}
                      onChange={(e) => setAutoPlayAudio(e.target.checked)}
                      className="w-4 h-4 accent-violet-600 rounded"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSpeechPrefs}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {isSaving ? "Saving..." : "Save Speech Settings"}
                </button>
              </div>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === "data" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Data & Export Options</h3>
                  <p className="text-xs text-slate-400">Export your conversations or purge stored records.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-violet-500/15 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Export All Data</div>
                      <div className="text-[11px] text-slate-400">Download complete chat history & preferences in JSON</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-violet-500/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-violet-400" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-red-200">Delete All Conversations</div>
                      <div className="text-[11px] text-red-400/80">Permanently erase all chat messages and attachments</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onDeleteAllChats();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-800 text-white text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge All</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Password & Security</h3>
                  <p className="text-xs text-slate-400">Update your account authentication credentials.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {isSaving ? "Updating..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
