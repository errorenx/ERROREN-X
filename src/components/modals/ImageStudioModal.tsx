import React, { useState, useRef, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useChat } from "../../context/ChatContext";
import {
  X,
  Palette,
  Sparkles,
  Download,
  Send,
  Loader2,
  Upload,
  Wand2,
  Sliders,
  Layers,
  Check,
  Copy,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryItem {
  id: string;
  userId: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  aspectRatio: string;
  provider: string;
  model: string;
  imageUrl: string;
  generationType: "text_to_image" | "image_edit";
  referenceImage?: string;
  editInstructions?: string;
  createdAt: string;
}

// 18 Full Production Artistic Rendering Styles
const ARTISTIC_STYLES_LIST = [
  { name: "Photorealistic", desc: "Authentic 8k camera photography", color: "from-blue-600 to-cyan-600" },
  { name: "Cinematic", desc: "70mm IMAX cinematic film still", color: "from-amber-600 to-orange-600" },
  { name: "Anime", desc: "Crisp modern Japanese anime aesthetic", color: "from-pink-600 to-rose-600" },
  { name: "3D", desc: "Octane 3D digital CGI render", color: "from-indigo-600 to-violet-600" },
  { name: "Digital Art", desc: "ArtStation trending concept painting", color: "from-purple-600 to-fuchsia-600" },
  { name: "Oil Painting", desc: "Classical fine art on textured linen", color: "from-amber-700 to-yellow-800" },
  { name: "Watercolor", desc: "Fluid watercolor washes and pigments", color: "from-teal-600 to-emerald-600" },
  { name: "Sketch", desc: "Expressive charcoal and graphite strokes", color: "from-zinc-600 to-slate-700" },
  { name: "Pencil Art", desc: "Fine 2B/6B graphite pencil drawing", color: "from-slate-600 to-zinc-800" },
  { name: "Cartoon", desc: "Bold ink animated cartoon styling", color: "from-yellow-500 to-orange-500" },
  { name: "Fantasy", desc: "Mystical high fantasy with magical glow", color: "from-violet-600 to-purple-800" },
  { name: "Dark Fantasy", desc: "Grim gothic obsidian & crimson mood", color: "from-purple-950 to-slate-900" },
  { name: "Cyberpunk", desc: "Neon cyan & magenta dystopian city", color: "from-cyan-500 to-fuchsia-600" },
  { name: "Minimalist", desc: "Modern Swiss geometry & negative space", color: "from-slate-700 to-slate-900" },
  { name: "Vintage", desc: "1970s analog 35mm film grain & sepia", color: "from-orange-800 to-amber-900" },
  { name: "Surreal", desc: "Dreamlike surrealist fine art", color: "from-teal-700 to-indigo-800" },
  { name: "Fashion", desc: "Vogue editorial high-fashion flash", color: "from-rose-600 to-pink-700" },
  { name: "Illustration", desc: "Refined contemporary editorial art", color: "from-blue-700 to-indigo-700" },
];

const ASPECT_RATIOS = [
  { label: "1:1 Square", value: "1:1", desc: "Profile / Avatar / Feed" },
  { label: "16:9 Landscape", value: "16:9", desc: "Desktop / Wallpaper" },
  { label: "9:16 Portrait", value: "9:16", desc: "Story / Mobile View" },
  { label: "4:3 Standard", value: "4:3", desc: "Editorial / Classic" },
  { label: "3:4 Vertical", value: "3:4", desc: "Art / Poster Layout" },
];

const PROMPT_INSPIRATIONS = [
  "Create a unique dark profile picture with the name Noor, elegant and mysterious",
  "A majestic cybernetic lion with glowing violet neon lines on dark chrome pedestal, 8k",
  "Futuristic electric supercar speeding through rain-soaked Tokyo with holographic neon signs",
  "Minimalist luxury brand emblem with the text 'ERROREN X' carved in matte obsidian",
  "Surreal cosmic library floating in a nebula with glowing stars between ancient bookshelves",
];

const EDIT_PRESETS = [
  "Change only the background to a beautiful snowy mountain at sunrise",
  "Change the background to a dark moody gothic forest with silver moonlight",
  "Add stylish cyberpunk neon sunglasses and atmospheric twilight lighting",
  "Change the person's clothing to a sleek black tailored futuristic suit",
  "Convert the background into a vibrant sunset beach with golden water reflections",
];

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const { addAttachment } = useChat();

  const [activeTab, setActiveTab] = useState<"generate" | "edit" | "history">("generate");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("Photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageRendering, setIsImageRendering] = useState(false);
  const [currentResultMetadata, setCurrentResultMetadata] = useState<{
    model?: string;
    style?: string;
    revisedPrompt?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Photo Editing state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "text_to_image" | "image_edit">("all");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Load history when tab is opened
  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.getImageHistory(100);
      if (res?.history) {
        setHistoryItems(res.history);
      }
    } catch (err: any) {
      console.warn("Could not fetch image history:", err?.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast("Please upload an image file (PNG, JPG, WEBP)", "error");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      addToast("Image size must be under 15MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setGeneratedImage(null);
      setCurrentResultMetadata(null);
      addToast("Reference photo loaded. Enter edit instructions below.", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePrompt = activeTab === "edit" ? editPrompt.trim() : prompt.trim();
    if (!effectivePrompt || isGenerating) return;

    if (activeTab === "edit" && !uploadedImage) {
      addToast("Please upload a reference photo to edit first.", "error");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setCurrentResultMetadata(null);

    try {
      const res = await api.generateImageStudio({
        prompt: effectivePrompt,
        aspectRatio,
        style,
        inputImage: activeTab === "edit" ? uploadedImage || undefined : undefined,
        mode: activeTab === "edit" ? "edit" : "generate",
      });

      if (res?.imageUrl) {
        setIsImageRendering(true);
        setGeneratedImage(res.imageUrl);
        setCurrentResultMetadata({
          model: res.model,
          style: res.style || style,
          revisedPrompt: res.revisedPrompt,
        });

        addToast(
          activeTab === "edit"
            ? "Photo edited and saved to history!"
            : "Image generated and saved to history!",
          "success"
        );
      } else {
        throw new Error("No image data returned from generator.");
      }
    } catch (err: any) {
      addToast(err.message || "Image generation failed. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const fakeEvt = { preventDefault: () => {} } as React.FormEvent;
    handleGenerateOrEdit(fakeEvt);
  };

  const handleDownload = async (imgUrl?: string, customName?: string) => {
    const targetUrl = imgUrl || generatedImage;
    if (!targetUrl) return;
    try {
      const filename = customName || `erroren_x_${Date.now()}.png`;
      if (targetUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = targetUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const resp = await fetch(targetUrl);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      }
      addToast("Image saved to your device", "success");
    } catch {
      window.open(targetUrl, "_blank");
      addToast("Opened image in new tab", "info");
    }
  };

  const handleCopy = async (imgUrl?: string) => {
    const targetUrl = imgUrl || generatedImage;
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast("Image data copied to clipboard", "success");
    } catch {
      addToast("Could not copy image data", "error");
    }
  };

  const handleSendToChat = (imgUrl?: string, promptText?: string) => {
    const targetUrl = imgUrl || generatedImage;
    if (!targetUrl) return;
    addAttachment({
      id: `img_${Date.now()}`,
      fileName: `erroren_x_${Date.now()}.png`,
      fileType: "image/png",
      fileSize: 1024 * 120,
      dataUrl: targetUrl,
    });
    addToast("Image attached to current chat conversation", "success");
    onClose();
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await api.deleteImageHistory(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
      }
      addToast("Image removed from history", "info");
    } catch {
      addToast("Failed to delete record", "error");
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your generation history?")) return;
    try {
      await api.clearImageHistory();
      setHistoryItems([]);
      setSelectedHistoryItem(null);
      addToast("Generation history cleared", "info");
    } catch {
      addToast("Failed to clear history", "error");
    }
  };

  const filteredHistory = historyItems.filter((item) => {
    if (historyFilter === "all") return true;
    return item.generationType === historyFilter;
  });

  return (
    <div
      id="image-studio-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        id="image-studio-modal-container"
        className="relative w-full max-w-5xl max-h-[94vh] rounded-3xl bg-slate-950 border border-violet-500/25 shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-600/25">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>ERROREN X AI Image Studio</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-500/30 font-semibold tracking-wider uppercase">
                  Multimodal Core
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Precision prompt synthesis, multi-style rendering & reference photo editing
              </p>
            </div>
          </div>
          <button
            id="close-image-studio-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-violet-500/15 px-6 pt-3 bg-slate-950 gap-2">
          <button
            id="tab-generate-from-text"
            onClick={() => setActiveTab("generate")}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "generate"
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate from Prompt</span>
          </button>

          <button
            id="tab-photo-editor"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "edit"
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Photo Editor (Upload & Edit)</span>
          </button>

          <button
            id="tab-generation-history"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Generation History</span>
            {historyItems.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-900/80 text-violet-200 font-mono">
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-violet-950">
          {activeTab !== "history" ? (
            <form onSubmit={handleGenerateOrEdit} className="space-y-6">
              {/* Tab 1: Text-to-Image */}
              {activeTab === "generate" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <span>Prompt Instructions</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Multilingual • English, Urdu, Roman Urdu & Hindi
                      </span>
                    </div>
                    <textarea
                      id="image-prompt-input"
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to create in detail. You can include exact names, colors, lighting, subjects, and text (e.g., 'Create a unique dark profile picture with the name Noor, elegant and mysterious')..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400 placeholder:text-slate-500 leading-relaxed resize-none shadow-inner"
                      required
                    />
                  </div>

                  {/* Inspirations */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span>Click to Try Prompt Inspirations:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PROMPT_INSPIRATIONS.map((insp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPrompt(insp)}
                          className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-violet-950/60 border border-violet-500/15 text-slate-300 hover:text-violet-200 text-left transition-colors cursor-pointer truncate max-w-full"
                        >
                          {insp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: AI Photo Editor */}
              {activeTab === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Reference Photo to Preserve & Edit
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />

                    {uploadedImage ? (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-violet-500/30">
                        <img
                          src={uploadedImage}
                          alt="Uploaded Reference"
                          className="w-24 h-24 rounded-xl object-cover border border-violet-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white">Reference Photo Attached</div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            The subject, identity, and facial proportions will be preserved by Vision AI
                            while executing your requested background or styling edits.
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline font-medium cursor-pointer"
                          >
                            Replace Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-8 rounded-2xl bg-slate-900/60 border-2 border-dashed border-violet-500/30 hover:border-violet-400 hover:bg-slate-900 transition-all text-center cursor-pointer group"
                      >
                        <Upload className="w-9 h-9 text-violet-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-semibold text-slate-200">
                          Click to upload photo or drag & drop here
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP up to 15MB</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-violet-400" />
                        <span>Modification Instructions</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Describe changes while keeping the subject intact
                      </span>
                    </div>
                    <textarea
                      id="image-edit-prompt-input"
                      rows={2}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. 'Change only the background to a beautiful snowy mountain at sunrise, keep the person exactly identical'..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-400 placeholder:text-slate-500 leading-relaxed resize-none shadow-inner"
                      required
                    />
                  </div>

                  {/* Edit Presets */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                      <Wand2 className="w-3 h-3 text-violet-400" />
                      <span>Quick Edit Presets:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {EDIT_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditPrompt(preset)}
                          className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-violet-950/60 border border-violet-500/15 text-slate-300 hover:text-violet-200 text-left transition-colors cursor-pointer truncate max-w-full"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Shared Controls: 18 Artistic Styles & Aspect Ratio */}
              <div className="pt-4 border-t border-violet-500/15 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-violet-400" />
                      <span>Artistic Rendering Style ({ARTISTIC_STYLES_LIST.length} Styles)</span>
                    </label>
                    <span className="text-[11px] text-violet-400 font-mono">Selected: {style}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {ARTISTIC_STYLES_LIST.map((s) => {
                      const isSelected = style === s.name;
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setStyle(s.name)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-violet-950/80 border-violet-400 shadow-md shadow-violet-950/60 text-white"
                              : "bg-slate-900/60 border-violet-500/15 text-slate-300 hover:border-violet-500/40 hover:bg-slate-900"
                          }`}
                        >
                          <div className="text-xs font-bold truncate flex items-center justify-between">
                            <span>{s.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 leading-tight">
                            {s.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span>Canvas Aspect Ratio</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ASPECT_RATIOS.map((ar) => {
                      const isSelected = aspectRatio === ar.value;
                      return (
                        <button
                          key={ar.value}
                          type="button"
                          onClick={() => setAspectRatio(ar.value)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-violet-950 border-violet-400 text-white font-bold shadow-md shadow-violet-950/50"
                              : "bg-slate-900/60 border-violet-500/15 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-semibold">{ar.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ar.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-image-studio-action"
                type="submit"
                disabled={
                  isGenerating ||
                  (activeTab === "generate" ? !prompt.trim() : !editPrompt.trim() || !uploadedImage)
                }
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {activeTab === "edit"
                        ? "Analyzing reference & synthesizing photo edits..."
                        : "Synthesizing full-resolution visual in " + style + " style..."}
                    </span>
                  </>
                ) : (
                  <>
                    {activeTab === "edit" ? <Wand2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>{activeTab === "edit" ? "Render AI Photo Edits" : "Generate Artwork"}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Tab 3: History View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-violet-500/15">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Filter:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setHistoryFilter("all")}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        historyFilter === "all"
                          ? "bg-violet-600 text-white font-semibold"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      All ({historyItems.length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter("text_to_image")}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        historyFilter === "text_to_image"
                          ? "bg-violet-600 text-white font-semibold"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Generations
                    </button>
                    <button
                      onClick={() => setHistoryFilter("image_edit")}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        historyFilter === "image_edit"
                          ? "bg-violet-600 text-white font-semibold"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Photo Edits
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchHistory}
                    disabled={isLoadingHistory}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>

                  {historyItems.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="p-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs flex items-center gap-1 border border-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {isLoadingHistory ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                  <div className="text-xs">Loading generation records from database...</div>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
                  <div className="text-sm font-semibold text-slate-300">No Image Generations Yet</div>
                  <div className="text-xs text-slate-500">
                    Use the 'Generate from Prompt' or 'AI Photo Editor' tabs to create artwork.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl overflow-hidden bg-slate-900/90 border border-violet-500/20 hover:border-violet-500/50 transition-all flex flex-col"
                    >
                      <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-violet-300 font-semibold border border-violet-500/30">
                            {item.style}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-300 font-mono">
                            {item.aspectRatio}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <p className="text-xs text-slate-200 line-clamp-2 leading-snug">{item.prompt}</p>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className="font-mono text-slate-400">{item.model}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-violet-500/10">
                          <button
                            title="Download Image"
                            onClick={() => handleDownload(item.imageUrl, `erroren_x_${item.id}.png`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Send to Current Chat"
                            onClick={() => handleSendToChat(item.imageUrl, item.prompt)}
                            className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Record"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated Result Preview (when generated) */}
          {generatedImage && activeTab !== "history" && (
            <div className="space-y-4 pt-4 border-t border-violet-500/20 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    {activeTab === "edit" ? "AI Edited Visual Result" : "Generated Artwork Result"}
                  </span>
                </div>
                {currentResultMetadata?.model && (
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2.5 py-0.5 rounded-md border border-violet-500/20">
                    {currentResultMetadata.model} • {style}
                  </span>
                )}
              </div>

              {/* Prompt and Style Interpretation Badge */}
              {currentResultMetadata?.revisedPrompt && (
                <div className="text-[11px] text-slate-300 bg-slate-900/90 border border-violet-500/20 px-3.5 py-2 rounded-xl flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-violet-300">Prompt & Style Applied: </span>
                    <span className="text-slate-300">{currentResultMetadata.revisedPrompt}</span>
                  </div>
                </div>
              )}

              {/* Side-by-side comparison if edited */}
              {activeTab === "edit" && uploadedImage ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-medium">Original Photo:</div>
                    <div className="rounded-2xl overflow-hidden border border-violet-500/20 bg-black/60 max-h-80 flex items-center justify-center">
                      <img
                        src={uploadedImage}
                        alt="Original Upload"
                        className="w-full h-auto max-h-80 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-emerald-400 font-medium">AI Edited Result:</div>
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black/60 max-h-80 flex items-center justify-center shadow-lg shadow-emerald-950/20">
                      {isImageRendering && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                          <span className="text-xs text-emerald-200 font-medium">Rendering neural pixels...</span>
                        </div>
                      )}
                      <img
                        src={generatedImage}
                        alt="AI Edited Result"
                        className="w-full h-auto max-h-80 object-contain"
                        referrerPolicy="no-referrer"
                        onLoad={() => setIsImageRendering(false)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 bg-black/80 shadow-2xl flex items-center justify-center max-h-96 min-h-[220px]">
                  {isImageRendering && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                      <span className="text-xs text-violet-200 font-medium">Rendering neural pixels in {style} style...</span>
                    </div>
                  )}
                  <img
                    src={generatedImage}
                    alt={prompt}
                    className="w-full h-auto max-h-96 object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                    onLoad={() => setIsImageRendering(false)}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-violet-200 border border-violet-500/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  title="Generate a new variation with different random seed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-violet-300 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>New Variation</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-violet-500/20 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-violet-500/30 text-xs font-medium transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-violet-400" />
                  <span>Download Full HD</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendToChat()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Current Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
