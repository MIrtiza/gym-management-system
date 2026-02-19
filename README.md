# IRONCORE | Gym Management Dashboard

A professional Next.js web dashboard for managing gym operations with a modern design system.

## Features

- 👥 Member Management
- 💳 Membership Management
- ✓ Attendance Tracking
- 💰 Payment Management
- 🏋️ Services Management
- 🎨 Professional Dark/Light Theme

## Technology Stack

- Next.js 16.1.6
- React 19
- TypeScript
- Tailwind CSS
- Manrope Font Family

## Color Theme

### Primary Colors

- **Primary**: `#0d6cf2` - Main brand color (bright blue)
- **Primary Accent**: `#0d6cf2e6` - Primary with 90% opacity

### Background Colors

- **Dark Background**: `#0f1115` - Main dark background
- **Dark Surface**: `#1a1d23` - Card/surface backgrounds
- **Dark Border**: `#2d333d` - Border color for dark mode

### Accessing Theme Colors

#### Via Tailwind CSS Classes

```html
<!-- Primary color -->
<div class="bg-primary text-white">Primary</div>

<!-- With opacity -->
<div class="bg-primary/10">Light primary background</div>

<!-- Dark mode variants -->
<div class="bg-white dark:bg-surface-dark">Content area</div>
```

#### Via JavaScript/TypeScript

```typescript
import { THEME } from "@/lib/theme";

// Access colors
const primaryColor = THEME.colors.primary; // #0d6cf2
const bgDark = THEME.colors.bgDark; // #0f1115

// Use color utilities
import { hexWithOpacity, lightenColor, darkenColor } from "@/lib/colorUtils";

const accentColor = hexWithOpacity("#0d6cf2", 0.9); // #0d6cf2e6
const lighterPrimary = lightenColor("#0d6cf2", 20);
const darkerPrimary = darkenColor("#0d6cf2", 20);
```

## Theme Files

- **Tailwind Config**: `tailwind.config.ts` - Color and design token definitions
- **Global Styles**: `src/app/globals.css` - CSS variables and utilities
- **Theme Configuration**: `src/lib/theme.ts` - JavaScript theme constants
- **Color Utilities**: `src/lib/colorUtils.ts` - Color manipulation functions
- **Theme Provider**: `src/components/common/ThemeProvider.tsx` - Dark/Light mode toggle
- **Theme Showcase**: `src/components/common/ThemeShowcase.tsx` - Color palette display

## Getting Started

```bash
npm install
npm run dev
```

Running on http://localhost:3000

## File Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with theme setup
│   ├── globals.css          # Global styles with CSS variables
│   ├── page.tsx             # Dashboard
│   ├── members/
│   ├── attendance/
│   ├── payments/
│   ├── memberships/
│   └── services/
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   ├── common/
│   │   ├── StatCard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── AttendanceChart.tsx
│   │   ├── RecentCheckinsTable.tsx
│   │   ├── ThemeShowcase.tsx
│   │   └── ThemeProvider.tsx
│   └── [feature-components]/
│
├── lib/
│   ├── theme.ts            # Theme constants and config
│   ├── colorUtils.ts       # Color manipulation utilities
│   ├── utils.ts            # General utilities
│   └── hooks/
│
└── types/
    └── index.ts            # TypeScript type definitions
```

## Customizing the Theme

### Update Primary Color

1. Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: '#YOUR_COLOR',
  'primary-accent': '#YOUR_COLOR_WITH_OPACITY',
}
```

2. Update `src/lib/theme.ts`:

```typescript
primary: '#YOUR_COLOR',
primaryAccent: '#YOUR_COLOR_WITH_OPACITY',
```

3. Update `src/app/globals.css`:

```css
:root {
  --primary: #YOUR_COLOR;
  --primary-accent: #YOUR_COLOR_WITH_OPACITY;
}
```

### Dark Mode

Dark mode is enabled by default. The HTML element has the `dark` class applied.

To toggle dark mode:

```typescript
import { ThemeProvider } from '@/components/common/ThemeProvider';

// In your layout or component
<ThemeProvider>
  {children}
</ThemeProvider>
```

## Building for Production

```bash
npm run build
npm start
```

## Status

✅ Design implementation complete  
✅ Color theme configured  
✅ Dark/Light mode ready  
✅ Professional UI components ready  
🔄 Feature development in progress
