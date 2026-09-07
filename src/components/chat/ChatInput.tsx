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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && activeAttachments.length === 0) || isGenerating || isUploading) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File Upload Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 20 * 1024 * 1024) {
        addToast(`File ${file.name} exceeds 20MB limit`, "error");
        continue;
      }

      try {
        const attachment = await api.uploadFile(file);
        addAttachment(attachment);
        addToast(`Uploaded ${file.name}`, "success");
      } catch (err: any) {
        addToast(`Failed to upload ${file.name}: ${err.message}`, "error");
      }
    }

    setIsUploading(false);
  };

  // Drag & Drop
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

  // Voice Input with Web Speech API
  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast("Speech recognition is not supported in this browser", "error");
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
        addToast("Listening... Speak into your microphone", "info");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          addToast("Microphone access was denied. Please allow microphone permission.", "error");
        } else {
          addToast(`Voice error: ${event.error}`, "error");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      addToast("Could not start voice recognition", "error");
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
        <div className="absolute inset-0 z-20 m-4 rounded-2xl bg-violet-950/90 border-2 border-dashed border-violet-400 flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-violet-200">
            <Paperclip className="w-8 h-8 text-violet-400 animate-bounce" />
            <span className="font-semibold text-sm">Drop files or images to attach</span>
          </div>
        </div>
      )}

      {/* Main Input Container Card */}
      <div className="relative flex flex-col rounded-2xl border border-violet-500/25 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-violet-950/30 overflow-hidden focus-within:border-violet-500/50 transition-all">
        {/* Active Attachments Bar */}
        {activeAttachments.length > 0 && (
          <div className="px-4 pt-3 pb-1 border-b border-violet-500/10 bg-slate-950/40">
            <AttachmentPreview
              attachments={activeAttachments}
              onRemove={removeAttachment}
              isCompact
            />
          </div>
        )}

        {/* Text Input Area */}
        <div className="flex items-start px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening to your voice..." : "Message ERROREN X..."}
            className="w-full bg-transparent text-sm md:text-[15px] text-slate-100 placeholder:text-slate-500 resize-none outline-none max-h-48 min-h-[28px] leading-relaxed scrollbar-thin scrollbar-thumb-violet-950"
            disabled={isGenerating}
            id="chat-textarea-input"
          />
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/40 border-t border-violet-500/10 text-slate-400">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              multiple
              accept=".pdf,.txt,.docx,.csv,.xlsx,.json,.md,.js,.ts,.py,.html,.css,.sql"
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              multiple
              accept="image/*"
            />

            {/* Attach Document Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isGenerating}
              className="flex items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-violet-300 hover:bg-violet-950/60 border border-transparent hover:border-violet-500/20 transition-colors disabled:opacity-50 text-xs font-medium"
              title="Attach document or file (PDF, TXT, CSV, JSON, etc.)"
              aria-label="Attach file"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">Attach</span>
            </button>

            {/* Attach Image Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading || isGenerating}
              className="p-2 rounded-xl text-slate-400 hover:text-violet-300 hover:bg-violet-950/60 border border-transparent hover:border-violet-500/20 transition-colors disabled:opacity-50"
              title="Upload image for visual analysis"
              aria-label="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Web Search Toggle Pill */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                webSearchEnabled
                  ? "bg-violet-900/60 border-violet-400 text-violet-200 shadow-sm shadow-violet-500/20"
                  : "bg-slate-900/60 border-violet-500/15 text-slate-400 hover:text-slate-200 hover:border-violet-500/30"
              }`}
              title="Toggle Google Search Grounding for live internet data"
              aria-label="Toggle Web Search"
            >
              <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? "text-violet-400 animate-pulse" : ""}`} />
              <span className="hidden xs:inline">Web Search</span>
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2 rounded-xl border transition-all ${
                isRecording
                  ? "bg-red-950/90 border-red-500 text-red-400 animate-pulse shadow-md shadow-red-500/20"
                  : "text-slate-400 hover:text-violet-300 hover:bg-violet-950/60 border-transparent hover:border-violet-500/20"
              }`}
              title={isRecording ? "Stop voice recording" : "Dictate with voice"}
              aria-label="Voice input"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Action: Send / Stop Button */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-md shadow-red-600/30 transition-colors"
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
                disabled={(!input.trim() && activeAttachments.length === 0) || isUploading}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-violet-600/30 transition-all"
                title="Send message (Enter)"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Under-input helper hints */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 mt-1.5 select-none">
        <span>ERROREN X can make mistakes. Verify important information.</span>
        <span className="hidden sm:inline">Press Shift + Enter for new line</span>
      </div>
    </div>
  );
};
