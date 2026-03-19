import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const pricingHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'pricing', 'index.html'), 'utf-8');

describe('Pricing Page HTML', () => {
  let doc: Document;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.innerHTML = '';
    // Parse the pricing HTML into the document
    const parser = new DOMParser();
    doc = parser.parseFromString(pricingHtml, 'text/html');
  });

  describe('Page Structure', () => {
    it('has correct page title', () => {
      expect(doc.title).toContain('Pricing');
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

    it('includes site-layout.js with data-page="pricing"', () => {
      const scripts = doc.querySelectorAll('script[src*="site-layout"]');
      expect(scripts.length).toBe(1);
      expect(scripts[0].getAttribute('data-page')).toBe('pricing');
    });
  });

  describe('Hero Section', () => {
    it('has a hero heading', () => {
      const h1 = doc.querySelector('.pricing-hero h1');
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain('pricing');
    });

    it('has a hero description', () => {
      const p = doc.querySelector('.pricing-hero p');
      expect(p).not.toBeNull();
      expect(p!.textContent!.length).toBeGreaterThan(20);
    });
  });

  describe('Pricing Cards', () => {
    it('has exactly two pricing cards', () => {
      const cards = doc.querySelectorAll('.pricing-card');
      expect(cards.length).toBe(2);
    });

    it('first card is Community tier', () => {
      const card = doc.querySelector('.pricing-card');
      const title = card?.querySelector('h2');
      expect(title?.textContent).toBe('Community');
    });

    it('Community card shows $0 price', () => {
      const card = doc.querySelector('.pricing-card');
      const amount = card?.querySelector('.amount');
      expect(amount?.textContent).toBe('$0');
    });

    it('second card is Pro tier with recommended class', () => {
      const cards = doc.querySelectorAll('.pricing-card');
      expect(cards[1].classList.contains('recommended')).toBe(true);
      expect(cards[1].querySelector('h2')?.textContent).toBe('Pro');
    });

    it('Pro card has recommended badge', () => {
      const badge = doc.querySelector('.pricing-badge');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toBe('Recommended');
    });

    it('each card has a features list', () => {
      const cards = doc.querySelectorAll('.pricing-card');
      cards.forEach((card) => {
        const features = card.querySelectorAll('.pricing-features li');
        expect(features.length).toBeGreaterThanOrEqual(6);
      });
    });

    it('Community card has check and x icons', () => {
      const card = doc.querySelector('.pricing-card');
      const checks = card!.querySelectorAll('.icon-check');
      const xs = card!.querySelectorAll('.icon-x');
      expect(checks.length).toBeGreaterThanOrEqual(6);
      expect(xs.length).toBeGreaterThanOrEqual(2);
    });

    it('Pro card has only check icons', () => {
      const card = doc.querySelector('.pricing-card.recommended');
      const checks = card!.querySelectorAll('.icon-check');
      const xs = card!.querySelectorAll('.icon-x');
      expect(checks.length).toBeGreaterThanOrEqual(8);
      expect(xs.length).toBe(0);
    });

    it('each card has a CTA button', () => {
      const cards = doc.querySelectorAll('.pricing-card');
      cards.forEach((card) => {
        const cta = card.querySelector('.pricing-cta');
        expect(cta).not.toBeNull();
      });
    });
  });

  describe('FAQ Section', () => {
    it('has a FAQ heading', () => {
      const h2 = doc.querySelector('.pricing-faq h2');
      expect(h2).not.toBeNull();
      expect(h2!.textContent).toContain('question');
    });

    it('has at least 4 FAQ items', () => {
      const items = doc.querySelectorAll('.pricing-faq-item');
      expect(items.length).toBeGreaterThanOrEqual(4);
    });

    it('each FAQ item has a question and answer', () => {
      const items = doc.querySelectorAll('.pricing-faq-item');
      items.forEach((item) => {
        expect(item.querySelector('h3')).not.toBeNull();
        expect(item.querySelector('p')).not.toBeNull();
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
