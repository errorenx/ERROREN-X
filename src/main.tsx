import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import "./index.css";

function hideStartupScreen() {
  try {
    if (typeof window !== "undefined") {
      const hide = (
        window as typeof window & {
          __ERROREN_X_HIDE_STARTUP__?: () => void;
        }
      ).__ERROREN_X_HIDE_STARTUP__;

      if (hide) {
        hide();
        return;
      }
    }

    const screen = document.getElementById("startup-fallback");

    if (screen) {
      screen.remove();
    }
  } catch {
    const screen = document.getElementById("startup-fallback");

    if (screen) {
      screen.remove();
    }
  }
}

function showFatalError(error: unknown) {
  console.error("ERROREN X startup error:", error);

  const root = document.getElementById("root");

  hideStartupScreen();

  if (!root) return;

  root.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      box-sizing:border-box;
      background:#020617;
      color:#f8fafc;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:520px;
        padding:28px;
        border-radius:20px;
        background:#0f172a;
        border:1px solid rgba(139,92,246,.3);
        text-align:center;
        box-sizing:border-box;
      ">
        <div style="
          width:56px;
          height:56px;
          margin:0 auto 18px;
          border-radius:16px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(135deg,#8b5cf6,#6366f1);
          font-size:24px;
          font-weight:800;
        ">X</div>

        <h2 style="margin:0 0 10px;font-size:22px">
          ERROREN X
        </h2>

        <p style="
          margin:0 0 20px;
          color:#94a3b8;
          font-size:14px;
          line-height:1.6;
        ">
          The application could not start correctly.
          Please reload the page.
        </p>

        <button
          onclick="window.location.reload()"
          style="
            padding:11px 20px;
            border:0;
            border-radius:10px;
            background:linear-gradient(135deg,#8b5cf6,#6366f1);
            color:white;
            font-weight:600;
            cursor:pointer;
          "
        >
          Reload ERROREN X
        </button>
      </div>
    </div>
  `;
}

function mountApplication() {
  try {
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Root element was not found.");
    }

    const root = createRoot(rootElement);

    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );

    /*
     * React has successfully mounted.
     * Remove the startup screen immediately.
     */
    hideStartupScreen();
  } catch (error) {
    showFatalError(error);
  }
}

/*
 * Suppress harmless network rejection messages.
 */
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const message = String(event.reason?.message || event.reason || "");

    if (
      message.toLowerCase().includes("websocket") ||
      message.toLowerCase().includes("failed to fetch")
    ) {
      event.preventDefault();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApplication, {
    once: true,
  });
} else {
  mountApplication();
}