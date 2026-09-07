import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Logo } from "../ui/Logo";
import { api } from "../../services/api";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Key,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register" | "forgot";
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose,
}) => {
  const { login, register, demoLogin } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">(initialMode);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResetSuccessMessage(null);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
        onClose();
      } else if (mode === "register") {
        if (password.length < 6) {
          addToast("Password must be at least 6 characters", "error");
          setIsSubmitting(false);
          return;
        }
        await register(name.trim(), email.trim(), password);
        onClose();
      } else if (mode === "forgot") {
        const res = await api.forgotPassword(email.trim());
        setResetSuccessMessage(res.message);
        addToast("Password reset link prepared", "success");
      } else if (mode === "reset") {
        if (password !== confirmPassword) {
          addToast("Passwords do not match", "error");
          setIsSubmitting(false);
          return;
        }
        const res = await api.resetPassword({ email: email.trim(), newPassword: password });
        addToast(res.message, "success");
        setMode("login");
      }
    } catch (err: any) {
      // Errors handled via context/toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = async (role: "user" | "admin") => {
    setIsSubmitting(true);
    try {
      await demoLogin(role);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-violet-500/30 shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="md" showTagline />
          <p className="text-xs text-slate-400 mt-2">
            {mode === "login" && "Sign in to access your intelligence workspace"}
            {mode === "register" && "Create your account for unlimited access"}
            {mode === "forgot" && "Reset your account password securely"}
            {mode === "reset" && "Enter your new password to restore access"}
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        {(mode === "login" || mode === "register") && (
          <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-violet-500/15 mb-6 font-display">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "login"
                  ? "bg-violet-950 text-violet-200 shadow-sm border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "register"
                  ? "bg-violet-950 text-violet-200 shadow-sm border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                required
              />
            </div>
          </div>

          {(mode === "login" || mode === "register" || mode === "reset") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  {mode === "reset" ? "New Password" : "Password"}
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-violet-400 hover:text-violet-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {mode === "reset" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-violet-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>{resetSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-white underline font-semibold mt-1 block"
                >
                  Click here to set your new password
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xs shadow-xl shadow-violet-600/30 disabled:opacity-50 transition-all"
          >
            <span>
              {mode === "login" && (isSubmitting ? "Signing in..." : "Sign In to ERROREN X")}
              {mode === "register" && (isSubmitting ? "Creating..." : "Create Free Account")}
              {mode === "forgot" && (isSubmitting ? "Sending..." : "Send Reset Link")}
              {mode === "reset" && (isSubmitting ? "Updating..." : "Save New Password")}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Forgot password return link */}
        {(mode === "forgot" || mode === "reset") && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* 1-Click Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-violet-500/15 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
            Instant 1-Click Demo Access
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo("user")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-violet-500/20 text-slate-200 text-xs font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span>Demo User</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemo("admin")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 text-amber-200 text-xs font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
