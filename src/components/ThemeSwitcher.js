"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const themes = [
  { id: "challengegrind", label: "ChallengeGrind", colors: ["#0a0705", "#ff6b1a", "#ffb627"] },
  { id: "bw", label: "Black & White", colors: ["#0a0a0a", "#e0e0e0", "#ffffff"] },
  { id: "arcane", label: "Arcane", colors: ["#211f20", "#e79291", "#65161b"] },
  { id: "perfectsky", label: "Perfect Sky", colors: ["#002d45", "#b9e9fb", "#0098ad"] },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const current = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-cg-border transition-all duration-200 hover:border-cg-orange/40"
        aria-label="Switch theme"
      >
        <div className="flex gap-0.5">
          {current.colors.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-xs text-cg-white-dim hidden sm:inline">{current.label}</span>
        <svg
          className={`h-3 w-3 text-cg-white-dim transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 min-w-[180px] animate-slide-down rounded-lg border border-cg-border bg-cg-surface py-1.5 shadow-xl shadow-black/50">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-150 ${
                theme === t.id ? "text-cg-orange" : "text-cg-white-dim hover:text-cg-white"
              }`}
            >
              <div className="flex gap-0.5">
                {t.colors.map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              {t.label}
              {theme === t.id && (
                <svg className="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
