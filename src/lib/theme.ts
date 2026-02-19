/**
 * Theme Configuration
 * Centralized color and styling constants
 */

export const THEME = {
  colors: {
    primary: '#0d6cf2',
    primaryAccent: '#0d6cf2e6', // Primary with 90% opacity
    
    // Background Colors
    bgLight: '#f5f7f8',
    bgDark: '#0f1115',
    
    // Surface Colors
    surfaceDark: '#1a1d23',
    
    // Border Colors
    borderLight: '#e2e8f0',
    borderDark: '#2d333d',
    
    // Semantic Colors
    success: {
      light: '#10b981',
      lighter: '#ecfdf5',
    },
    error: {
      light: '#ef4444',
      lighter: '#fee2e2',
    },
    warning: {
      light: '#f59e0b',
      lighter: '#fffbeb',
    },
    info: {
      light: '#3b82f6',
      lighter: '#eff6ff',
    },
  },
  
  // Shadow definitions
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    'primary-lg': '0 20px 25px -5px rgba(13, 108, 242, 0.2)',
  },
  
  // Typography
  fontFamily: {
    display: "'Manrope', sans-serif",
  },
  
  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Utility function to get theme color
export const getThemeColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = THEME;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return '';
  }
  
  return value;
};
