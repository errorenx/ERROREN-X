import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../../types";
import { CodeBlock } from "./CodeBlock";
import { AttachmentPreview } from "./AttachmentPreview";
import { useToast } from "../../context/ToastContext";
import { useChat } from "../../context/ChatContext";
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Share2,
  ExternalLink,
  Globe,
  Download,
  Maximize2,
  X,
} from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast = false }) => {
  const isUser = message.role === "user";
  const { addToast } = useToast();
  const { regenerateLastMessage, setFeedback, isGenerating } = useChat();

  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech if component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      addToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy text", "error");
    }
  };

  const handleSpeechToggle = () => {
    if (!("speechSynthesis" in window)) {
      addToast("Speech synthesis is not supported on this browser", "error");
      return;
    }

    if (isPlayingAudio) {
      if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
      }
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "Visual image output.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    speechUtteranceRef.current = utterance;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Premium") ||
            v.name.includes("Samantha"))
      ) || voices[0];
    if (englishVoice) utterance.voice = englishVoice;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  const handleFeedback = (type: "like" | "dislike") => {
    if (message.feedback === type) {
      setFeedback(message.id, null as any);
    } else {
      setFeedback(message.id, type);
      addToast(type === "like" ? "Thanks for positive feedback!" : "Feedback recorded", "info");
    }
  };

  const handleShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(`ERROREN X:\n${message.content}`);
      addToast("Response copied to share", "success");
    } catch {
      addToast("Failed to share", "error");
    }
  };

  const handleDownloadImage = (src?: string) => {
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = `erroren_x_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Image downloaded", "success");
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 transition-colors ${
        isUser
          ? "bg-transparent"
          : "bg-slate-900/35 border-y border-violet-500/5"
      }`}
    >
      <div className={`max-w-4xl mx-auto flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
        {/* Assistant Avatar Badge */}
        {!isUser && (
          <div className="shrink-0 pt-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center text-white shadow-md shadow-violet-500/20 border border-violet-400/40">
              <span className="font-display font-black text-xs tracking-wider text-violet-300">X</span>
            </div>
          </div>
        )}

        {/* Message Bubble Body */}
        <div className={`flex-1 min-w-0 ${isUser ? "max-w-2xl flex flex-col items-end" : ""}`}>
          {isUser ? (
            /* User Message Bubble */
            <div className="flex flex-col items-end">
              {/* Attachments if any */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                  <AttachmentPreview attachments={message.attachments} isCompact />
                </div>
              )}
              <div className="p-4 rounded-2xl bg-violet-950/70 border border-violet-500/30 text-white text-sm md:text-[15px] leading-relaxed shadow-lg shadow-violet-950/40 whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 mr-1">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : (
            /* Assistant Message Layout */
            <div className="flex flex-col space-y-3">
              {/* Model Tag & Timestamp */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-violet-300 font-display">ERROREN X</span>
                {message.model && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-400 border border-violet-500/20 font-medium">
                    {message.model.includes("flash-lite") || message.model.includes("latest")
                      ? "Fast"
                      : message.model.includes("pro")
                      ? "Advanced"
                      : "Balanced"}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Web Grounding Sources if available */}
              {message.webSources && message.webSources.length > 0 && (
                <div className="my-2 p-3 rounded-xl bg-slate-950/60 border border-violet-500/20 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-violet-300 mb-2">
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                    <span>Sources & Search Grounding</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.webSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-violet-500/20 hover:border-violet-400 text-slate-300 hover:text-white transition-colors max-w-[240px]"
                      >
                        <ExternalLink className="w-3 h-3 text-violet-400 shrink-0" />
                        <span className="truncate">{source.title || source.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Content Area */}
              <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-[15px] leading-relaxed break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p({ children }) {
                      // Prevent <p><div> DOM nesting errors when children contain block-level elements or image wrappers
                      const hasBlockElement = React.Children.toArray(children).some((child: any) => {
                        if (!React.isValidElement(child)) return false;
                        if (typeof child.type === "string" && child.type === "div") return true;
                        if (child.props && typeof child.props === "object") {
                          if ("src" in child.props || "node" in child.props) return true;
                        }
                        return false;
                      });

                      if (hasBlockElement) {
                        return <div className="mb-3.5 last:mb-0 leading-relaxed text-slate-200">{children}</div>;
                      }
                      return <p className="mb-3.5 last:mb-0 leading-relaxed">{children}</p>;
                    },
                    img({ src, alt }) {
                      if (!src || src.trim() === "") {
                        return null;
                      }
                      return (
                        <div className="my-4 rounded-2xl overflow-hidden border border-violet-500/30 bg-slate-950/90 shadow-2xl relative group">
                          <div className="relative">
                            <img
                              src={src}
                              alt={alt || "Generated Visual"}
                              className="w-full max-h-[520px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.005] cursor-pointer"
                              referrerPolicy="no-referrer"
                              onClick={() => setPreviewImageUrl(src || null)}
                            />
                            {/* Hover Quick Zoom */}
                            <button
                              type="button"
                              onClick={() => setPreviewImageUrl(src || null)}
                              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-violet-500/30 text-slate-300 hover:text-white hover:bg-violet-950 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                              title="Expand Fullscreen"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Image Action Footer Bar */}
                          <div className="p-3 bg-slate-900/90 backdrop-blur-md border-t border-violet-500/20 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-medium text-violet-300 truncate max-w-[200px] sm:max-w-xs">
                              {alt || "ERROREN X Generated Visual"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {/* Download Button */}
                              <button
                                type="button"
                                onClick={() => handleDownloadImage(src)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-colors cursor-pointer"
                                title="Download image to your device"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>

                              {/* Regenerate Button */}
                              <button
                                type="button"
                                onClick={() => regenerateLastMessage()}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-violet-500/20 transition-colors cursor-pointer"
                                title="Regenerate this image"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Regenerate</span>
                              </button>

                              {/* Share Button */}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (navigator.share && src?.startsWith("http")) {
                                    try {
                                      await navigator.share({ title: alt || "Generated Image", url: src });
                                    } catch {}
                                  } else {
                                    try {
                                      await navigator.clipboard.writeText(src || "");
                                      addToast("Image link copied to clipboard", "success");
                                    } catch {
                                      addToast("Failed to copy image link", "error");
                                    }
                                  }
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-violet-500/20 transition-colors cursor-pointer"
                                title="Share image"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    },
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !String(children).includes("\n");

                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 rounded-md bg-violet-950/60 text-violet-300 font-mono text-xs border border-violet-500/20" {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : "text"}
                          code={String(children).replace(/\n$/, "")}
                        />
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="my-4 overflow-x-auto rounded-xl border border-violet-500/20">
                          <table className="w-full text-left text-xs md:text-sm border-collapse bg-slate-950/60">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border-b border-violet-500/20 bg-slate-900/80 px-4 py-2.5 font-semibold text-violet-200">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border-b border-violet-500/10 px-4 py-2 text-slate-300">
                          {children}
                        </td>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-2 border-violet-500 pl-4 my-3 text-slate-300 italic bg-violet-950/20 py-1 rounded-r-lg">
                          {children}
                        </blockquote>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1 pt-2 select-none text-slate-400 text-xs">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  title="Copy response"
                  aria-label="Copy Response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </button>

                {/* TTS Listen Button */}
                <button
                  onClick={handleSpeechToggle}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                    isPlayingAudio
                      ? "bg-violet-950 text-violet-300 border border-violet-500/30"
                      : "hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  title={isPlayingAudio ? (isPausedAudio ? "Resume speech" : "Pause speech") : "Listen to response"}
                  aria-label="Listen to response"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio && !isPausedAudio ? "animate-pulse text-violet-400" : ""}`} />
                  <span className="hidden sm:inline">
                    {isPlayingAudio ? (isPausedAudio ? "Resume" : "Pause") : "Listen"}
                  </span>
                </button>

                {isPlayingAudio && (
                  <button
                    onClick={handleStopSpeech}
                    className="p-1 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors"
                    title="Stop speech"
                    aria-label="Stop speech"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Regenerate (if last message) */}
                {isLast && !isGenerating && (
                  <button
                    onClick={regenerateLastMessage}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    title="Regenerate response"
                    aria-label="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>
                )}

                {/* Thumbs Up Feedback */}
                <button
                  onClick={() => handleFeedback("like")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    message.feedback === "like"
                      ? "text-emerald-400 bg-emerald-950/50"
                      : "hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  title="Good response"
                  aria-label="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                {/* Thumbs Down Feedback */}
                <button
                  onClick={() => handleFeedback("dislike")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    message.feedback === "dislike"
                      ? "text-red-400 bg-red-950/50"
                      : "hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  title="Poor response"
                  aria-label="Poor response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>

                {/* Share Message */}
                <button
                  onClick={handleShareMessage}
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  title="Share response"
                  aria-label="Share response"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Zoomed Image */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-violet-500/30 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl border border-violet-500/30 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDownloadImage(previewImageUrl)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
