import React, { useEffect, useState, useRef } from "react";
import { sendChatMessage } from "../api.js";

const MEMORY_KEY = "eduagent.chat.history";

function ChatBox({ lesson, initialHighlighted, initialHighlightContext, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const persist = (nextMessages) => {
    setMessages(nextMessages);
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(nextMessages));
    } catch (e) {
      console.warn("Could not persist chat history", e);
    }
  };

  const loadPersisted = () => {
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Could not load persisted history", e);
    }
    return [];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const savedMessages = loadPersisted();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
      return;
    }

    if (initialHighlighted) {
      persist([
        {
          role: "user",
          content: `I'm confused about this part of the lesson:\n\n\"${initialHighlighted}\".\nCan you explain it in simple terms?`
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (!initialHighlighted) return;

    const question = `I'm confused about this part of the lesson:\n\n\"${initialHighlighted}\".\nCan you explain it in simple terms?`;

    const alreadyExists = messages.some(
      (m) => m.role === 'user' && m.content === question
    );

    if (alreadyExists) return;

    const newMessages = [...messages, { role: 'user', content: question }];
    persist(newMessages);
  }, [initialHighlighted]);

  const getContextMessages = () => {
    const previousMessages = messages.slice(-4); // keep 2 exchanges (user + assistant)
    return previousMessages;
  };

  const formatAssistantContent = (content) => {
    const lines = content.split(/\r?\n/);
    const chunks = [];
    let listType = null;
    let listItems = [];

    const flushList = () => {
      if (!listType || listItems.length === 0) return;
      chunks.push({ type: listType, items: [...listItems] });
      listItems = [];
      listType = null;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        chunks.push({ type: "br" });
        continue;
      }

      const headingMatch = trimmed.match(/^(Summary|Key idea|Step by step|In one line|Extra rules):$/i);
      if (headingMatch) {
        flushList();
        chunks.push({ type: "heading", text: headingMatch[1] });
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        listItems.push(trimmed.replace(/^[-*]\s+/, ""));
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        listItems.push(trimmed.replace(/^\d+\.\s+/, ""));
        continue;
      }

      flushList();
      chunks.push({ type: "text", text: trimmed });
    }

    flushList();

    return chunks.map((chunk, idx) => {
      switch (chunk.type) {
        case "heading":
          return (
            <div key={idx} className="markdown-heading">
              {chunk.text}
            </div>
          );
        case "br":
          return <div key={idx} style={{ height: 8 }} />;
        case "text":
          return (
            <div key={idx} className="markdown-paragraph">
              {chunk.text}
            </div>
          );
        case "ul":
          return (
            <ul key={idx} className="markdown-list">
              {chunk.items.map((item, i) => (
                <li key={`${idx}-${i}`}>{item}</li>
              ))}
            </ul>
          );
        case "ol":
          return (
            <ol key={idx} className="markdown-list">
              {chunk.items.map((item, i) => (
                <li key={`${idx}-${i}`}>{item}</li>
              ))}
            </ol>
          );
        default:
          return null;
      }
    });
  };


  const handleSend = async () => {
    if (!input.trim() && messages.length === 0) return;

    const userMessage = input.trim()
      ? { role: "user", content: input.trim() }
      : null;

    const updatedMessages = userMessage
      ? [...messages, userMessage]
      : [...messages];

    persist(updatedMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const contextMessages = userMessage
        ? [...getContextMessages(), userMessage]
        : getContextMessages();

      const response = await sendChatMessage({
        lesson_text: lesson,
        highlighted_text: initialHighlighted || "",
        highlight_context: initialHighlightContext || "",
        messages: contextMessages
      });

      persist([...updatedMessages, response.assistant_message]);
    } catch (e) {
      console.error(e);
      setError("Failed to reach EduAgent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeContext = async () => {
    if (loading) return;

    const summaryRequest = {
      role: "user",
      content:
        "Please summarize the entire lesson context in simple language for a student, with bullets and a short conclusion. Then offer one or two quick tips for what to ask next."
    };

    const updatedMessages = [...messages, summaryRequest];
    persist(updatedMessages);
    setLoading(true);
    setError("");

    try {
      const contextMessages = [...getContextMessages(), summaryRequest];

      const response = await sendChatMessage({
        lesson_text: lesson,
        highlighted_text: initialHighlighted || "",
        messages: contextMessages
      });

      persist([...updatedMessages, response.assistant_message]);
    } catch (e) {
      console.error(e);
      setError("Failed to summarize context. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSend();
      }
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h2>EduAgent</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="ghost-btn" onClick={handleSummarizeContext}>
            Summarize Context
          </button>
          <button className="ghost-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="chat-meta">
        <p>
          EduAgent answers based on the current lesson. Highlight text in the
          lesson for more focused help.
        </p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            Ask anything about the lesson to get started.
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === "user" ? "chat-message user" : "chat-message assistant"
            }
          >
            <div className="chat-message-role">
              {m.role === "user" ? "You" : "EduAgent"}
            </div>
            <div className="chat-message-content">
              {m.role === "assistant"
                ? formatAssistantContent(m.content)
                : m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && (
          <div className="chat-message assistant">
            <div className="chat-message-role">EduAgent</div>
            <div className="chat-message-content">Thinking...</div>
          </div>
        )}
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your doubt here... (Shift+Enter for new line)"
          rows={2}
        />
        <button
          className="primary-btn send-btn"
          onClick={handleSend}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
