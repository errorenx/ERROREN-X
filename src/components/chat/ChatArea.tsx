import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { ChatMessage } from "./ChatMessage";
import { EmptyChat } from "./EmptyChat";
import { AlertCircle, RotateCcw, ArrowDown, Sparkles, X, Clock } from "lucide-react";
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

  // Track generation duration to trigger the 15-second graceful notice
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && !streamingContent) {
      setGenerationDuration(0);
      timer = setInterval(() => {
        setGenerationDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setGenerationDuration(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating, streamingContent]);

  // Auto-scroll on new messages or streaming chunks
  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent, showScrollBottom]);

  // Track scroll position to show/hide scroll to bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  if (messages.length === 0 && !isGenerating && !streamingContent) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4">
        <EmptyChat onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  const isTakingLonger = isGenerating && !streamingContent && generationDuration >= 15;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-violet-950 scrollbar-track-transparent"
    >
      <div className="flex flex-col min-h-full pb-4">
        {/* Render Saved Messages */}
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            message={msg}
            isLast={index === messages.length - 1 && !isGenerating}
          />
        ))}

        {/* Live Streaming Message Container */}
        {isGenerating && (
          <div className="py-5 px-4 md:px-8 bg-slate-900/40 border-y border-violet-500/5 flex justify-start animate-fade-in">
            <div className="w-full max-w-4xl flex gap-4 justify-start">
              {/* Assistant Avatar Badge */}
              <div className="shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center text-white shadow-md shadow-violet-500/20 border border-violet-400/40">
                  <span className="font-display font-black text-xs tracking-wider text-violet-300">X</span>
                </div>
              </div>

              {/* Streaming Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-violet-300 font-display">ERROREN X</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-violet-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Streaming response</span>
                  </div>
                </div>

                {streamingContent ? (
                  <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-[15px] leading-relaxed break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
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
                      }}
                    >
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  /* Smart Thinking State */
                  <div className="space-y-3 py-1">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="font-medium">ERROREN X is thinking</span>
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-200" />
                      </span>
                    </div>

                    {/* Timeout Notice if taking >15 seconds */}
                    {isTakingLonger && (
                      <div className="p-3.5 rounded-2xl bg-violet-950/60 border border-violet-500/30 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-md">
                        <div className="flex items-center gap-2 text-violet-200">
                          <Clock className="w-4 h-4 text-violet-400 shrink-0" />
                          <span>ERROREN X is taking longer than expected.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={regenerateLastMessage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white font-medium transition-colors shadow-sm cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>
                          <button
                            onClick={stopGeneration}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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

        {/* Generation Error Banner */}
        {generationError && (
          <div className="max-w-xl mx-auto my-4 p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Response Interrupted</div>
              <div className="text-xs text-red-300/90 leading-relaxed mb-3">{generationError}</div>
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

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-violet-900/90 text-white shadow-xl border border-violet-500/40 hover:bg-violet-800 transition-all cursor-pointer"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
