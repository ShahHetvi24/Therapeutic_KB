import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { generateAnswer } from "./geminiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const retrievalCases = [
  {
    question: "What biomarkers influence treatment selection?",
    disease: "NHL",
    topic: null,
  },
  {
    question: "What are the main treatment options?",
    disease: "NHL",
    topic: null,
  },
  {
    question: "What biomarkers influence treatment selection?",
    disease: "AML",
    topic: null,
  },
  {
    question: "What are the main treatment options?",
    disease: null,
    topic: null,
  },
];

async function retrieveFromFastApi(question, disease, topic) {
  const endpointUrl = "http://127.0.0.1:8000/retrieve";
  const requestBody = {
    question,
    top_k: 5,
    disease,
    topic,
  };

  console.log("Request URL:", endpointUrl);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseStatus = response.status;
  const responseStatusText = response.statusText;
  const responseContentType = response.headers.get("content-type");

  console.log("HTTP status:", responseStatus);
  console.log("HTTP status text:", responseStatusText);
  console.log("Response content type:", responseContentType);

  const rawText = await response.text();
  const responseLength = rawText ? rawText.length : 0;
  console.log("Response body length:", responseLength);

  if (!response.ok) {
    console.error("Retrieval HTTP error:");
    console.error(`Endpoint URL: ${endpointUrl}`);
    console.error(`HTTP status: ${responseStatus} ${responseStatusText}`);
    console.error("Response body:", rawText || "<empty response body>");
    throw new Error(`FastAPI retrieval failed with HTTP ${responseStatus}: ${rawText || "empty response"}`);
  }

  if (!rawText || rawText.trim() === "") {
    console.error("Retrieval error: empty response body from FastAPI endpoint.");
    console.error(`Endpoint URL: ${endpointUrl}`);
    throw new Error("FastAPI retrieval returned an empty response body.");
  }

  try {
    const json = JSON.parse(rawText);
    return json;
  } catch (error) {
    console.error("Invalid JSON returned from FastAPI retrieval endpoint.");
    console.error(`Endpoint URL: ${endpointUrl}`);
    console.error("Raw response body:", rawText);
    throw new Error(`Failed to parse retrieval JSON: ${rawText || "empty response body"}`);
  }
}

async function main() {
  console.log("Testing Gemini answer generation with retrieval context from FastAPI...\n");

  for (const test of retrievalCases) {
    try {
      const ragContext = await retrieveFromFastApi(test.question, test.disease, test.topic);

      const result = await generateAnswer(test.question, ragContext, {
        disease: test.disease,
        topic: test.topic,
      });

      console.log("=".repeat(90));
      console.log(`Question: ${test.question}`);
      console.log(`Disease: ${test.disease ?? "None"}`);
      console.log(`Topic: ${test.topic ?? "None"}`);
      console.log(`Retrieved chunk count: ${ragContext?.chunks?.length ?? 0}`);
      console.log("Gemini answer:");
      console.log(result.answer);
      console.log("Sources:");
      console.log(JSON.stringify(result.sources, null, 2));
      console.log("Follow-up questions:");
      console.log(JSON.stringify(result.followUpQuestions, null, 2));
      console.log("\n");
    } catch (err) {
      console.error("Error during test case:", test);
      console.error(err.message || err);
      console.log("\n");
    }
  }
}

main();
