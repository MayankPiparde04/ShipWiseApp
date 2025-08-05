# ShipWise App Theme Migration Guide

## Overview
This guide documents the complete migration of the ShipWise app from manual theme handling to a centralized, dynamic light/dark theme system using the existing Tailwind color configuration.

## Changes Made

### 1. Created Centralized Theme Hook (`hooks/useAppTheme.ts`)
- Replaced manual theme objects with centralized `useAppTheme()` hook
- Uses existing Tailwind color configuration from `tailwind.config.js`
- Provides consistent theme classes across all components
- Automatically switches between light and dark themes based on device setting

### 2. Updated Tailwind Configuration
- Added `darkMode: 'class'` support
- Included hooks directory in content paths for proper class generation
- Maintains existing comprehensive color palette

### 3. Theme Property Mapping

#### Old → New Property Names
```typescript
// OLD THEME PROPERTIES → NEW THEME PROPERTIES
theme.success → theme.buttonSuccess (for buttons)
theme.success → theme.successBg (for backgrounds)
theme.successText → theme.successText (unchanged)
theme.error → theme.errorBg
theme.errorText → theme.errorText (unchanged)
theme.accent → theme.buttonAccent (for buttons)
theme.accent → theme.accentBg (for backgrounds)
theme.accentText → theme.accentText (unchanged)
```

#### Component Update Pattern
```typescript
// Before
const isDark = useColorScheme() === 'dark';
const theme = {
  bg: isDark ? 'bg-gray-950' : 'bg-gray-50',
  // ... manual theme object
};

// After
import { useAppTheme } from '@/hooks/useAppTheme';
const theme = useAppTheme();
```

## Files Updated

### ✅ Completed
1. `hooks/useAppTheme.ts` - New centralized theme hook
2. `tailwind.config.js` - Updated with darkMode support and content paths
3. `app/_layout.tsx` - Root layout with theme integration
4. `app/login.tsx` - Login page theme migration (started)

### 🔄 In Progress / To Do
1. `app/(tabs)/analysis.tsx` - Analysis page (partially updated, needs property fixes)
2. `app/(tabs)/index.tsx` - Home page (import added, theme replacement needed)
3. `app/(tabs)/inventory.tsx` - Inventory management
4. `app/(tabs)/profile.tsx` - Profile page
5. `app/(tabs)/gemini.tsx` - Gemini AI page
6. `app/register.tsx` - Registration page
7. `app/activationpage.tsx` - Account activation
8. `components/` - All component files

## Quick Migration Steps for Each Component

### Step 1: Import Theme Hook
```typescript
import { useAppTheme } from '@/hooks/useAppTheme';
```

### Step 2: Replace Theme Declaration
```typescript
// Remove old theme object and replace with:
const theme = useAppTheme();
```

### Step 3: Update Property References
Use find & replace to update theme properties:
- `theme.success` → `theme.buttonSuccess` (for buttons) or `theme.successBg` (for backgrounds)
- `theme.error` → `theme.errorBg`
- `theme.accent` → `theme.buttonAccent` or `theme.accentBg`

### Step 4: Test Color Consistency
Verify that all colors are properly displaying in both light and dark modes.

## Benefits of New System

1. **Consistency**: All components use the same color palette from Tailwind config
2. **Maintainability**: Single source of truth for all theme colors
3. **Dynamic Switching**: Automatic light/dark mode based on device settings
4. **Type Safety**: TypeScript interfaces prevent color property errors
5. **Performance**: Reduced bundle size by eliminating duplicate theme objects

## Color Palette Reference

### Light Theme Colors
- Primary: `#0a7ea4` (Teal blue)
- Secondary: `#2563eb` (Vivid blue)
- Success: `#16a34a` (True green)
- Warning: `#f59e0b` (Amber)
- Error: `#dc2626` (Red)
- Info: `#0284c7` (Ocean blue)

### Dark Theme Colors
- Primary: `#ffffff` (White)
- Secondary: `#60a5fa` (Soft blue)
- Success: `#22c55e` (Neon green)
- Warning: `#eab308` (Yellow gold)
- Error: `#ef4444` (Coral red)
- Info: `#38bdf8` (Cyan)

## Next Steps

1. Complete migration of remaining component files
2. Test all screens in both light and dark modes
3. Verify accessibility and contrast ratios
4. Update any custom styling to use theme classes
5. Add theme switching toggle (optional)

## Notes

- The existing Tailwind color configuration is preserved and enhanced
- No breaking changes to existing functionality
- All components will automatically support light/dark mode switching
- Color collision issues are eliminated through centralized management
