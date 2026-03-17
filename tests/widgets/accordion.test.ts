import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { accordion } from '../../src/widgets/accordion';

describe('Accordion widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicItems = [
    { id: 'item1', title: 'Item 1', content: '<p>Content 1</p>' },
    { id: 'item2', title: 'Item 2', content: '<p>Content 2</p>' },
    { id: 'item3', title: 'Item 3', content: '<p>Content 3</p>' },
  ];

  it('should render items with headers and panels', () => {
    accordion(container, { items: basicItems });

    const headers = container.querySelectorAll('.tx-accordion-header');
    expect(headers.length).toBe(3);

    const panels = container.querySelectorAll('.tx-accordion-panel');
    expect(panels.length).toBe(3);

    // Check titles
    const titles = container.querySelectorAll('.tx-accordion-title');
    expect(titles[0].textContent).toBe('Item 1');
    expect(titles[1].textContent).toBe('Item 2');
    expect(titles[2].textContent).toBe('Item 3');
  });

  it('click toggles item open/close', () => {
    accordion(container, { items: basicItems, animated: false });

    const header = container.querySelector('[data-item="item1"] .tx-accordion-header') as HTMLElement;
    const item = container.querySelector('[data-item="item1"]') as HTMLElement;

    // Initially closed
    expect(item.classList.contains('tx-accordion-open')).toBe(false);

    // Click to open
    header.click();
    expect(item.classList.contains('tx-accordion-open')).toBe(true);

    // Click to close
    header.click();
    expect(item.classList.contains('tx-accordion-open')).toBe(false);
  });

  it('single mode: opening one closes others', () => {
    const a = accordion(container, { items: basicItems, multiple: false, animated: false });

    a.open('item1');
    expect(container.querySelector('[data-item="item1"]')!.classList.contains('tx-accordion-open')).toBe(true);

    a.open('item2');
    // item1 should be closed, item2 should be open
    expect(container.querySelector('[data-item="item2"]')!.classList.contains('tx-accordion-open')).toBe(true);
    // In single mode, opening item2 should close item1
    // Note: close animation may take time, but since animated=false, it should be immediate
    const item1 = container.querySelector('[data-item="item1"]') as HTMLElement;
    const item1Panel = item1.querySelector('.tx-accordion-panel') as HTMLElement;
    expect(item1Panel.style.display).toBe('none');
  });

  it('multiple mode: multiple can be open', () => {
    const a = accordion(container, { items: basicItems, multiple: true, animated: false });

    a.open('item1');
    a.open('item2');

    expect(container.querySelector('[data-item="item1"]')!.classList.contains('tx-accordion-open')).toBe(true);
    expect(container.querySelector('[data-item="item2"]')!.classList.contains('tx-accordion-open')).toBe(true);
  });

  it('open() method opens an item', () => {
    const a = accordion(container, { items: basicItems, animated: false });

    a.open('item2');

    const item = container.querySelector('[data-item="item2"]') as HTMLElement;
    expect(item.classList.contains('tx-accordion-open')).toBe(true);
  });

  it('close() method closes an item', () => {
    const items = [{ id: 'item1', title: 'Item 1', content: 'Content 1', open: true }];
    const a = accordion(container, { items, animated: false });

    const item = container.querySelector('[data-item="item1"]') as HTMLElement;
    expect(item.classList.contains('tx-accordion-open')).toBe(true);

    a.close('item1');
    expect(item.classList.contains('tx-accordion-open')).toBe(false);
  });

  it('toggle() method toggles an item', () => {
    const a = accordion(container, { items: basicItems, animated: false });

    a.toggle('item1');
    expect(container.querySelector('[data-item="item1"]')!.classList.contains('tx-accordion-open')).toBe(true);

    a.toggle('item1');
    expect(container.querySelector('[data-item="item1"]')!.classList.contains('tx-accordion-open')).toBe(false);
  });

  it('openAll() opens all items', () => {
    const a = accordion(container, { items: basicItems, multiple: true, animated: false });

    a.openAll();

    for (const item of basicItems) {
      expect(container.querySelector(`[data-item="${item.id}"]`)!.classList.contains('tx-accordion-open')).toBe(true);
    }
  });

  it('closeAll() closes all items', () => {
    const items = basicItems.map((i) => ({ ...i, open: true }));
    const a = accordion(container, { items, multiple: true, animated: false });

    a.closeAll();

    for (const item of basicItems) {
      const el = container.querySelector(`[data-item="${item.id}"]`) as HTMLElement;
      const panel = el.querySelector('.tx-accordion-panel') as HTMLElement;
      expect(panel.style.display).toBe('none');
    }
  });

  it('should render initially open items', () => {
    const items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1', open: true },
      { id: 'item2', title: 'Item 2', content: 'Content 2' },
    ];
    accordion(container, { items });

    const item1 = container.querySelector('[data-item="item1"]') as HTMLElement;
    expect(item1.classList.contains('tx-accordion-open')).toBe(true);

    const item2 = container.querySelector('[data-item="item2"]') as HTMLElement;
    expect(item2.classList.contains('tx-accordion-open')).toBe(false);
  });

  it('should not toggle disabled items', () => {
    const items = [{ id: 'item1', title: 'Item 1', content: 'Content 1', disabled: true }];
    const a = accordion(container, { items, animated: false });

    a.open('item1');
    const item = container.querySelector('[data-item="item1"]') as HTMLElement;
    expect(item.classList.contains('tx-accordion-open')).toBe(false);
  });

  it('destroy() clears content', () => {
    const a = accordion(container, { items: basicItems });

    a.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should add bordered class by default', () => {
    accordion(container, { items: basicItems });

    const accordionEl = container.querySelector('.tx-accordion');
    expect(accordionEl!.classList.contains('tx-accordion-bordered')).toBe(true);
  });

  it('should render icons in headers when specified', () => {
    const items = [{ id: 'item1', title: 'Item 1', content: 'Content', icon: 'home' }];
    accordion(container, { items });

    const iconEl = container.querySelector('.tx-accordion-icon');
    expect(iconEl).not.toBeNull();
    expect(iconEl!.innerHTML).toContain('<svg');
  });
});
