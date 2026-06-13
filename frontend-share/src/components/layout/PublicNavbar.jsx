// src/components/layout/PublicNavbar.jsx
import { useNavigate, useLocation } from "react-router-dom";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="nav">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <div className="nav-logo">S</div>
        <span className="nav-title">
          Semantic<span>Notes</span>
        </span>
      </div>

      <div className="nav-links">
        {location.pathname !== "/" && (
          <span className="nav-link" onClick={() => navigate("/")}>
            Home
          </span>
        )}
        {location.pathname !== "/login" && (
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Sign In
          </button>
        )}
        {location.pathname !== "/signup" && (
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}