import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const MODEL_NAME = "gemini-3.6-flash";

async function runBasicGeminiTest() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = "Explain what R-CHOP is in one sentence.";

  console.log("MODEL:", MODEL_NAME);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "text/plain",
      },
    });

    console.log("HTTP/API success: true");
    console.log("TYPEOF_RESPONSE:", typeof response);
    console.log("RESPONSE_KEYS:", Object.keys(response || {}));
    console.log("RAW_RESPONSE:", JSON.stringify(response, null, 2).slice(0, 4000));
    console.log("TEXT_IF_AVAILABLE:", response?.text ?? "<missing>");
    console.log("CANDIDATES:", Array.isArray(response?.candidates));
    if (Array.isArray(response?.candidates)) {
      console.log("FIRST_CANDIDATE:", JSON.stringify(response.candidates[0], null, 2).slice(0, 2000));
    }
  } catch (error) {
    console.log("HTTP/API success: false");
    console.error("ERROR_MESSAGE:", error?.message || error);
    if (error?.status) console.error("STATUS:", error.status);
    if (error?.details) console.error("DETAILS:", error.details);
  }
}

async function runHardcodedContextTest() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const context = `## DLBCL

| Setting | Common Treatment Approach |
|---|---|
| Frontline standard risk | R-CHOP or Polivy-R-CHP depending patient risk, guideline preference, access, and local practice |
| High-grade / double-hit biology | More intensive regimens or clinical trial depending cytogenetics and patient fitness |
| Primary refractory or early relapse | CAR-T therapy in eligible patients; bridging therapy may be used |
| Late relapse, transplant eligible | Salvage chemoimmunotherapy followed by autologous transplant in chemosensitive disease |
| Transplant/CAR-T ineligible or later lines | Bispecific antibodies, ADCs, tafasitamab-lenalidomide, loncastuximab, polatuzumab-based therapy, clinical trial |`;

  const prompt = [
    "SYSTEM:",
    "You answer questions using only the provided context.",
    "",
    "USER:",
    "Question:",
    "What are the important treatment options?",
    "",
    "Context:",
    "<<<START>>>",
    context,
    "<<<END>>>",
    "",
    "Instructions:",
    "Answer directly using only the context.",
    "If the context contains the answer, do not say that information is missing.",
    "For this debugging test, return plain text only.",
    "Do not return JSON.",
    "Do not generate sources.",
    "Do not generate follow-up questions.",
  ].join("\n");

  console.log("\n=== HARDCODED CONTEXT TEST ===");
  console.log("MODEL:", MODEL_NAME);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "text/plain",
      },
    });

    console.log("TYPEOF_RESPONSE:", typeof response);
    console.log("RESPONSE_KEYS:", Object.keys(response || {}));
    console.log("RAW_RESPONSE:", JSON.stringify(response, null, 2).slice(0, 4000));
    console.log("TEXT_IF_AVAILABLE:", response?.text ?? "<missing>");
    console.log("CANDIDATES:", Array.isArray(response?.candidates));
    if (Array.isArray(response?.candidates)) {
      console.log("FIRST_CANDIDATE:", JSON.stringify(response.candidates[0], null, 2).slice(0, 2000));
    }
  } catch (error) {
    console.error("ERROR_MESSAGE:", error?.message || error);
    if (error?.status) console.error("STATUS:", error.status);
    if (error?.details) console.error("DETAILS:", error.details);
  }
}

async function main() {
  await runBasicGeminiTest();
  await runHardcodedContextTest();
}

main().catch((error) => {
  console.error("Test script failed:", error?.message || error);
  process.exitCode = 1;
});
