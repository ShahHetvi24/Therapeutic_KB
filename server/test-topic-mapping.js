import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, ".");

dotenv.config({ path: path.join(serverRoot, ".env") });

const API_BASE_URL = process.env.API_BASE_URL || "https://jjqkh58k-5000.inc1.devtunnels.ms/";
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

// Test cases for topic mapping and improved retrieval
const TEST_CASES = [
  {
    id: "TEST 1",
    description: "NHL + Treatment Guidelines (maps to Treatment Modalities)",
    payload: {
      question: "What are the important treatment options?",
      disease: "NHL",
      topic: "Treatment Guidelines",
    },
    expectedKeywords: ["treatment", "NHL"],
    expectMinChunks: 1,
  },

  {
    id: "TEST 2",
    description: "NHL + Treatment Sequencing (maps to Line of Therapy)",
    payload: {
      question: "How does treatment change across lines of therapy?",
      disease: "NHL",
      topic: "Treatment Sequencing",
    },
    expectedKeywords: ["treatment", "line", "therapy"],
    expectMinChunks: 1,
  },

  {
    id: "TEST 3",
    description: "NHL + Pipeline Products (maps to Clinical Trial + Key Product)",
    payload: {
      question: "What are the key pipeline development areas?",
      disease: "NHL",
      topic: "Pipeline Products",
    },
    expectedKeywords: ["pipeline", "product", "trial"],
    expectMinChunks: 1,
  },

  {
    id: "TEST 4",
    description: "AML + Diagnosis & Biomarkers (maps to Diagnosis + Biomarker)",
    payload: {
      question: "What biomarkers influence treatment selection?",
      disease: "AML",
      topic: "Diagnosis & Biomarkers",
    },
    expectedKeywords: ["biomarker", "AML"],
    expectMinChunks: 1,
  },

  {
    id: "TEST 5",
    description: "All diseases + no topic (cross-disease query)",
    payload: {
      question: "What are the main treatment options?",
      disease: null,
      topic: null,
    },
    expectsAmbiguity: true,
  },

  {
    id: "TEST 6",
    description: "NHL + Epidemiology (maps to both Epidemiology variants)",
    payload: {
      question: "What is the epidemiology of NHL?",
      disease: "NHL",
      topic: "Epidemiology",
    },
    expectedKeywords: ["NHL"],
    expectMinChunks: 1,
  },

  {
    id: "TEST 7",
    description: "CLL + Disease Overview",
    payload: {
      question: "Give an overview of CLL and its characteristics",
      disease: "CLL",
      topic: "Disease Overview",
    },
    expectedKeywords: ["CLL"],
    expectMinChunks: 1,
  },

  {
    id: "TEST 8",
    description: "Out-of-knowledge-base question",
    payload: {
      question: "What is the atomic weight of platinum?",
      disease: null,
      topic: null,
    },
    expectsNoContext: true,
  },

  {
    id: "TEST 9",
    description: "Invalid topic should return error",
    payload: {
      question: "What about something?",
      disease: "NHL",
      topic: "Invalid Topic Name",
    },
    expectsError: true,
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
  if (testCase.expectsError) {
    if (!result.ok || result.status !== 400) {
      return {
        passed: false,
        reason: `Expected HTTP 400 error, got ${result.status}`,
      };
    }
    return {
      passed: true,
      reason: "Correctly returned error for invalid topic",
    };
  }

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
    return {
      passed: false,
      reason: `Expected ambiguity detection. Got: ${data.answer.substring(0, 100)}...`,
    };
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
    return {
      passed: false,
      reason: `Expected 'no context' message. Got: ${data.answer.substring(0, 100)}...`,
    };
  }

  // Check for minimum chunks retrieved
  if (testCase.expectMinChunks) {
    if (!data.sources || data.sources.length < testCase.expectMinChunks) {
      return {
        passed: false,
        reason: `Expected at least ${testCase.expectMinChunks} source(s), got ${data.sources?.length || 0}`,
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
        // Check for source grouping/sections
        const hasGrouping = data.sources.some(s => s.sections && s.sections.length > 0);
        return {
          passed: true,
          reason: `Found ${foundKeywords.length}/${testCase.expectedKeywords.length} keywords, ${data.sources.length} source(s)${hasGrouping ? " with section grouping" : ""}`,
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
  console.log("Topic Taxonomy Mapping & Retrieval Test Suite");
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
      if (result.data.sources && result.data.sources.length > 0) {
        console.log("Source structure:");
        result.data.sources.slice(0, 2).forEach((s, i) => {
          console.log(`  [${i}] ${s.document} (${s.disease})`);
          if (s.sections) {
            console.log(`      Sections: ${s.sections.join(", ")}`);
          }
        });
      }
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
  console.log(`Test Results: ${passed} passed, ${failed} failed out of ${TEST_CASES.length}`);
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
