import { useState, useRef, useEffect } from "react";

function ChatBox({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <p className="message-content">{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <p className="message-content">
              <span className="loading-dots">Thinking</span>
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatBox;
