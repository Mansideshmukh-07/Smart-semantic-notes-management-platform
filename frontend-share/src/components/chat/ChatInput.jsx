import { useState } from "react";

export default function ChatInput({ onSendMessage, placeholder = "Ask about your notes or codebase..." }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message.trim());
    setMessage(""); // Clear text buffer
  };

  return (
    <div className="input-panel-wrapper">
      <form className="interactive-input-box" onSubmit={handleSubmit}>
        <input
          type="text"
          className="dashboard-pro-input"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          type="submit" 
          className="send-message-btn" 
          disabled={!message.trim()}
        >
          Send
        </button>
      </form>
      <span className="input-disclaimer">
        responses are generated using your personal Notes context
      </span>
    </div>
  );
}