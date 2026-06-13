import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ReactMarkdown from 'react-markdown';
export default function ChatPanel({ messages, onSendMessage }) {
  const streamEndRef = useRef(null);

  // Auto-scroll anchor point tracking helper
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="workspace-panel chat-view">
      {messages.length === 0 ? (
        <div className="empty-chat-state">
          <div className="empty-chat-state">
            <span className="sparkle-badge">Semantic Search Engine</span>
            <h2>Search your notes by meaning</h2>
            <p>
                Ask a question here and I will extract precise answers based on the context of your notes.
            </p>
            </div>
        </div>
      ) : (
        <div className="chat-message-stream">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={streamEndRef} />
        </div>
      )}

      {/* INPUT ARCHITECTURE ANCHOR TERMINAL */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
