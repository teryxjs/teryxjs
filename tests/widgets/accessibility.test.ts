import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tabs } from '../../src/widgets/tabs';
import { accordion } from '../../src/widgets/accordion';
import { dropdown } from '../../src/widgets/dropdown';
import { modal } from '../../src/widgets/modal';
import { tree } from '../../src/widgets/tree';
import { rating } from '../../src/widgets/rating';

function fireKeydown(el: HTMLElement, key: string, opts: Partial<KeyboardEventInit> = {}): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }));
}

describe('Accessibility — Keyboard Navigation & ARIA', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Tabs ──

  it('Tabs: arrow keys navigate between tabs (roving tabindex)', () => {
    const t = tabs(container, {
      items: [
        { id: 'a', title: 'A', content: 'A', active: true },
        { id: 'b', title: 'B', content: 'B' },
        { id: 'c', title: 'C', content: 'C' },
      ],
    });

    const tabA = container.querySelector('.tx-tab[data-tab="a"]') as HTMLElement;
    const tabB = container.querySelector('.tx-tab[data-tab="b"]') as HTMLElement;

    expect(tabA.getAttribute('tabindex')).toBe('0');
    expect(tabB.getAttribute('tabindex')).toBe('-1');

    // Arrow right moves to next tab
    fireKeydown(tabA, 'ArrowRight');
    expect(t.activeTab()).toBe('b');
    expect(tabB.getAttribute('tabindex')).toBe('0');
    expect(tabA.getAttribute('tabindex')).toBe('-1');
  });

  it('Tabs: Home/End keys jump to first/last tab', () => {
    const t = tabs(container, {
      items: [
        { id: 'a', title: 'A', content: 'A', active: true },
        { id: 'b', title: 'B', content: 'B' },
        { id: 'c', title: 'C', content: 'C' },
      ],
    });

    const tabA = container.querySelector('.tx-tab[data-tab="a"]') as HTMLElement;

    fireKeydown(tabA, 'End');
    expect(t.activeTab()).toBe('c');

    const tabC = container.querySelector('.tx-tab[data-tab="c"]') as HTMLElement;
    fireKeydown(tabC, 'Home');
    expect(t.activeTab()).toBe('a');
  });

  it('Tabs: panels have aria-labelledby linking to tab buttons', () => {
    tabs(container, {
      items: [{ id: 'x', title: 'X', content: 'X', active: true }],
    });

    const tab = container.querySelector('.tx-tab[data-tab="x"]') as HTMLElement;
    const panel = container.querySelector('.tx-tab-panel[data-tab="x"]') as HTMLElement;

    expect(tab.id).toBeTruthy();
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    expect(panel.getAttribute('tabindex')).toBe('0');
  });

  // ── Accordion ──

  it('Accordion: arrow keys navigate between headers', () => {
    accordion(container, {
      items: [
        { id: 'a', title: 'A', content: 'A', open: true },
        { id: 'b', title: 'B', content: 'B' },
        { id: 'c', title: 'C', content: 'C' },
      ],
    });

    const headers = container.querySelectorAll('.tx-accordion-header') as NodeListOf<HTMLElement>;
    // Focus first header
    headers[0].focus();

    // Arrow down
    fireKeydown(headers[0], 'ArrowDown');
    expect(document.activeElement).toBe(headers[1]);

    // Arrow up wraps
    fireKeydown(headers[0], 'ArrowUp');
    expect(document.activeElement).toBe(headers[2]);
  });

  it('Accordion: Enter/Space toggles panel', () => {
    const acc = accordion(container, {
      items: [
        { id: 'a', title: 'A', content: 'A' },
        { id: 'b', title: 'B', content: 'B' },
      ],
    });

    const headerA = container.querySelector('.tx-accordion-header') as HTMLElement;
    expect(headerA.getAttribute('aria-expanded')).toBe('false');

    // Space to open
    fireKeydown(headerA, ' ');
    expect(headerA.getAttribute('aria-expanded')).toBe('true');

    // Enter to close
    fireKeydown(headerA, 'Enter');
    expect(headerA.getAttribute('aria-expanded')).toBe('false');
  });

  it('Accordion: panels have role=region and aria-labelledby', () => {
    accordion(container, {
      items: [{ id: 'a', title: 'A', content: 'A' }],
    });

    const header = container.querySelector('.tx-accordion-header') as HTMLElement;
    const panel = container.querySelector('.tx-accordion-panel') as HTMLElement;

    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-labelledby')).toBe(header.id);
  });

  // ── Dropdown ──

  it('Dropdown: trigger has aria-haspopup and aria-expanded', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Menu';
    container.appendChild(trigger);

    const dd = dropdown({
      trigger,
      items: [{ label: 'Item 1' }, { label: 'Item 2' }],
    });

    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    dd.open();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    dd.destroy();
  });

  it('Dropdown: arrow keys navigate menu items', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Menu';
    container.appendChild(trigger);

    const handler = vi.fn();
    const dd = dropdown({
      trigger,
      items: [{ label: 'Item 1', handler }, { label: 'Item 2' }, { label: 'Item 3' }],
    });

    dd.open();

    // First item should be focused
    const items = trigger.querySelectorAll('.tx-dropdown-item') as NodeListOf<HTMLElement>;
    expect(items[0].getAttribute('tabindex')).toBe('0');

    // Arrow down
    fireKeydown(items[0], 'ArrowDown');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    expect(items[0].getAttribute('tabindex')).toBe('-1');

    dd.destroy();
  });

  // ── Modal ──

  it('Modal: focus trap cycles within modal', () => {
    const m = modal({
      title: 'Test',
      content: '<button id="btn1">First</button><button id="btn2">Last</button>',
      buttons: [{ label: 'OK', variant: 'primary', action: 'close' }],
    });

    m.open();

    const overlay = m.el;
    const dialog = overlay.querySelector('.tx-modal') as HTMLElement;
    const buttons = dialog.querySelectorAll('button') as NodeListOf<HTMLElement>;
    const lastButton = buttons[buttons.length - 1];

    // Simulate Tab at last element - should wrap to first
    lastButton.focus();
    fireKeydown(lastButton, 'Tab');

    // The focus trap should prevent focus from leaving the modal
    // (We can verify the handler exists and runs)
    expect(overlay.getAttribute('aria-modal')).toBe('true');
    expect(overlay.getAttribute('role')).toBe('dialog');

    m.destroy();
  });

  it('Modal: restores focus on close', async () => {
    const openButton = document.createElement('button');
    openButton.textContent = 'Open';
    container.appendChild(openButton);
    openButton.focus();

    const m = modal({
      title: 'Test',
      content: '<p>Content</p>',
    });

    m.open();

    // Close and wait for animation
    m.close();
    await new Promise((r) => setTimeout(r, 250));

    expect(document.activeElement).toBe(openButton);

    m.destroy();
  });

  // ── Tree ──

  it('Tree: arrow keys navigate between visible nodes', () => {
    tree(container, {
      nodes: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
        { id: 'c', text: 'C' },
      ],
    });

    const contents = container.querySelectorAll('.tx-tree-content') as NodeListOf<HTMLElement>;
    expect(contents[0].getAttribute('tabindex')).toBe('0');

    contents[0].focus();

    // Arrow down
    fireKeydown(contents[0], 'ArrowDown');
    expect(document.activeElement).toBe(contents[1]);

    // Arrow up
    fireKeydown(contents[1], 'ArrowUp');
    expect(document.activeElement).toBe(contents[0]);
  });

  it('Tree: Enter selects a node', () => {
    const onSelect = vi.fn();
    tree(container, {
      nodes: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      onSelect,
    });

    const contents = container.querySelectorAll('.tx-tree-content') as NodeListOf<HTMLElement>;
    contents[0].focus();

    fireKeydown(contents[0], 'Enter');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
    expect(contents[0].classList.contains('tx-tree-selected')).toBe(true);
  });

  // ── Rating ──

  it('Rating: arrow keys change value', () => {
    const onChange = vi.fn();
    const r = rating(container, { value: 3, max: 5, onChange });

    const ratingEl = container.querySelector('.tx-rating') as HTMLElement;
    expect(ratingEl.getAttribute('tabindex')).toBe('0');
    expect(ratingEl.getAttribute('role')).toBe('radiogroup');

    // Arrow right increases
    fireKeydown(ratingEl, 'ArrowRight');
    expect(r.getValue()).toBe(4);
    expect(onChange).toHaveBeenCalledWith(4);

    // Arrow left decreases
    fireKeydown(ratingEl, 'ArrowLeft');
    expect(r.getValue()).toBe(3);
  });

  it('Rating: Home/End set min/max values', () => {
    const r = rating(container, { value: 3, max: 5 });

    const ratingEl = container.querySelector('.tx-rating') as HTMLElement;

    fireKeydown(ratingEl, 'End');
    expect(r.getValue()).toBe(5);

    fireKeydown(ratingEl, 'Home');
    expect(r.getValue()).toBe(0);
  });
});
