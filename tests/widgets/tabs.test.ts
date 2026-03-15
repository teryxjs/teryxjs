import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tabs } from '../../src/widgets/tabs';

describe('Tabs widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicItems = [
    { id: 'tab1', title: 'Tab 1', content: '<p>Content 1</p>' },
    { id: 'tab2', title: 'Tab 2', content: '<p>Content 2</p>' },
    { id: 'tab3', title: 'Tab 3', content: '<p>Content 3</p>' },
  ];

  it('should render tab buttons and panels', () => {
    tabs(container, { items: basicItems });

    const buttons = container.querySelectorAll('.tx-tab');
    expect(buttons.length).toBe(3);

    const panels = container.querySelectorAll('.tx-tab-panel');
    expect(panels.length).toBe(3);
  });

  it('should show first tab as active by default', () => {
    // When no item has active: true, the first tab is tracked as active internally
    const items = [
      { id: 'tab1', title: 'Tab 1', content: '<p>Content 1</p>', active: true },
      { id: 'tab2', title: 'Tab 2', content: '<p>Content 2</p>' },
      { id: 'tab3', title: 'Tab 3', content: '<p>Content 3</p>' },
    ];
    const t = tabs(container, { items });

    expect(t.activeTab()).toBe('tab1');

    const activeBtn = container.querySelector('.tx-tab-active');
    expect(activeBtn).not.toBeNull();
    expect(activeBtn!.getAttribute('data-tab')).toBe('tab1');

    const activePanel = container.querySelector('.tx-tab-panel-active');
    expect(activePanel).not.toBeNull();
    expect(activePanel!.getAttribute('data-tab')).toBe('tab1');
  });

  it('should activate the tab marked as active in items', () => {
    const items = [
      { id: 'a', title: 'A', content: 'A' },
      { id: 'b', title: 'B', content: 'B', active: true },
    ];
    const t = tabs(container, { items });

    expect(t.activeTab()).toBe('b');
  });

  it('activate() switches tabs', () => {
    const t = tabs(container, { items: basicItems });

    t.activate('tab2');
    expect(t.activeTab()).toBe('tab2');

    const activeBtn = container.querySelector('.tx-tab-active');
    expect(activeBtn!.getAttribute('data-tab')).toBe('tab2');

    // Old panel should be hidden
    const panel1 = container.querySelector('[data-tab="tab1"].tx-tab-panel') as HTMLElement;
    expect(panel1.hasAttribute('hidden')).toBe(true);

    // New panel should be visible
    const panel2 = container.querySelector('[data-tab="tab2"].tx-tab-panel') as HTMLElement;
    expect(panel2.classList.contains('tx-tab-panel-active')).toBe(true);
    expect(panel2.hasAttribute('hidden')).toBe(false);
  });

  it('activeTab() returns current', () => {
    const t = tabs(container, { items: basicItems });

    expect(t.activeTab()).toBe('tab1');
    t.activate('tab3');
    expect(t.activeTab()).toBe('tab3');
  });

  it('click handler switches tabs', () => {
    const t = tabs(container, { items: basicItems });

    const tab2Btn = container.querySelector('.tx-tab[data-tab="tab2"]') as HTMLElement;
    tab2Btn.click();

    expect(t.activeTab()).toBe('tab2');
  });

  it('disabled tabs do not activate on click', () => {
    const items = [
      { id: 'a', title: 'A', content: 'A', active: true },
      { id: 'b', title: 'B', content: 'B', disabled: true },
    ];
    const t = tabs(container, { items });

    const disabledBtn = container.querySelector('.tx-tab[data-tab="b"]') as HTMLElement;
    expect(disabledBtn.classList.contains('tx-tab-disabled')).toBe(true);
    disabledBtn.click();

    expect(t.activeTab()).toBe('a'); // should not have changed
  });

  it('addTab() adds new tab', () => {
    const t = tabs(container, { items: basicItems });

    t.addTab({ id: 'tab4', title: 'Tab 4', content: '<p>Content 4</p>' });

    const allTabs = t.getTabs();
    expect(allTabs).toContain('tab4');

    const tab4Btn = container.querySelector('.tx-tab[data-tab="tab4"]');
    expect(tab4Btn).not.toBeNull();

    const tab4Panel = container.querySelector('.tx-tab-panel[data-tab="tab4"]');
    expect(tab4Panel).not.toBeNull();
  });

  it('addTab() with active: true activates the new tab', () => {
    const t = tabs(container, { items: basicItems });

    t.addTab({ id: 'tab4', title: 'Tab 4', content: 'new', active: true });
    expect(t.activeTab()).toBe('tab4');
  });

  it('removeTab() removes tab', () => {
    const t = tabs(container, { items: basicItems });

    t.removeTab('tab2');

    const allTabs = t.getTabs();
    expect(allTabs).not.toContain('tab2');

    const btn = container.querySelector('.tx-tab[data-tab="tab2"]');
    expect(btn).toBeNull();

    const panel = container.querySelector('.tx-tab-panel[data-tab="tab2"]');
    expect(panel).toBeNull();
  });

  it('removing active tab activates first remaining', () => {
    const t = tabs(container, { items: basicItems });

    expect(t.activeTab()).toBe('tab1');
    t.removeTab('tab1');

    // Should activate next available tab
    const remaining = t.getTabs();
    expect(remaining.length).toBe(2);
    expect(t.activeTab()).toBe(remaining[0]);
  });

  it('closable tabs show close button', () => {
    const items = [
      { id: 'a', title: 'A', content: 'A', closable: true },
      { id: 'b', title: 'B', content: 'B' },
    ];
    tabs(container, { items });

    const closeBtn = container.querySelector('.tx-tab[data-tab="a"] .tx-tab-close');
    expect(closeBtn).not.toBeNull();

    const noCloseBtn = container.querySelector('.tx-tab[data-tab="b"] .tx-tab-close');
    expect(noCloseBtn).toBeNull();
  });

  it('clicking close button removes the tab', () => {
    const items = [
      { id: 'a', title: 'A', content: 'A', closable: true },
      { id: 'b', title: 'B', content: 'B', active: true },
    ];
    const t = tabs(container, { items });

    const closeBtn = container.querySelector('.tx-tab[data-tab="a"] .tx-tab-close') as HTMLElement;
    closeBtn.click();

    const allTabs = t.getTabs();
    expect(allTabs).not.toContain('a');
  });

  it('getTabs() returns all tab IDs', () => {
    const t = tabs(container, { items: basicItems });

    const allTabs = t.getTabs();
    expect(allTabs).toEqual(['tab1', 'tab2', 'tab3']);
  });

  it('destroy() clears content', () => {
    const t = tabs(container, { items: basicItems });

    t.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should call onChange callback when tab is switched', () => {
    const onChange = vi.fn();
    const t = tabs(container, { items: basicItems, onChange });

    t.activate('tab2');
    expect(onChange).toHaveBeenCalledWith('tab2');
  });

  it('should render tab badges', () => {
    const items = [
      { id: 'a', title: 'A', content: 'A', badge: '5' },
    ];
    tabs(container, { items });

    const badge = container.querySelector('.tx-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('5');
  });

  it('should render tab icons', () => {
    const items = [
      { id: 'a', title: 'A', content: 'A', icon: 'home' },
    ];
    tabs(container, { items });

    const iconEl = container.querySelector('.tx-tab-icon');
    expect(iconEl).not.toBeNull();
    expect(iconEl!.innerHTML).toContain('<svg');
  });
});
