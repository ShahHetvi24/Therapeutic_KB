import express from "express";
import { retrieveContext } from "../service/ragClient.js";
import { generateAnswer } from "../service/llmService.js";
import { getKBTopics, isValidUITopic } from "../config/topicMapping.js";

const router = express.Router();

// Allowed diseases
const ALLOWED_DISEASES = ["AML", "CLL", "MM", "NHL"];

// POST /api/chat
router.post("/chat", async (req, res) => {
  try {
    const { question, disease = null, topic = null } = req.body;

    // Step 1: Validate question
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        answer: "Question is required.",
        sources: [],
        followUpQuestions: [],
        disease: null,
        topic: null,
      });
    }

    const trimmedQuestion = question.trim();

    // Step 2: Validate disease
    let validatedDisease = null;
    if (disease !== null && disease !== undefined) {
      if (ALLOWED_DISEASES.includes(disease)) {
        validatedDisease = disease;
      } else {
        return res.status(400).json({
          success: false,
          answer: `Invalid disease. Allowed values: ${ALLOWED_DISEASES.join(", ")}`,
          sources: [],
          followUpQuestions: [],
          disease: null,
          topic: null,
        });
      }
    }

    // Step 3: Translate UI topic to KB topics
    let translatedTopics = null;
    let uiTopicForLog = topic || null;

    if (topic && typeof topic === "string" && topic.trim()) {
      if (!isValidUITopic(topic)) {
        return res.status(400).json({
          success: false,
          answer: `Invalid topic. Please select from the available topics.`,
          sources: [],
          followUpQuestions: [],
          disease: null,
          topic: null,
        });
      }

      translatedTopics = getKBTopics(topic);
      console.log(`Topic mapping: "${topic}" → [${translatedTopics.join(", ")}]`);
    }

    // Step 4: Call Python retrieval service
    console.log(`\n=== Chat Request ===`);
    console.log(`Question: ${trimmedQuestion}`);
    console.log(`Disease: ${validatedDisease || "null (all)"}`);
    console.log(`UI Topic: ${uiTopicForLog || "null"}`);
    console.log(`KB Topics: ${translatedTopics ? `[${translatedTopics.join(", ")}]` : "null"}`);

    const retrieval = await retrieveContext(
      trimmedQuestion,
      validatedDisease,
      translatedTopics,
      { top_k: 5, timeoutMs: 20000 }
    );

    // Check for retrieval errors
    if (retrieval.error) {
      console.error(`Retrieval error: ${retrieval.error}`);
      return res.status(503).json({
        success: false,
        answer: "The assistant is temporarily unavailable. Please try again.",
        sources: [],
        followUpQuestions: [],
        disease: validatedDisease,
        topic: uiTopicForLog,
      });
    }

    // Step 5: Check if we have relevant context
    if (!retrieval.has_relevant_context || retrieval.chunks.length === 0) {
      console.log("No relevant context found in knowledge base.");
      return res.status(200).json({
        success: true,
        answer:
          "I couldn't find sufficient information in the provided knowledge base to answer this question.",
        sources: [],
        followUpQuestions: [],
        disease: validatedDisease,
        topic: uiTopicForLog,
      });
    }

    // Step 6: Handle potential ambiguity for broad cross-disease questions
    if (validatedDisease === null) {
      const uniqueDiseases = new Set();
      for (const chunk of retrieval.chunks) {
        if (chunk.disease) {
          uniqueDiseases.add(chunk.disease);
        }
      }

      // If multiple diseases found and question is broad, ask for clarification
      if (uniqueDiseases.size > 1) {
        const isBroadQuestion =
          trimmedQuestion.toLowerCase().includes("main") ||
          trimmedQuestion.toLowerCase().includes("general") ||
          trimmedQuestion.toLowerCase().includes("important");

        if (isBroadQuestion && trimmedQuestion.length < 100) {
          console.log(
            `Ambiguous cross-disease question detected. Diseases: ${Array.from(uniqueDiseases).join(", ")}`
          );
          return res.status(200).json({
            success: true,
            answer: `This question could apply to multiple disease areas in the knowledge base: ${Array.from(uniqueDiseases).join(", ")}. Please select a disease area or specify the disease you are interested in.`,
            sources: [],
            followUpQuestions: [],
            disease: null,
            topic: uiTopicForLog,
          });
        }
      }
    }

    // Step 7: Generate answer using the configured LLM provider
    console.log(
      `Retrieved ${retrieval.chunks.length} chunk(s). Generating answer...`
    );

    const answer = await generateAnswer({
      question: trimmedQuestion,
      ragContext: retrieval,
      disease: validatedDisease,
      topic: uiTopicForLog,
    });

    // Step 8: Check for LLM generation errors
    if (!answer || !answer.answer) {
      console.error("LLM generation failed or returned empty answer.");
      return res.status(503).json({
        success: false,
        answer: "The answer generation service is temporarily unavailable.",
        sources: [],
        followUpQuestions: [],
        disease: validatedDisease,
        topic: uiTopicForLog,
      });
    }

    // Step 9: Format and return response
    const response = {
      success: true,
      answer: answer.answer,
      sources: answer.sources || [],
      followUpQuestions: answer.followUpQuestions || [],
      disease: validatedDisease,
      topic: uiTopicForLog,
    };

    console.log(`Response: ${response.answer.substring(0, 100)}...`);
    console.log(`Sources count: ${response.sources.length}`);
    console.log(`Follow-up questions: ${response.followUpQuestions.length}`);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return res.status(500).json({
      success: false,
      answer: "An unexpected error occurred.",
      sources: [],
      followUpQuestions: [],
      disease: null,
      topic: null,
    });
  }
});

export default router;
