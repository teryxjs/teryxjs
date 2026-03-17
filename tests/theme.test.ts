import { describe, it, expect, beforeEach } from 'vitest';
import { setTheme, getTheme, registerTheme, getThemeNames } from '../src/theme';

describe('theme', () => {
  beforeEach(() => {
    // Reset to light theme before each test
    setTheme('light');
    // Clean up any inline styles left by previous tests
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('data-theme');
    setTheme('light');
  });

  // ---- getThemeNames() ----
  it('should include the three built-in themes', () => {
    const names = getThemeNames();
    expect(names).toContain('light');
    expect(names).toContain('dark');
    expect(names).toContain('highContrast');
  });

  // ---- getTheme() / setTheme() ----
  it('should default to "light" theme', () => {
    expect(getTheme()).toBe('light');
  });

  it('should switch to dark theme and update data-theme attribute', () => {
    setTheme('dark');
    expect(getTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply CSS variables when switching themes', () => {
    setTheme('dark');
    const bg = document.documentElement.style.getPropertyValue('--tx-bg');
    expect(bg).toBe('#111827');
  });

  it('should throw when setting an unregistered theme', () => {
    expect(() => setTheme('nonexistent')).toThrow('unknown theme "nonexistent"');
  });

  // ---- registerTheme() ----
  it('should register a custom theme and allow switching to it', () => {
    registerTheme({
      name: 'ocean',
      vars: {
        '--tx-bg': '#0a1628',
        '--tx-text': '#e0f0ff',
      },
    });
    expect(getThemeNames()).toContain('ocean');

    setTheme('ocean');
    expect(getTheme()).toBe('ocean');
    expect(document.documentElement.style.getPropertyValue('--tx-bg')).toBe('#0a1628');
  });

  it('should allow replacing an existing built-in theme', () => {
    registerTheme({
      name: 'light',
      vars: {
        '--tx-bg': '#fefefe',
      },
    });
    setTheme('light');
    expect(document.documentElement.style.getPropertyValue('--tx-bg')).toBe('#fefefe');
  });
});
