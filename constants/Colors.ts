// theme/Colors.ts

export type ThemeMode = 'light' | 'dark';

export const Colors = {
  light: {
    // ===== CORE COLORS =====
    primary: '#0a7ea4',         // teal blue (brand primary)
    secondary: '#2563eb',       // vivid blue (secondary CTA)
    background: '#fefefe',      // pure off-white (app background)
    cardBackground: '#ffffff',  // true white (card surface)
    border: '#e2e8f0',          // soft gray blue (neutral border)
    overlay: 'rgba(0, 0, 0, 0.04)', // very light black (modal background)

    // ===== TEXT COLORS =====
    textPrimary: '#080b12',     // slate black (main text)
    textSecondary: '#374151',   // slate gray (supporting text)
    textMuted: '#6b7280',       // cool gray (placeholder/subtle)
    textInverted: '#ffffff',    // white (used over dark surfaces)

    // ===== ICON & INTERACTIVE =====
    iconDefault: '#4b5563',     // mid-gray (default icon)
    iconActive: '#0a7ea4',      // teal blue (active icon)
    tabIconDefault: '#9ca3af',  // light gray (inactive tab)
    tabIconSelected: '#0a7ea4', // teal blue (active tab)
    focusRing: '#bae6fd',       // pale sky blue (focus outline)

    // ===== STATUS COLORS =====
    success: '#16a34a',         // true green (success icon)
    successBg: '#dcfce7',       // mint (success background)
    successText: '#15803d',     // forest green (text)

    warning: '#f59e0b',         // amber (warning)
    warningBg: '#fef3c7',       // pale amber (bg)
    warningText: '#b45309',     // dark amber (text)

    error: '#dc2626',           // red (error)
    errorBg: '#fee2e2',         // soft red (bg)
    errorText: '#991b1b',       // deep red (text)

    info: '#0284c7',            // ocean blue (info icon)
    infoBg: '#e0f2fe',          // ice blue (bg)
    infoText: '#075985',        // steel blue (text)

    // ===== ACCENTS =====
    accent: '#7c3aed',          // electric violet
    accentBg: '#ede9fe',        // lavender bg
    accentText: '#5b21b6',      // deep violet

    // ===== MISC =====
    modalOverlay: 'rgba(17, 24, 39, 0.5)', // dark navy (modal backdrop)
    inputBg: '#f9fafb',         // very light gray (input background)
  },

  dark: {
    // ===== CORE COLORS =====
    primary: '#ffffff',         // white (primary brand)
    secondary: '#60a5fa',       // soft blue (secondary CTA)
    background: '#0f1113',      // rich black (app bg)
    cardBackground: '#1a1d1f',  // dark charcoal (cards)
    border: '#2d333b',          // dim gray (neutral borders)
    overlay: 'rgba(255, 255, 255, 0.03)', // light overlay

    // ===== TEXT COLORS =====
    textPrimary: '#f3f4f6',     // near white (text)
    textSecondary: '#9ca3af',   // soft gray (support text)
    textMuted: '#6b7280',       // mid gray (placeholder)
    textInverted: '#0a0e10',    // black (on light background)

    // ===== ICON & INTERACTIVE =====
    iconDefault: '#9ca3af',     // gray (icon default)
    iconActive: '#ffffff',      // white (active icon)
    tabIconDefault: '#6b7280',  // mid gray (inactive tab)
    tabIconSelected: '#ffffff', // white (active tab)
    focusRing: '#0ea5e9',       // sky blue (focus outline)

    // ===== STATUS COLORS =====
    success: '#22c55e',         // neon green (success)
    successBg: 'rgba(34, 197, 94, 0.1)', // green tint (bg)
    successText: '#4ade80',     // bright green (text)

    warning: '#eab308',         // yellow gold (warning)
    warningBg: 'rgba(234, 179, 8, 0.1)', // yellow tint (bg)
    warningText: '#facc15',     // vivid gold

    error: '#ef4444',           // coral red (error)
    errorBg: 'rgba(239, 68, 68, 0.08)', // tinted red
    errorText: '#f87171',       // soft red (text)

    info: '#38bdf8',            // cyan (info)
    infoBg: 'rgba(14, 165, 233, 0.08)', // info tint
    infoText: '#0ea5e9',        // sky blue

    // ===== ACCENTS =====
    accent: '#c084fc',          // lilac (accent)
    accentBg: 'rgba(192, 132, 252, 0.12)', // soft lilac
    accentText: '#d8b4fe',      // lavender

    // ===== MISC =====
    modalOverlay: 'rgba(0, 0, 0, 0.6)', // black translucent (modal bg)
    inputBg: '#111827',         // charcoal (input field bg)
  },
};
