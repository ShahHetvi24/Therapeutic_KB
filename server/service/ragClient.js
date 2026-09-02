import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const DEFAULT_RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000";

export async function retrieveContext(question, disease = null, topic = null, options = {}) {
  const finalQuestion = typeof question === "string" ? question.trim() : "";
  const ragServiceUrl = process.env.RAG_SERVICE_URL || DEFAULT_RAG_SERVICE_URL;

  if (!finalQuestion) {
    return {
      question: "",
      disease,
      topic,
      chunks: [],
      context: "",
      sources: [],
      source_count: 0,
      has_relevant_context: false,
    };
  }

  const requestBody = {
    question: finalQuestion,
    top_k: options.top_k ?? 5,
    disease: disease || null,
    topic: topic || null,
  };

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ragServiceUrl}/retrieve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`FastAPI retrieval failed with HTTP ${response.status}`);
    }

    if (!rawText || rawText.trim() === "") {
      throw new Error("FastAPI retrieval returned an empty response body.");
    }

    let payload;
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      throw new Error("FastAPI retrieval returned invalid JSON.");
    }

    const normalized = {
      question: payload?.question ?? finalQuestion,
      disease: payload?.disease ?? disease ?? null,
      topic: payload?.topic ?? topic ?? null,
      chunks: Array.isArray(payload?.chunks) ? payload.chunks : [],
      context: payload?.context ?? "",
      sources: Array.isArray(payload?.sources) ? payload.sources : [],
      source_count: Number(payload?.source_count ?? payload?.sources?.length ?? 0),
      has_relevant_context: Boolean(payload?.has_relevant_context),
    };

    return normalized;
  } catch (error) {
    const message = error?.name === "AbortError"
      ? "FastAPI retrieval timed out."
      : error?.message || "FastAPI retrieval failed.";

    return {
      question: finalQuestion,
      disease: disease || null,
      topic: topic || null,
      chunks: [],
      context: "",
      sources: [],
      source_count: 0,
      has_relevant_context: false,
      error: message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default { retrieveContext };
