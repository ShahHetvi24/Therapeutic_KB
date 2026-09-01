// API client for the Therapeutic Knowledge Base Assistant

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

// const CHAT_ENDPOINT = import.meta.env.DEV
//   ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/chat`
//   : "/api/chat";

/**
 * Send a chat message to the backend.
 */
export async function sendChatMessage({
  question,
  disease = null,
  topic = null,
}) {
  if (!question || typeof question !== "string" || !question.trim()) {
    throw new Error("Question is required");
  }

  const payload = {
    question: question.trim(),
    disease: disease || null,
    topic: topic || null,
  };

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.answer ||
          data?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return {
      success: data.success !== false,
      answer: data.answer || "No answer received from the server.",
      sources: Array.isArray(data.sources) ? data.sources : [],
      followUpQuestions: Array.isArray(data.followUpQuestions)
        ? data.followUpQuestions
        : [],
      disease: data.disease || null,
      topic: data.topic || null,
    };
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}

export default {
  sendChatMessage,
};