/**
 * Topic Mapping: UI (Business-Friendly) → Knowledge Base Topics
 * 
 * This is the centralized mapping between user-facing topic names
 * and the actual topic values stored in Qdrant metadata.
 * 
 * Each UI topic maps to one or more KB topics that should be searched.
 * When a user selects a UI topic, all mapped KB topics are used for filtering.
 */

const TOPIC_MAPPING = {
  // Overview and basics
  "Disease Overview": [
    "Disease Overview",
  ],

  // Epidemiology and statistics
  "Epidemiology": [
    "Epidemiology",
    "Epidemiology Prevalence And Statistics",
  ],

  // Classification and staging
  "Patient Journey": [
    "Classification And Staging",
    "Disease Specific Patient Cohort Defs",
  ],

  // Diagnosis and biomarkers
  "Diagnosis & Biomarkers": [
    "Diagnosis And Clinical Evaluation",
    "Biomarker Risk Marker Summary",
  ],

  // Treatment planning
  "Treatment Guidelines": [
    "Treatment Modalities",
    "Line Of Therapy Lot Framework",
  ],

  // Treatment sequencing across lines of therapy
  "Treatment Sequencing": [
    "Line Of Therapy Lot Framework",
    "Treatment Modalities",
  ],

  // Market and competitive landscape
  "Market Landscape": [
    "Market Landscape",
  ],

  // Competitive intelligence
  "Competitive Intelligence": [
    "Major Drugs And Manufacturers",
  ],

  // Pipeline and clinical trials
  "Pipeline Products": [
    "Clinical Trial Pipeline",
    "Key Product Approval Timeline And Market Baskets",
  ],

  // Patient analytics and cohorts
  "Patient Analytics": [
    "Disease Specific Patient Cohort Defs",
  ],

  // Access and reimbursement
  "Access & Reimbursement": [
    "Access And Reimbursement Caveats",
  ],
};

/**
 * Get KB topics for a given UI topic
 * @param {string|null} uiTopic - The business-friendly topic name, or null
 * @returns {string[]|null} Array of KB topics, or null if no mapping
 */
function getKBTopics(uiTopic) {
  if (!uiTopic || !uiTopic.trim()) {
    return null;
  }

  const trimmed = uiTopic.trim();
  return TOPIC_MAPPING[trimmed] || null;
}

/**
 * Check if a UI topic is valid
 * @param {string} uiTopic - The business-friendly topic name
 * @returns {boolean} True if the topic exists in the mapping
 */
function isValidUITopic(uiTopic) {
  if (!uiTopic || !uiTopic.trim()) {
    return false;
  }
  return uiTopic.trim() in TOPIC_MAPPING;
}

/**
 * Get all available UI topics
 * @returns {string[]} Array of all UI topic names
 */
function getAllUITopics() {
  return Object.keys(TOPIC_MAPPING).sort();
}

/**
 * Get all KB topics (flattened from all mappings)
 * @returns {string[]} Array of all unique KB topic names
 */
function getAllKBTopics() {
  const topics = new Set();
  for (const kbTopics of Object.values(TOPIC_MAPPING)) {
    for (const topic of kbTopics) {
      topics.add(topic);
    }
  }
  return Array.from(topics).sort();
}

export {
  TOPIC_MAPPING,
  getKBTopics,
  isValidUITopic,
  getAllUITopics,
  getAllKBTopics,
};
