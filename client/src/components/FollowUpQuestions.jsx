import React from "react";

export default function FollowUpQuestions({ questions, onClick }) {
  return (
    <div className="followup-list">
      {questions.map((q) => (
        <button key={q} className="followup-btn" onClick={() => onClick(q)}>
          {q}
        </button>
      ))}
    </div>
  );
}
