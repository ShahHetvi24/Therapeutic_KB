import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const PROVIDER_NAME = process.env.LLM_PROVIDER || "openrouter";
const FALLBACK_ANSWER = "I couldn't find sufficient information in the provided knowledge base to answer this question.";
const SERVICE_ERROR = "The answer generation service is temporarily unavailable.";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const HTTP_REFERER = "http://localhost:5173";
const X_TITLE = "Therapeutic Knowledge Base Assistant";

function normalizeSource(item = {}) {
  return {
    document: String(item?.document ?? "").trim(),
    documentPath: String(item?.documentPath ?? item?.document ?? "").trim(),
    disease: String(item?.disease ?? "").trim(),
    topic: String(item?.topic ?? "").trim(),
    section: String(item?.section ?? "").trim(),
  };
}

function buildSourcesFromChunks(chunks = []) {
  const sourceMap = new Map();

  for (const chunk of chunks) {
    const normalized = normalizeSource(chunk);
    const document = normalized.document;
    const documentPath = normalized.documentPath;
    const disease = normalized.disease;
    const topic = normalized.topic;
    const section = normalized.section;

    if (!document) continue;

    const key = [documentPath || document, disease, topic].join("|");

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
    if (section) entry.sections.add(section);
  }

  return Array.from(sourceMap.values()).map((entry) => {
    const source = {
      document: entry.document,
      documentPath: entry.documentPath,
      disease: entry.disease,
      topic: entry.topic,
    };

    const sections = Array.from(entry.sections).sort();
    if (sections.length > 0) source.sections = sections;
    return source;
  });
}

function deduplicateSources(chunks = []) {
  return buildSourcesFromChunks(chunks);
}

function getContextText(ragContext) {
  if (!ragContext) return "";

  if (typeof ragContext.context === "string") {
    const trimmed = ragContext.context.trim();
    if (trimmed) return trimmed;
  }

  const chunks = Array.isArray(ragContext.chunks) ? ragContext.chunks : [];
  return chunks.map((chunk) => String(chunk?.text ?? "")).filter(Boolean).join("\n---\n");
}

function hasNoRelevantContext(ragContext) {
  if (!ragContext) return true;

  const contextText = getContextText(ragContext).trim();
  const hasNoChunks = Array.isArray(ragContext.chunks) && ragContext.chunks.length === 0;

  return ragContext.has_relevant_context === false || hasNoChunks || contextText === "";
}

function buildPrompt(question, disease, topic, ragContext) {
  const safeQuestion = String(question ?? "").trim();
  const safeDisease = disease === null || disease === undefined ? "null" : String(disease).trim();
  const safeTopic = topic === null || topic === undefined ? "null" : String(topic).trim();
  const contextText = getContextText(ragContext);

  return [
    "Question:",
    safeQuestion,
    "",
    "Disease:",
    safeDisease,
    "",
    "Topic:",
    safeTopic,
    "",
    "KNOWLEDGE BASE CONTEXT:",
    "<<<START_CONTEXT>>>",
    contextText,
    "<<<END_CONTEXT>>>",
    "",
    "Answer the question using ONLY the supplied context.",
  ].join("\n");
}

function buildSystemInstruction() {
  return [
    "You are a Therapeutic Knowledge Base Assistant.",
    "Use ONLY the supplied knowledge-base context.",
    "Do NOT use outside knowledge.",
    "This is a general educational knowledge-base question, not individualized medical advice.",
    "Do NOT invent:",
    "- treatments",
    "- biomarkers",
    "- products",
    "- statistics",
    "- market claims",
    "- recommendations",
    "Preserve uncertainty and caveats from the retrieved context.",
    'If the supplied context does not contain enough information, respond exactly: "I couldn\'t find sufficient information in the provided knowledge base to answer this question."',
    'If the user requests individualized medical advice, do not provide it; instead respond with: "I can provide general information from the knowledge base, but I can\'t provide individualized medical advice."',
  ].join("\n");
}

function classifyMedicalIntent(question) {
  const text = String(question ?? "").trim().toLowerCase();
  if (!text) return "unknown";

  const personalAdvicePatterns = [
    "what treatment should i",
    "what drug should i",
    "what should i take",
    "which treatment is best for me",
    "what treatment should this patient take",
    "what drug should this patient receive",
    "what dose should i take",
    "what dose of therapy should i take",
    "should i stop taking",
    "should i start",
    "what should my doctor prescribe",
    "what should my doctor prescribe for me",
    "what is best for me",
    "what treatment should i personally take",
    "what medication should i take",
    "what should this patient receive",
    "what treatment should i take for mm",
    "doctor prescribe",
    "for me",
    "my treatment",
    "my medication",
    "my dose",
    "this patient",
  ];

  const generalInfoPatterns = [
    "what are the main treatment considerations",
    "what are the main treatment options",
    "what are the important treatment options",
    "summarize first-line treatment",
    "what biomarkers influence treatment selection",
    "how does treatment sequencing work",
    "what are the key pipeline development areas",
    "what are the major unmet needs",
    "what are the treatment options",
    "treatment considerations",
    "treatment guidelines",
    "treatment sequencing",
    "biomarkers influence treatment selection",
    "in the retrieved context",
  ];

  const hasPersonalPattern = personalAdvicePatterns.some((pattern) => text.includes(pattern));
  const hasGeneralPattern = generalInfoPatterns.some((pattern) => text.includes(pattern));

  if (hasPersonalPattern) return "restricted";
  if (hasGeneralPattern) return "allowed";

  const hasMedicalTerms = /\b(?:treatment|therapy|drug|medication|biomarker|dose|patient|disease|guideline|pipeline)\b/.test(text);
  const hasPersonalPronouns = /\b(?:i|me|my|you|your|patient|doctor|prescribe|take|start|stop|should)\b/.test(text);

  if (hasMedicalTerms && hasPersonalPronouns) {
    return "restricted";
  }

  return "allowed";
}

function addKnowledgeBaseDisclaimer(answer) {
  const text = String(answer ?? "").trim();
  if (!text) return text;
  if (/knowledge-base summary for informational purposes/i.test(text)) return text;
  return `${text}\n\nThis is a knowledge-base summary for informational purposes and is not individualized medical advice.`;
}

function getAssistantText(payload) {
  const choice = Array.isArray(payload?.choices) ? payload.choices[0] : null;
  const message = choice?.message ?? {};
  const content = message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const parts = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          if (typeof part.text === "string") return part.text;
          if (typeof part.content === "string") return part.content;
          if (Array.isArray(part.content)) {
            return getAssistantText({ choices: [{ message: { content: part.content } }] });
          }
        }
        return "";
      })
      .filter(Boolean);

    return parts.join("\n").trim();
  }

  return "";
}

function getFollowUpQuestions(ragContext = {}, disease, topic) {
  const chunks = Array.isArray(ragContext?.chunks) ? ragContext.chunks : [];
  const sectionNames = chunks
    .map((chunk) => String(chunk?.section ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const diseaseLabel = disease ? String(disease).trim() : "this disease";
  const topicLabel = topic ? String(topic).trim() : "this topic";

  const basedOnContext = sectionNames.length > 0
    ? `What does the retrieved context say about ${sectionNames.join(", ")}?`
    : `What other details in the retrieved context are most relevant to ${diseaseLabel} and ${topicLabel}?`;

  return [
    `What are the main treatment considerations for ${diseaseLabel} in the retrieved context?`,
    topicLabel && topicLabel !== "null"
      ? `Which factors are highlighted under the ${topicLabel} section of the knowledge base?`
      : "Which factors or biomarkers are most emphasized in the retrieved context?",
    basedOnContext,
  ];
}

function logOpenRouterError({ status, errorMessage, model, provider }) {
  console.error("OpenRouter API failure");
  console.error(`HTTP status: ${status}`);
  console.error(`Error message: ${errorMessage}`);
  console.error(`Model: ${model}`);
  console.error(`Provider: ${provider}`);
}

export async function generateAnswer({ question, ragContext, disease, topic }) {
  const trimmedQuestion = String(question ?? "").trim();
  const chunks = Array.isArray(ragContext?.chunks) ? ragContext.chunks : [];
  const sources = deduplicateSources(chunks);

  if (!trimmedQuestion) {
    return {
      answer: FALLBACK_ANSWER,
      sources: [],
      followUpQuestions: [],
      provider: PROVIDER_NAME,
      model: DEFAULT_MODEL,
    };
  }

  if (hasNoRelevantContext(ragContext)) {
    return {
      answer: FALLBACK_ANSWER,
      sources: [],
      followUpQuestions: [],
      provider: PROVIDER_NAME,
      model: DEFAULT_MODEL,
    };
  }

  const intent = classifyMedicalIntent(trimmedQuestion);
  if (intent === "restricted") {
    return {
      answer: "I can provide general information from the knowledge base, but I can't provide individualized medical advice.",
      sources,
      followUpQuestions: [],
      provider: PROVIDER_NAME,
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    };
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OpenRouter API error [authentication]: OPENROUTER_API_KEY is not configured.");
    console.error(`Model: ${model}`);
    console.error(`Provider: ${PROVIDER_NAME}`);
    return {
      answer: SERVICE_ERROR,
      sources,
      followUpQuestions: [],
      provider: PROVIDER_NAME,
      model,
    };
  }

  const prompt = buildPrompt(trimmedQuestion, disease, topic, ragContext);
  const requestBody = {
    model,
    temperature: 0.1,
    messages: [
      { role: "system", content: buildSystemInstruction() },
      { role: "user", content: prompt },
    ],
  };

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": HTTP_REFERER,
        "X-Title": X_TITLE,
      },
      body: JSON.stringify(requestBody),
    });

    const rawText = await response.text();
    let payload = null;

    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
      console.error("OpenRouter API returned non-JSON response.");
      console.error(`HTTP status: ${response.status}`);
      console.error(`Model: ${model}`);
      console.error(`Provider: ${PROVIDER_NAME}`);
      return {
        answer: SERVICE_ERROR,
        sources,
        followUpQuestions: [],
        provider: PROVIDER_NAME,
        model,
      };
    }

    if (!response.ok) {
      const errorMessage = payload?.error?.message || payload?.message || rawText || "Unknown OpenRouter API error";
      logOpenRouterError({ status: response.status, errorMessage, model, provider: PROVIDER_NAME });
      return {
        answer: SERVICE_ERROR,
        sources,
        followUpQuestions: [],
        provider: PROVIDER_NAME,
        model,
      };
    }

    const assistantText = getAssistantText(payload);
    if (!assistantText) {
      console.error("OpenRouter API returned no assistant text.");
      console.error(`HTTP status: ${response.status}`);
      console.error(`Model: ${model}`);
      console.error(`Provider: ${PROVIDER_NAME}`);
      return {
        answer: SERVICE_ERROR,
        sources,
        followUpQuestions: [],
        provider: PROVIDER_NAME,
        model: payload?.model || model,
      };
    }

    const returnedModel = payload?.model || model;
    console.log(`OpenRouter response model: ${returnedModel}`);
    console.log(`OpenRouter provider: ${PROVIDER_NAME}`);

    return {
      answer: addKnowledgeBaseDisclaimer(assistantText),
      sources,
      followUpQuestions: getFollowUpQuestions(ragContext, disease, topic),
      provider: PROVIDER_NAME,
      model: returnedModel,
    };
  } catch (error) {
    const status = error?.status || "unknown";
    const errorMessage = error?.message || String(error);
    logOpenRouterError({ status, errorMessage, model, provider: PROVIDER_NAME });
    return {
      answer: SERVICE_ERROR,
      sources,
      followUpQuestions: [],
      provider: PROVIDER_NAME,
      model,
    };
  }
}

export default { generateAnswer };
