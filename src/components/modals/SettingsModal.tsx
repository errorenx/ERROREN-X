import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  useTheme,
  type AccentColor,
} from "../../context/ThemeContext";
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
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAllChats: () => void;
}

const accentColors: {
  id: AccentColor;
  name: string;
  color: string;
}[] = [
  {
    id: "violet",
    name: "Violet",
    color: "#8b5cf6",
  },
  {
    id: "blue",
    name: "Blue",
    color: "#3b82f6",
  },
  {
    id: "cyan",
    name: "Cyan",
    color: "#06b6d4",
  },
  {
    id: "emerald",
    name: "Emerald",
    color: "#10b981",
  },
  {
    id: "rose",
    name: "Rose",
    color: "#f43f5e",
  },
  {
    id: "orange",
    name: "Orange",
    color: "#f97316",
  },
  {
    id: "pink",
    name: "Pink",
    color: "#ec4899",
  },
  {
    id: "indigo",
    name: "Indigo",
    color: "#6366f1",
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDeleteAllChats,
}) => {
  const {
    user,
    preferences,
    updateUserProfile,
    updateUserPreferences,
  } = useAuth();

  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
  } = useTheme();

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "account" | "appearance" | "ai" | "speech" | "data" | "security"
  >("account");

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const [defaultModel, setDefaultModel] = useState(
    preferences?.defaultModel || "gemini-3.7-flash"
  );

  const [responseStyle, setResponseStyle] = useState(
    preferences?.responseStyle || "balanced"
  );

  const [customInstructions, setCustomInstructions] =
    useState(preferences?.customInstructions || "");

  const [webSearchDefault, setWebSearchDefault] =
    useState(preferences?.webSearchDefault || false);

  const [speechRate, setSpeechRate] = useState(
    preferences?.speechRate || 1.0
  );

  const [autoPlayAudio, setAutoPlayAudio] = useState(
    preferences?.autoPlayAudio || false
  );

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
      setCustomInstructions(
        preferences.customInstructions
      );
      setWebSearchDefault(
        preferences.webSearchDefault
      );
      setSpeechRate(preferences.speechRate);
      setAutoPlayAudio(
        preferences.autoPlayAudio
      );
    }
  }, [user, preferences]);

  if (!isOpen) return null;

  const handleSaveProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      await updateUserProfile({
        name,
        avatar,
      });
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

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast(
        "New passwords do not match",
        "error"
      );
      return;
    }

    if (newPassword.length < 6) {
      addToast(
        "Password must be at least 6 characters",
        "error"
      );
      return;
    }

    setIsSaving(true);

    try {
      await api.changePassword({
        currentPassword,
        newPassword,
      });

      addToast(
        "Password updated successfully",
        "success"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      addToast(
        err.message ||
          "Failed to update password",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();

      const blob = new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `erroren_x_export_${Date.now()}.json`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      addToast(
        "Export downloaded successfully",
        "success"
      );
    } catch (err: any) {
      addToast(
        err.message ||
          "Failed to export data",
        "error"
      );
    }
  };

  const tabClass = (
    tab:
      | "account"
      | "appearance"
      | "ai"
      | "speech"
      | "data"
      | "security"
  ) => {
    return `
      flex items-center gap-2.5
      px-3 py-2 rounded-xl
      text-xs font-medium
      transition-all whitespace-nowrap
      ${
        activeTab === tab
          ? "bg-[rgba(var(--accent-rgb),0.15)] text-[var(--accent-color)] border border-[rgba(var(--accent-rgb),0.4)]"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70"
      }
    `;
  };

  const themeButtonClass = (
    selected: boolean
  ) => {
    return `
      relative flex flex-col
      items-center justify-center
      gap-2 p-4 rounded-2xl
      border text-xs font-semibold
      transition-all duration-200
      ${
        selected
          ? "border-[var(--accent-color)] bg-[rgba(var(--accent-rgb),0.15)] text-[var(--accent-color)] shadow-lg"
          : "border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-600"
      }
    `;
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
        bg-black/70
        backdrop-blur-md
        animate-fade-in
      "
    >
      <div
        className="
          relative w-full max-w-2xl
          max-h-[90vh]
          rounded-3xl
          bg-[var(--bg-primary)]
          border border-[rgba(var(--accent-rgb),0.3)]
          shadow-2xl
          flex flex-col
          overflow-hidden
        "
      >
        {/* HEADER */}

        <div
          className="
            flex items-center
            justify-between
            px-6 py-4
            border-b
            border-[rgba(var(--accent-rgb),0.15)]
          "
        >
          <div className="flex items-center gap-2.5">
            <Sliders
              className="w-5 h-5"
              style={{
                color:
                  "var(--accent-color)",
              }}
            />

            <h2 className="text-lg font-display font-bold text-[var(--text-primary)] tracking-tight">
              Settings & Preferences
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              p-1 rounded-lg
              text-slate-400
              hover:text-white
              hover:bg-slate-900
              transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* SIDEBAR */}

          <div
            className="
              w-full md:w-48
              bg-[var(--bg-secondary)]
              p-2 md:p-3
              border-b md:border-b-0
              md:border-r
              border-[rgba(var(--accent-rgb),0.15)]
              flex md:flex-col
              gap-1
              overflow-x-auto
              shrink-0
            "
          >
            <button
              onClick={() =>
                setActiveTab("account")
              }
              className={tabClass("account")}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </button>

            <button
              onClick={() =>
                setActiveTab("appearance")
              }
              className={tabClass(
                "appearance"
              )}
            >
              <Moon className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() =>
                setActiveTab("ai")
              }
              className={tabClass("ai")}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Personality</span>
            </button>

            <button
              onClick={() =>
                setActiveTab("speech")
              }
              className={tabClass(
                "speech"
              )}
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice & Audio</span>
            </button>

            <button
              onClick={() =>
                setActiveTab("data")
              }
              className={tabClass("data")}
            >
              <Database className="w-4 h-4" />
              <span>Privacy & Data</span>
            </button>

            <button
              onClick={() =>
                setActiveTab("security")
              }
              className={tabClass(
                "security"
              )}
            >
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </button>
          </div>

          {/* CONTENT */}

          <div
            className="
              flex-1 p-6
              overflow-y-auto
              scrollbar-thin
            "
          >

            {/* ACCOUNT */}

            {activeTab === "account" && (
              <form
                onSubmit={
                  handleSaveProfile
                }
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Account Information
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Manage your profile details
                    and current plan.
                  </p>
                </div>

                <div className="space-y-3">

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={
                        user?.email || ""
                      }
                      disabled
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--bg-secondary)]
                        border
                        border-[rgba(var(--accent-rgb),0.1)]
                        text-[var(--text-muted)]
                        text-sm
                        cursor-not-allowed
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Avatar Image URL
                    </label>

                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) =>
                        setAvatar(
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/avatar.png"
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                    />
                  </div>

                  <div
                    className="
                      p-3 rounded-xl
                      flex items-center
                      justify-between
                      bg-[rgba(var(--accent-rgb),0.12)]
                      border
                      border-[rgba(var(--accent-rgb),0.2)]
                    "
                  >
                    <div>
                      <div
                        className="
                          text-xs font-semibold
                          text-[var(--accent-color)]
                        "
                      >
                        Account Plan
                      </div>

                      <div
                        className="
                          text-xs
                          text-[var(--text-secondary)]
                        "
                      >
                        {user?.plan ||
                          "Pro Tier"}{" "}
                        Unlimited Access
                      </div>
                    </div>

                    <span
                      className="
                        text-xs px-2.5 py-1
                        rounded-full
                        text-white
                        font-semibold
                      "
                      style={{
                        backgroundColor:
                          "var(--accent-color)",
                      }}
                    >
                      ACTIVE
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="
                    px-4 py-2
                    rounded-xl
                    text-white
                    text-xs font-semibold
                    shadow-md
                    transition-all
                  "
                  style={{
                    backgroundColor:
                      "var(--accent-color)",
                  }}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </form>
            )}

            {/* APPEARANCE */}

            {activeTab === "appearance" && (
              <div className="space-y-6">

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Appearance & Interface
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Customize the visual theme
                    of ERROREN X.
                  </p>
                </div>

                {/* THEMES */}

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-3">
                    Theme Mode
                  </h4>

                  <div className="grid grid-cols-3 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setTheme("dark")
                      }
                      className={themeButtonClass(
                        theme === "dark"
                      )}
                    >
                      {theme === "dark" && (
                        <span
                          className="
                            absolute top-2 right-2
                            flex items-center
                            justify-center
                            w-5 h-5 rounded-full
                            text-white
                          "
                          style={{
                            backgroundColor:
                              "var(--accent-color)",
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      )}

                      <Moon className="w-5 h-5" />

                      <span>
                        Dark Theme
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTheme("light")
                      }
                      className={themeButtonClass(
                        theme === "light"
                      )}
                    >
                      {theme === "light" && (
                        <span
                          className="
                            absolute top-2 right-2
                            flex items-center
                            justify-center
                            w-5 h-5 rounded-full
                            text-white
                          "
                          style={{
                            backgroundColor:
                              "var(--accent-color)",
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      )}

                      <Sun className="w-5 h-5 text-amber-400" />

                      <span>
                        Light Theme
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTheme("system")
                      }
                      className={themeButtonClass(
                        theme === "system"
                      )}
                    >
                      {theme === "system" && (
                        <span
                          className="
                            absolute top-2 right-2
                            flex items-center
                            justify-center
                            w-5 h-5 rounded-full
                            text-white
                          "
                          style={{
                            backgroundColor:
                              "var(--accent-color)",
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      )}

                      <Laptop className="w-5 h-5 text-blue-400" />

                      <span>
                        System Sync
                      </span>
                    </button>

                  </div>
                </div>

                {/* ACCENT COLORS */}

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Accent Color
                  </h4>

                  <p className="text-[11px] text-[var(--text-secondary)] mb-4">
                    Choose your preferred ERROREN X
                    accent color.
                  </p>

                  <div className="grid grid-cols-4 gap-3">

                    {accentColors.map(
                      (item) => {
                        const selected =
                          accentColor ===
                          item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setAccentColor(
                                item.id
                              )
                            }
                            className={`
                              relative
                              flex flex-col
                              items-center
                              gap-2
                              p-3
                              rounded-2xl
                              border
                              transition-all
                              duration-200
                              ${
                                selected
                                  ? "border-[var(--accent-color)] bg-[rgba(var(--accent-rgb),0.12)] shadow-lg"
                                  : "border-slate-700 bg-slate-900/40 hover:border-slate-500"
                              }
                            `}
                          >
                            <span
                              className="
                                w-8 h-8
                                rounded-full
                                border-2
                                border-white/20
                                shadow-md
                              "
                              style={{
                                backgroundColor:
                                  item.color,
                              }}
                            />

                            <span
                              className={`
                                text-[11px]
                                font-medium
                                ${
                                  selected
                                    ? "text-[var(--accent-color)]"
                                    : "text-[var(--text-secondary)]"
                                }
                              `}
                            >
                              {item.name}
                            </span>

                            {selected && (
                              <span
                                className="
                                  absolute top-2 right-2
                                  flex items-center
                                  justify-center
                                  w-4 h-4
                                  rounded-full
                                  text-white
                                "
                                style={{
                                  backgroundColor:
                                    "var(--accent-color)",
                                }}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* PREVIEW */}

                <div
                  className="
                    p-4 rounded-2xl
                    border
                    border-[rgba(var(--accent-rgb),0.2)]
                    bg-[rgba(var(--accent-rgb),0.06)]
                  "
                >
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-9 h-9 rounded-xl
                        flex items-center
                        justify-center
                        text-white
                      "
                      style={{
                        backgroundColor:
                          "var(--accent-color)",
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        Theme Preview
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {theme === "dark"
                          ? "Dark Theme"
                          : theme === "light"
                          ? "Light Theme"
                          : "System Sync"}{" "}
                        •{" "}
                        {accentColors.find(
                          (x) =>
                            x.id ===
                            accentColor
                        )?.name || "Violet"}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* AI */}

            {activeTab === "ai" && (
              <div className="space-y-4">

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    AI Behavior & Persona
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Configure default models,
                    tone, and system directives.
                  </p>
                </div>

                <div className="space-y-3">

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Default Engine
                    </label>

                    <select
                      value={defaultModel}
                      onChange={(e) =>
                        setDefaultModel(
                          e.target.value
                        )
                      }
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                    >
                      <option value="gemini-3.7-flash">
                        ERROREN X Balanced
                        (Fast & Smart)
                      </option>

                      <option value="gemini-3.1-flash-lite">
                        ERROREN X Fast
                        (Instant Responses)
                      </option>

                      <option value="gemini-3.1-pro">
                        ERROREN X Advanced
                        (Deep Logic)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Response Style
                    </label>

                    <select
                      value={responseStyle}
                      onChange={(e) =>
                        setResponseStyle(
                          e.target.value as any
                        )
                      }
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                    >
                      <option value="balanced">
                        Balanced & Professional
                      </option>

                      <option value="concise">
                        Concise & Direct
                      </option>

                      <option value="detailed">
                        Detailed & Comprehensive
                      </option>

                      <option value="code_architect">
                        Code Architect
                      </option>

                      <option value="creative">
                        Creative & Brainstorming
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Custom System Directives
                    </label>

                    <textarea
                      rows={3}
                      value={
                        customInstructions
                      }
                      onChange={(e) =>
                        setCustomInstructions(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Always respond in TypeScript when discussing code."
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-xs
                        leading-relaxed
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                    />
                  </div>

                  <div
                    className="
                      flex items-center
                      justify-between
                      p-3 rounded-xl
                      bg-[var(--bg-secondary)]
                      border
                      border-[rgba(var(--accent-rgb),0.15)]
                    "
                  >
                    <div>
                      <div className="text-xs font-medium text-[var(--text-primary)]">
                        Enable Web Search by default
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Ground new conversations
                        with Google Search
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        webSearchDefault
                      }
                      onChange={(e) =>
                        setWebSearchDefault(
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded"
                      style={{
                        accentColor:
                          "var(--accent-color)",
                      }}
                    />
                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleSaveAiPrefs
                  }
                  disabled={isSaving}
                  className="
                    px-4 py-2 rounded-xl
                    text-white
                    text-xs font-semibold
                    shadow-md
                  "
                  style={{
                    backgroundColor:
                      "var(--accent-color)",
                  }}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save AI Preferences"}
                </button>

              </div>
            )}

            {/* SPEECH */}

            {activeTab === "speech" && (
              <div className="space-y-4">

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Voice & Text-to-Speech
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Configure speech synthesis
                    and playback speeds.
                  </p>
                </div>

                <div className="space-y-3">

                  <div>
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                      <span>
                        Speech Playback Rate
                      </span>

                      <span
                        className="font-semibold"
                        style={{
                          color:
                            "var(--accent-color)",
                        }}
                      >
                        {speechRate}x
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) =>
                        setSpeechRate(
                          parseFloat(
                            e.target.value
                          )
                        )
                      }
                      className="w-full"
                      style={{
                        accentColor:
                          "var(--accent-color)",
                      }}
                    />
                  </div>

                  <div
                    className="
                      flex items-center
                      justify-between
                      p-3 rounded-xl
                      bg-[var(--bg-secondary)]
                      border
                      border-[rgba(var(--accent-rgb),0.15)]
                    "
                  >
                    <div>
                      <div className="text-xs font-medium text-[var(--text-primary)]">
                        Auto-play audio responses
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Automatically read aloud
                        assistant replies
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        autoPlayAudio
                      }
                      onChange={(e) =>
                        setAutoPlayAudio(
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded"
                      style={{
                        accentColor:
                          "var(--accent-color)",
                      }}
                    />
                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleSaveSpeechPrefs
                  }
                  disabled={isSaving}
                  className="
                    px-4 py-2 rounded-xl
                    text-white
                    text-xs font-semibold
                    shadow-md
                  "
                  style={{
                    backgroundColor:
                      "var(--accent-color)",
                  }}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Speech Settings"}
                </button>

              </div>
            )}

            {/* DATA */}

            {activeTab === "data" && (
              <div className="space-y-4">

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Data & Export Options
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Export your conversations
                    or purge stored records.
                  </p>
                </div>

                <div className="space-y-3">

                  <div
                    className="
                      p-3.5 rounded-2xl
                      bg-[var(--bg-secondary)]
                      border
                      border-[rgba(var(--accent-rgb),0.15)]
                      flex items-center
                      justify-between
                    "
                  >
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        Export All Data
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Download complete chat
                        history & preferences
                        in JSON
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleExportData
                      }
                      className="
                        flex items-center
                        gap-1.5
                        px-3 py-1.5
                        rounded-xl
                        bg-[var(--bg-tertiary)]
                        hover:opacity-80
                        text-[var(--text-primary)]
                        text-xs font-semibold
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                      "
                    >
                      <Download
                        className="w-3.5 h-3.5"
                        style={{
                          color:
                            "var(--accent-color)",
                        }}
                      />

                      <span>Export</span>
                    </button>
                  </div>

                  <div
                    className="
                      p-3.5 rounded-2xl
                      bg-red-950/30
                      border border-red-500/20
                      flex items-center
                      justify-between
                    "
                  >
                    <div>
                      <div className="text-xs font-semibold text-red-200">
                        Delete All Conversations
                      </div>

                      <div className="text-[11px] text-red-400/80">
                        Permanently erase all chat
                        messages and attachments
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onDeleteAllChats();
                      }}
                      className="
                        flex items-center
                        gap-1.5
                        px-3 py-1.5
                        rounded-xl
                        bg-red-900/80
                        hover:bg-red-800
                        text-white
                        text-xs font-semibold
                      "
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge All</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* SECURITY */}

            {activeTab === "security" && (
              <form
                onSubmit={
                  handleChangePassword
                }
                className="space-y-4"
              >

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Password & Security
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Update your account
                    authentication credentials.
                  </p>
                </div>

                <div className="space-y-3">

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Current Password
                    </label>

                    <input
                      type="password"
                      value={
                        currentPassword
                      }
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      className="
                        w-full px-3 py-2
                        rounded-xl
                        bg-[var(--input-bg)]
                        border
                        border-[rgba(var(--accent-rgb),0.2)]
                        text-[var(--text-primary)]
                        text-sm
                        focus:outline-none
                        focus:border-[var(--accent-color)]
                      "
                      required
                      minLength={6}
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="
                    px-4 py-2
                    rounded-xl
                    text-white
                    text-xs font-semibold
                    shadow-md
                  "
                  style={{
                    backgroundColor:
                      "var(--accent-color)",
                  }}
                >
                  {isSaving
                    ? "Updating..."
                    : "Change Password"}
                </button>

              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};