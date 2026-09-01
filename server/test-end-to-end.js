import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, ".");

dotenv.config({ path: path.join(serverRoot, ".env") });

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

// Test cases
const TEST_CASES = [
  {
    id: "TEST 1",
    description: "NHL treatment options with disease and topic",
    payload: {
      question: "What are the important treatment options?",
      disease: "NHL",
      topic: "Treatment Modalities",
    },
    expectedKeywords: ["treatment", "NHL"],
  },
  {
    id: "TEST 2",
    description: "AML biomarkers with disease filter",
    payload: {
      question: "What biomarkers influence treatment selection?",
      disease: "AML",
      topic: null,
    },
    expectedKeywords: ["biomarker", "AML"],
  },
  {
    id: "TEST 3",
    description: "Pipeline products across all diseases",
    payload: {
      question: "What are the key pipeline products?",
      disease: "NHL",
      topic: null,
    },
    expectedKeywords: ["pipeline", "product"],
  },
  {
    id: "TEST 4",
    description: "Broad cross-disease question (should ask for clarification)",
    payload: {
      question: "What are the main treatment options?",
      disease: null,
      topic: null,
    },
    expectsAmbiguity: true,
  },
  {
    id: "TEST 5",
    description: "Question not in knowledge base",
    payload: {
      question: "What is the atomic weight of platinum?",
      disease: null,
      topic: null,
    },
    expectsNoContext: true,
  },
];

/**
 * Send a test request to the chat API
 */
async function testChatApi(payload) {
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false,
    };
  }
}

/**
 * Check if response meets test expectations
 */
function validateResponse(testCase, result) {
  if (!result.ok) {
    return {
      passed: false,
      reason: `HTTP ${result.status}: ${result.error || "Request failed"}`,
    };
  }

  const { data } = result;

  // Check basic response structure
  if (!data.hasOwnProperty("success") || !data.hasOwnProperty("answer")) {
    return {
      passed: false,
      reason: "Response missing required fields (success, answer)",
    };
  }

  // Check for ambiguity handling
  if (testCase.expectsAmbiguity) {
    if (
      data.answer.toLowerCase().includes("multiple disease") ||
      data.answer.toLowerCase().includes("select a disease")
    ) {
      return {
        passed: true,
        reason: "Correctly identified ambiguous question",
      };
    }
  }

  // Check for "no context" response
  if (testCase.expectsNoContext) {
    if (
      data.answer.toLowerCase().includes("couldn't find") ||
      data.answer.toLowerCase().includes("insufficient information")
    ) {
      return {
        passed: true,
        reason: "Correctly returned 'no context' message",
      };
    }
  }

  // Check for expected keywords
  if (testCase.expectedKeywords && testCase.expectedKeywords.length > 0) {
    const answerLower = data.answer.toLowerCase();
    const foundKeywords = testCase.expectedKeywords.filter((kw) =>
      answerLower.includes(kw.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      // Check for sources
      if (
        Array.isArray(data.sources) &&
        data.sources.length > 0
      ) {
        return {
          passed: true,
          reason: `Found ${foundKeywords.length}/${testCase.expectedKeywords.length} keywords and ${data.sources.length} source(s)`,
        };
      } else {
        return {
          passed: true,
          reason: `Found ${foundKeywords.length}/${testCase.expectedKeywords.length} keywords (no sources - may indicate context limitation)`,
        };
      }
    } else {
      return {
        passed: false,
        reason: `No expected keywords found. Answer: ${data.answer.substring(0, 100)}...`,
      };
    }
  }

  return {
    passed: true,
    reason: "Response validated",
  };
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("End-to-End Chat API Test Suite");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`API Endpoint: ${CHAT_ENDPOINT}\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`\n${testCase.id}: ${testCase.description}`);
    console.log("────────────────────────────────────────────────────────────────");
    console.log("Request:");
    console.log(JSON.stringify(testCase.payload, null, 2));

    const result = await testChatApi(testCase.payload);

    console.log("\nResponse Status:", result.status);
    if (result.data) {
      console.log("Answer preview:", result.data.answer.substring(0, 150) + "...");
      console.log("Sources:", result.data.sources?.length || 0);
      console.log("Follow-up questions:", result.data.followUpQuestions?.length || 0);
    }

    const validation = validateResponse(testCase, result);
    console.log("\nValidation:", validation.reason);
    console.log("Status:", validation.passed ? "✓ PASSED" : "✗ FAILED");

    if (validation.passed) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
