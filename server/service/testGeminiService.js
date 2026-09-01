import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { generateAnswer } from "./geminiService.js";
import { retrieveContext } from "./ragClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const testCase = {
  question: "What are the important treatment options?",
  disease: "NHL",
  topic: "Treatment Modalities",
};

async function runTest(testCase) {
  const ragContext = await retrieveContext(testCase.question, testCase.disease, testCase.topic, { top_k: 5, timeoutMs: 25000 });

  console.log("=".repeat(90));
  console.log(`Question: ${testCase.question}`);
  console.log(`Disease: ${testCase.disease ?? "null"}`);
  console.log(`Topic: ${testCase.topic ?? "null"}`);
  console.log(`Retrieved chunk count: ${ragContext?.chunks?.length ?? 0}`);
  console.log(`ragContext.has_relevant_context: ${ragContext?.has_relevant_context}`);
  console.log(`ragContext.context length: ${String(ragContext?.context ?? "").length}`);
  console.log(`ragContext.context preview: ${String(ragContext?.context ?? "").slice(0, 1200)}`);
  console.log("ragContext object keys:", Object.keys(ragContext || {}));

  const result = await generateAnswer({
    question: testCase.question,
    ragContext,
    disease: testCase.disease,
    topic: testCase.topic,
  });

  console.log("Gemini answer:");
  console.log(result.answer);
  console.log("Sources:");
  console.log(JSON.stringify(result.sources, null, 2));
  console.log("Follow-up questions:");
  console.log(JSON.stringify(result.followUpQuestions, null, 2));
  console.log("\n");
}

async function main() {
  await runTest(testCase);
}

main().catch((error) => {
  console.error("Test script failed:", error?.message || error);
  process.exitCode = 1;
});
