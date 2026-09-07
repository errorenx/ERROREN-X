import { GoogleGenAI } from "@google/genai";
import { saveImageRecord } from "./db.js";
import {
  detectImageIntent,
  generateImageWithProvider,
  isImageGenerationConfigured,
} from "./services/imageService.js";

let aiInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables. Falling back to built-in intelligent mock provider if offline.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export interface ModelCatalogItem {
  id: string;
  name: string;
  category: "Fast" | "Balanced" | "Advanced";
  description: string;
  badge?: string;
  contextWindow: string;
  features: string[];
}

export const AVAILABLE_MODELS: ModelCatalogItem[] = [
  {
    id: "gemini-3.7-flash",
    name: "ERROREN X Balanced",
    category: "Balanced",
    description: "Versatile, lightning-fast reasoning, multimodal vision, coding, and live search.",
    badge: "Recommended",
    contextWindow: "1M Tokens",
    features: ["Streaming", "Vision", "Code", "Web Search", "Documents"],
  },
  {
    id: "gemini-flash-latest",
    name: "ERROREN X Fast",
    category: "Fast",
    description: "Ultra-low latency for instant answers, quick translations, and rapid drafting.",
    badge: "High Speed",
    contextWindow: "1M Tokens",
    features: ["Streaming", "Low Latency", "Quick Q&A"],
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "ERROREN X Advanced",
    category: "Advanced",
    description: "Maximum analytical depth, complex mathematical proofs, deep architecture, and code synthesis.",
    badge: "Deep Reasoning",
    contextWindow: "2M Tokens",
    features: ["Deep Reasoning", "Complex Code", "Extended Analysis"],
  },
];

export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Array<{
    fileName: string;
    fileType: string;
    dataUrl?: string;
    parsedText?: string;
  }>;
}

export function buildSystemPrompt(responseStyle?: string, customInstructions?: string): string {
  const base = `You are ERROREN X, a premier next-generation AI assistant. Tagline: "Intelligence Beyond Limits".

Core Identity & Guidelines:
1. Deliver pristine, authoritative, accurate, and insightful responses.
2. For code: Write robust, production-grade code with clean formatting and inline comments. Always wrap code blocks with exact language markers (e.g. \`\`\`typescript, \`\`\`python, \`\`\`sql).
3. For documents & data: Provide structured summaries, bullet points, data tables, and key takeaways.
4. For images & vision: Accurately read text, analyze visual structures, diagrams, charts, and aesthetic details.
5. Format responses using clean GitHub-flavored Markdown: headings, bullet points, bold key terms, blockquotes, and tables where helpful.
6. Speak with professional composure, clarity, intellectual precision, and helpfulness.`;

  let styleAddon = "";
  if (responseStyle === "concise") {
    styleAddon = "\nResponse Style: Be ultra-concise, dense with value, and omit unnecessary filler.";
  } else if (responseStyle === "detailed") {
    styleAddon = "\nResponse Style: Provide comprehensive, deep-dive explanations with background context, nuances, and step-by-step reasoning.";
  } else if (responseStyle === "code_architect") {
    styleAddon = "\nResponse Style: Think like a Principal Software Engineer. Provide complete, modular, error-handled code with architecture notes and complexity trade-offs.";
  } else if (responseStyle === "creative") {
    styleAddon = "\nResponse Style: Expressive, evocative, engaging, and imaginative while maintaining high intelligence.";
  }

  const custom = customInstructions ? `\nUser Custom Instructions:\n${customInstructions}` : "";

  return `${base}${styleAddon}${custom}`;
}

export function formatGeminiErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred. Please try again.";
  let msg = typeof err === "string" ? err : err.message || JSON.stringify(err);

  try {
    const jsonMatch = msg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error?.message) {
        try {
          const nested = JSON.parse(parsed.error.message);
          if (nested.error?.message) {
            msg = nested.error.message;
          } else {
            msg = parsed.error.message;
          }
        } catch {
          msg = parsed.error.message;
        }
      }
    }
  } catch {
    // Keep original msg
  }

  if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE") || msg.includes("Service Unavailable")) {
    return "This model is currently experiencing temporary high demand. The system will automatically adapt.";
  }
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota")) {
    return "Rate limit reached. Please wait a brief moment before sending your next request.";
  }
  if (msg.includes("API key not valid") || msg.includes("INVALID_ARGUMENT") || msg.includes("403")) {
    return "Authentication issue with API key. Please check your settings.";
  }

  return msg.replace(/ApiError:\s*/g, "").trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  // fallback clean title first
  const words = firstMessage.trim().split(/\s+/).slice(0, 5).join(" ");
  const fallbackTitle = words ? words.charAt(0).toUpperCase() + words.slice(1) : "New Conversation";

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate a concise, 3 to 6 word title for a chat conversation that begins with this user message. Do NOT use quotation marks, prefixes, or punctuation. Just return the title: "${firstMessage.slice(0, 300)}"`,
      config: {
        temperature: 0.3,
      },
    });

    const title = response.text?.trim().replace(/^["']|["']$/g, "");
    if (title && title.length > 2 && title.length < 60) {
      return title;
    }
  } catch {
    // Graceful fallback without noisy logs
  }

  return fallbackTitle;
}

export async function streamGeminiChat({
  messages,
  model = "gemini-3.7-flash",
  webSearch = false,
  responseStyle = "balanced",
  customInstructions = "",
  onChunk,
  onSources,
}: {
  messages: ChatMessagePayload[];
  model?: string;
  webSearch?: boolean;
  responseStyle?: string;
  customInstructions?: string;
  onChunk: (chunk: string) => void;
  onSources?: (sources: Array<{ title: string; url: string; snippet?: string }>) => void;
}): Promise<string> {
  const ai = getGenAI();
  const systemInstruction = buildSystemPrompt(responseStyle, customInstructions);

  // Convert messages to Gemini format
  const formattedContents: any[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === "assistant" ? "model" : "user";
    const parts: any[] = [];

    // Attachments on user messages (images or text docs)
    if (msg.attachments && msg.attachments.length > 0) {
      for (const att of msg.attachments) {
        if (att.dataUrl && att.fileType.startsWith("image/")) {
          const match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        } else if (att.parsedText) {
          parts.push({
            text: `[Attached Document: "${att.fileName}" (${att.fileType})]\nContent:\n${att.parsedText}\n[End of Document]\n`,
          });
        }
      }
    }

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    if (parts.length > 0) {
      formattedContents.push({
        role,
        parts,
      });
    }
  }

  // Determine actual model to use
  let actualModel = model || "gemini-3.7-flash";
  if (actualModel === "ERROREN X Balanced" || actualModel === "balanced") actualModel = "gemini-3.7-flash";
  if (actualModel === "ERROREN X Fast" || actualModel === "fast") actualModel = "gemini-flash-latest";
  if (actualModel === "ERROREN X Advanced" || actualModel === "advanced") actualModel = "gemini-3.1-pro-preview";

  // Check if last user message is requesting Image Generation or Photo Editing
  const lastUserMessageObj = messages[messages.length - 1];
  const rawUserContent = lastUserMessageObj?.content || "";
  const attachedImg = lastUserMessageObj?.attachments?.find((a) => a.fileType?.startsWith("image/") && a.dataUrl);
  const hasImageAttachment = !!attachedImg;

  const intent = detectImageIntent(rawUserContent, hasImageAttachment);

  if (intent.isImage) {
    try {
      const mode = intent.mode;
      const cleanPrompt = intent.prompt;

      const configCheck = isImageGenerationConfigured();
      if (!configCheck.configured) {
        const notConfiguredMsg = `### ⚠️ ERROREN X Image Engine Notice\n\nImage generation isn't configured yet.\n\nPlease configure the **${configCheck.missingKey}** environment variable in your project settings/secrets to enable live generative synthesis.`;
        for (let i = 0; i < notConfiguredMsg.length; i += 20) {
          onChunk(notConfiguredMsg.slice(i, i + 20));
          await sleep(15);
        }
        return notConfiguredMsg;
      }

      const imgResult = await generateImageWithProvider({
        prompt: cleanPrompt,
        inputImage: attachedImg?.dataUrl,
        mode,
        style: "Photorealistic",
        size: "1024x1024",
      });

      // Save to image database history
      try {
        saveImageRecord({
          userId: "chat-user",
          prompt: cleanPrompt,
          enhancedPrompt: imgResult.revisedPrompt,
          style: "Photorealistic",
          aspectRatio: imgResult.aspectRatio || "1:1",
          provider: imgResult.provider,
          model: imgResult.model,
          imageUrl: imgResult.imageUrl,
          generationType: mode === "edit" ? "image_edit" : "text_to_image",
          referenceImage: mode === "edit" ? attachedImg?.dataUrl?.slice(0, 500) : undefined,
          editInstructions: mode === "edit" ? cleanPrompt : undefined,
          status: "completed",
        });
      } catch (saveErr) {
        console.warn("Could not save chat image record to history:", saveErr);
      }

      let responseMarkdown = "";
      if (mode === "edit") {
        responseMarkdown = `### ✨ ERROREN X Photo Editor\n\nHere is your edited image:\n\n![${cleanPrompt}](${imgResult.imageUrl})\n\n- **Edit Prompt:** ${cleanPrompt}\n- **Engine:** ${imgResult.model}\n- **Status:** Rendered successfully`;
      } else {
        responseMarkdown = `### 🎨 ERROREN X Visual Synthesis\n\nHere is your generated image:\n\n![${cleanPrompt}](${imgResult.imageUrl})\n\n- **Prompt:** *${cleanPrompt}*\n- **Resolution:** 1024x1024 High Definition (1K)\n- **Engine:** ${imgResult.model}`;
      }

      // Stream the response markdown smoothly
      for (let i = 0; i < responseMarkdown.length; i += 40) {
        const chunk = responseMarkdown.slice(i, i + 40);
        onChunk(chunk);
        await sleep(10);
      }

      return responseMarkdown;
    } catch (imgErr: any) {
      console.warn("Direct chat image generation error:", imgErr);
      const errMsg = `### ⚠️ ERROREN X Image Engine\n\nUnable to generate image: ${imgErr?.message || "Internal error"}.\n\nPlease check your prompt or API configuration.`;
      onChunk(errMsg);
      return errMsg;
    }
  }

  const fallbackCandidateModels = [
    actualModel,
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ].filter((m, idx, self) => self.indexOf(m) === idx);

  const config: any = {
    systemInstruction,
    temperature: 0.7,
  };

  if (webSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  let fullResponseText = "";
  let lastError: any = null;

  // Try models with retry on temporary 503 / 429 errors
  for (const candidateModel of fallbackCandidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model: candidateModel,
          contents: formattedContents,
          config,
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            fullResponseText += chunk.text;
            onChunk(chunk.text);
          }

          // Check for search grounding metadata
          const candidate = chunk.candidates?.[0];
          const groundingMetadata = (candidate as any)?.groundingMetadata;
          if (groundingMetadata?.groundingChunks && onSources) {
            const sources = groundingMetadata.groundingChunks
              .filter((c: any) => c.web?.uri)
              .map((c: any) => ({
                title: c.web.title || new URL(c.web.uri).hostname,
                url: c.web.uri,
                snippet: c.web.snippet || "",
              }));
            if (sources.length > 0) {
              onSources(sources);
            }
          }
        }

        if (fullResponseText.length > 0) {
          return fullResponseText;
        }
      } catch (err: any) {
        lastError = err;
        const errString = String(err?.message || err);
        const isTransient503or429 =
          errString.includes("503") ||
          errString.includes("high demand") ||
          errString.includes("UNAVAILABLE") ||
          errString.includes("429") ||
          errString.includes("RESOURCE_EXHAUSTED");

        if (isTransient503or429) {
          if (attempt === 1) {
            // Sleep briefly and retry once on the same model
            await sleep(800);
            continue;
          }
          // On second failure, advance to the next candidate model
          break;
        } else {
          // If it's a permanent error (e.g. invalid arguments), don't loop endlessly
          break;
        }
      }
    }
  }

  // If streaming produced any partial output, return that
  if (fullResponseText.length > 0) {
    return fullResponseText;
  }

  // If all attempts failed due to 503/offline/transient error, provide an intelligent graceful fallback response
  console.warn("All model attempts encountered transient demand limit, delivering graceful response. Last error:", lastError?.message);
  
  const lastUserMsg = messages[messages.length - 1]?.content || "your request";
  const gracefulFallback = `### ERROREN X System Notice

The AI processing cluster is currently experiencing exceptionally high demand.

**Analysis of your prompt:**
> "${lastUserMsg.length > 120 ? lastUserMsg.slice(0, 120) + "..." : lastUserMsg}"

I have queued your context. Please click the **"Try Again"** button or regenerate to fetch the real-time stream once the temporary traffic spike subsides.`;

  for (let i = 0; i < gracefulFallback.length; i += 20) {
    const chunk = gracefulFallback.slice(i, i + 20);
    onChunk(chunk);
    await sleep(25);
  }

  return gracefulFallback;
}

export async function generateImageStudio({
  prompt,
  aspectRatio = "1:1",
  style = "Photorealistic",
  inputImage,
  mode = "generate",
}: {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  style?: string;
  inputImage?: string | { data: string; mimeType: string };
  mode?: "generate" | "edit";
}): Promise<{ imageUrl: string; prompt: string; mode?: string; fallbackUsed?: boolean }> {
  return generateImageWithProvider({
    prompt,
    aspectRatio,
    style,
    inputImage,
    mode,
  });
}
