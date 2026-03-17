// ============================================================
// Teryx — Theme Switcher
// ============================================================

/** A named set of CSS custom-property overrides. */
export interface TeryxTheme {
  name: string;
  vars: Record<string, string>;
}

// ----------------------------------------------------------
//  Built-in themes
// ----------------------------------------------------------

const lightTheme: TeryxTheme = {
  name: 'light',
  vars: {
    '--tx-bg': '#ffffff',
    '--tx-bg-secondary': '#f9fafb',
    '--tx-bg-tertiary': '#f3f4f6',
    '--tx-bg-elevated': '#ffffff',
    '--tx-surface': '#ffffff',
    '--tx-overlay': 'rgba(0, 0, 0, 0.5)',
    '--tx-text': '#111827',
    '--tx-text-secondary': '#6b7280',
    '--tx-text-muted': '#9ca3af',
    '--tx-text-inverse': '#ffffff',
    '--tx-border': '#e5e7eb',
    '--tx-border-strong': '#d1d5db',
    '--tx-shadow-sm': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    '--tx-shadow': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
    '--tx-shadow-lg': '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  },
};

const darkTheme: TeryxTheme = {
  name: 'dark',
  vars: {
    '--tx-bg': '#111827',
    '--tx-bg-secondary': '#1f2937',
    '--tx-bg-tertiary': '#374151',
    '--tx-bg-elevated': '#1f2937',
    '--tx-surface': '#1f2937',
    '--tx-overlay': 'rgba(0, 0, 0, 0.7)',
    '--tx-text': '#f9fafb',
    '--tx-text-secondary': '#d1d5db',
    '--tx-text-muted': '#9ca3af',
    '--tx-text-inverse': '#111827',
    '--tx-border': '#374151',
    '--tx-border-strong': '#4b5563',
    '--tx-shadow-sm': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
    '--tx-shadow': '0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
    '--tx-shadow-lg': '0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2)',
  },
};

const highContrastTheme: TeryxTheme = {
  name: 'highContrast',
  vars: {
    '--tx-bg': '#000000',
    '--tx-bg-secondary': '#1a1a1a',
    '--tx-bg-tertiary': '#2d2d2d',
    '--tx-bg-elevated': '#1a1a1a',
    '--tx-surface': '#1a1a1a',
    '--tx-overlay': 'rgba(0, 0, 0, 0.85)',
    '--tx-text': '#ffffff',
    '--tx-text-secondary': '#e5e5e5',
    '--tx-text-muted': '#cccccc',
    '--tx-text-inverse': '#000000',
    '--tx-border': '#ffffff',
    '--tx-border-strong': '#ffffff',
    '--tx-primary': '#3b9aff',
    '--tx-primary-hover': '#69b3ff',
    '--tx-success': '#22d68e',
    '--tx-warning': '#fbbf24',
    '--tx-danger': '#ff6b6b',
    '--tx-shadow-sm': '0 0 0 1px rgba(255,255,255,0.3)',
    '--tx-shadow': '0 0 0 1px rgba(255,255,255,0.3)',
    '--tx-shadow-lg': '0 0 0 2px rgba(255,255,255,0.4)',
  },
};

// ----------------------------------------------------------
//  Registry & state
// ----------------------------------------------------------

const themes = new Map<string, TeryxTheme>();
let currentThemeName = 'light';

// Register built-in themes
themes.set('light', lightTheme);
themes.set('dark', darkTheme);
themes.set('highContrast', highContrastTheme);

// ----------------------------------------------------------
//  Public API
// ----------------------------------------------------------

/**
 * Apply a registered theme by name.
 * Sets CSS variables on `document.documentElement` and a `data-theme` attribute.
 *
 * @throws If the theme name has not been registered.
 */
export function setTheme(name: string): void {
  const theme = themes.get(name);
  if (!theme) {
    throw new Error(`Teryx: unknown theme "${name}". Register it first via registerTheme().`);
  }

  // Apply CSS custom properties
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    for (const [prop, value] of Object.entries(theme.vars)) {
      root.style.setProperty(prop, value);
    }
    root.setAttribute('data-theme', name);
  }

  currentThemeName = name;
}

/** Return the name of the currently active theme. */
export function getTheme(): string {
  return currentThemeName;
}

/**
 * Register a custom theme (or replace an existing one).
 * Does **not** activate the theme — call `setTheme(theme.name)` afterwards.
 */
export function registerTheme(theme: TeryxTheme): void {
  themes.set(theme.name, theme);
}

/** Return the names of all registered themes. */
export function getThemeNames(): string[] {
  return Array.from(themes.keys());
}
