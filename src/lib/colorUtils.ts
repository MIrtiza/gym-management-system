/**
 * Color Utilities
 * Helper functions for color manipulation
 */

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Add opacity to hex color
 */
export const hexWithOpacity = (hex: string, opacity: number): string => {
  // opacity should be 0-1
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return hex + opacityHex;
};

/**
 * Parse hex color with opacity (e.g., #0d6cf2e6 -> {hex: #0d6cf2, opacity: 0.9})
 */
export const parseHexWithOpacity = (hexWithOpacity: string): { hex: string; opacity: number } => {
  if (hexWithOpacity.length === 9) {
    const hex = hexWithOpacity.slice(0, 7);
    const opacityHex = hexWithOpacity.slice(7);
    const opacity = parseInt(opacityHex, 16) / 255;
    return { hex, opacity };
  }
  return { hex: hexWithOpacity, opacity: 1 };
};

/**
 * Lighten color by percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 + percent / 100;
  return rgbToHex(
    Math.min(255, Math.round(rgb.r * factor)),
    Math.min(255, Math.round(rgb.g * factor)),
    Math.min(255, Math.round(rgb.b * factor))
  );
};

/**
 * Darken color by percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
};

/**
 * Get contrast ratio between two colors (for accessibility)
 */
export const getContrastRatio = (hex1: string, hex2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color is light or dark
 */
export const isColorLight = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
};
