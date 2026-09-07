import React from "react";
import { Attachment } from "../../types";
import { FileText, Image as ImageIcon, FileCode, FileSpreadsheet, X, Eye } from "lucide-react";

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  isCompact?: boolean;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove,
  isCompact = false,
}) => {
  if (!attachments || attachments.length === 0) return null;

  const getIcon = (type: string, name: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-violet-400" />;
    if (name.endsWith(".csv") || name.endsWith(".xlsx") || type.includes("sheet")) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    }
    if (name.endsWith(".ts") || name.endsWith(".js") || name.endsWith(".py") || name.endsWith(".json") || name.endsWith(".sql")) {
      return <FileCode className="w-4 h-4 text-amber-400" />;
    }
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${isCompact ? "mb-2" : "my-2"}`}>
      {attachments.map((att) => {
        const isImage = att.fileType.startsWith("image/") && Boolean(att.dataUrl && att.dataUrl.trim().length > 0);

        return (
          <div
            key={att.id}
            className={`group relative flex items-center gap-2.5 rounded-xl border border-violet-500/20 bg-slate-900/80 p-2 text-xs shadow-sm transition-all hover:border-violet-500/40 ${
              isCompact ? "max-w-[220px]" : "max-w-[280px]"
            }`}
          >
            {isImage ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-violet-500/20 bg-black/40">
                <img
                  src={att.dataUrl}
                  alt={att.fileName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-violet-950/60 border border-violet-500/20 flex items-center justify-center shrink-0">
                {getIcon(att.fileType, att.fileName)}
              </div>
            )}

            <div className="flex-1 min-w-0 pr-1">
              <div className="font-medium text-slate-200 truncate">{att.fileName}</div>
              <div className="text-[10px] text-slate-400">{formatSize(att.fileSize)}</div>
            </div>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(att.id)}
                className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                title="Remove attachment"
                aria-label="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
