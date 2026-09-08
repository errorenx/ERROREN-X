import React, { useState } from "react";
import { Check, Copy, Download, Code2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = "text",
  code,
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const cleanLang = language.replace(/[{}]/g, "").trim() || "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      addToast("Code copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy code", "error");
    }
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      jsx: "jsx",
      tsx: "tsx",
      html: "html",
      css: "css",
      sql: "sql",
      json: "json",
      rust: "rs",
      cpp: "cpp",
      c: "c",
      java: "java",
      bash: "sh",
      shell: "sh",
      markdown: "md",
      yaml: "yaml",
      yml: "yml",
    };

    const ext = extMap[cleanLang.toLowerCase()] || "txt";
    const filename = `erroren_x_code_${Date.now()}.${ext}`;

    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    addToast(`Downloaded as ${filename}`, "success");
  };

  const lines = code.trim().split("\n");

  return (
    <div
      className="
        my-4
        rounded-xl
        overflow-hidden
        border
        shadow-lg
        text-xs
        md:text-sm
      "
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "color-mix(in srgb, var(--accent-color) 25%, var(--border-color))",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.12), 0 0 20px rgba(var(--accent-rgb), 0.06)",
      }}
    >
      {/* Code Header Toolbar */}
      <div
        className="
          flex
          items-center
          justify-between
          px-4
          py-2
          border-b
          select-none
        "
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--bg-secondary) 88%, var(--accent-color) 12%)",
          borderColor:
            "color-mix(in srgb, var(--accent-color) 18%, var(--border-color))",
          color: "var(--text-secondary)",
        }}
      >
        {/* Language */}
        <div
          className="
            flex
            items-center
            gap-2
            font-mono
            font-medium
          "
          style={{
            color: "var(--accent-color)",
          }}
        >
          <Code2
            className="w-4 h-4"
            style={{
              color: "var(--accent-color)",
            }}
          />

          <span className="uppercase tracking-wider text-[11px] font-semibold">
            {cleanLang}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Download */}
          <button
            onClick={handleDownload}
            className="
              flex
              items-center
              gap-1
              px-2.5
              py-1
              rounded-md
              border
              border-transparent
              transition-colors
              text-xs
            "
            style={{
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-color)";
              e.currentTarget.style.backgroundColor =
                "color-mix(in srgb, var(--accent-color) 12%, transparent)";
              e.currentTarget.style.borderColor =
                "color-mix(in srgb, var(--accent-color) 25%, transparent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
            title="Download code as file"
            aria-label="Download Code"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="
              flex
              items-center
              gap-1
              px-2.5
              py-1
              rounded-md
              border
              transition-colors
              text-xs
            "
            style={{
              color: copied
                ? "#34d399"
                : "var(--text-secondary)",
              backgroundColor: copied
                ? "rgba(16,185,129,0.12)"
                : "transparent",
              borderColor: copied
                ? "rgba(16,185,129,0.30)"
                : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.color = "var(--accent-color)";
                e.currentTarget.style.backgroundColor =
                  "color-mix(in srgb, var(--accent-color) 12%, transparent)";
                e.currentTarget.style.borderColor =
                  "color-mix(in srgb, var(--accent-color) 25%, transparent)";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
            title="Copy code"
            aria-label="Copy Code"
          >
            {copied ? (
              <Check
                className="w-3.5 h-3.5"
                style={{ color: "#34d399" }}
              />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}

            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div
        className="
          p-4
          overflow-x-auto
          font-mono
          leading-relaxed
          scrollbar-thin
        "
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--bg-tertiary) 72%, var(--card-bg) 28%)",
          color: "var(--text-primary)",
        }}
      >
        <pre className="flex">
          {/* Line Numbers */}
          <div
            className="
              select-none
              text-right
              pr-4
              border-r
              shrink-0
              font-mono
              text-[11px]
              leading-relaxed
            "
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border-color)",
            }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code */}
          <code
            className="pl-4 flex-1"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};