"use client";

import { THEME } from "@/lib/theme";

export const ThemeShowcase = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Color Theme
        </h2>

        {/* Primary Colors */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Primary Colors
          </h3>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-lg mb-2 border-2 border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: THEME.colors.primary }}
              />
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                {THEME.colors.primary}
              </p>
              <p className="text-xs text-slate-500">Primary</p>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-lg mb-2 border-2 border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: THEME.colors.primaryAccent }}
              />
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                {THEME.colors.primaryAccent}
              </p>
              <p className="text-xs text-slate-500">Accent (90%)</p>
            </div>
          </div>
        </div>

        {/* Background Colors */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Background Colors
          </h3>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-lg mb-2 border-2 border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: THEME.colors.bgDark }}
              />
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                {THEME.colors.bgDark}
              </p>
              <p className="text-xs text-slate-500">Dark BG</p>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-lg mb-2 border-2 border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: THEME.colors.surfaceDark }}
              />
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                {THEME.colors.surfaceDark}
              </p>
              <p className="text-xs text-slate-500">Surface</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
