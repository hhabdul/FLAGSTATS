"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setTheme("light");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  }

  return (
    <button
      onClick={toggleTheme}
      className="glass-panel rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.08em] text-ink-primary transition hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
      type="button"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
