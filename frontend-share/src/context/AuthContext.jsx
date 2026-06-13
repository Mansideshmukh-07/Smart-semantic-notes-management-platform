// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // In production replace this with a real token/session check
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sn_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(userData) {
    localStorage.setItem("sn_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("sn_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
