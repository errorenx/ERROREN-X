import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ERROREN X - Uncaught UI Exception:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearState = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen flex items-center justify-center p-6 select-none font-sans"
          style={{
            backgroundColor: "#020617",
            color: "#f8fafc",
          }}
        >
          <div
            id="error-boundary-card"
            className="max-w-md w-full rounded-2xl p-8 text-center space-y-5 border shadow-2xl"
            style={{
              backgroundColor: "#0f172a",
              borderColor: "rgba(139, 92, 246, 0.3)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                backgroundColor: "rgba(244, 63, 94, 0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244, 63, 94, 0.3)",
              }}
            >
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Application Recovery
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                ERROREN X encountered an unexpected client state. You can safely reload the workspace or reset session cache.
              </p>
            </div>

            {this.state.error && (
              <div
                className="text-left rounded-xl p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-28 border"
                style={{
                  backgroundColor: "#020617",
                  borderColor: "#1e293b",
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="btn-error-reload"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                id="btn-error-clear"
                onClick={this.handleClearState}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                }}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
