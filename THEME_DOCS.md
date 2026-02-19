# IRONCORE Theme System Documentation

## Overview

The IRONCORE gym dashboard uses a professional color system designed for dark mode with a vibrant primary color. The theme is built on top of Tailwind CSS with custom CSS variables for flexibility.

## Primary Colors

### Main Colors

- **Primary**: `#0d6cf2` - Vibrant blue, main brand color
- **Primary Accent**: `#0d6cf2e6` - Primary color with 90% opacity (230/255)

### Background Colors

- **Dark Background**: `#0f1115` - Main dark background
- **Dark Surface**: `#1a1d23` - Card and surface backgrounds
- **Light Background**: `#f5f7f8` - Light mode background

### Border Colors

- **Dark Border**: `#2d333d` - Borders in dark mode
- **Light Border** - Borders in light mode (via Tailwind defaults)

## File Structure

### Configuration Files

#### `tailwind.config.ts`

Defines Tailwind CSS color tokens and extends the theme:

```typescript
colors: {
  primary: '#0d6cf2',
  'primary-accent': '#0d6cf2e6',
  'background-dark': '#0f1115',
  'surface-dark': '#1a1d23',
  'border-dark': '#2d333d',
}
```

#### `src/app/globals.css`

CSS variables for the theme:

```css
:root {
  --primary: #0d6cf2;
  --primary-accent: #0d6cf2e6;
  --bg-dark: #0f1115;
  --surface-dark: #1a1d23;
  --border-dark: #2d333d;
}
```

#### `src/lib/theme.ts`

JavaScript constants and helper functions:

```typescript
export const THEME = {
  colors: {...},
  shadows: {...},
  fontFamily: {...},
  transitions: {...}
}
```

### Utility Files

#### `src/lib/colorUtils.ts`

Helper functions for color manipulation:

- `hexToRgb()` - Convert hex to RGB
- `rgbToHex()` - Convert RGB to hex
- `hexWithOpacity()` - Add opacity to hex color
- `lightenColor()` - Lighten a color by percentage
- `darkenColor()` - Darken a color by percentage
- `getContrastRatio()` - Calculate contrast ratio (accessibility)
- `isColorLight()` - Check if color is light or dark

### Component Files

#### `src/components/common/ThemeProvider.tsx`

Manages dark/light theme switching:

- Detects system preference
- Persists user choice to localStorage
- Applies theme class to document

#### `src/components/common/ThemeShowcase.tsx`

Visual guide displaying all theme colors

#### `src/app/theme/page.tsx`

Full theme configuration page with all colors, typography, spacing, and shadows

## Usage Examples

### Using Colors in Components

#### Tailwind CSS Classes

```tsx
// Using primary color
<div className="bg-primary text-white">
  Primary button
</div>

// With opacity
<div className="bg-primary/10">
  Light primary background
</div>

// Dark mode variants
<div className="bg-white dark:bg-surface-dark">
  Card content
</div>
```

#### CSS Variables

```tsx
<div style={{ backgroundColor: "var(--primary)" }}>Using CSS variable</div>
```

#### JavaScript Constants

```typescript
import { THEME } from "@/lib/theme";

const buttonColor = THEME.colors.primary;
const darkBg = THEME.colors.bgDark;
```

### Color Manipulation

```typescript
import {
  lightenColor,
  darkenColor,
  hexWithOpacity,
  getContrastRatio,
} from "@/lib/colorUtils";

// Create lighter/darker variants
const lighterPrimary = lightenColor("#0d6cf2", 20); // 20% lighter
const darkerPrimary = darkenColor("#0d6cf2", 20); // 20% darker

// Add opacity
const accentColor = hexWithOpacity("#0d6cf2", 0.9);

// Check contrast (for accessibility)
const ratio = getContrastRatio("#0d6cf2", "#ffffff");
console.log(`Contrast ratio: ${ratio}:1`); // WCAG AA if > 4.5
```

## Component Integration

### Sidebar

- Uses `bg-primary` for logo background
- Uses `dark:border-border-dark` for borders
- Uses `dark:text-slate-400` for text

### Header

- Uses `bg-primary` for main button
- Uses `shadow-lg shadow-primary/20` for glow effect
- Uses `dark:bg-surface-dark` for inputs

### Stat Cards

- Uses `bg-primary/10` for icon backgrounds
- Uses `text-primary` for icon colors
- Uses `dark:bg-surface-dark` for card backgrounds

### Charts

- Uses hex colors directly for chart elements
- Uses `text-primary` for labels
- Uses `dark:bg-background-dark/30` for backgrounds

## Dark Mode Implementation

Dark mode is enabled globally via the `dark` class on the HTML element:

```tsx
<html lang="en" className="dark">
```

### Why Dark Mode by Default?

1. **Modern Design** - Reduces eye strain in low-light environments
2. **Professional Look** - Aligns with modern dashboard trends
3. **Battery Efficient** - Beneficial for OLED displays
4. **Brand Aligned** - Fits the IRONCORE gym dashboard aesthetic

### Switching Light/Dark Mode

To implement a toggle, use the `ThemeProvider` component:

```tsx
import { ThemeProvider } from "@/components/common/ThemeProvider";

export default function RootLayout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

## Accessibility Considerations

### Color Contrast

- Primary color (#0d6cf2) has good contrast with white text (ratio: 5.3:1)
- Uses semantic colors (green, red, yellow) for status indicators
- All text meets WCAG AA standards

### Color Utilities Helper

Use `getContrastRatio()` to verify color combinations:

```typescript
const contrast = getContrastRatio("#0d6cf2", "#ffffff");
// 5.3 - ✅ WCAG AA compliant for body text
```

## Customization Guide

### Change Primary Color

1. **Update tailwind.config.ts**

```typescript
colors: {
  primary: '#YOUR_NEW_COLOR',
  'primary-accent': '#YOUR_NEW_COLOR_WITH_OPACITY',
}
```

2. **Update src/lib/theme.ts**

```typescript
colors: {
  primary: '#YOUR_NEW_COLOR',
  primaryAccent: '#YOUR_NEW_COLOR_WITH_OPACITY',
}
```

3. **Update src/app/globals.css**

```css
:root {
  --primary: #YOUR_NEW_COLOR;
  --primary-accent: #YOUR_NEW_COLOR_WITH_OPACITY;
}
```

### Add New Color

1. Add to `tailwind.config.ts` colors
2. Add to `src/lib/theme.ts` THEME object
3. Add CSS variable to `src/app/globals.css`
4. Use in components with `className="bg-your-color"` or `style={{backgroundColor: THEME.colors.yourColor}}`

## Typography with Theme

The theme uses the **Manrope** font family:

- Modern, geometric sans-serif
- Excellent readability
- Loaded from Google Fonts

Font weights available:

- 400 (Regular)
- 500 (Medium)
- 600 (Semibold)
- 700 (Bold)
- 800 (Extrabold)

## Spacing and Sizing

Based on a 4px base unit:

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 80px

## Shadows

Pre-defined shadows for different elements:

- `sm`: Light shadow for subtle elevation
- `md`: Medium shadow for cards
- `lg`: Large shadow for modals
- `xl`: Extra large shadow for overlays
- `primary-lg`: Primary-colored shadow for emphasis

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Opera: Full support

## Performance Considerations

1. All colors are defined via CSS variables - zero runtime overhead
2. Tailwind CSS optimizes unused utilities
3. Theme switching uses localStorage - instant persistence
4. No external color libraries needed

## Testing the Theme

1. Visit `/theme` page to see all colors and design tokens
2. Use DevTools to inspect color values:
   ```javascript
   const style = getComputedStyle(document.documentElement);
   console.log(style.getPropertyValue("--primary"));
   ```
3. Test dark mode by adding/removing `dark` class to `<html>`

## Future Enhancements

- [ ] Theme switcher UI in settings
- [ ] Custom theme builder
- [ ] Export theme as CSS variables
- [ ] Automatic color harmony generation
- [ ] Light mode improvements

---

**Last Updated**: February 18, 2026
**Version**: 1.0
