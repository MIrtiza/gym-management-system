"use client";

import { useTheme } from "@/lib/themeContext";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

interface HeaderProps {
  onOpenQuickCheckin?: () => void;
}

export const Header = ({ onOpenQuickCheckin }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signout, gymName } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  const handleSettings = () => {
    setIsDropdownOpen(false);
    router.push("/settings");
  };

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

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">
                  {gymName || "Gym Owner"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Gym Manager
                </p>
              </div>
              <div className="size-10 rounded-xl bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-transparent hover:ring-primary/20 transition-all">
                {user?.email?.[0].toUpperCase() || "G"}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d23] rounded-xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-[#2d333d] overflow-hidden z-50">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-[#2d333d]">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {gymName || "Gym Owner"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {user?.email || "No email"}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleSettings}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-[#0f1115] text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
                  >
                    <span>⚙️</span>
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors border-t border-slate-200 dark:border-[#2d333d] mt-2 pt-2"
                  >
                    <span>🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
