import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { generateAnswer } from "./llmService.js";
import { retrieveContext } from "./ragClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const testCase = {
  question: "What are the important treatment options?",
  disease: "NHL",
  topic: "Treatment Guidelines",
};

async function main() {
  const ragContext = await retrieveContext(testCase.question, testCase.disease, testCase.topic, { top_k: 5, timeoutMs: 25000 });

  console.log("Question:");
  console.log(testCase.question);
  console.log("Disease:");
  console.log(testCase.disease ?? "null");
  console.log("Topic:");
  console.log(testCase.topic ?? "null");
  console.log("Retrieved chunk count:");
  console.log(ragContext?.chunks?.length ?? 0);
  console.log("Context length:");
  console.log(String(ragContext?.context ?? "").length);
  console.log("OpenRouter model:");
  console.log(process.env.OPENROUTER_MODEL || "openrouter/free");

  const result = await generateAnswer({
    question: testCase.question,
    ragContext,
    disease: testCase.disease,
    topic: testCase.topic,
  });

  console.log("Actual OpenRouter model returned:");
  console.log(result.model || process.env.OPENROUTER_MODEL || "openrouter/free");
  console.log("Answer:");
  console.log(result.answer);
  console.log("Sources:");
  console.log(JSON.stringify(result.sources, null, 2));
}

main().catch((error) => {
  console.error("Test script failed:", error?.message || error);
  process.exitCode = 1;
});
