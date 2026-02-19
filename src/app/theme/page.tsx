"use client";

import { Card } from "@/components/common/Card";
import { THEME } from "@/lib/theme";
import { parseHexWithOpacity } from "@/lib/colorUtils";

export default function ThemePage() {
  const colorCategories = [
    {
      name: "Primary Colors",
      colors: [
        {
          name: "Primary",
          value: THEME.colors.primary,
          label: "Main brand color",
        },
        {
          name: "Primary Accent",
          value: THEME.colors.primaryAccent,
          label: "90% opacity variant",
        },
      ],
    },
    {
      name: "Background Colors",
      colors: [
        {
          name: "Light BG",
          value: THEME.colors.bgLight,
          label: "Light mode background",
        },
        {
          name: "Dark BG",
          value: THEME.colors.bgDark,
          label: "Dark mode background",
        },
      ],
    },
    {
      name: "Surface Colors",
      colors: [
        {
          name: "Dark Surface",
          value: THEME.colors.surfaceDark,
          label: "Card backgrounds in dark mode",
        },
      ],
    },
    {
      name: "Border Colors",
      colors: [
        {
          name: "Light Border",
          value: THEME.colors.borderLight,
          label: "Borders in light mode",
        },
        {
          name: "Dark Border",
          value: THEME.colors.borderDark,
          label: "Borders in dark mode",
        },
      ],
    },
    {
      name: "Semantic Colors",
      colors: [
        {
          name: "Success",
          value: THEME.colors.success.light,
          label: "Success state",
        },
        {
          name: "Error",
          value: THEME.colors.error.light,
          label: "Error state",
        },
        {
          name: "Warning",
          value: THEME.colors.warning.light,
          label: "Warning state",
        },
        { name: "Info", value: THEME.colors.info.light, label: "Info state" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-800 mb-2">Theme Configuration</h1>
        <p className="text-slate-500 dark:text-slate-400">
          IRONCORE gym dashboard color system and design tokens
        </p>
      </div>

      {/* Color Palette */}
      {colorCategories.map((category) => (
        <Card key={category.name} title={category.name}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.colors.map((color) => {
              const { opacity } = parseHexWithOpacity(color.value);
              return (
                <div key={color.name} className="space-y-2">
                  <div
                    className="w-full h-24 rounded-lg border-2 border-slate-200 dark:border-border-dark"
                    style={{ backgroundColor: color.value }}
                  />
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {color.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {color.value}
                    </p>
                    {opacity < 1 && (
                      <p className="text-xs text-slate-500">
                        Opacity: {Math.round(opacity * 100)}%
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{color.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Typography */}
      <Card title="Typography">
        <div className="space-y-6">
          <div>
            <p className="text-4xl font-800 mb-2">Display - 32px Bold (800)</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Font: {THEME.fontFamily.display}
            </p>
          </div>
          <div className="border-t border-slate-200 dark:border-border-dark pt-6">
            <p className="text-2xl font-bold mb-2">Heading - 24px Bold (700)</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              For section titles
            </p>
          </div>
          <div className="border-t border-slate-200 dark:border-border-dark pt-6">
            <p className="text-base font-semibold mb-2">
              Body - 16px Semibold (600)
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              For regular text and labels
            </p>
          </div>
        </div>
      </Card>

      {/* Spacing */}
      <Card title="Spacing Scale">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "xs", value: "4px" },
            { name: "sm", value: "8px" },
            { name: "md", value: "16px" },
            { name: "lg", value: "24px" },
            { name: "xl", value: "32px" },
            { name: "2xl", value: "48px" },
            { name: "3xl", value: "64px" },
            { name: "4xl", value: "80px" },
          ].map((item) => (
            <div key={item.name}>
              <div
                className="bg-primary/10 rounded mb-2"
                style={{ height: item.value }}
              />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Border Radius */}
      <Card title="Border Radius">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "xs", value: "0.25rem" },
            { name: "sm", value: "0.375rem" },
            { name: "md", value: "0.5rem" },
            { name: "lg", value: "0.75rem" },
            { name: "xl", value: "1rem" },
            { name: "full", value: "9999px" },
          ].map((item) => (
            <div key={item.name}>
              <div
                className="w-20 h-20 bg-primary/10 mb-2"
                style={{ borderRadius: item.value }}
              />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Shadows */}
      <Card title="Shadows">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "sm", shadow: THEME.shadows.sm },
            { name: "md", shadow: THEME.shadows.md },
            { name: "lg", shadow: THEME.shadows.lg },
            { name: "xl", shadow: THEME.shadows.xl },
            { name: "primary-lg", shadow: THEME.shadows["primary-lg"] },
          ].map((item) => (
            <div key={item.name} className="p-4">
              <div
                className="w-full h-24 bg-white dark:bg-surface-dark rounded-lg"
                style={{ boxShadow: item.shadow }}
              />
              <p className="text-sm font-semibold mt-2 text-slate-900 dark:text-white">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
