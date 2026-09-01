import React, { forwardRef } from "react";
import ChatMessage from "./ChatMessage";

const ChatWindow = forwardRef(function ChatWindow({ messages, onFollowUp }, ref) {
  return (
    <div className="chat-window" ref={ref}>
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} onFollowUp={onFollowUp} />
      ))}
    </div>
  );
});

export default ChatWindow;
