import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const layoutScript = fs.readFileSync(path.join(__dirname, '..', 'pages', 'site-layout.js'), 'utf-8');

function loadLayout(dataPage?: string): void {
  // Create script tag with data-page attribute for detection
  if (dataPage) {
    const script = document.createElement('script');
    script.setAttribute('src', 'site-layout.js');
    script.setAttribute('data-page', dataPage);
    document.head.appendChild(script);
  }

  // Execute the layout script
  const fn = new Function(layoutScript);
  fn();
}

describe('Site Layout', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.body.innerHTML = '';
    document.body.className = '';
    // Clear script tags from previous test runs
    document.querySelectorAll('script[src*="site-layout"]').forEach((s) => s.remove());
    localStorage.clear();
    (window as any).TeryxSiteLayout = undefined;
  });

  afterEach(() => {
    (window as any).TeryxSiteLayout = undefined;
  });

  describe('Navigation', () => {
    it('injects nav element into body', () => {
      loadLayout('home');
      const nav = document.querySelector('.site-nav');
      expect(nav).not.toBeNull();
    });

    it('renders brand link', () => {
      loadLayout('home');
      const brand = document.querySelector('.site-nav-brand');
      expect(brand).not.toBeNull();
      expect(brand!.textContent).toBe('Teryx');
    });

    it('renders all nav links', () => {
      loadLayout('home');
      const links = document.querySelectorAll('.site-nav-link');
      expect(links.length).toBe(4);
      const texts = Array.from(links).map((l) => l.textContent);
      expect(texts).toEqual(['Home', 'Widgets', 'Explorer', 'Docs']);
    });

    it('marks the current page as active', () => {
      loadLayout('docs');
      const active = document.querySelector('.site-nav-link.active');
      expect(active).not.toBeNull();
      expect(active!.textContent).toBe('Docs');
    });

    it('renders GitHub button', () => {
      loadLayout('home');
      const gh = document.querySelector('.site-nav-gh');
      expect(gh).not.toBeNull();
      expect(gh!.textContent).toContain('GitHub');
    });

    it('renders theme toggle button', () => {
      loadLayout('home');
      const btn = document.querySelector('.site-nav-theme-toggle');
      expect(btn).not.toBeNull();
    });

    it('renders mobile hamburger button', () => {
      loadLayout('home');
      const btn = document.querySelector('.site-nav-mobile-btn');
      expect(btn).not.toBeNull();
    });

    it('adds has-site-nav class to body', () => {
      loadLayout('home');
      expect(document.body.classList.contains('has-site-nav')).toBe(true);
    });

    it('renders mobile menu with all links', () => {
      loadLayout('home');
      const menu = document.querySelector('.site-nav-mobile-menu');
      expect(menu).not.toBeNull();
      const links = menu!.querySelectorAll('a');
      expect(links.length).toBe(5); // 4 nav + GitHub
    });
  });

  describe('Footer', () => {
    it('injects footer for non-explorer pages', () => {
      loadLayout('home');
      const footer = document.querySelector('.site-footer');
      expect(footer).not.toBeNull();
    });

    it('does not inject footer for explorer page', () => {
      loadLayout('explorer');
      const footer = document.querySelector('.site-footer');
      expect(footer).toBeNull();
    });

    it('footer contains brand name', () => {
      loadLayout('docs');
      const brand = document.querySelector('.site-footer-brand h3');
      expect(brand).not.toBeNull();
      expect(brand!.textContent).toBe('Teryx');
    });

    it('footer contains MIT badge', () => {
      loadLayout('home');
      const badge = document.querySelector('.site-footer-badge');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toContain('MIT');
    });

    it('footer has three navigation columns', () => {
      loadLayout('home');
      const cols = document.querySelectorAll('.site-footer-col');
      expect(cols.length).toBe(3);
    });

    it('footer has copyright with current year', () => {
      loadLayout('home');
      const bottom = document.querySelector('.site-footer-bottom');
      expect(bottom).not.toBeNull();
      expect(bottom!.textContent).toContain(new Date().getFullYear().toString());
    });
  });

  describe('Dark Mode', () => {
    it('defaults to light theme', () => {
      loadLayout('home');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('reads stored theme from localStorage', () => {
      localStorage.setItem('teryx-theme', 'dark');
      loadLayout('home');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggleTheme switches between light and dark', () => {
      loadLayout('home');
      const layout = (window as any).TeryxSiteLayout;
      expect(layout).toBeDefined();

      layout.applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      layout.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      layout.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('persists theme to localStorage', () => {
      loadLayout('home');
      const layout = (window as any).TeryxSiteLayout;
      layout.applyTheme('dark');
      expect(localStorage.getItem('teryx-theme')).toBe('dark');
    });

    it('clicking theme toggle button changes theme', () => {
      loadLayout('home');
      document.documentElement.setAttribute('data-theme', 'light');

      const btn = document.querySelector('.site-nav-theme-toggle') as HTMLButtonElement;
      btn.click();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Mobile Menu', () => {
    it('clicking hamburger toggles mobile menu open class', () => {
      loadLayout('home');
      const btn = document.querySelector('.site-nav-mobile-btn') as HTMLButtonElement;
      const menu = document.querySelector('.site-nav-mobile-menu')!;

      expect(menu.classList.contains('open')).toBe(false);
      btn.click();
      expect(menu.classList.contains('open')).toBe(true);
      btn.click();
      expect(menu.classList.contains('open')).toBe(false);
    });

    it('hamburger button toggles aria-expanded', () => {
      loadLayout('home');
      const btn = document.querySelector('.site-nav-mobile-btn') as HTMLButtonElement;

      expect(btn.getAttribute('aria-expanded')).toBe('false');
      btn.click();
      expect(btn.getAttribute('aria-expanded')).toBe('true');
      btn.click();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Exposed API', () => {
    it('exposes TeryxSiteLayout on window', () => {
      loadLayout('home');
      const layout = (window as any).TeryxSiteLayout;
      expect(layout).toBeDefined();
      expect(typeof layout.toggleTheme).toBe('function');
      expect(typeof layout.applyTheme).toBe('function');
      expect(typeof layout.getPreferredTheme).toBe('function');
      expect(typeof layout.detectPage).toBe('function');
    });
  });

  describe('Nav links for all subdirectory pages', () => {
    // Blog is not in the nav links, only in the footer
    const navPages = ['widgets', 'docs', 'explorer'] as const;

    for (const page of navPages) {
      it(`marks ${page} as active when data-page="${page}"`, () => {
        loadLayout(page);
        const active = document.querySelector('.site-nav-link.active');
        expect(active).not.toBeNull();
        const expected = page.charAt(0).toUpperCase() + page.slice(1);
        expect(active!.textContent).toBe(expected);
      });
    }

    it('injects footer for blog page', () => {
      loadLayout('blog');
      const footer = document.querySelector('.site-footer');
      expect(footer).not.toBeNull();
    });

    it('injects footer for widgets page', () => {
      loadLayout('widgets');
      const footer = document.querySelector('.site-footer');
      expect(footer).not.toBeNull();
    });
  });
});
