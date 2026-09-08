import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../ui/Logo";
import { Conversation } from "../../types";
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  Palette,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenImageStudio: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenShare: (conv: Conversation) => void;
  onOpenAdmin: () => void;
  onDeleteRequest: (conv: Conversation) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSettings,
  onOpenImageStudio,
  onOpenHelp,
  onOpenAbout,
  onOpenShare,
  onOpenAdmin,
  onDeleteRequest,
}) => {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    createNewChat,
    renameConversation,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useChat();

  const { user, logout } = useAuth();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStartRename = (conv: Conversation) => {
    setEditingConvId(conv.id);
    setEditTitleText(conv.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitleText.trim()) {
      renameConversation(id, editTitleText.trim());
    }

    setEditingConvId(null);
  };

  const groupConversations = (list: Conversation[]) => {
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    list.forEach((conv) => {
      const convTime = new Date(
        conv.updatedAt || conv.createdAt
      ).getTime();

      if (convTime >= today) {
        groups.Today.push(conv);
      } else if (convTime >= yesterday) {
        groups.Yesterday.push(conv);
      } else if (convTime >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  };

  const grouped = groupConversations(conversations);

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 flex flex-col w-72 md:w-80 backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "color-mix(in srgb, var(--bg-secondary) 96%, transparent)",
          borderRightColor:
            "color-mix(in srgb, var(--accent-color) 15%, transparent)",
          borderRightWidth: "1px",
          borderRightStyle: "solid",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{
            borderBottom:
              "1px solid color-mix(in srgb, var(--accent-color) 10%, transparent)",
          }}
        >
          <Logo size="md" showTagline />

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg transition-colors"
            style={{
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background =
                "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color =
                "var(--text-secondary)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat + Search */}
        <div className="p-3 space-y-2">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white font-bold text-xs font-display tracking-tight transition-all group cursor-pointer"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-color), var(--brand-color))",
              boxShadow:
                "0 8px 24px rgba(var(--accent-rgb), 0.20)",
            }}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 opacity-80 group-hover:rotate-90 transition-transform" />
              <span>NEW CONVERSATION</span>
            </div>

            <kbd
              className="hidden sm:inline px-1.5 py-0.5 rounded border text-[10px] font-mono"
              style={{
                background:
                  "rgba(var(--accent-rgb), 0.18)",
                borderColor:
                  "rgba(var(--accent-rgb), 0.30)",
                color: "white",
              }}
            >
              Ctrl+N
            </kbd>
          </button>

          {/* Search */}
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{
                color: "var(--text-muted)",
              }}
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-2 rounded-xl text-xs focus:outline-none transition-colors font-medium"
              style={{
                background: "var(--input-bg)",
                border:
                  "1px solid color-mix(in srgb, var(--accent-color) 15%, var(--border-color))",
                color: "var(--text-primary)",
              }}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div
          className="flex-1 overflow-y-auto px-2 py-1 space-y-4 scrollbar-thin"
          style={{
            scrollbarColor:
              "var(--accent-color) transparent",
          }}
        >
          {searchResults ? (
            <div className="space-y-1 px-1">
              <div
                className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1"
                style={{
                  color: "var(--accent-color)",
                }}
              >
                Search Results ({searchResults.conversations.length})
              </div>

              {searchResults.conversations.length === 0 ? (
                <div
                  className="text-xs px-3 py-4 text-center"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  No conversations match "{searchQuery}"
                </div>
              ) : (
                searchResults.conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className="w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 border"
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "transparent",
                    }}
                  >
                    <MessageSquare
                      className="w-3.5 h-3.5 shrink-0"
                      style={{
                        color: "var(--accent-color)",
                      }}
                    />

                    <span className="truncate flex-1">
                      {conv.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : conversations.length === 0 ? (
            <div
              className="text-xs px-4 py-8 text-center"
              style={{
                color: "var(--text-muted)",
              }}
            >
              No conversations yet. Click "New Conversation" to start
              chatting with ERROREN X.
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-1">
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 font-display"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {category}
                  </div>

                  {items.map((conv) => {
                    const isActive =
                      conv.id === currentConversationId;

                    const isEditing =
                      conv.id === editingConvId;

                    return (
                      <div
                        key={conv.id}
                        className="group relative flex items-center rounded-xl transition-all"
                        style={{
                          background: isActive
                            ? "rgba(var(--accent-rgb), 0.14)"
                            : "transparent",
                          border: isActive
                            ? "1px solid rgba(var(--accent-rgb), 0.30)"
                            : "1px solid transparent",
                          color: isActive
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                          boxShadow: isActive
                            ? "0 4px 16px rgba(var(--accent-rgb), 0.08)"
                            : "none",
                        }}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full p-1.5">
                            <input
                              type="text"
                              value={editTitleText}
                              onChange={(e) =>
                                setEditTitleText(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveRename(conv.id);
                                }

                                if (e.key === "Escape") {
                                  setEditingConvId(null);
                                }
                              }}
                              autoFocus
                              className="flex-1 text-xs px-2 py-1 rounded outline-none"
                              style={{
                                background: "var(--input-bg)",
                                color: "var(--text-primary)",
                                border:
                                  "1px solid var(--accent-color)",
                              }}
                            />

                            <button
                              onClick={() =>
                                handleSaveRename(conv.id)
                              }
                              className="p-1"
                              style={{
                                color: "#10b981",
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() =>
                                setEditingConvId(null)
                              }
                              className="p-1"
                              style={{
                                color: "var(--text-secondary)",
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                selectConversation(conv.id)
                              }
                              className="flex-1 flex items-center gap-2.5 px-3 py-2 text-xs text-left min-w-0"
                              style={{
                                color: isActive
                                  ? "var(--text-primary)"
                                  : "var(--text-secondary)",
                              }}
                            >
                              <MessageSquare
                                className="w-3.5 h-3.5 shrink-0"
                                style={{
                                  color: isActive
                                    ? "var(--accent-color)"
                                    : "var(--text-muted)",
                                }}
                              />

                              <span className="truncate font-medium flex-1">
                                {conv.title}
                              </span>
                            </button>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setActiveMenuId(
                                    activeMenuId === conv.id
                                      ? null
                                      : conv.id
                                  );
                                }}
                                className="p-1.5 mr-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                  color:
                                    "var(--text-secondary)",
                                  background:
                                    activeMenuId === conv.id
                                      ? "var(--bg-tertiary)"
                                      : "transparent",
                                }}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeMenuId === conv.id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-0 top-full mt-1 w-36 rounded-xl p-1 shadow-2xl z-30 animate-in fade-in"
                                  style={{
                                    background:
                                      "var(--card-bg)",
                                    border:
                                      "1px solid rgba(var(--accent-rgb), 0.30)",
                                  }}
                                >
                                  <button
                                    onClick={() =>
                                      handleStartRename(conv)
                                    }
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                                    style={{
                                      color:
                                        "var(--text-secondary)",
                                    }}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Rename</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onOpenShare(conv);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                                    style={{
                                      color:
                                        "var(--text-secondary)",
                                    }}
                                  >
                                    <Share2 className="w-3 h-3" />
                                    <span>Share Link</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onDeleteRequest(conv);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                                    style={{
                                      color: "#ef4444",
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Image Studio */}
        <div
          className="p-3"
          style={{
            borderTop:
              "1px solid rgba(var(--accent-rgb), 0.10)",
          }}
        >
          <button
            onClick={onOpenImageStudio}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group shadow-sm"
            style={{
              background:
                "rgba(var(--accent-rgb), 0.10)",
              border:
                "1px solid rgba(var(--accent-rgb), 0.20)",
              color: "var(--accent-color)",
            }}
          >
            <div
              className="p-1 rounded-lg transition-transform group-hover:scale-105"
              style={{
                background:
                  "rgba(var(--accent-rgb), 0.18)",
                color: "var(--accent-color)",
              }}
            >
              <Palette className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 text-left">
              <div
                className="font-semibold flex items-center gap-1.5"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <span>Image Studio</span>

                <span
                  className="text-[9px] px-1.5 py-0.5 rounded text-white"
                  style={{
                    background: "var(--accent-color)",
                  }}
                >
                  NEW
                </span>
              </div>

              <div
                className="text-[10px]"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Generate creative visuals
              </div>
            </div>
          </button>
        </div>

        {/* User Profile */}
        <div
          className="p-3 relative"
          ref={userMenuRef}
          style={{
            borderTop:
              "1px solid rgba(var(--accent-rgb), 0.10)",
          }}
        >
          {user ? (
            <div>
              <button
                onClick={() =>
                  setIsUserMenuOpen(!isUserMenuOpen)
                }
                className="w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left"
                style={{
                  background: "var(--input-bg)",
                  border:
                    "1px solid rgba(var(--accent-rgb), 0.15)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-color), var(--brand-color))",
                    border:
                      "1px solid rgba(var(--accent-rgb), 0.40)",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-semibold truncate flex items-center gap-1"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    <span>{user.name}</span>

                    {user.role === "admin" && (
                      <span
                        className="text-[9px] px-1 py-0.5 rounded font-bold"
                        style={{
                          background:
                            "rgba(245, 158, 11, 0.15)",
                          color: "#fbbf24",
                          border:
                            "1px solid rgba(245, 158, 11, 0.30)",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div
                    className="text-[10px] truncate"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {user.email}
                  </div>
                </div>

                <Settings
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                />
              </button>

              {/* User Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-bottom-2"
                  style={{
                    background: "var(--card-bg)",
                    border:
                      "1px solid rgba(var(--accent-rgb), 0.30)",
                  }}
                >
                  <div
                    className="px-3 py-2 mb-1"
                    style={{
                      borderBottom:
                        "1px solid rgba(var(--accent-rgb), 0.10)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {user.name}
                    </div>

                    <div
                      className="text-[10px] font-medium"
                      style={{
                        color: "var(--accent-color)",
                      }}
                    >
                      Plan: {user.plan || "Pro Tier"}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Settings
                      className="w-3.5 h-3.5"
                      style={{
                        color: "var(--accent-color)",
                      }}
                    />
                    <span>Settings & Preferences</span>
                  </button>

                  {user.role === "admin" && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{
                        color: "#fbbf24",
                      }}
                    >
                      <Shield
                        className="w-3.5 h-3.5"
                        style={{
                          color: "#f59e0b",
                        }}
                      />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenHelp();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <HelpCircle
                      className="w-3.5 h-3.5"
                      style={{
                        color: "#3b82f6",
                      }}
                    />
                    <span>Help & Knowledge Base</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAbout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Sparkles
                      className="w-3.5 h-3.5"
                      style={{
                        color: "var(--accent-color)",
                      }}
                    />
                    <span>About ERROREN X</span>
                  </button>

                  <div
                    className="my-1"
                    style={{
                      borderTop:
                        "1px solid rgba(var(--accent-rgb), 0.10)",
                    }}
                  />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors"
                    style={{
                      color: "#ef4444",
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Securely</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <span
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Not signed in
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};