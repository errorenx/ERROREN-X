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

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast = false,
}) => {
  const isUser = message.role === "user";

  const { addToast } = useToast();
  const { regenerateLastMessage, setFeedback, isGenerating } = useChat();

  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      addToast("Failed to copy text", "error");
    }
  };

  const handleSpeechToggle = () => {
    if (!("speechSynthesis" in window)) {
      addToast(
        "Speech synthesis is not supported on this browser",
        "error"
      );
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

    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "Visual image output.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    const utterance = new SpeechSynthesisUtterance(cleanText);

    speechUtteranceRef.current = utterance;

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

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;

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

      addToast(
        type === "like"
          ? "Thanks for positive feedback!"
          : "Feedback recorded",
        "info"
      );
    }
  };

  const handleShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(
        `ERROREN X:\n${message.content}`
      );

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
      className="py-5 px-4 md:px-8 transition-colors"
      style={{
        background: isUser
          ? "transparent"
          : "color-mix(in srgb, var(--bg-secondary) 55%, transparent)",
        borderTop: isUser
          ? "none"
          : "1px solid rgba(var(--accent-rgb), 0.05)",
        borderBottom: isUser
          ? "none"
          : "1px solid rgba(var(--accent-rgb), 0.05)",
      }}
    >
      <div
        className={`max-w-4xl mx-auto flex gap-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* Assistant Avatar */}
        {!isUser && (
          <div className="shrink-0 pt-0.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{
                background:
                  "linear-gradient(to bottom, var(--bg-tertiary), var(--bg-primary), var(--bg-tertiary))",
                color: "var(--text-primary)",
                border: "1px solid rgba(var(--accent-rgb), 0.4)",
                boxShadow:
                  "0 4px 12px rgba(var(--accent-rgb), 0.2)",
              }}
            >
              <span
                className="font-display font-black text-xs tracking-wider"
                style={{ color: "var(--accent-color)" }}
              >
                X
              </span>
            </div>
          </div>
        )}

        {/* Message Body */}
        <div
          className={`flex-1 min-w-0 ${
            isUser ? "max-w-2xl flex flex-col items-end" : ""
          }`}
        >
          {isUser ? (
            <div className="flex flex-col items-end">
              {/* Attachments */}
              {message.attachments &&
                message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-end">
                    <AttachmentPreview
                      attachments={message.attachments}
                      isCompact
                    />
                  </div>
                )}

              {/* User Message */}
              <div
                className="p-4 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-lg whitespace-pre-wrap break-words"
                style={{
                  background:
                    "rgba(var(--accent-rgb), 0.16)",
                  border:
                    "1px solid rgba(var(--accent-rgb), 0.3)",
                  color: "var(--text-primary)",
                  boxShadow:
                    "0 10px 25px rgba(var(--accent-rgb), 0.12)",
                }}
              >
                {message.content}
              </div>

              <span
                className="text-[10px] mt-1 mr-1"
                style={{ color: "var(--text-muted)" }}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {/* Model + Timestamp */}
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="font-semibold font-display"
                  style={{ color: "var(--accent-color)" }}
                >
                  ERROREN X
                </span>

                {message.model && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background:
                        "rgba(var(--accent-rgb), 0.12)",
                      color: "var(--accent-color)",
                      border:
                        "1px solid rgba(var(--accent-rgb), 0.2)",
                    }}
                  >
                    {message.model.includes("flash-lite") ||
                    message.model.includes("latest")
                      ? "Fast"
                      : message.model.includes("pro")
                      ? "Advanced"
                      : "Balanced"}
                  </span>
                )}

                <span
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {new Date(
                    message.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Web Sources */}
              {message.webSources &&
                message.webSources.length > 0 && (
                  <div
                    className="my-2 p-3 rounded-xl text-xs"
                    style={{
                      background:
                        "rgba(var(--accent-rgb), 0.05)",
                      border:
                        "1px solid rgba(var(--accent-rgb), 0.2)",
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5 font-medium mb-2"
                      style={{
                        color: "var(--accent-color)",
                      }}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>
                        Sources & Search Grounding
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {message.webSources.map(
                        (source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors max-w-[240px]"
                            style={{
                              background:
                                "var(--bg-tertiary)",
                              border:
                                "1px solid rgba(var(--accent-rgb), 0.2)",
                              color:
                                "var(--text-secondary)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--accent-color)";
                              e.currentTarget.style.color =
                                "var(--text-primary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "rgba(var(--accent-rgb), 0.2)";
                              e.currentTarget.style.color =
                                "var(--text-secondary)";
                            }}
                          >
                            <ExternalLink
                              className="w-3 h-3 shrink-0"
                              style={{
                                color:
                                  "var(--accent-color)",
                              }}
                            />

                            <span className="truncate">
                              {source.title ||
                                source.url}
                            </span>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Markdown Content */}
              <div
                className="prose prose-invert max-w-none text-sm md:text-[15px] leading-relaxed break-words"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p({ children }) {
                      const hasBlockElement =
                        React.Children.toArray(
                          children
                        ).some((child: any) => {
                          if (!React.isValidElement(child)) {
                            return false;
                          }

                          if (
                            typeof child.type ===
                              "string" &&
                            child.type === "div"
                          ) {
                            return true;
                          }

                          if (
                            child.props &&
                            typeof child.props ===
                              "object"
                          ) {
                            if (
                              "src" in child.props ||
                              "node" in child.props
                            ) {
                              return true;
                            }
                          }

                          return false;
                        });

                      if (hasBlockElement) {
                        return (
                          <div
                            className="mb-3.5 last:mb-0 leading-relaxed"
                            style={{
                              color:
                                "var(--text-primary)",
                            }}
                          >
                            {children}
                          </div>
                        );
                      }

                      return (
                        <p className="mb-3.5 last:mb-0 leading-relaxed">
                          {children}
                        </p>
                      );
                    },

                    img({ src, alt }) {
                      if (!src || src.trim() === "") {
                        return null;
                      }

                      return (
                        <div
                          className="my-4 rounded-2xl overflow-hidden shadow-2xl relative group"
                          style={{
                            border:
                              "1px solid rgba(var(--accent-rgb), 0.3)",
                            background:
                              "var(--bg-primary)",
                          }}
                        >
                          <div className="relative">
                            <img
                              src={src}
                              alt={
                                alt ||
                                "Generated Visual"
                              }
                              className="w-full max-h-[520px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.005] cursor-pointer"
                              referrerPolicy="no-referrer"
                              onClick={() =>
                                setPreviewImageUrl(
                                  src || null
                                )
                              }
                            />

                            {/* Zoom */}
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImageUrl(
                                  src || null
                                )
                              }
                              className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                              style={{
                                background:
                                  "rgba(var(--accent-rgb), 0.12)",
                                border:
                                  "1px solid rgba(var(--accent-rgb), 0.3)",
                                color:
                                  "var(--text-secondary)",
                              }}
                              title="Expand Fullscreen"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Image Footer */}
                          <div
                            className="p-3 backdrop-blur-md border-t flex flex-wrap items-center justify-between gap-2"
                            style={{
                              background:
                                "var(--bg-secondary)",
                              borderColor:
                                "rgba(var(--accent-rgb), 0.2)",
                            }}
                          >
                            <span
                              className="text-[11px] font-medium truncate max-w-[200px] sm:max-w-xs"
                              style={{
                                color:
                                  "var(--accent-color)",
                              }}
                            >
                              {alt ||
                                "ERROREN X Generated Visual"}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Download */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadImage(
                                    src
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                                style={{
                                  background:
                                    "var(--accent-color)",
                                }}
                                title="Download image to your device"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>
                                  Download
                                </span>
                              </button>

                              {/* Regenerate */}
                              <button
                                type="button"
                                onClick={() =>
                                  regenerateLastMessage()
                                }
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                style={{
                                  background:
                                    "var(--bg-tertiary)",
                                  color:
                                    "var(--text-primary)",
                                  border:
                                    "1px solid rgba(var(--accent-rgb), 0.2)",
                                }}
                                title="Regenerate this image"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                  Regenerate
                                </span>
                              </button>

                              {/* Share */}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    navigator.share &&
                                    src?.startsWith(
                                      "http"
                                    )
                                  ) {
                                    try {
                                      await navigator.share(
                                        {
                                          title:
                                            alt ||
                                            "Generated Image",
                                          url: src,
                                        }
                                      );
                                    } catch {}
                                  } else {
                                    try {
                                      await navigator.clipboard.writeText(
                                        src || ""
                                      );

                                      addToast(
                                        "Image link copied to clipboard",
                                        "success"
                                      );
                                    } catch {
                                      addToast(
                                        "Failed to copy image link",
                                        "error"
                                      );
                                    }
                                  }
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                style={{
                                  background:
                                    "var(--bg-tertiary)",
                                  color:
                                    "var(--text-primary)",
                                  border:
                                    "1px solid rgba(var(--accent-rgb), 0.2)",
                                }}
                                title="Share image"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                  Share
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    },

                    code({
                      node,
                      className,
                      children,
                      ...props
                    }) {
                      const match =
                        /language-(\w+)/.exec(
                          className || ""
                        );

                      const isInline =
                        !match &&
                        !String(children).includes(
                          "\n"
                        );

                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 rounded-md font-mono text-xs"
                            style={{
                              background:
                                "rgba(var(--accent-rgb), 0.1)",
                              color:
                                "var(--accent-color)",
                              border:
                                "1px solid rgba(var(--accent-rgb), 0.2)",
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={
                            match
                              ? match[1]
                              : "text"
                          }
                          code={String(children).replace(
                            /\n$/,
                            ""
                          )}
                        />
                      );
                    },

                    table({ children }) {
                      return (
                        <div
                          className="my-4 overflow-x-auto rounded-xl"
                          style={{
                            border:
                              "1px solid rgba(var(--accent-rgb), 0.2)",
                          }}
                        >
                          <table
                            className="w-full text-left text-xs md:text-sm border-collapse"
                            style={{
                              background:
                                "var(--bg-secondary)",
                            }}
                          >
                            {children}
                          </table>
                        </div>
                      );
                    },

                    th({ children }) {
                      return (
                        <th
                          className="border-b px-4 py-2.5 font-semibold"
                          style={{
                            borderColor:
                              "rgba(var(--accent-rgb), 0.2)",
                            background:
                              "var(--bg-tertiary)",
                            color:
                              "var(--accent-color)",
                          }}
                        >
                          {children}
                        </th>
                      );
                    },

                    td({ children }) {
                      return (
                        <td
                          className="border-b px-4 py-2"
                          style={{
                            borderColor:
                              "rgba(var(--accent-rgb), 0.1)",
                            color:
                              "var(--text-secondary)",
                          }}
                        >
                          {children}
                        </td>
                      );
                    },

                    blockquote({ children }) {
                      return (
                        <blockquote
                          className="border-l-2 pl-4 my-3 italic py-1 rounded-r-lg"
                          style={{
                            borderColor:
                              "var(--accent-color)",
                            color:
                              "var(--text-secondary)",
                            background:
                              "rgba(var(--accent-rgb), 0.06)",
                          }}
                        >
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
                          className="underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
                          style={{
                            color:
                              "var(--accent-color)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity =
                              "0.75";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity =
                              "1";
                          }}
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
              <div
                className="flex items-center gap-1 pt-2 select-none text-xs"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--bg-tertiary)";
                    e.currentTarget.style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "transparent";
                    e.currentTarget.style.color =
                      "var(--text-secondary)";
                  }}
                  title="Copy response"
                  aria-label="Copy Response"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span className="hidden sm:inline">
                    {copied ? "Copied" : "Copy"}
                  </span>
                </button>

                {/* Listen */}
                <button
                  onClick={handleSpeechToggle}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                  style={{
                    background: isPlayingAudio
                      ? "rgba(var(--accent-rgb), 0.12)"
                      : "transparent",
                    color: isPlayingAudio
                      ? "var(--accent-color)"
                      : "var(--text-secondary)",
                    border: isPlayingAudio
                      ? "1px solid rgba(var(--accent-rgb), 0.3)"
                      : "1px solid transparent",
                  }}
                  title={
                    isPlayingAudio
                      ? isPausedAudio
                        ? "Resume speech"
                        : "Pause speech"
                      : "Listen to response"
                  }
                  aria-label="Listen to response"
                >
                  <Volume2
                    className={`w-3.5 h-3.5 ${
                      isPlayingAudio &&
                      !isPausedAudio
                        ? "animate-pulse"
                        : ""
                    }`}
                    style={{
                      color: isPlayingAudio
                        ? "var(--accent-color)"
                        : undefined,
                    }}
                  />

                  <span className="hidden sm:inline">
                    {isPlayingAudio
                      ? isPausedAudio
                        ? "Resume"
                        : "Pause"
                      : "Listen"}
                  </span>
                </button>

                {/* Stop Speech */}
                {isPlayingAudio && (
                  <button
                    onClick={handleStopSpeech}
                    className="p-1 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                    title="Stop speech"
                    aria-label="Stop speech"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Regenerate */}
                {isLast && !isGenerating && (
                  <button
                    onClick={regenerateLastMessage}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                    style={{
                      color:
                        "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.color =
                        "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "transparent";
                      e.currentTarget.style.color =
                        "var(--text-secondary)";
                    }}
                    title="Regenerate response"
                    aria-label="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5" />

                    <span className="hidden sm:inline">
                      Regenerate
                    </span>
                  </button>
                )}

                {/* Like */}
                <button
                  onClick={() =>
                    handleFeedback("like")
                  }
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    color:
                      message.feedback === "like"
                        ? "#34d399"
                        : "var(--text-secondary)",
                    background:
                      message.feedback === "like"
                        ? "rgba(16, 185, 129, 0.12)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      message.feedback !== "like"
                    ) {
                      e.currentTarget.style.background =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.color =
                        "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      message.feedback !== "like"
                    ) {
                      e.currentTarget.style.background =
                        "transparent";
                      e.currentTarget.style.color =
                        "var(--text-secondary)";
                    }
                  }}
                  title="Good response"
                  aria-label="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                {/* Dislike */}
                <button
                  onClick={() =>
                    handleFeedback("dislike")
                  }
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    color:
                      message.feedback === "dislike"
                        ? "#f87171"
                        : "var(--text-secondary)",
                    background:
                      message.feedback === "dislike"
                        ? "rgba(239, 68, 68, 0.12)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      message.feedback !==
                      "dislike"
                    ) {
                      e.currentTarget.style.background =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.color =
                        "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      message.feedback !==
                      "dislike"
                    ) {
                      e.currentTarget.style.background =
                        "transparent";
                      e.currentTarget.style.color =
                        "var(--text-secondary)";
                    }
                  }}
                  title="Poor response"
                  aria-label="Poor response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>

                {/* Share */}
                <button
                  onClick={handleShareMessage}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    color:
                      "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--bg-tertiary)";
                    e.currentTarget.style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "transparent";
                    e.currentTarget.style.color =
                      "var(--text-secondary)";
                  }}
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

      {/* Image Lightbox */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() =>
            setPreviewImageUrl(null)
          }
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              onClick={() =>
                setPreviewImageUrl(null)
              }
              className="absolute -top-12 right-0 p-2 rounded-full transition-colors cursor-pointer"
              style={{
                background:
                  "rgba(var(--accent-rgb), 0.12)",
                color: "var(--text-primary)",
                border:
                  "1px solid rgba(var(--accent-rgb), 0.3)",
              }}
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl"
              style={{
                border:
                  "1px solid rgba(var(--accent-rgb), 0.3)",
              }}
              referrerPolicy="no-referrer"
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleDownloadImage(
                    previewImageUrl
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition-colors cursor-pointer"
                style={{
                  background:
                    "var(--accent-color)",
                }}
              >
                <Download className="w-4 h-4" />

                <span>
                  Download High-Res Image
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};