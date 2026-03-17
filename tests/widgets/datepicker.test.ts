import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { default as datePicker } from '../../src/widgets/datepicker';

describe('DatePicker widget', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('renders an input with calendar icon', () => {
    datePicker(container, {});
    expect(container.querySelector('.tx-datepicker-input')).not.toBeNull();
    expect(container.querySelector('.tx-datepicker-icon')).not.toBeNull();
  });

  it('renders with initial value', () => {
    const dp = datePicker(container, { value: '2024-06-15' });
    expect(dp.getValue()).toBe('2024-06-15');
    const input = container.querySelector('.tx-datepicker-input') as HTMLInputElement;
    expect(input.value).toBe('2024-06-15');
  });

  it('getValue returns empty string when no date selected', () => {
    const dp = datePicker(container, {});
    expect(dp.getValue()).toBe('');
  });

  it('setValue updates value and input', () => {
    const dp = datePicker(container, {});
    dp.setValue('2024-03-10');
    expect(dp.getValue()).toBe('2024-03-10');
  });

  it('clear() resets the value', () => {
    const dp = datePicker(container, { value: '2024-06-15' });
    dp.clear();
    expect(dp.getValue()).toBe('');
  });

  it('calendar dropdown is hidden by default', () => {
    datePicker(container, {});
    const dropdown = container.querySelector('.tx-datepicker-dropdown') as HTMLElement;
    expect(dropdown.style.display).toBe('none');
  });

  it('open() shows calendar dropdown', () => {
    const dp = datePicker(container, {});
    dp.open();
    const dropdown = container.querySelector('.tx-datepicker-dropdown') as HTMLElement;
    expect(dropdown.style.display).not.toBe('none');
  });

  it('close() hides calendar dropdown', () => {
    const dp = datePicker(container, {});
    dp.open();
    dp.close();
    const dropdown = container.querySelector('.tx-datepicker-dropdown') as HTMLElement;
    expect(dropdown.style.display).toBe('none');
  });

  it('renders weekday headers', () => {
    const dp = datePicker(container, {});
    dp.open();
    const weekdays = container.querySelectorAll('.tx-datepicker-weekday');
    expect(weekdays.length).toBe(7);
  });

  it('renders days of month', () => {
    const dp = datePicker(container, { value: '2024-01-15' });
    dp.open();
    const days = container.querySelectorAll('.tx-datepicker-day:not(.tx-datepicker-day-other)');
    expect(days.length).toBe(31); // January has 31 days
  });

  it('clicking a day selects it', () => {
    const onChange = vi.fn();
    const dp = datePicker(container, { value: '2024-06-01', onChange });
    dp.open();
    const day15 = container.querySelector('.tx-datepicker-day[data-day="15"]') as HTMLElement;
    day15.click();
    expect(dp.getValue()).toBe('2024-06-15');
    expect(onChange).toHaveBeenCalledWith('2024-06-15');
  });

  it('marks selected day with selected class', () => {
    const dp = datePicker(container, { value: '2024-06-15' });
    dp.open();
    const selected = container.querySelector('.tx-datepicker-day-selected');
    expect(selected).not.toBeNull();
    expect(selected?.getAttribute('data-day')).toBe('15');
  });

  it('navigation prev month works', () => {
    const dp = datePicker(container, { value: '2024-06-15' });
    dp.open();
    const prev = container.querySelector('.tx-datepicker-prev') as HTMLElement;
    prev.click();
    const title = container.querySelector('.tx-datepicker-title');
    expect(title?.textContent).toContain('May');
  });

  it('navigation next month works', () => {
    const dp = datePicker(container, { value: '2024-06-15' });
    dp.open();
    const next = container.querySelector('.tx-datepicker-next') as HTMLElement;
    next.click();
    const title = container.querySelector('.tx-datepicker-title');
    expect(title?.textContent).toContain('July');
  });

  it('inline mode renders calendar directly', () => {
    datePicker(container, { inline: true });
    const dropdown = container.querySelector('.tx-datepicker-dropdown') as HTMLElement;
    expect(dropdown.style.display).not.toBe('none');
    expect(container.querySelector('.tx-datepicker-inline')).not.toBeNull();
  });

  it('inline mode has no input trigger', () => {
    datePicker(container, { inline: true });
    expect(container.querySelector('.tx-datepicker-trigger')).toBeNull();
  });

  it('destroy clears content', () => {
    const dp = datePicker(container, {});
    dp.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('disabled dates cannot be selected', () => {
    const dp = datePicker(container, { value: '2024-06-01', disabledDates: ['2024-06-15'] });
    dp.open();
    const day15 = container.querySelector('.tx-datepicker-day[data-day="15"]') as HTMLElement;
    expect(day15.classList.contains('tx-datepicker-day-disabled')).toBe(true);
  });

  it('custom format works', () => {
    const dp = datePicker(container, { value: '15-06-2024', format: 'DD-MM-YYYY' });
    expect(dp.getValue()).toBe('15-06-2024');
  });

  it('applies custom class', () => {
    datePicker(container, { class: 'my-picker' });
    expect(container.querySelector('.tx-datepicker')?.classList.contains('my-picker')).toBe(true);
  });
});
