"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "challengegrind",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("challengegrind");

  useEffect(() => {
    const saved = localStorage.getItem("cg-theme");
    if (saved) {
      setThemeState(saved);
      applyTheme(saved);
    }
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem("cg-theme", t);
    applyTheme(t);
  };

  const applyTheme = (t) => {
    if (t === "challengegrind") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
