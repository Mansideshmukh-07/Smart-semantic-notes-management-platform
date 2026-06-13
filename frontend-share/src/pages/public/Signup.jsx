// src/pages/public/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import COLORS from "../../styles/colors";
import api from "../../services/api";

const STRENGTH_COLORS = ["#FF6B6B", "#F5C842", "#4F8EF7", "#0FBCAD"];
const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"];

function getPasswordStrength(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function EyeIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      ) : (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
      )}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
      <polyline points="2,6 5,9 10,3"/>
    </svg>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();   // ← Bug 4 fix

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", agree: false });
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pwStrength = getPasswordStrength(form.password);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(er => ({ ...er, [key]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())                        e.name     = "Full name is required";
    if (!form.email)                              e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email    = "Enter a valid email";
    if (!form.password)                           e.password = "Password is required";
    else if (form.password.length < 8)            e.password = "Minimum 8 characters";
    if (!form.confirm)                            e.confirm  = "Please confirm your password";
    else if (form.confirm !== form.password)      e.confirm  = "Passwords do not match";
    if (!form.agree)                              e.agree    = "Please accept the terms to continue";
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
  
      await api.post("/signup/", {
        username: form.email,
        email: form.email,
        password: form.password,
      });
  
      setSuccess(true);
  
    } catch (error) {
      console.log("SIGNUP ERROR:", error.response?.data);
      setErrors({
        email: error.response?.data?.email?.[0] ||
               error.response?.data?.password?.[0] ||
               "Unable to create account"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ paddingTop: 88, paddingBottom: 40 }}>
      <div className="glow-orb pulse-orb" style={{ width: 350, height: 350, background: COLORS.teal,   top: "5%",    right: "10%" }} />
      <div className="glow-orb pulse-orb" style={{ width: 400, height: 400, background: COLORS.accent, bottom: "5%", left: "10%", animationDelay: "2s" }} />

      <div className="auth-card fade-up">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div className="nav-logo">S</div>
          <span className="nav-title">Semantic<span style={{ color: COLORS.accent }}>Notes</span></span>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#0A3A35", border: `2px solid ${COLORS.teal}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 28,
            }}>🎉</div>
            <h2 style={{ marginBottom: 10 }}>Account created!</h2>
            <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>
              Welcome, <strong style={{ color: COLORS.white }}>{form.name}</strong>! Your vault is ready.
            </p>
            <button className="submit-btn" onClick={() => navigate("/login")}>Sign In Now →</button>
          </div>
        ) : (
          <>
            <h2>Create account</h2>
            <p className="sub">Start organizing your notes with AI intelligence.</p>

            <div className="field-group">
              <label className="field-label">Full name</label>
              <input className={`input-field${errors.name ? " error" : ""}`} type="text" placeholder="Your full name"
                value={form.name} onChange={e => setField("name", e.target.value)} />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Email address</label>
              <input className={`input-field${errors.email ? " error" : ""}`} type="email" placeholder="you@university.edu"
                value={form.email} onChange={e => setField("email", e.target.value)} />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="password-wrapper">
                <input className={`input-field${errors.password ? " error" : ""}`}
                  type={showPw ? "text" : "password"} placeholder="Minimum 8 characters"
                  style={{ paddingRight: 44 }} value={form.password}
                  onChange={e => setField("password", e.target.value)} />
                <button className="password-toggle" onClick={() => setShowPw(s => !s)}><EyeIcon open={showPw} /></button>
              </div>
              {form.password && (
                <>
                  <div className="strength-bar">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="strength-seg"
                        style={{ background: i < pwStrength ? STRENGTH_COLORS[pwStrength-1] : undefined }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: STRENGTH_COLORS[pwStrength-1] || COLORS.muted, marginTop: 5 }}>
                    {pwStrength > 0 ? STRENGTH_LABELS[pwStrength-1] + " password" : ""}
                  </p>
                </>
              )}
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Confirm password</label>
              <div className="password-wrapper">
                <input className={`input-field${errors.confirm ? " error" : ""}`}
                  type={showCPw ? "text" : "password"} placeholder="Re-enter your password"
                  style={{ paddingRight: 44 }} value={form.confirm}
                  onChange={e => setField("confirm", e.target.value)} />
                <button className="password-toggle" onClick={() => setShowCPw(s => !s)}><EyeIcon open={showCPw} /></button>
              </div>
              {errors.confirm && <p className="error-text">{errors.confirm}</p>}
            </div>

            <div className="field-group" style={{ marginBottom: 24 }}>
              <div className="checkbox-wrapper"
                onClick={() => { setForm(f => ({ ...f, agree: !f.agree })); setErrors(er => ({ ...er, agree: "" })); }}>
                <div className={`custom-checkbox${form.agree ? " checked" : ""}`}>{form.agree && <CheckIcon />}</div>
                <span className="checkbox-label">
                  I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span>
                </span>
              </div>
              {errors.agree && <p className="error-text" style={{ marginTop: 6 }}>{errors.agree}</p>}
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating your account…" : "Create Account →"}
            </button>

            <div className="auth-switch">
              Already have an account? <span onClick={() => navigate("/login")}>Sign in</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
