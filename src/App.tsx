import React from "react";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { MainLayout } from "./components/layout/MainLayout";
import { ToastContainer } from "./components/ui/Toast";

export default function App() {
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
