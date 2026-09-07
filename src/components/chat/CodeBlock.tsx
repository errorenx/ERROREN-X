import React, { useState } from "react";
import { Check, Copy, Download, Code2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "text", code }) => {
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

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
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
    <div className="my-4 rounded-xl overflow-hidden border border-violet-500/20 bg-slate-950/90 shadow-lg text-xs md:text-sm">
      {/* Code Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-violet-500/10 text-slate-400 select-none">
        <div className="flex items-center gap-2 font-mono font-medium text-violet-300">
          <Code2 className="w-4 h-4 text-violet-400" />
          <span className="uppercase tracking-wider text-[11px] font-semibold">{cleanLang}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-violet-950/60 border border-transparent hover:border-violet-500/20 transition-colors text-xs"
            title="Download code as file"
            aria-label="Download Code"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors text-xs border ${
              copied
                ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                : "text-slate-300 hover:text-white hover:bg-violet-950/60 border-transparent hover:border-violet-500/20"
            }`}
            title="Copy code"
            aria-label="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto font-mono text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-violet-950 scrollbar-track-transparent">
        <pre className="flex">
          <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 shrink-0 font-mono text-[11px] leading-relaxed">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code className="pl-4 flex-1">{code}</code>
        </pre>
      </div>
    </div>
  );
};
