"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/members", label: "Members", icon: "👥" },
    { href: "/attendance", label: "Attendance", icon: "✓" },
    { href: "/payments", label: "Payments", icon: "💰" },
    { href: "/memberships", label: "Memberships", icon: "💳" },
    { href: "/services", label: "Services", icon: "🏋️" },
  ];

  const bottomItems = [
    { href: "/reports", label: "Reports", icon: "📈" },
    { href: "/theme", label: "Theme", icon: "🎨" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-border-dark bg-white dark:bg-[#0f1115] hidden md:flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            💪
          </div>
          <div>
            <h1 className="text-xl font-800 tracking-tighter text-slate-900 dark:text-white uppercase">
              IRONCORE
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest leading-none">
              Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border-r-3 border-primary"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-primary"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="pt-10">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-primary transition-all text-sm font-semibold"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-slate-200 dark:border-border-dark">
        <div className="flex items-center gap-3 p-2">
          <div className="size-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
              AR
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white leading-none">
              Alex Rivera
            </p>
            <p className="text-[10px] text-slate-500">Admin Account</p>
          </div>
          <button className="text-slate-500 hover:text-primary transition-colors flex-shrink-0">
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
};
