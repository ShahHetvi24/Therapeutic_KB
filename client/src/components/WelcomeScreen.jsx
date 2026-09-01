import React from "react";

const SUGGESTED = [
  "What are the major subtypes of lymphoma?",
  "What biomarkers influence treatment selection?",
  "Summarize the treatment landscape.",
  "What are the key pipeline products?",
  "What are the major unmet needs?",
];

export default function WelcomeScreen({ onSuggest }) {
  return (
    <div className="welcome-screen">
      <h2>How can I help you explore Lymphoma insights?</h2>
      <p className="muted">Ask questions and get evidence-based answers from the therapeutic knowledge base.</p>

      <div className="suggested-grid">
        {SUGGESTED.map((q) => (
          <button key={q} className="suggested-card" onClick={() => onSuggest(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
