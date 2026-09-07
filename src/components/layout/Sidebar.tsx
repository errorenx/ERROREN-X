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

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Group conversations by date
  const groupConversations = (list: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    list.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (convTime >= today) {
        groups["Today"].push(conv);
      } else if (convTime >= yesterday) {
        groups["Yesterday"].push(conv);
      } else if (convTime >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(conv);
      } else {
        groups["Older"].push(conv);
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

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 flex flex-col w-72 md:w-80 bg-slate-950/95 border-r border-violet-500/15 backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex items-center justify-between p-4 border-b border-violet-500/10">
          <Logo size="md" showTagline />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons: New Chat & Search */}
        <div className="p-3 space-y-2">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs font-display tracking-tight shadow-md shadow-violet-600/25 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-200 group-hover:rotate-90 transition-transform" />
              <span>NEW CONVERSATION</span>
            </div>
            <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-violet-950/60 border border-violet-400/30 text-[10px] font-mono text-violet-200">
              Ctrl+N
            </kbd>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-900/80 border border-violet-500/15 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40 transition-colors font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List / Search Results */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 scrollbar-thin scrollbar-thumb-violet-950">
          {searchResults ? (
            /* Search Results View */
            <div className="space-y-1 px-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 px-2 py-1">
                Search Results ({searchResults.conversations.length})
              </div>
              {searchResults.conversations.length === 0 ? (
                <div className="text-xs text-slate-500 px-3 py-4 text-center">
                  No conversations match "{searchQuery}"
                </div>
              ) : (
                searchResults.conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 text-xs text-slate-300 transition-colors flex items-center gap-2 border border-transparent hover:border-violet-500/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="truncate flex-1">{conv.title}</span>
                  </button>
                ))
              )}
            </div>
          ) : conversations.length === 0 ? (
            /* Empty state */
            <div className="text-xs text-slate-500 px-4 py-8 text-center">
              No conversations yet. Click "New Conversation" to start chatting with ERROREN X.
            </div>
          ) : (
            /* Grouped History */
            Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-3 py-1 font-display">
                    {category}
                  </div>

                  {items.map((conv) => {
                    const isActive = conv.id === currentConversationId;
                    const isEditing = conv.id === editingConvId;

                    return (
                      <div
                        key={conv.id}
                        className={`group relative flex items-center rounded-xl transition-all ${
                          isActive
                            ? "bg-violet-950/70 border border-violet-500/30 text-white shadow-sm shadow-violet-500/10"
                            : "hover:bg-slate-900/80 text-slate-300 border border-transparent hover:border-violet-500/15"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full p-1.5">
                            <input
                              type="text"
                              value={editTitleText}
                              onChange={(e) => setEditTitleText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(conv.id);
                                if (e.key === "Escape") setEditingConvId(null);
                              }}
                              autoFocus
                              className="flex-1 bg-slate-900 text-xs text-white px-2 py-1 rounded border border-violet-400 outline-none"
                            />
                            <button
                              onClick={() => handleSaveRename(conv.id)}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingConvId(null)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => selectConversation(conv.id)}
                              className="flex-1 flex items-center gap-2.5 px-3 py-2 text-xs text-left min-w-0"
                            >
                              <MessageSquare
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? "text-violet-400" : "text-slate-500 group-hover:text-violet-400"
                                }`}
                              />
                              <span className="truncate font-medium flex-1">{conv.title}</span>
                            </button>

                            {/* 3-dots actions trigger */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                                }}
                                className={`p-1.5 mr-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400 hover:text-white transition-opacity ${
                                  activeMenuId === conv.id ? "opacity-100 bg-slate-800" : ""
                                }`}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Context menu popover */}
                              {activeMenuId === conv.id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-slate-950 border border-violet-500/30 p-1 shadow-2xl z-30 animate-in fade-in"
                                >
                                  <button
                                    onClick={() => handleStartRename(conv)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-violet-950/70 hover:text-violet-300 transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onOpenShare(conv);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-violet-950/70 hover:text-violet-300 transition-colors"
                                  >
                                    <Share2 className="w-3 h-3" />
                                    <span>Share Link</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onDeleteRequest(conv);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors"
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

        {/* Image Studio Quick Launch Button */}
        <div className="p-3 border-t border-violet-500/10">
          <button
            onClick={onOpenImageStudio}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-violet-950/50 hover:bg-violet-950 border border-violet-500/20 hover:border-violet-500/40 text-violet-300 text-xs font-semibold transition-all group shadow-sm"
          >
            <div className="p-1 rounded-lg bg-violet-900/60 text-violet-300 group-hover:scale-105 transition-transform">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span>Image Studio</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-600/80 text-white">NEW</span>
              </div>
              <div className="text-[10px] text-slate-400">Generate creative visuals</div>
            </div>
          </button>
        </div>

        {/* User Profile & Navigation Pill */}
        <div className="p-3 border-t border-violet-500/10 relative" ref={userMenuRef}>
          {user ? (
            <div>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-violet-500/15 hover:border-violet-500/30 transition-all text-left"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-violet-400/40">
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
                  <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                    <span>{user.name}</span>
                    {user.role === "admin" && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>

                <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-slate-950 border border-violet-500/30 p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-3 py-2 border-b border-violet-500/10 mb-1">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[10px] text-violet-400 font-medium">
                      Plan: {user.plan || "Pro Tier"}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-violet-400" />
                    <span>Settings & Preferences</span>
                  </button>

                  {user.role === "admin" && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-950/40 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenHelp();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Help & Knowledge Base</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAbout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>About ERROREN X</span>
                  </button>

                  <div className="border-t border-violet-500/10 my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Securely</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xs text-slate-500">Not signed in</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
