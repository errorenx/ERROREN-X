import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserPreferences } from "../types";
import { api, getStoredToken, clearStoredToken } from "../services/api";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  demoLogin: (role?: "user" | "admin") => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const loadUserData = useCallback(async () => {
    try {
      if (!getStoredToken()) {
        setUser(null);
        setPreferences(null);
        setIsLoading(false);
        return;
      }
      const [currentUser, userPrefs] = await Promise.all([
        api.getMe(),
        api.getPreferences(),
      ]);
      setUser(currentUser);
      setPreferences(userPrefs);
    } catch (err) {
      console.warn("Failed to restore auth session:", err);
      clearStoredToken();
      setToken(null);
      setUser(null);
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setUser(res.user);
      setToken(res.token);
      const prefs = await api.getPreferences();
      setPreferences(prefs);
      addToast(`Welcome back, ${res.user.name}!`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to log in", "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password: pass });
      setUser(res.user);
      setToken(res.token);
      const prefs = await api.getPreferences();
      setPreferences(prefs);
      addToast(`Welcome to ERROREN X, ${res.user.name}!`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to sign up", "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: "user" | "admin" = "user") => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setUser(res.user);
      setToken(res.token);
      const prefs = await api.getPreferences();
      setPreferences(prefs);
      addToast(`Logged in as ${res.user.name} (${res.user.role})`, "success");
    } catch (err: any) {
      addToast(err.message || "Demo login failed", "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setPreferences(null);
    addToast("Logged out securely", "info");
  };

  const updateUserProfile = async (updates: { name?: string; avatar?: string }) => {
    try {
      const updated = await api.updateProfile(updates);
      setUser(updated);
      addToast("Profile updated successfully", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update profile", "error");
      throw err;
    }
  };

  const updateUserPreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const updated = await api.updatePreferences(prefs);
      setPreferences(updated);
      addToast("Preferences saved", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to save preferences", "error");
      throw err;
    }
  };

  const refreshUser = async () => {
    await loadUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateUserProfile,
        updateUserPreferences,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
