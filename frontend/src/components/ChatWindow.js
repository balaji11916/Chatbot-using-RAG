import React, { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  return (
    <div className="chat-window">
      {!messages.length && !isTyping && (
        <div className="empty-state">
          <h2>👋 Start a conversation</h2>
          <p>Ask me anything, or upload a PDF to chat with its contents.</p>
        </div>
      )}
      {messages.map((msg, i) => (
        <div key={i} className={`message-row ${msg.sender}`}>
          <div className={`message-bubble ${msg.sender}`}>{msg.message}</div>
        </div>
      ))}
      {isTyping && (
        <div className="message-row bot">
          <div className="message-bubble bot typing-indicator">
            <span/><span/><span/>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}