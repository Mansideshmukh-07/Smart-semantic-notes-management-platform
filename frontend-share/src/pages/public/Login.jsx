// src/pages/public/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import COLORS from "../../styles/colors";
import api from "../../services/api";
// ── Inline eye icon (no extra dependency) ───────────────────────────────
function EyeIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();   // ← Bug 4 fix: use auth context

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email)                            e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email";
    if (!form.password)                         e.password = "Password is required";
    return e;
  }

  const handleSubmit = async (e) => {
    e?.preventDefault();
  
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
  
    try {
      setLoading(true);
  
      const response = await api.post("/token/", {
        username: form.email,
        password: form.password,
      });
  
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
  
      login({ email: form.email });
  
      navigate("/dashboard");
  
    } catch (error) {
      setErrors({ password: "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div className="glow-orb pulse-orb" style={{ width: 400, height: 400, background: COLORS.accent, top: "10%",    left: "20%",  marginLeft: -200 }} />
      <div className="glow-orb pulse-orb" style={{ width: 300, height: 300, background: COLORS.teal,   bottom: "10%", right: "15%", animationDelay: "2s" }} />

      <div className="auth-card fade-up">
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div className="nav-logo">S</div>
          <span className="nav-title">Semantic<span style={{ color: COLORS.accent }}>Notes</span></span>
        </div>

        <h2>Sign in</h2>
        <p className="sub">Welcome back — your notes are waiting.</p>

        {/* Email */}
        <div className="field-group">
          <label className="field-label">Email address</label>
          <input
            className={`input-field${errors.email ? " error" : ""}`}
            type="email"
            placeholder="you@university.edu"
            value={form.email}
            onChange={e => {
              setForm(f => ({ ...f, email: e.target.value }));
              setErrors(er => ({ ...er, email: "" }));
            }}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="field-group">
          <label className="field-label">Password</label>
          <div className="password-wrapper">
            <input
              className={`input-field${errors.password ? " error" : ""}`}
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              style={{ paddingRight: 44 }}
              value={form.password}
              onChange={e => {
                setForm(f => ({ ...f, password: e.target.value }));
                setErrors(er => ({ ...er, password: "" }));
              }}
            />
            <button className="password-toggle" onClick={() => setShowPw(s => !s)}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        {/* Forgot */}
        <div style={{ textAlign: "right", marginBottom: 8, marginTop: -8 }}>
          <span style={{ fontSize: 13, color: COLORS.accent, cursor: "pointer" }}>Forgot password?</span>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        <div className="auth-switch">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Create one free</span>
        </div>
      </div>
    </div>
  );
}