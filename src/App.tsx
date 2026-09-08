import React, { useEffect } from "react";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { MainLayout } from "./components/layout/MainLayout";
import { ToastContainer } from "./components/ui/Toast";

export default function App() {
  useEffect(() => {
    // Guaranteed removal of splash overlay once React components render
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(() => splash.remove(), 200);
    }
  }, []);

  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <MainLayout />
            <ToastContainer />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
