import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { segmented } from '../../src/widgets/segmented';

describe('Segmented widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicItems = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  it('should render items', () => {
    segmented(container, { items: basicItems });

    const buttons = container.querySelectorAll('.tx-segmented-item');
    expect(buttons.length).toBe(3);

    const labels = Array.from(buttons).map((b) => b.querySelector('.tx-segmented-label')!.textContent);
    expect(labels).toEqual(['Day', 'Week', 'Month']);
  });

  it('should set first item as active by default', () => {
    const s = segmented(container, { items: basicItems });

    expect(s.getValue()).toBe('day');

    const activeBtn = container.querySelector('.tx-segmented-active');
    expect(activeBtn).not.toBeNull();
    expect(activeBtn!.getAttribute('data-value')).toBe('day');
  });

  it('should set specified value as active', () => {
    const s = segmented(container, { items: basicItems, value: 'week' });

    expect(s.getValue()).toBe('week');
  });

  it('click switches active item', () => {
    const s = segmented(container, { items: basicItems });

    const monthBtn = container.querySelector('.tx-segmented-item[data-value="month"]') as HTMLElement;
    monthBtn.click();

    expect(s.getValue()).toBe('month');

    const activeBtn = container.querySelector('.tx-segmented-active');
    expect(activeBtn!.getAttribute('data-value')).toBe('month');
  });

  it('getValue() returns current value', () => {
    const s = segmented(container, { items: basicItems, value: 'week' });
    expect(s.getValue()).toBe('week');
  });

  it('setValue() changes active item', () => {
    const s = segmented(container, { items: basicItems });

    s.setValue('month');
    expect(s.getValue()).toBe('month');

    const activeBtn = container.querySelector('.tx-segmented-active');
    expect(activeBtn!.getAttribute('data-value')).toBe('month');
  });

  it('disabled items do not activate on click', () => {
    const items = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', disabled: true },
      { label: 'C', value: 'c' },
    ];
    const s = segmented(container, { items });

    const disabledBtn = container.querySelector('.tx-segmented-item[data-value="b"]') as HTMLButtonElement;
    expect(disabledBtn.disabled).toBe(true);

    disabledBtn.click();
    expect(s.getValue()).toBe('a'); // should not change
  });

  it('should call onChange callback', () => {
    const onChange = vi.fn();
    segmented(container, { items: basicItems, onChange });

    const weekBtn = container.querySelector('.tx-segmented-item[data-value="week"]') as HTMLElement;
    weekBtn.click();

    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('clicking already active item does not call onChange', () => {
    const onChange = vi.fn();
    segmented(container, { items: basicItems, value: 'day', onChange });

    const dayBtn = container.querySelector('.tx-segmented-item[data-value="day"]') as HTMLElement;
    dayBtn.click();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should apply block class', () => {
    segmented(container, { items: basicItems, block: true });

    const el = container.querySelector('.tx-segmented');
    expect(el!.classList.contains('tx-segmented-block')).toBe(true);
  });

  it('should apply size class', () => {
    segmented(container, { items: basicItems, size: 'lg' });

    const el = container.querySelector('.tx-segmented');
    expect(el!.classList.contains('tx-segmented-lg')).toBe(true);
  });

  it('should render icons in items', () => {
    const items = [
      { label: 'Home', value: 'home', icon: 'home' },
      { label: 'Settings', value: 'settings', icon: 'settings' },
    ];
    segmented(container, { items });

    const icons = container.querySelectorAll('.tx-segmented-icon');
    expect(icons.length).toBe(2);
    expect(icons[0].innerHTML).toContain('<svg');
  });

  it('destroy() clears content', () => {
    const s = segmented(container, { items: basicItems });
    s.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('items have role="radio" and aria-checked', () => {
    segmented(container, { items: basicItems, value: 'week' });

    const buttons = container.querySelectorAll('.tx-segmented-item');
    buttons.forEach((btn) => {
      expect(btn.getAttribute('role')).toBe('radio');
    });

    const activeBtn = container.querySelector('.tx-segmented-item[data-value="week"]');
    expect(activeBtn!.getAttribute('aria-checked')).toBe('true');

    const inactiveBtn = container.querySelector('.tx-segmented-item[data-value="day"]');
    expect(inactiveBtn!.getAttribute('aria-checked')).toBe('false');
  });
});
