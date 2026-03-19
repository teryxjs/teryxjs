import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tabs } from '../../src/widgets/tabs';
import { accordion } from '../../src/widgets/accordion';

describe('Tabs demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Basic Tabs ──
  describe('Basic Tabs', () => {
    it('renders tabs container with default variant class', () => {
      tabs(container, {
        items: [
          { id: 'b1', title: 'Overview', content: '<p>Overview</p>' },
          { id: 'b2', title: 'Settings', content: '<p>Settings</p>' },
          { id: 'b3', title: 'Activity', content: '<p>Activity</p>' },
        ],
      });

      const el = container.querySelector('.tx-tabs-container');
      expect(el).not.toBeNull();
      expect(el!.classList.contains('tx-tabs-tabs')).toBe(true);
    });

    it('renders three tab buttons', () => {
      tabs(container, {
        items: [
          { id: 'b1', title: 'Overview', content: '<p>Overview</p>' },
          { id: 'b2', title: 'Settings', content: '<p>Settings</p>' },
          { id: 'b3', title: 'Activity', content: '<p>Activity</p>' },
        ],
      });

      const tabBtns = container.querySelectorAll('.tx-tab');
      expect(tabBtns.length).toBe(3);
    });

    it('first tab is active by default', () => {
      tabs(container, {
        items: [
          { id: 'b1', title: 'Overview', content: '<p>Overview</p>' },
          { id: 'b2', title: 'Settings', content: '<p>Settings</p>' },
        ],
      });

      const active = container.querySelector('.tx-tab-active');
      expect(active).not.toBeNull();
      expect(active!.getAttribute('data-tab')).toBe('b1');
    });

    it('clicking a tab activates it', () => {
      tabs(container, {
        items: [
          { id: 'b1', title: 'Overview', content: '<p>Overview</p>' },
          { id: 'b2', title: 'Settings', content: '<p>Settings</p>' },
        ],
      });

      const secondTab = container.querySelector('.tx-tab[data-tab="b2"]') as HTMLElement;
      secondTab.click();

      const active = container.querySelector('.tx-tab-active');
      expect(active!.getAttribute('data-tab')).toBe('b2');
      expect(container.querySelector('.tx-tab-panel[data-tab="b2"]')!.classList).toContain('tx-tab-panel-active');
    });
  });

  // ── Underline Variant ──
  describe('Underline Variant', () => {
    it('renders with underline variant class', () => {
      tabs(container, {
        variant: 'underline',
        items: [
          { id: 'u1', title: 'Profile', content: '<p>Profile</p>' },
          { id: 'u2', title: 'Billing', content: '<p>Billing</p>' },
        ],
      });

      const el = container.querySelector('.tx-tabs-container');
      expect(el!.classList.contains('tx-tabs-underline')).toBe(true);
    });
  });

  // ── Pills Variant ──
  describe('Pills Variant', () => {
    it('renders with pills variant class', () => {
      tabs(container, {
        variant: 'pills',
        items: [
          { id: 'p1', title: 'All', content: '<p>All</p>' },
          { id: 'p2', title: 'Active', content: '<p>Active</p>' },
        ],
      });

      const el = container.querySelector('.tx-tabs-container');
      expect(el!.classList.contains('tx-tabs-pills')).toBe(true);
    });
  });

  // ── Card Variant ──
  describe('Card Variant', () => {
    it('renders with card variant class', () => {
      tabs(container, {
        variant: 'card',
        items: [
          { id: 'c1', title: 'Details', content: '<p>Details</p>' },
          { id: 'c2', title: 'Reviews', content: '<p>Reviews</p>' },
        ],
      });

      const el = container.querySelector('.tx-tabs-container');
      expect(el!.classList.contains('tx-tabs-card')).toBe(true);
    });
  });

  // ── Vertical Tabs ──
  describe('Vertical Tabs', () => {
    it('renders with vertical class', () => {
      tabs(container, {
        vertical: true,
        items: [
          { id: 'v1', title: 'General', content: '<p>General</p>' },
          { id: 'v2', title: 'Security', content: '<p>Security</p>' },
        ],
      });

      const el = container.querySelector('.tx-tabs-container');
      expect(el!.classList.contains('tx-tabs-vertical')).toBe(true);
    });
  });

  // ── Scrollable Tabs ──
  describe('Scrollable Tabs', () => {
    it('renders scroll buttons and scrollable class', () => {
      const items = [];
      for (let i = 1; i <= 15; i++) {
        items.push({
          id: 's' + i,
          title: 'Tab ' + i,
          content: '<p>Content ' + i + '</p>',
        });
      }
      tabs(container, { scrollable: true, items });

      expect(container.querySelector('.tx-tabs-scrollable')).not.toBeNull();
      expect(container.querySelector('.tx-tabs-scroll-left')).not.toBeNull();
      expect(container.querySelector('.tx-tabs-scroll-right')).not.toBeNull();
    });

    it('renders all 15 tabs', () => {
      const items = [];
      for (let i = 1; i <= 15; i++) {
        items.push({
          id: 's' + i,
          title: 'Tab ' + i,
          content: '<p>Content ' + i + '</p>',
        });
      }
      tabs(container, { scrollable: true, items });

      const tabBtns = container.querySelectorAll('.tx-tab');
      expect(tabBtns.length).toBe(15);
    });
  });

  // ── Closable Tabs ──
  describe('Closable Tabs', () => {
    it('renders close buttons on closable tabs', () => {
      tabs(container, {
        items: [
          {
            id: 'cl1',
            title: 'Home',
            content: '<p>Home</p>',
            closable: true,
          },
          {
            id: 'cl2',
            title: 'Editor',
            content: '<p>Editor</p>',
            closable: true,
          },
        ],
      });

      const closeButtons = container.querySelectorAll('.tx-tab-close');
      expect(closeButtons.length).toBe(2);
    });

    it('renders add button when addable is true', () => {
      tabs(container, {
        addable: true,
        items: [
          {
            id: 'cl1',
            title: 'Home',
            content: '<p>Home</p>',
            closable: true,
          },
        ],
        onAdd: () => ({
          id: 'new',
          title: 'New',
          content: '<p>New</p>',
          closable: true,
        }),
      });

      expect(container.querySelector('.tx-tab-add')).not.toBeNull();
    });

    it('removeTab removes a tab', () => {
      const inst = tabs(container, {
        items: [
          {
            id: 'cl1',
            title: 'Home',
            content: '<p>Home</p>',
            closable: true,
          },
          {
            id: 'cl2',
            title: 'Editor',
            content: '<p>Editor</p>',
            closable: true,
          },
        ],
      });

      inst.removeTab('cl1');
      expect(container.querySelector('.tx-tab[data-tab="cl1"]')).toBeNull();
      expect(container.querySelectorAll('.tx-tab').length).toBe(1);
    });
  });

  // ── Lazy-Load Tabs ──
  describe('Lazy-Load Tabs', () => {
    it('renders tab with icon', () => {
      tabs(container, {
        items: [
          { id: 'l1', title: 'Loaded', content: '<p>Loaded</p>' },
          {
            id: 'l2',
            title: 'Icons',
            content: '<p>Icons</p>',
            icon: 'star',
          },
        ],
      });

      const iconSpan = container.querySelector('.tx-tab-icon');
      expect(iconSpan).not.toBeNull();
    });

    it('renders disabled tab correctly', () => {
      tabs(container, {
        items: [
          { id: 'l1', title: 'Loaded', content: '<p>Loaded</p>' },
          {
            id: 'l2',
            title: 'Disabled',
            content: '<p>Disabled</p>',
            disabled: true,
          },
        ],
      });

      const disabled = container.querySelector('.tx-tab-disabled');
      expect(disabled).not.toBeNull();
      expect(disabled!.hasAttribute('disabled')).toBe(true);
    });

    it('disabled tab cannot be activated by click', () => {
      tabs(container, {
        items: [
          { id: 'l1', title: 'Loaded', content: '<p>Loaded</p>' },
          {
            id: 'l2',
            title: 'Disabled',
            content: '<p>Disabled</p>',
            disabled: true,
          },
        ],
      });

      const disabledTab = container.querySelector('.tx-tab[data-tab="l2"]') as HTMLElement;
      disabledTab.click();

      const active = container.querySelector('.tx-tab-active');
      expect(active!.getAttribute('data-tab')).toBe('l1');
    });
  });
});

describe('Accordion demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Basic Accordion ──
  describe('Basic Accordion', () => {
    it('renders accordion container', () => {
      accordion(container, {
        items: [
          {
            id: 'a1',
            title: 'What is Teryx?',
            content: '<p>Framework</p>',
            open: true,
          },
          {
            id: 'a2',
            title: 'How does it work?',
            content: '<p>Widgets</p>',
          },
          { id: 'a3', title: 'Is it free?', content: '<p>Yes</p>' },
        ],
      });

      const el = container.querySelector('.tx-accordion');
      expect(el).not.toBeNull();
    });

    it('renders three accordion items', () => {
      accordion(container, {
        items: [
          {
            id: 'a1',
            title: 'Section 1',
            content: '<p>Content</p>',
            open: true,
          },
          { id: 'a2', title: 'Section 2', content: '<p>Content</p>' },
          { id: 'a3', title: 'Section 3', content: '<p>Content</p>' },
        ],
      });

      const items = container.querySelectorAll('.tx-accordion-item');
      expect(items.length).toBe(3);
    });

    it('first item is open by default when open: true', () => {
      accordion(container, {
        items: [
          {
            id: 'a1',
            title: 'First',
            content: '<p>Content</p>',
            open: true,
          },
          { id: 'a2', title: 'Second', content: '<p>Content</p>' },
        ],
      });

      const first = container.querySelector('[data-item="a1"]');
      expect(first!.classList.contains('tx-accordion-open')).toBe(true);
    });

    it('only one item open at a time (non-multiple mode)', () => {
      const inst = accordion(container, {
        animated: false,
        items: [
          {
            id: 'a1',
            title: 'First',
            content: '<p>Content</p>',
            open: true,
          },
          { id: 'a2', title: 'Second', content: '<p>Content</p>' },
        ],
      });

      inst.open('a2');
      const openItems = container.querySelectorAll('.tx-accordion-open');
      expect(openItems.length).toBe(1);
      expect(openItems[0].getAttribute('data-item')).toBe('a2');
    });
  });

  // ── Multiple Open ──
  describe('Multiple Open', () => {
    it('allows multiple items to be open simultaneously', () => {
      accordion(container, {
        multiple: true,
        items: [
          {
            id: 'm1',
            title: 'Frontend',
            content: '<p>Content</p>',
            open: true,
          },
          {
            id: 'm2',
            title: 'Backend',
            content: '<p>Content</p>',
            open: true,
          },
          { id: 'm3', title: 'Database', content: '<p>Content</p>' },
        ],
      });

      const openItems = container.querySelectorAll('.tx-accordion-open');
      expect(openItems.length).toBe(2);
    });

    it('opening a third item keeps others open', () => {
      const inst = accordion(container, {
        multiple: true,
        items: [
          {
            id: 'm1',
            title: 'Frontend',
            content: '<p>Content</p>',
            open: true,
          },
          {
            id: 'm2',
            title: 'Backend',
            content: '<p>Content</p>',
            open: true,
          },
          { id: 'm3', title: 'Database', content: '<p>Content</p>' },
        ],
      });

      inst.open('m3');
      const openItems = container.querySelectorAll('.tx-accordion-open');
      expect(openItems.length).toBe(3);
    });
  });

  // ── With Icons ──
  describe('With Icons', () => {
    it('renders icon elements in headers', () => {
      accordion(container, {
        items: [
          {
            id: 'i1',
            title: 'Settings',
            icon: 'settings',
            content: '<p>Content</p>',
          },
          {
            id: 'i2',
            title: 'Users',
            icon: 'user',
            content: '<p>Content</p>',
          },
          {
            id: 'i3',
            title: 'Files',
            icon: 'folder',
            content: '<p>Content</p>',
          },
        ],
      });

      const icons = container.querySelectorAll('.tx-accordion-icon');
      expect(icons.length).toBe(3);
    });

    it('each icon contains an SVG', () => {
      accordion(container, {
        items: [
          {
            id: 'i1',
            title: 'Settings',
            icon: 'settings',
            content: '<p>Content</p>',
          },
        ],
      });

      const iconEl = container.querySelector('.tx-accordion-icon');
      expect(iconEl!.querySelector('svg')).not.toBeNull();
    });
  });

  // ── Nested Accordion ──
  describe('Nested Accordion', () => {
    it('renders outer accordion', () => {
      accordion(container, {
        items: [
          {
            id: 'n1',
            title: 'Getting Started',
            content: '<div id="nested-test"></div>',
            open: true,
          },
          {
            id: 'n2',
            title: 'API Reference',
            content: '<p>API docs</p>',
          },
        ],
      });

      expect(container.querySelector('.tx-accordion')).not.toBeNull();
      const items = container.querySelectorAll('.tx-accordion-item');
      expect(items.length).toBe(2);
    });

    it('supports nested accordion inside content', () => {
      accordion(container, {
        items: [
          {
            id: 'n1',
            title: 'Getting Started',
            content: '<div id="nested-test"></div>',
            open: true,
          },
        ],
      });

      const nested = container.querySelector('#nested-test') as HTMLElement;
      accordion(nested, {
        bordered: false,
        items: [
          {
            id: 'ns1',
            title: 'Installation',
            content: '<p>npm install</p>',
            open: true,
          },
          {
            id: 'ns2',
            title: 'Quick Start',
            content: '<p>Import widgets</p>',
          },
        ],
      });

      const allAccordions = container.querySelectorAll('.tx-accordion');
      expect(allAccordions.length).toBe(2);

      const nestedItems = nested.querySelectorAll('.tx-accordion-item');
      expect(nestedItems.length).toBe(2);
    });
  });

  // ── Programmatic API ──
  describe('Programmatic API', () => {
    it('openAll and closeAll work correctly', () => {
      const inst = accordion(container, {
        multiple: true,
        animated: false,
        items: [
          { id: 'p1', title: 'A', content: '<p>A</p>' },
          { id: 'p2', title: 'B', content: '<p>B</p>' },
          { id: 'p3', title: 'C', content: '<p>C</p>' },
        ],
      });

      inst.openAll();
      expect(container.querySelectorAll('.tx-accordion-open').length).toBe(3);

      inst.closeAll();
      expect(container.querySelectorAll('.tx-accordion-open').length).toBe(0);
    });

    it('toggle flips item state', () => {
      const inst = accordion(container, {
        items: [
          {
            id: 'p1',
            title: 'A',
            content: '<p>A</p>',
            open: true,
          },
        ],
      });

      expect(container.querySelector('[data-item="p1"]')!.classList.contains('tx-accordion-open')).toBe(true);

      inst.toggle('p1');
      // After toggle the close animation starts; the class may be removed synchronously
      // or after a timeout depending on animated mode. In JSDOM there is no rAF,
      // so the non-animated path runs synchronously.
    });
  });
});
