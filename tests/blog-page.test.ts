import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const blogHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'blog', 'index.html'), 'utf-8');

describe('Blog Page HTML', () => {
  let doc: Document;

  beforeEach(() => {
    const parser = new DOMParser();
    doc = parser.parseFromString(blogHtml, 'text/html');
  });

  describe('Page Structure', () => {
    it('has correct page title', () => {
      expect(doc.title).toContain('Blog');
    });

    it('includes teryx.css stylesheet', () => {
      const links = doc.querySelectorAll('link[rel="stylesheet"]');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs.some((h) => h?.includes('teryx.css'))).toBe(true);
    });

    it('includes site-layout.css stylesheet', () => {
      const links = doc.querySelectorAll('link[rel="stylesheet"]');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs.some((h) => h?.includes('site-layout.css'))).toBe(true);
    });

    it('includes site-layout.js with data-page="blog"', () => {
      const scripts = doc.querySelectorAll('script[src*="site-layout"]');
      expect(scripts.length).toBe(1);
      expect(scripts[0].getAttribute('data-page')).toBe('blog');
    });
  });

  describe('Header', () => {
    it('has a blog heading', () => {
      const h1 = doc.querySelector('.blog-header h1');
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toBe('Blog');
    });

    it('has a description', () => {
      const p = doc.querySelector('.blog-header p');
      expect(p).not.toBeNull();
      expect(p!.textContent!.length).toBeGreaterThan(10);
    });
  });

  describe('Blog Entries', () => {
    it('has at least 3 blog entries', () => {
      const entries = doc.querySelectorAll('.blog-entry');
      expect(entries.length).toBeGreaterThanOrEqual(3);
    });

    it('each entry has a date', () => {
      const entries = doc.querySelectorAll('.blog-entry');
      entries.forEach((entry) => {
        const date = entry.querySelector('.blog-entry-date');
        expect(date).not.toBeNull();
        expect(date!.textContent!.length).toBeGreaterThan(0);
      });
    });

    it('each entry has a tag', () => {
      const entries = doc.querySelectorAll('.blog-entry');
      entries.forEach((entry) => {
        const tag = entry.querySelector('.blog-entry-tag');
        expect(tag).not.toBeNull();
      });
    });

    it('each entry has a title', () => {
      const entries = doc.querySelectorAll('.blog-entry');
      entries.forEach((entry) => {
        const title = entry.querySelector('h2');
        expect(title).not.toBeNull();
        expect(title!.textContent!.length).toBeGreaterThan(0);
      });
    });

    it('each entry has content paragraphs or lists', () => {
      const entries = doc.querySelectorAll('.blog-entry');
      entries.forEach((entry) => {
        const hasContent = entry.querySelector('p') || entry.querySelector('ul');
        expect(hasContent).not.toBeNull();
      });
    });

    it('entries are tagged as releases', () => {
      const releaseTags = doc.querySelectorAll('.blog-entry-tag.release');
      expect(releaseTags.length).toBeGreaterThanOrEqual(3);
    });

    it('first entry is the latest version (v0.3.0)', () => {
      const firstTitle = doc.querySelector('.blog-entry h2');
      expect(firstTitle!.textContent).toContain('0.3.0');
    });

    it('entries contain version anchors', () => {
      const anchors = doc.querySelectorAll('.blog-entry h2 a[id]');
      expect(anchors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Footer', () => {
    it('has a site-footer placeholder', () => {
      const footer = doc.getElementById('site-footer');
      expect(footer).not.toBeNull();
    });
  });
});
