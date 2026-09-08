import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { ChatMessage } from "./ChatMessage";
import { EmptyChat } from "./EmptyChat";
import {
  AlertCircle,
  RotateCcw,
  ArrowDown,
  Sparkles,
  X,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface ChatAreaProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onSelectPrompt }) => {
  const {
    messages,
    isGenerating,
    streamingContent,
    streamingSources,
    selectedModel,
    generationError,
    regenerateLastMessage,
    stopGeneration,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [generationDuration, setGenerationDuration] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isGenerating && !streamingContent) {
      setGenerationDuration(0);

      timer = setInterval(() => {
        setGenerationDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setGenerationDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating, streamingContent]);

  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, streamingContent, showScrollBottom]);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const {
      scrollTop,
      scrollHeight,
      clientHeight,
    } = containerRef.current;

    const isScrolledUp =
      scrollHeight - scrollTop - clientHeight > 150;

    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    setShowScrollBottom(false);
  };

  if (
    messages.length === 0 &&
    !isGenerating &&
    !streamingContent
  ) {
    return (
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4"
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <EmptyChat onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  const isTakingLonger =
    isGenerating &&
    !streamingContent &&
    generationDuration >= 15;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto relative"
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="flex flex-col min-h-full pb-4">
        {/* Saved Messages */}
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            message={msg}
            isLast={
              index === messages.length - 1 &&
              !isGenerating
            }
          />
        ))}

        {/* Live Streaming Message */}
        {isGenerating && (
          <div
            className="py-5 px-4 md:px-8 border-y animate-fade-in"
            style={{
              background:
                "color-mix(in srgb, var(--bg-secondary) 72%, transparent)",
              borderColor:
                "rgba(var(--accent-rgb), 0.10)",
            }}
          >
            <div className="w-full max-w-4xl flex gap-4 justify-start">
              {/* Assistant Avatar */}
              <div className="shrink-0 pt-0.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md border"
                  style={{
                    background:
                      "linear-gradient(to bottom, var(--bg-tertiary), var(--bg-primary), var(--bg-tertiary))",
                    color: "var(--accent-color)",
                    borderColor:
                      "rgba(var(--accent-rgb), 0.40)",
                    boxShadow:
                      "0 4px 14px rgba(var(--accent-rgb), 0.18)",
                  }}
                >
                  <span className="font-display font-black text-xs tracking-wider">
                    X
                  </span>
                </div>
              </div>

              {/* Streaming Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    className="font-semibold font-display"
                    style={{
                      color: "var(--accent-color)",
                    }}
                  >
                    ERROREN X
                  </span>

                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{
                      color: "var(--accent-color)",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Streaming response</span>
                  </div>
                </div>

                {streamingContent ? (
                  <div
                    className="prose max-w-none text-sm md:text-[15px] leading-relaxed break-words"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
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
                            !String(children).includes("\n");

                          if (isInline) {
                            return (
                              <code
                                className="px-1.5 py-0.5 rounded-md font-mono text-xs border"
                                style={{
                                  background:
                                    "rgba(var(--accent-rgb), 0.12)",
                                  color:
                                    "var(--accent-color)",
                                  borderColor:
                                    "rgba(var(--accent-rgb), 0.20)",
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
                      }}
                    >
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  /* Thinking State */
                  <div className="space-y-3 py-1">
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span className="font-medium">
                        ERROREN X is thinking
                      </span>

                      <span className="inline-flex gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{
                            background:
                              "var(--accent-color)",
                          }}
                        />

                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce delay-100"
                          style={{
                            background:
                              "var(--accent-color)",
                          }}
                        />

                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce delay-200"
                          style={{
                            background:
                              "var(--accent-color)",
                          }}
                        />
                      </span>
                    </div>

                    {/* Timeout Notice */}
                    {isTakingLonger && (
                      <div
                        className="p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-md"
                        style={{
                          background:
                            "rgba(var(--accent-rgb), 0.10)",
                          borderColor:
                            "rgba(var(--accent-rgb), 0.30)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <div
                          className="flex items-center gap-2"
                          style={{
                            color: "var(--accent-color)",
                          }}
                        >
                          <Clock className="w-4 h-4 shrink-0" />

                          <span>
                            ERROREN X is taking longer
                            than expected.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={regenerateLastMessage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-medium transition-colors shadow-sm cursor-pointer"
                            style={{
                              background:
                                "var(--accent-color)",
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>

                          <button
                            onClick={stopGeneration}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                            style={{
                              background:
                                "var(--bg-tertiary)",
                              color:
                                "var(--text-secondary)",
                              border:
                                "1px solid rgba(var(--accent-rgb), 0.15)",
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generation Error */}
        {generationError && (
          <div className="max-w-xl mx-auto my-4 p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />

            <div className="flex-1">
              <div className="font-semibold mb-1">
                Response Interrupted
              </div>

              <div className="text-xs text-red-300/90 leading-relaxed mb-3">
                {generationError}
              </div>

              <button
                onClick={regenerateLastMessage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        <div
          ref={messagesEndRef}
          className="h-4"
        />
      </div>

      {/* Scroll to Bottom */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-30 flex items-center justify-center w-10 h-10 rounded-full text-white shadow-xl border transition-all cursor-pointer"
          style={{
            background:
              "color-mix(in srgb, var(--accent-color) 82%, transparent)",
            borderColor:
              "rgba(var(--accent-rgb), 0.45)",
            boxShadow:
              "0 10px 30px rgba(var(--accent-rgb), 0.25)",
          }}
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};