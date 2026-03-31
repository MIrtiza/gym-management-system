"use client";

import { useTheme } from "@/lib/themeContext";
import { useEffect, useState } from "react";

interface HeaderProps {
  onOpenQuickCheckin?: () => void;
}

export const Header = ({ onOpenQuickCheckin }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 bg-white dark:bg-[#0f1115] border-b border-slate-200 dark:border-[#2d333d] flex items-center justify-between px-8 shrink-0">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            🔍
          </span>
          <input
            className="w-full bg-slate-50 dark:bg-[#1a1d23] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
            placeholder="Search members, activities or reports..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenQuickCheckin}
          className="bg-[#0d6cf2] hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <span>✓</span>
          Check-in Member
        </button>
        <div className="flex items-center border-l border-slate-200 dark:border-[#2d333d] ml-2 pl-6 gap-3">
          <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#1a1d23] text-slate-500 dark:text-slate-400 relative hover:text-primary transition-all">
            🔔
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 border-2 border-white dark:border-[#0f1115] rounded-full"></span>
          </button>

          {/* Theme Toggle Button */}
          {mounted ? (
            <button
              onClick={toggleTheme}
              className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#1a1d23] text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          ) : (
            <div className="size-10 rounded-xl bg-slate-50 dark:bg-[#1a1d23]"></div>
          )}

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">Admin Alex</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Gym Manager
              </p>
            </div>
            <div className="size-10 rounded-xl bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              AR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

