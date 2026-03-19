import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const catalogHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'widgets', 'index.html'), 'utf-8');

describe('Widget Catalog Page HTML', () => {
  let doc: Document;

  beforeEach(() => {
    const parser = new DOMParser();
    doc = parser.parseFromString(catalogHtml, 'text/html');
  });

  describe('Page Structure', () => {
    it('has correct page title', () => {
      expect(doc.title).toContain('Widgets');
    });

    it('includes site-layout.js with data-page="widgets"', () => {
      const scripts = doc.querySelectorAll('script[src*="site-layout"]');
      expect(scripts.length).toBe(1);
      expect(scripts[0].getAttribute('data-page')).toBe('widgets');
    });
  });

  describe('Hero Section', () => {
    it('has a catalog heading', () => {
      const h1 = doc.querySelector('.widgets-hero h1');
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain('Widget');
    });

    it('has a description mentioning 45+ components', () => {
      const p = doc.querySelector('.widgets-hero p');
      expect(p).not.toBeNull();
      expect(p!.textContent).toContain('45+');
    });
  });

  describe('Categories', () => {
    it('has 7 widget categories', () => {
      const categories = doc.querySelectorAll('.widgets-category');
      expect(categories.length).toBe(7);
    });

    it('categories are: Data Display, Navigation, Feedback, Data Entry, Layout, Specialized, Utilities', () => {
      const headers = doc.querySelectorAll('.widgets-category-header h2');
      const names = Array.from(headers).map((h) => h.textContent);
      expect(names).toEqual([
        'Data Display',
        'Navigation',
        'Feedback',
        'Data Entry',
        'Layout',
        'Specialized',
        'Utilities',
      ]);
    });

    it('each category has a widget count', () => {
      const counts = doc.querySelectorAll('.widgets-category-header span');
      counts.forEach((span) => {
        expect(span.textContent).toMatch(/\d+ widgets/);
      });
    });
  });

  describe('Widget Cards', () => {
    it('has at least 42 widget cards total', () => {
      const cards = doc.querySelectorAll('.widget-card');
      expect(cards.length).toBeGreaterThanOrEqual(42);
    });

    it('each card has a title', () => {
      const cards = doc.querySelectorAll('.widget-card');
      cards.forEach((card) => {
        const h3 = card.querySelector('h3');
        expect(h3).not.toBeNull();
        expect(h3!.textContent!.length).toBeGreaterThan(0);
      });
    });

    it('each card has a description', () => {
      const cards = doc.querySelectorAll('.widget-card');
      cards.forEach((card) => {
        const p = card.querySelector('p');
        expect(p).not.toBeNull();
        expect(p!.textContent!.length).toBeGreaterThan(10);
      });
    });

    it('each card links to the Explorer', () => {
      const cards = doc.querySelectorAll('.widget-card');
      cards.forEach((card) => {
        const href = card.getAttribute('href');
        expect(href).not.toBeNull();
        expect(href).toContain('explorer');
      });
    });
  });

  describe('Footer', () => {
    it('has a site-footer placeholder', () => {
      const footer = doc.getElementById('site-footer');
      expect(footer).not.toBeNull();
    });
  });
});
