import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const homeHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'index.html'), 'utf-8');

describe('Homepage HTML', () => {
  let doc: Document;

  beforeEach(() => {
    const parser = new DOMParser();
    doc = parser.parseFromString(homeHtml, 'text/html');
  });

  describe('Page Structure', () => {
    it('has correct title', () => {
      expect(doc.title).toContain('Teryx');
    });

    it('includes site-layout.js with data-page="home"', () => {
      const scripts = doc.querySelectorAll('script[src*="site-layout"]');
      expect(scripts.length).toBe(1);
      expect(scripts[0].getAttribute('data-page')).toBe('home');
    });

    it('includes teryx.css and site-layout.css', () => {
      const links = doc.querySelectorAll('link[rel="stylesheet"]');
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs.some((h) => h?.includes('teryx.css'))).toBe(true);
      expect(hrefs.some((h) => h?.includes('site-layout.css'))).toBe(true);
    });
  });

  describe('Hero Section', () => {
    it('has a hero container', () => {
      expect(doc.getElementById('hero')).not.toBeNull();
    });
  });

  describe('Quick Start Section', () => {
    it('has quick start section', () => {
      expect(doc.getElementById('quickstart')).not.toBeNull();
    });

    it('has 3 steps', () => {
      const steps = doc.querySelectorAll('.quickstart-step');
      expect(steps.length).toBe(3);
    });

    it('steps are Install, Import, Render', () => {
      const titles = doc.querySelectorAll('.quickstart-step h3');
      const texts = Array.from(titles).map((t) => t.textContent);
      expect(texts).toEqual(['Install', 'Import', 'Render']);
    });

    it('each step has a code block', () => {
      const steps = doc.querySelectorAll('.quickstart-step');
      steps.forEach((step) => {
        expect(step.querySelector('pre')).not.toBeNull();
      });
    });
  });

  describe('Why Teryx Section', () => {
    it('has features section', () => {
      expect(doc.getElementById('features')).not.toBeNull();
    });

    it('has 4 feature cards', () => {
      const cards = doc.querySelectorAll('.feature-card');
      expect(cards.length).toBe(4);
    });

    it('features cover Zero Deps, 45+ Widgets, TypeScript, Dual API', () => {
      const titles = doc.querySelectorAll('.feature-card h3');
      const texts = Array.from(titles).map((t) => t.textContent);
      expect(texts).toContain('Zero Dependencies');
      expect(texts).toContain('45+ Widgets');
      expect(texts).toContain('TypeScript Native');
      expect(texts).toContain('Dual API');
    });
  });

  describe('Widget Showcase Section', () => {
    it('has showcase section', () => {
      expect(doc.getElementById('showcase')).not.toBeNull();
    });

    it('has 4 showcase boxes', () => {
      const boxes = doc.querySelectorAll('.showcase-box');
      expect(boxes.length).toBe(4);
    });

    it('includes grid, charts, form, and tabs demos', () => {
      expect(doc.getElementById('demo-grid')).not.toBeNull();
      expect(doc.getElementById('demo-charts')).not.toBeNull();
      expect(doc.getElementById('demo-form')).not.toBeNull();
      expect(doc.getElementById('demo-tabs')).not.toBeNull();
    });
  });

  describe('DX Section', () => {
    it('has DX section', () => {
      expect(doc.getElementById('dx')).not.toBeNull();
    });

    it('has two code panels (declarative and imperative)', () => {
      const panels = doc.querySelectorAll('.dx-panel');
      expect(panels.length).toBe(2);
    });

    it('panels show Declarative HTML and Imperative TypeScript', () => {
      const headers = doc.querySelectorAll('.dx-panel-header');
      const texts = Array.from(headers).map((h) => h.textContent);
      expect(texts).toContain('Declarative HTML');
      expect(texts).toContain('Imperative TypeScript');
    });
  });

  describe('Stats Section', () => {
    it('has stats section', () => {
      expect(doc.getElementById('stats')).not.toBeNull();
    });

    it('has 4 stat cards', () => {
      const cards = doc.querySelectorAll('.stat-card');
      expect(cards.length).toBe(4);
    });
  });

  describe('CTA Section', () => {
    it('has CTA section', () => {
      expect(doc.querySelector('.cta-section')).not.toBeNull();
    });

    it('has CTA buttons', () => {
      const buttons = doc.querySelectorAll('.cta-btn');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Footer', () => {
    it('has site-footer placeholder', () => {
      expect(doc.getElementById('site-footer')).not.toBeNull();
    });
  });
});
