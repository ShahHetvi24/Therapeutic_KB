import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import TopicTags from "./components/TopicTags";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";
import { sendChatMessage } from "./services/api.js";

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [disease, setDisease] = useState(null);
  const [topic, setTopic] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when messages change
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendQuestion = async (question) => {
    if (!question || loading) return;
    setError(null);
    const userMsg = { id: Date.now() + "u", sender: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // Call real backend API with disease and topic filters
      const res = await sendChatMessage({
        question: question.trim(),
        disease,
        topic,
      });

      if (res && res.answer) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + "a",
            sender: "assistant",
            text: res.answer,
            sources: res.sources || [],
            followUpQuestions: res.followUpQuestions || [],
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + "a",
            sender: "assistant",
            text: "I couldn't find sufficient information in the provided knowledge base to answer this question.",
            sources: [],
            followUpQuestions: [],
          },
        ]);
      }
    } catch (err) {
      const errorMessage =
        err?.message ||
        "An error occurred while fetching the answer.";
      setError(errorMessage);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + "ae",
          sender: "assistant",
          text: errorMessage,
          sources: [],
          followUpQuestions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (text) => {
    sendQuestion(text.trim());
  };

  const handleTopicClick = (topicName, topicQuestion) => {
    // Set topic and send question
    setTopic(topicName);
    handleSend(topicQuestion);
  };

  const handleSuggestedClick = (q) => {
    handleSend(q);
  };

  const handleFollowUp = (q) => {
    handleSend(q);
  };

  return (
    <div className="app-root">
      <Header />
      
      {/* Disease Selector */}
      <div className="disease-selector">
        <span className="selector-label">Disease Area:</span>
        <div className="selector-buttons">
          <button
            className={`disease-btn ${disease === null ? "active" : ""}`}
            onClick={() => setDisease(null)}
          >
            All
          </button>
          <button
            className={`disease-btn ${disease === "AML" ? "active" : ""}`}
            onClick={() => setDisease("AML")}
          >
            AML
          </button>
          <button
            className={`disease-btn ${disease === "CLL" ? "active" : ""}`}
            onClick={() => setDisease("CLL")}
          >
            CLL
          </button>
          <button
            className={`disease-btn ${disease === "MM" ? "active" : ""}`}
            onClick={() => setDisease("MM")}
          >
            MM
          </button>
          <button
            className={`disease-btn ${disease === "NHL" ? "active" : ""}`}
            onClick={() => setDisease("NHL")}
          >
            NHL
          </button>
        </div>
      </div>

      <main className="main-container">
        <TopicTags onTopicClick={handleTopicClick} selectedTopic={topic} />

        <section className="content-area">
          {messages.length === 0 && !loading ? (
            <WelcomeScreen onSuggest={handleSuggestedClick} />
          ) : (
            <ChatWindow
              ref={chatRef}
              messages={messages}
              onFollowUp={handleFollowUp}
            />
          )}

          {error && <div className="error-banner">{error}</div>}

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSend(inputValue)}
            disabled={loading}
            loading={loading}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
