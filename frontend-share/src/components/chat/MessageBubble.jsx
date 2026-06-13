import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const { sender, text, answer, timestamp } = message;
  const isUser = sender === "user";
  const displayContent = answer || text || "";

  return (
    <div className={`chat-layout-wrapper ${isUser ? "user-right-align" : "ai-left-align"}`}>
      {/* Sender Identity Tag */}
      <span className="chat-avatar-label">
        {isUser ? "👤 You" : "🤖 Assistant"}
      </span>
      
      {/* Content Core */}
      {isUser ? (
        // User Question Box (Now on the Right)
        <div className="user-query-card dynamic-theme-box">
          <p>{displayContent}</p>
        </div>
      ) : (
        // RAG Answer Area (Now on the Left)
        <div className="ai-response-prose structural-fade-in">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
      )}

      {timestamp && (
        <span className="chat-layout-timestamp">{timestamp}</span>
      )}
    </div>
  );
}
