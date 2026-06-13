// src/pages/public/Landing.jsx
import { useNavigate } from "react-router-dom";
import COLORS from "../../styles/colors";

const FEATURES = [
  { icon: "🔍", bg: "#1A3A7A", label: "Semantic Search",    desc: "Ask questions in natural language and get precise answers from your notes." },
  { icon: "✍️", bg: "#0A3A35", label: "Handwritten OCR",    desc: "Upload photos of handwritten notes. Our custom OCR engine converts them to searchable, digital text." },
  { icon: "🧠", bg: "#2A1A4A", label: "RAG Intelligence",   desc: "Retrieval-Augmented Generation synthesizes answers from multiple notes for context-aware responses." },
  { icon: "📂", bg: "#2A1A15", label: "Subject Categories", desc: "Organize notes by subject, topic, or custom tags for structured academic knowledge management." },
  { icon: "🔐", bg: "#1A1A3A", label: "Secure & Private",   desc: "Personalized encrypted vaults ensure only you can access your academic notes and insights." },
  { icon: "⚡", bg: "#0A2A1A", label: "Instant Retrieval",  desc: "Semantic embeddings power millisecond-fast search across thousands of pages of notes." },
];

const STEPS = [
  ["01", "Upload Your Notes",    "Upload PDFs, images of handwritten notes, text files, or Word documents."],
  ["02", "OCR & Preprocessing",  "Our engine extracts text, cleans it, and structures the content for analysis."],
  ["03", "Semantic Embedding",   "Notes are converted into vector embeddings capturing meaning, not just keywords."],
  ["04", "Ask & Retrieve",       "Query in natural language. The system synthesizes context-aware answers from your notes."],
];

const STATS = [
  ["Study Smarter", "Not Harder"],
  ["Instant", "Note Access"],
  ["Organized", "Study Material"],
  ["Exam Ready", "Anytime"],
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="hero">
        <div className="glow-orb pulse-orb" style={{ width: 500, height: 500, background: COLORS.accent,    top: -100, left: "30%", marginLeft: -250 }} />
        <div className="glow-orb pulse-orb" style={{ width: 300, height: 300, background: COLORS.teal,     top: 80,  right: "15%", animationDelay: "2s" }} />

        <div className="hero-tag fade-up">
          <span className="dot" />
          Academic Notes Management Platform 
        </div>

        <h1 className="hero-headline fade-up-2">
        Smarter Notes<br />
          <span className="highlight">Retrieve It Instantly</span>
        </h1>

        <p className="fade-up-3">
        Upload, organize, and retrieve handwritten or digital notes using Intelligence. Ask questions — get answers from your own study material.
        </p>

        <div className="hero-actions fade-up-4">
          {/* Fixed below: Changed setPage to navigate */}
          <button className="hero-cta"       onClick={() => navigate("/signup")}>Start for Free →</button>
          <button className="hero-cta-ghost" onClick={() => navigate("/login")}>Sign In</button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="stats-strip">
        {STATS.map(([num, label]) => (
          <div className="stat-item" key={label}>
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <div className="section">
        <div className="section-tag">Capabilities</div>
        <h2 className="section-title">Everything you need to study smarter</h2>
        
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.label}>
              <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="section" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="section-tag">Workflow</div>
        <div className="how-it-works">

          <div>
            <h2 className="section-title">How SemanticNotes works</h2>
            <p className="section-sub" style={{ marginBottom: 32 }}>
              From raw notes to intelligent answers in four seamless steps.
            </p>
            <div className="step-list">
              {STEPS.map(([n, t, d]) => (
                <div className="step-item" key={n}>
                  <div className="step-num">{n}</div>
                  <div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="demo-card float">
            <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>
              Live Demo Preview
            </p>
            <div className="demo-search">
              <input defaultValue="Explain Newton's second law" readOnly />
              <button>Search</button>
            </div>

            {[
              { tag: "Physics — Chapter 3", text: "Newton's second law states that force equals mass times acceleration (F = ma). The acceleration of an object is directly proportional to the net force acting upon it...", score: 97 },
            ].map((r, i) => (
              <div className="demo-result" key={i}>
                <div className="demo-result-tag">{r.tag}</div>
                <div className="demo-result-text">{r.text}</div>
                <div className="demo-result-meta">
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="section" style={{ textAlign: "center" }}>
        <div className="glow-orb" style={{ width: 300, height: 300, background: COLORS.teal, bottom: 0, left: "50%", marginLeft: -150 }} />
        <h2 className="section-title" style={{ position: "relative" }}>Ready to study smarter?</h2>
        <p className="section-sub" style={{ margin: "0 auto 32px", position: "relative" }}>
          Join students who are already using SemanticNotes to turn hours of review into minutes of insight.
        </p>
        <button className="hero-cta" style={{ position: "relative" }} onClick={() => navigate("/signup")}>
          Create Your Free Account →
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div>
          <div className="footer-brand">Semantic<span>Notes</span></div>
          <p style={{ marginTop: 6, fontSize: 13, color: COLORS.muted }}>Smart Academic Notes Platform</p>
        </div>
        <p>© 2025 SemanticNotes. Built for students.</p>
      </footer>
    </div>
  );
}
