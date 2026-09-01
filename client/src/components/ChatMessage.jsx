import React from "react";
import SourceCard from "./SourceCard";
import FollowUpQuestions from "./FollowUpQuestions";

export default function ChatMessage({ message, onFollowUp }) {
  const isUser = message.sender === "user";

  return (
    <div className={"chat-message " + (isUser ? "user" : "assistant")}>
      <div className="bubble">
        <div className="message-text">{message.text}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="sources">
            <h4>Relevant Sources found</h4>
            {message.sources.map((s, i) => (
              <SourceCard key={i} source={s} />
            ))}
          </div>
        )}

        {!isUser && message.followUpQuestions && message.followUpQuestions.length > 0 && (
          <div className="followups">
            <h4>Related Questions</h4>
            <FollowUpQuestions questions={message.followUpQuestions} onClick={onFollowUp} />
          </div>
        )}
      </div>
    </div>
  );
}
