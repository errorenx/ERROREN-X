import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { AttachmentPreview } from "./AttachmentPreview";
import {
  Send,
  Square,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  Globe,
  Loader2,
  Plus,
} from "lucide-react";

interface ChatInputProps {
  onOpenImageStudio?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onOpenImageStudio }) => {
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    sendMessage,
    isGenerating,
    stopGeneration,
    activeAttachments,
    addAttachment,
    removeAttachment,
    webSearchEnabled,
    setWebSearchEnabled,
  } = useChat();

  const { addToast } = useToast();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (
      (!input.trim() && activeAttachments.length === 0) ||
      isGenerating ||
      isUploading
    ) {
      return;
    }

    sendMessage(input.trim());
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 20 * 1024 * 1024) {
        addToast(
          `File ${file.name} exceeds 20MB limit`,
          "error"
        );
        continue;
      }

      try {
        const attachment = await api.uploadFile(file);
        addAttachment(attachment);
        addToast(`Uploaded ${file.name}`, "success");
      } catch (err: any) {
        addToast(
          `Failed to upload ${file.name}: ${err.message}`,
          "error"
        );
      }
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast(
        "Speech recognition is not supported in this browser",
        "error"
      );
      return;
    }

    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }

      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        addToast(
          "Listening... Speak into your microphone",
          "info"
        );
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        setInput((prev) =>
          prev ? `${prev} ${transcript}` : transcript
        );
      };

      recognition.onerror = (event: any) => {
        console.warn(
          "Speech recognition error:",
          event.error
        );

        if (event.error === "not-allowed") {
          addToast(
            "Microphone access was denied. Please allow microphone permission.",
            "error"
          );
        } else {
          addToast(
            `Voice error: ${event.error}`,
            "error"
          );
        }

        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      addToast(
        "Could not start voice recognition",
        "error"
      );
      setIsRecording(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full max-w-4xl mx-auto px-4 pb-4 md:pb-6 transition-all ${
        isDragOver ? "scale-[1.01]" : ""
      }`}
    >
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div
          className="absolute inset-0 z-20 m-4 rounded-2xl border-2 border-dashed flex items-center justify-center backdrop-blur-sm pointer-events-none"
          style={{
            background:
              "color-mix(in srgb, var(--accent-color) 25%, var(--bg-primary))",
            borderColor: "var(--accent-color)",
          }}
        >
          <div
            className="flex flex-col items-center gap-2"
            style={{
              color: "var(--accent-color)",
            }}
          >
            <Paperclip className="w-8 h-8 animate-bounce" />

            <span className="font-semibold text-sm">
              Drop files or images to attach
            </span>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div
        className="relative flex flex-col rounded-2xl border backdrop-blur-xl overflow-hidden transition-all"
        style={{
          background:
            "color-mix(in srgb, var(--bg-secondary) 92%, transparent)",
          borderColor:
            "rgba(var(--accent-rgb), 0.25)",
          boxShadow:
            "0 20px 45px rgba(var(--accent-rgb), 0.10)",
        }}
      >
        {/* Attachments */}
        {activeAttachments.length > 0 && (
          <div
            className="px-4 pt-3 pb-1 border-b"
            style={{
              background:
                "color-mix(in srgb, var(--bg-tertiary) 70%, transparent)",
              borderColor:
                "rgba(var(--accent-rgb), 0.10)",
            }}
          >
            <AttachmentPreview
              attachments={activeAttachments}
              onRemove={removeAttachment}
              isCompact
            />
          </div>
        )}

        {/* Text Input */}
        <div className="flex items-start px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? "Listening to your voice..."
                : "Message ERROREN X..."
            }
            className="w-full bg-transparent text-sm md:text-[15px] resize-none outline-none max-h-48 min-h-[28px] leading-relaxed"
            style={{
              color: "var(--text-primary)",
            }}
            disabled={isGenerating}
            id="chat-textarea-input"
          />
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-3 py-2 border-t"
          style={{
            background:
              "color-mix(in srgb, var(--bg-tertiary) 55%, transparent)",
            borderColor:
              "rgba(var(--accent-rgb), 0.10)",
            color: "var(--text-secondary)",
          }}
        >
          {/* Left Buttons */}
          <div className="flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                handleFileUpload(e.target.files)
              }
              className="hidden"
              multiple
              accept=".pdf,.txt,.docx,.csv,.xlsx,.json,.md,.js,.ts,.py,.html,.css,.sql"
            />

            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) =>
                handleFileUpload(e.target.files)
              }
              className="hidden"
              multiple
              accept="image/*"
            />

            {/* Attach */}
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                isUploading || isGenerating
              }
              className="flex items-center gap-1 p-2 rounded-xl border border-transparent transition-colors disabled:opacity-50 text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--accent-color)";
                e.currentTarget.style.background =
                  "rgba(var(--accent-rgb), 0.10)";
                e.currentTarget.style.borderColor =
                  "rgba(var(--accent-rgb), 0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--text-secondary)";
                e.currentTarget.style.background =
                  "transparent";
                e.currentTarget.style.borderColor =
                  "transparent";
              }}
              title="Attach document or file"
              aria-label="Attach file"
            >
              {isUploading ? (
                <Loader2
                  className="w-4 h-4 animate-spin"
                  style={{
                    color: "var(--accent-color)",
                  }}
                />
              ) : (
                <Plus className="w-4 h-4" />
              )}

              <span className="hidden sm:inline">
                Attach
              </span>
            </button>

            {/* Image */}
            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              disabled={
                isUploading || isGenerating
              }
              className="p-2 rounded-xl border border-transparent transition-colors disabled:opacity-50"
              style={{
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--accent-color)";
                e.currentTarget.style.background =
                  "rgba(var(--accent-rgb), 0.10)";
                e.currentTarget.style.borderColor =
                  "rgba(var(--accent-rgb), 0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--text-secondary)";
                e.currentTarget.style.background =
                  "transparent";
                e.currentTarget.style.borderColor =
                  "transparent";
              }}
              title="Upload image for visual analysis"
              aria-label="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Web Search */}
            <button
              type="button"
              onClick={() =>
                setWebSearchEnabled(!webSearchEnabled)
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={
                webSearchEnabled
                  ? {
                      background:
                        "rgba(var(--accent-rgb), 0.16)",
                      borderColor:
                        "var(--accent-color)",
                      color:
                        "var(--accent-color)",
                      boxShadow:
                        "0 4px 15px rgba(var(--accent-rgb), 0.15)",
                    }
                  : {
                      background:
                        "rgba(var(--accent-rgb), 0.04)",
                      borderColor:
                        "rgba(var(--accent-rgb), 0.15)",
                      color:
                        "var(--text-secondary)",
                    }
              }
              title="Toggle Google Search Grounding"
              aria-label="Toggle Web Search"
            >
              <Globe
                className={`w-3.5 h-3.5 ${
                  webSearchEnabled
                    ? "animate-pulse"
                    : ""
                }`}
                style={
                  webSearchEnabled
                    ? {
                        color:
                          "var(--accent-color)",
                      }
                    : undefined
                }
              />

              <span className="hidden xs:inline">
                Web Search
              </span>
            </button>

            {/* Voice */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className="p-2 rounded-xl border transition-all"
              style={
                isRecording
                  ? {
                      background:
                        "rgba(239, 68, 68, 0.12)",
                      borderColor:
                        "rgba(239, 68, 68, 0.50)",
                      color: "#ef4444",
                    }
                  : {
                      color:
                        "var(--text-secondary)",
                      borderColor:
                        "transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isRecording) {
                  e.currentTarget.style.color =
                    "var(--accent-color)";
                  e.currentTarget.style.background =
                    "rgba(var(--accent-rgb), 0.10)";
                  e.currentTarget.style.borderColor =
                    "rgba(var(--accent-rgb), 0.20)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isRecording) {
                  e.currentTarget.style.color =
                    "var(--text-secondary)";
                  e.currentTarget.style.background =
                    "transparent";
                  e.currentTarget.style.borderColor =
                    "transparent";
                }
              }}
              title={
                isRecording
                  ? "Stop voice recording"
                  : "Dictate with voice"
              }
              aria-label="Voice input"
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Send / Stop */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-medium text-xs transition-colors"
                style={{
                  background: "#dc2626",
                  boxShadow:
                    "0 5px 18px rgba(220, 38, 38, 0.25)",
                }}
                title="Stop generating response"
                aria-label="Stop Generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={
                  (!input.trim() &&
                    activeAttachments.length === 0) ||
                  isUploading
                }
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, #000))",
                  boxShadow:
                    "0 6px 20px rgba(var(--accent-rgb), 0.30)",
                }}
                title="Send message (Enter)"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div
        className="flex items-center justify-between text-[11px] px-2 mt-1.5 select-none"
        style={{
          color: "var(--text-muted)",
        }}
      >
        <span>
          ERROREN X can make mistakes. Verify important
          information.
        </span>

        <span className="hidden sm:inline">
          Press Shift + Enter for new line
        </span>
      </div>
    </div>
  );
};