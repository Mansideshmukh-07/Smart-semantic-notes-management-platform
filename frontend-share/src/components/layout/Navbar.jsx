import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate(); // ✅ inside component

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <h2>Smart Notes AI</h2>
      </div>

      <div>
        <button onClick={toggleTheme}>
          {theme === "light" ? "Dark" : "Light"}
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}