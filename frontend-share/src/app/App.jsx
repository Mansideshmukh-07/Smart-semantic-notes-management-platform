// src/app/App.jsx  ← this is the real entry point (index.js imports from here)
import AppRoutes from "./routes";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import "../styles/global.css";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}