import React, { useRef } from "react";

export default function ChatInput({ value, onChange, onSend, disabled, loading }) {
  const ref = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value && value.trim()) onSend();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        ref={ref}
        placeholder="Ask a question about Lymphoma..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        disabled={disabled}
      />

      <button className="send-btn" onClick={() => value && value.trim() && onSend()} disabled={!value || disabled}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
