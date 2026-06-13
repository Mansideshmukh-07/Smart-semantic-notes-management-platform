import { useState } from "react";

export default function Sidebar({ notes, setActiveView, setShowUpload }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("chat");

  const handleNavClick = (viewName) => {
    setActiveItem(viewName);
    if (setActiveView) setActiveView(viewName);
  };

  return (
    <aside className={`sidebar-container ${collapsed ? "is-collapsed" : ""}`}>
      
      {/* SIDEBAR HEADER BLOCK */}
      <div className="sidebar-brand-wrapper">
        {!collapsed && (
          <div className="brand-meta-identity">
            <svg className="brand-spark-vector" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m10.607 10.607l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <span className="brand-system-name">Workspace</span>
          </div>
        )}
        
        <button 
          className="sidebar-collapse-trigger"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle navigation structural drawer"
        >
          {collapsed ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 19l-7-7 7-7M19 19l-7-7 7-7"/></svg>
          )}
        </button>
      </div>

      {/* CORE NAVIGATION LINKS */}
      <nav className="sidebar-navigation-links">
        <button 
          className={`sidebar-nav-row ${activeItem === "chat" ? "is-active" : ""}`}
          onClick={() => handleNavClick("chat")}
        >
          <div className="nav-row-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          {!collapsed && <span className="nav-row-label">AI Workspace</span>}
        </button>

        <button 
          className="sidebar-nav-row highlight-upload-action"
          onClick={() => setShowUpload && setShowUpload(true)}
        >
          <div className="nav-row-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          </div>
          {!collapsed && <span className="nav-row-label">Upload Note</span>}
        </button>

        <button 
          className={`sidebar-nav-row ${activeItem === "notes" ? "is-active" : ""}`}
          onClick={() => handleNavClick("notes")}
        >
          <div className="nav-row-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          {!collapsed && (
            <div className="nav-label-with-counter">
              <span className="nav-row-label">Knowledge Base</span>
              <span className="sidebar-badge-counter">{notes.length}</span>
            </div>
          )}
        </button>

        <button 
          className={`sidebar-nav-row ${activeItem === "search" ? "is-active" : ""}`}
          onClick={() => handleNavClick("search")}
        >
          <div className="nav-row-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          {!collapsed && <span className="nav-row-label">Global Search</span>}
        </button>
      </nav>

      {/* DYNAMIC INTEGRATED DOCUMENT SUB-LIST */}
      {!collapsed && (
        <div className="sidebar-document-section">
          <div className="document-section-title">Active Files</div>
          <div className="sidebar-document-scroll-container">
            {notes.map((n) => (
              <div key={n.id} className="sidebar-document-item-row" onClick={() => handleNavClick("notes")}>
                <svg className="document-clip-vector" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="sidebar-document-filename-text">{n.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}