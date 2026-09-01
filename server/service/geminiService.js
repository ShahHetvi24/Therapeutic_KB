import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const DEFAULT_MODEL = "gemini-2.0-flash";
const FALLBACK_ANSWER = "I couldn't find sufficient information in the provided knowledge base to answer this question.";
const SERVICE_ERROR = "The answer generation service is temporarily unavailable.";

function normalizeSource(item = {}) {
  return {
    document: String(item?.document ?? "").trim(),
    documentPath: String(item?.documentPath ?? item?.document ?? "").trim(),
    disease: String(item?.disease ?? "").trim(),
    topic: String(item?.topic ?? "").trim(),
    section: String(item?.section ?? "").trim(),
  };
}

function deduplicateSources(sources = []) {
  const seen = new Set();
  const unique = [];

  for (const item of sources) {
    const normalized = normalizeSource(item);
    const key = [
      normalized.document,
      normalized.documentPath,
      normalized.disease,
      normalized.topic,
      normalized.section,
    ].join("|");

    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(normalized);
  }

  return unique;
}

/**
 * Group sources by document + disease, collecting multiple sections under one source
 * This improves readability when multiple chunks come from same document
 */
function buildSourcesFromChunks(chunks = []) {
  const sourceMap = new Map();

  for (const chunk of chunks) {
    const document = String(chunk?.document ?? "").trim();
    const documentPath = String(chunk?.documentPath ?? chunk?.document ?? "").trim();
    const disease = String(chunk?.disease ?? "").trim();
    const topic = String(chunk?.topic ?? "").trim();
    const section = String(chunk?.section ?? "").trim();

    if (!document) continue;

    // Group by: document + disease (ignore topic/section for grouping)
    const key = [document, disease].join("|");

    if (!sourceMap.has(key)) {
      sourceMap.set(key, {
        document,
        documentPath,
        disease,
        topic,
        sections: new Set(),
      });
    }

    const entry = sourceMap.get(key);
    if (section) {
      entry.sections.add(section);
    }
  }

  // Convert map to array of sources
  const sources = [];
  for (const entry of sourceMap.values()) {
    const source = {
      document: entry.document,
      documentPath: entry.documentPath,
      disease: entry.disease,
      topic: entry.topic,
    };

    // Include sections array if we have any sections
    if (entry.sections.size > 0) {
      source.sections = Array.from(entry.sections).sort();
    }

    sources.push(source);
  }

  return sources;
}

function buildPrompt(question, ragContext) {
  const contextText = typeof ragContext?.context === "string" && ragContext.context.trim()
    ? ragContext.context.trim()
    : (Array.isArray(ragContext?.chunks) ? ragContext.chunks.map((chunk) => chunk?.text ?? "").join("\n---\n") : "");

  return [
    "SYSTEM:",
    "You are a Therapeutic Knowledge Base Assistant for the Lymphoma knowledge base.",
    "You answer using ONLY the provided knowledge base context.",
    "Do not use outside knowledge.",
    "If the context does not contain enough information, say exactly: \"I couldn't find sufficient information in the provided knowledge base to answer this question.\"",
    "",
    "USER:",
    "Question:",
    String(question ?? "").trim(),
    "",
    "Context:",
    "<<<START>>>",
    contextText,
    "<<<END>>>",
    "",
    "Instructions:",
    "Answer directly using only the context.",
    "Do not say information is missing if the context contains the answer.",
    "For this task, return plain text only.",
    "Do not return JSON.",
    "Do not generate sources.",
    "Do not generate follow-up questions.",
  ].join("\n");
}

function getGeminiText(response) {
  if (!response) return "";

  if (typeof response.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  const candidates = Array.isArray(response?.candidates) ? response.candidates : [];
  for (const candidate of candidates) {
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
    for (const part of parts) {
      if (typeof part?.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return "";
}

function classifyGeminiError(code, message) {
  const normalizedMessage = message.toLowerCase();
  if (code === 401 || code === 403 || normalizedMessage.includes("api key") || normalizedMessage.includes("authentication")) {
    return "authentication";
  }
  if (code === 404 || normalizedMessage.includes("not found") || normalizedMessage.includes("no longer available")) {
    return "model unavailable";
  }
  if (code === 429 || normalizedMessage.includes("quota") || normalizedMessage.includes("rate limit")) {
    return "quota/rate limit";
  }
  if (code === 400 || normalizedMessage.includes("invalid")) {
    return "invalid request";
  }
  return "other API error";
}

export async function generateAnswer(input, legacyRagContext, legacyOptions = {}) {
  const request = typeof input === "object" && input !== null
    ? input
    : { question: input, ragContext: legacyRagContext, ...legacyOptions };
  const parsedQuestion = String(request.question ?? "").trim();
  const ragContext = request.ragContext;
  const disease = request.disease ?? ragContext?.disease ?? null;
  const topic = request.topic ?? ragContext?.topic ?? null;
  const chunks = Array.isArray(ragContext?.chunks) ? ragContext.chunks : [];
  const context = typeof ragContext?.context === "string" ? ragContext.context.trim() : "";

  if (!parsedQuestion) {
    return { answer: FALLBACK_ANSWER, sources: [], followUpQuestions: [] };
  }

  if (!ragContext || context === "") {
    return { answer: FALLBACK_ANSWER, sources: buildSourcesFromChunks(chunks), followUpQuestions: [] };
  }

  const prompt = buildPrompt(parsedQuestion, ragContext);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API error [authentication]: GEMINI_API_KEY is not configured.");
    return { answer: SERVICE_ERROR, sources: deduplicateSources(buildSourcesFromChunks(chunks)), followUpQuestions: [] };
  }

  console.log("Model:", DEFAULT_MODEL);
  console.log("Question:", parsedQuestion);
  console.log("Disease:", disease ?? "null");
  console.log("Topic:", topic ?? "null");
  console.log("Retrieved chunk count:", chunks.length);
  console.log("Context character count:", context.length);
  console.log("Context preview:", context.slice(0, 1000));
  console.log("API Key configured:", apiKey ? "✓ YES" : "✗ NO");

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        systemInstruction: [
          "You are a Therapeutic Knowledge Base Assistant for the Lymphoma knowledge base.",
          "Use only the provided context.",
          "Do not use outside knowledge.",
          "If the context is insufficient, say exactly: \"I couldn't find sufficient information in the provided knowledge base to answer this question.\"",
        ].join(" "),
        responseMimeType: "text/plain",
      },
    });

    const text = getGeminiText(response);
    console.log("HTTP/API success: true");
    console.log("Raw response text:", text || "<empty>");

    return {
      answer: text || SERVICE_ERROR,
      sources: deduplicateSources(buildSourcesFromChunks(chunks)),
      followUpQuestions: [],
    };
  } catch (error) {
    const errorCode = error?.status ?? error?.code ?? error?.statusCode ?? "unknown";
    const errorMessage = error?.message || String(error);
    const errorCategory = classifyGeminiError(errorCode, errorMessage);
    console.error("HTTP/API success: false");
    console.error(`Gemini API error [${errorCategory}] code:`, errorCode);
    console.error("Gemini API error message:", errorMessage);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    return {
      answer: SERVICE_ERROR,
      sources: deduplicateSources(buildSourcesFromChunks(chunks)),
      followUpQuestions: [],
    };
  }
}

export default { generateAnswer };
