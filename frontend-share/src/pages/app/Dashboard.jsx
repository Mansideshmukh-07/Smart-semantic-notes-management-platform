import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import UploadModal from "../../components/upload/UploadModal";
import ChatPanel from "../../components/chat/ChatPanel";
import api from "../../services/api";
import { searchNotesDatabase } from "../../services/chatService"; // Import our rocket service
import useDebounce from "../../hooks/useDebounce"; // Import our stopwatch helper
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem("access"); 
  const [messages, setMessages] = useState([]);
  const [activeView, setActiveView] = useState("chat");
  const [showUpload, setShowUpload] = useState(false);

  // New states for the Global System Search view
  const [searchQuery, setSearchQuery] = useState(""); // Tracks typing characters
  const [searchResults, setSearchResults] = useState(""); // Stores vector match response
  const [isSearching, setIsSearching] = useState(false); // Shows a loader for search

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      try {
        await api.get("/profile/");
      } catch (err) {
        console.log(err);
      }
    }

    loadProfile();
  }, [navigate, token]);

  // ── FEATURE 1: REAL CHAT PANEL VECTOR SEARCH ──
  const handleSendMessage = async (textPayload) => {
    // 1. Instantly display what the user typed on the screen
    const userMessage = { 
      id: Date.now(), 
      sender: "user", 
      text: textPayload 
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // 2. Fire the rocket helper to tell Django to convert this text to a vector
      const realAnswerText = await searchNotesDatabase(textPayload);

      // 3. Put the real database answer on the screen
      const aiMessage = { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: realAnswerText 
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (err) {
      console.error("Chat Vector search failed:", err);
      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I ran into a problem searching through your notes context database."
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // ── FEATURE 2: PREVENTING REPEATED CALLS WHILE TYPING (DEBOUNCING) ──
  // Hand the raw typing text to our stopwatch hook. It waits for 400ms of silence.
  const debouncedSearchTerm = useDebounce(searchQuery, 400);

  useEffect(() => {
    // If the input box is completely wiped empty, clear the old results and stop
    if (!debouncedSearchTerm.trim()) {
      setSearchResults("");
      return;
    }

    async function triggerDelayedSearch() {
      setIsSearching(true);
      try {
        // Fires only ONE time when the user stops typing
        const answer = await searchNotesDatabase(debouncedSearchTerm);
        setSearchResults(answer);
      } catch (err) {
        setSearchResults("Failed to retrieve matching context from your system library.");
      } finally {
        setIsSearching(false);
      }
    }

    triggerDelayedSearch();
  }, [debouncedSearchTerm]); // Wakes up ONLY when the stopwatch finishes ticking down!


  // Add new note passed back from UploadModal
  const handleUpload = (newNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  return (
    <div className="dashboard-app">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar
          notes={notes}
          setActiveView={setActiveView}
          setShowUpload={setShowUpload}
        />

        <main className="workspace-panel">

          {/* CHAT VIEW */}
          {activeView === "chat" && (
            <div className="view-wrapper chat-view">
              <ChatPanel 
                messages={messages} 
                onSendMessage={handleSendMessage} 
              />
            </div>
          )}

          {/* NOTES VIEW */}
          {activeView === "notes" && (
            <div className="view-wrapper content-view">
              <div className="view-title-header">
                <div>
                  <h2>Knowledge Base</h2>
                  <p>Browse and manage your source documents</p>
                </div>
              </div>

              <div className="documents-grid-layout">
                {notes.map((n) => (
                  <div key={n.id} className="document-premium-card">
                    <div className="document-icon-wrapper">
                      <span className="doc-format-tag">PDF</span>
                    </div>
                    <div className="document-info-block">
                      <span className="document-filename">{n.name}</span>
                      <span className="document-filesize">Uploaded Asset</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH VIEW */}
          {activeView === "search" && (
            <div className="view-wrapper content-view">
              <div className="view-title-header">
                <h2>Global System Search</h2>
                <p>Locate specific terms, concepts, or references across your entire library</p>
              </div>
              
              <div className="search-input-container">
                {/* Connected to searchQuery so characters render instantly on screen */}
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, tags, categories, or text snippets..." 
                  className="global-search-bar"
                />
              </div>

              {/* Display panel to view results nicely */}
              <div className="search-results-panel" style={{ marginTop: "2rem" }}>
                <h3>{isSearching ? "Searching Knowledge Base..." : "Search Result:"}</h3>
                <div className="result-text-box" style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", minHeight: "60px" }}>
                  <p style={{ margin: 0, color: searchResults ? "#333" : "#777" }}>
                    {searchResults || "Type your topic queries above to look up embeddings..."}
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <UploadModal
        show={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
