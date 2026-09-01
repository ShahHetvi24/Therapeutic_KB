import React, { useState } from "react";

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="source-card">
      <div className="source-header">
        <strong>📄 {source.document || source.documentPath}</strong>
        {source.sections && source.sections.length > 1 && (
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▼" : "▶"}
          </button>
        )}
      </div>
      <div className="source-meta">
        {source.disease && <span className="badge disease">{source.disease}</span>}
        {source.topic && <span className="badge topic">{source.topic}</span>}
      </div>
      {source.sections && source.sections.length > 0 && (
        <div className="source-sections">
          {expanded ? (
            <ul>
              {source.sections.map((section, idx) => (
                <li key={idx}>{section}</li>
              ))}
            </ul>
          ) : (
            <div className="section-preview">
              {source.sections.length === 1 ? (
                <span>{source.sections[0]}</span>
              ) : (
                <span>{source.sections[0]} +{source.sections.length - 1} more</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
