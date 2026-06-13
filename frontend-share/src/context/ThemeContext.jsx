import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check if there's a saved preference in the browser, otherwise default to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "dark";
  });

  useEffect(() => {
    // 1. Grab the root body tag of your website
    const bodyElement = document.body;
    
    // 2. Clear old classes to avoid duplicate conflicts
    bodyElement.classList.remove("light", "dark");
    
    // 3. Mount the current active theme class directly onto the body layout
    bodyElement.classList.add(theme);
    
    // 4. Stash preference into the browser storage so refresh doesn't wipe it
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}