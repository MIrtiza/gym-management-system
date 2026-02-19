"use client";

import { useEffect, useState } from "react";
import { ThemeContext } from "@/lib/themeContext";

type Theme = "light" | "dark";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read the theme that was set by the script in the head
    const isDark = document.documentElement.classList.contains("dark");
    const currentTheme: Theme = isDark ? "dark" : "light";
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  const applyThemeToDOM = (newTheme: Theme) => {
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyThemeToDOM(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
