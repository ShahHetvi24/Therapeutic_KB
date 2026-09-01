import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const MODEL_NAME = process.env.OPENROUTER_MODEL || "openrouter/free";
const API_KEY = process.env.OPENROUTER_API_KEY;

async function main() {
  console.log("Provider: openrouter");
  console.log(`Model: ${MODEL_NAME}`);
  console.log(`API key configured: ${API_KEY ? "YES" : "NO"}`);

  if (!API_KEY) {
    console.log("HTTP status: unavailable");
    console.log("Raw response: API key not configured");
    console.log("Extracted text: <not available>");
    return;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Therapeutic Knowledge Base Assistant",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "user", content: "Reply with exactly: OpenRouter connection successful." },
        ],
      }),
    });

    const rawText = await response.text();
    console.log(`HTTP status: ${response.status}`);
    console.log(`Raw response: ${rawText}`);

    let payload = null;
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      console.log("Extracted text: <non-JSON response>");
      return;
    }

    const message = payload?.choices?.[0]?.message?.content;
    console.log(`Extracted text: ${typeof message === "string" ? message : "<missing>"}`);
    if (payload?.model) {
      console.log(`Actual model returned: ${payload.model}`);
    }
  } catch (error) {
    console.log("HTTP status: error");
    console.log("Raw response: " + (error?.message || String(error)));
    console.log("Extracted text: <error>");
  }
}

main();
