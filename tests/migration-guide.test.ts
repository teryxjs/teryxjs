import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const migrationHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'docs', 'migration.html'), 'utf-8');

describe('Migration Guide HTML', () => {
  let doc: Document;

  beforeEach(() => {
    const parser = new DOMParser();
    doc = parser.parseFromString(migrationHtml, 'text/html');
  });

  describe('Page Structure', () => {
    it('has correct page title', () => {
      expect(doc.title).toContain('Migration');
    });

    it('includes site-layout.js with data-page="docs"', () => {
      const scripts = doc.querySelectorAll('script[src*="site-layout"]');
      expect(scripts.length).toBe(1);
      expect(scripts[0].getAttribute('data-page')).toBe('docs');
    });

    it('includes site-layout.css', () => {
      const links = doc.querySelectorAll('link[rel="stylesheet"]');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs.some((h) => h?.includes('site-layout.css'))).toBe(true);
    });
  });

  describe('Sidebar', () => {
    it('has sidebar navigation', () => {
      expect(doc.querySelector('.sidebar')).not.toBeNull();
    });

    it('migration guide link is active', () => {
      const active = doc.querySelector('.sidebar a.active');
      expect(active).not.toBeNull();
      expect(active!.textContent).toContain('Migration');
    });

    it('sidebar includes all docs pages', () => {
      const links = doc.querySelectorAll('.sidebar a');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('./');
      expect(hrefs).toContain('widgets.html');
      expect(hrefs).toContain('declarative.html');
      expect(hrefs).toContain('theming.html');
      expect(hrefs).toContain('migration.html');
    });
  });

  describe('Content', () => {
    it('has main heading', () => {
      const h1 = doc.querySelector('.content h1');
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain('Migration');
    });

    it('covers ExtJS migration', () => {
      const headings = doc.querySelectorAll('.content h2');
      const texts = Array.from(headings).map((h) => h.textContent);
      expect(texts.some((t) => t!.includes('ExtJS'))).toBe(true);
    });

    it('covers jQuery UI migration', () => {
      const headings = doc.querySelectorAll('.content h2');
      const texts = Array.from(headings).map((h) => h.textContent);
      expect(texts.some((t) => t!.includes('jQuery'))).toBe(true);
    });

    it('covers AG Grid migration', () => {
      const headings = doc.querySelectorAll('.content h2');
      const texts = Array.from(headings).map((h) => h.textContent);
      expect(texts.some((t) => t!.includes('AG Grid'))).toBe(true);
    });

    it('has comparison tables', () => {
      const tables = doc.querySelectorAll('.content table');
      expect(tables.length).toBeGreaterThanOrEqual(3);
    });

    it('has code examples', () => {
      const codeBlocks = doc.querySelectorAll('.content pre');
      expect(codeBlocks.length).toBeGreaterThanOrEqual(4);
    });

    it('has general migration tips section', () => {
      const headings = doc.querySelectorAll('.content h2');
      const texts = Array.from(headings).map((h) => h.textContent);
      expect(texts.some((t) => t!.includes('General') || t!.includes('Tips'))).toBe(true);
    });
  });
});

describe('Docs Sidebar Navigation', () => {
  const docsFiles = ['index.html', 'widgets.html', 'declarative.html', 'theming.html'];

  docsFiles.forEach((file) => {
    it(`${file} sidebar includes migration guide link`, () => {
      const html = fs.readFileSync(path.join(__dirname, '..', 'pages', 'docs', file), 'utf-8');
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.querySelectorAll('.sidebar a');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('migration.html');
    });

    it(`${file} sidebar links to Explorer`, () => {
      const html = fs.readFileSync(path.join(__dirname, '..', 'pages', 'docs', file), 'utf-8');
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.querySelectorAll('.sidebar a');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('../explorer/');
    });
  });
});
