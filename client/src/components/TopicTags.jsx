import React from "react";

const TOPICS = [
  ["Disease Overview", "Give an overview of lymphoma and major subtypes."],
  ["Epidemiology", "Summarize lymphoma epidemiology and incidence."],
  ["Patient Journey", "Describe a typical patient journey for lymphoma."],
  ["Diagnosis & Biomarkers", "What biomarkers influence treatment selection?"],
  ["Treatment Guidelines", "Summarize first-line treatment guidelines."],
  ["Treatment Sequencing", "How is treatment sequencing determined for lymphoma?"],
  ["Market Landscape", "Provide a high-level market landscape summary."],
  ["Competitive Intelligence", "What are key competitor strategies?"],
  ["Pipeline Products", "List major pipeline products for lymphoma."],
  ["Patient Analytics", "How is patient analytics used in lymphoma care?"],
  ["Access & Reimbursement", "Describe access and reimbursement considerations."]
];

export default function TopicTags({ onTopicClick, selectedTopic }) {
  return (
    <div className="topic-tags">
      {TOPICS.map(([label, example]) => (
        <button
          key={label}
          className={`tag ${selectedTopic === label ? "active" : ""}`}
          onClick={() => onTopicClick(label, example)}
          title={example}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
