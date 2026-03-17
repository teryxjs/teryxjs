// ============================================================
// Teryx — Date Picker Widget
// ============================================================

import type { DatePickerOptions, DatePickerInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget, clamp } from '../utils';
import { registerWidget, emit } from '../core';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDate(d: Date, fmt: string): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return fmt
    .replace('YYYY', String(y))
    .replace('MM', String(m).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'));
}

function parseDate(s: string, fmt: string): Date | null {
  const yi = fmt.indexOf('YYYY');
  const mi = fmt.indexOf('MM');
  const di = fmt.indexOf('DD');
  if (yi < 0 || mi < 0 || di < 0 || s.length < fmt.length) return null;
  const y = parseInt(s.substring(yi, yi + 4), 10);
  const m = parseInt(s.substring(mi, mi + 2), 10);
  const d = parseInt(s.substring(di, di + 2), 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function datePicker(target: string | HTMLElement, options: DatePickerOptions = {}): DatePickerInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-datepicker');
  const format = options.format || 'YYYY-MM-DD';
  const placeholder = options.placeholder || format.toLowerCase();
  const firstDay = options.firstDay ?? 0;
  const isInline = options.inline ?? false;
  const isRange = options.range ?? false;
  let selectedDate: Date | null = options.value ? parseDate(options.value, format) : null;
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;
  let viewYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  let viewMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  let isOpen = isInline;

  if (isRange && options.value) {
    const parts = options.value.split(' - ');
    if (parts.length === 2) {
      rangeStart = parseDate(parts[0].trim(), format);
      rangeEnd = parseDate(parts[1].trim(), format);
      if (rangeStart) {
        viewYear = rangeStart.getFullYear();
        viewMonth = rangeStart.getMonth();
      }
    }
  }

  function isDisabled(d: Date): boolean {
    if (options.min) {
      const minD = parseDate(options.min, format);
      if (minD && d < minD) return true;
    }
    if (options.max) {
      const maxD = parseDate(options.max, format);
      if (maxD && d > maxD) return true;
    }
    if (options.disabledDates) {
      if (typeof options.disabledDates === 'function') return options.disabledDates(d);
      return options.disabledDates.some((ds) => {
        const dd = parseDate(ds, format);
        return dd ? sameDay(dd, d) : false;
      });
    }
    return false;
  }

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function renderCalendar(): string {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDayOfMonth - firstDay + 7) % 7;
    const today = new Date();

    let html = '<div class="tx-datepicker-calendar">';

    // Header
    html += '<div class="tx-datepicker-header">';
    html += `<button class="tx-datepicker-nav tx-datepicker-prev" type="button" aria-label="Previous month">${icon('chevronLeft')}</button>`;
    html += `<span class="tx-datepicker-title">${MONTHS[viewMonth]} ${viewYear}</span>`;
    html += `<button class="tx-datepicker-nav tx-datepicker-next" type="button" aria-label="Next month">${icon('chevronRight')}</button>`;
    html += '</div>';

    // Day names
    html += '<div class="tx-datepicker-weekdays">';
    for (let i = 0; i < 7; i++) {
      html += `<span class="tx-datepicker-weekday">${DAYS[(i + firstDay) % 7]}</span>`;
    }
    html += '</div>';

    // Days grid
    html += '<div class="tx-datepicker-days">';
    // Previous month padding
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevDays = getDaysInMonth(prevYear, prevMonth);
    for (let i = startOffset - 1; i >= 0; i--) {
      html += `<span class="tx-datepicker-day tx-datepicker-day-other">${prevDays - i}</span>`;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const classes = ['tx-datepicker-day'];
      if (sameDay(date, today)) classes.push('tx-datepicker-day-today');
      if (selectedDate && sameDay(date, selectedDate)) classes.push('tx-datepicker-day-selected');
      if (isRange) {
        if (rangeStart && sameDay(date, rangeStart))
          classes.push('tx-datepicker-day-selected', 'tx-datepicker-day-range-start');
        if (rangeEnd && sameDay(date, rangeEnd))
          classes.push('tx-datepicker-day-selected', 'tx-datepicker-day-range-end');
        if (rangeStart && rangeEnd && date > rangeStart && date < rangeEnd) classes.push('tx-datepicker-day-in-range');
      }
      if (isDisabled(date)) classes.push('tx-datepicker-day-disabled');
      html += `<span class="${classes.join(' ')}" data-day="${d}">${d}</span>`;
    }

    // Next month padding
    const totalCells = startOffset + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<span class="tx-datepicker-day tx-datepicker-day-other">${i}</span>`;
    }

    html += '</div>'; // days
    html += '</div>'; // calendar
    return html;
  }

  function render(): void {
    let html = `<div class="${cls('tx-datepicker', isInline && 'tx-datepicker-inline', options.class)}" id="${esc(id)}">`;

    if (!isInline) {
      const displayValue = isRange
        ? rangeStart && rangeEnd
          ? `${formatDate(rangeStart, format)} - ${formatDate(rangeEnd, format)}`
          : ''
        : selectedDate
          ? formatDate(selectedDate, format)
          : '';
      html += '<div class="tx-datepicker-trigger">';
      html += `<input type="text" class="tx-input tx-datepicker-input" placeholder="${esc(placeholder)}" value="${esc(displayValue)}" readonly>`;
      html += `<span class="tx-datepicker-icon">${icon('calendar')}</span>`;
      html += '</div>';
    }

    html += `<div class="tx-datepicker-dropdown" style="${isOpen ? '' : 'display:none'}">`;
    html += renderCalendar();
    html += '</div>';
    html += '</div>';

    el.innerHTML = html;
    bindEvents();
  }

  function bindEvents(): void {
    const container = el.querySelector(`#${id}`) as HTMLElement;
    if (!container) return;

    // Open/close
    if (!isInline) {
      const triggerArea = container.querySelector('.tx-datepicker-trigger') as HTMLElement;
      triggerArea?.addEventListener('click', () => {
        isOpen ? instance.close() : instance.open();
      });
    }

    // Navigation
    container.querySelector('.tx-datepicker-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      render();
    });
    container.querySelector('.tx-datepicker-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      render();
    });

    // Day selection
    container
      .querySelectorAll('.tx-datepicker-day:not(.tx-datepicker-day-other):not(.tx-datepicker-day-disabled)')
      .forEach((dayEl) => {
        dayEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const day = parseInt((dayEl as HTMLElement).getAttribute('data-day') || '1', 10);
          const clickedDate = new Date(viewYear, viewMonth, day);

          if (isRange) {
            if (!rangeStart || (rangeStart && rangeEnd)) {
              rangeStart = clickedDate;
              rangeEnd = null;
            } else {
              if (clickedDate < rangeStart) {
                rangeEnd = rangeStart;
                rangeStart = clickedDate;
              } else {
                rangeEnd = clickedDate;
              }
              if (!isInline) isOpen = false;
              const val = `${formatDate(rangeStart, format)} - ${formatDate(rangeEnd, format)}`;
              options.onChange?.(val);
              emit('datepicker:change', { id, value: val });
            }
          } else {
            selectedDate = clickedDate;
            if (!isInline) isOpen = false;
            const val = formatDate(selectedDate, format);
            options.onChange?.(val);
            emit('datepicker:change', { id, value: val });
          }
          render();
        });
      });

    // Close on outside click
    if (!isInline) {
      const closeHandler = (e: MouseEvent) => {
        if (isOpen && !container.contains(e.target as Node)) {
          isOpen = false;
          render();
        }
      };
      document.addEventListener('click', closeHandler);
    }
  }

  render();

  const instance: DatePickerInstance = {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    getValue() {
      if (isRange) {
        return rangeStart && rangeEnd ? `${formatDate(rangeStart, format)} - ${formatDate(rangeEnd, format)}` : '';
      }
      return selectedDate ? formatDate(selectedDate, format) : '';
    },
    setValue(val: string) {
      if (isRange) {
        const parts = val.split(' - ');
        if (parts.length === 2) {
          rangeStart = parseDate(parts[0].trim(), format);
          rangeEnd = parseDate(parts[1].trim(), format);
          if (rangeStart) {
            viewYear = rangeStart.getFullYear();
            viewMonth = rangeStart.getMonth();
          }
        }
      } else {
        selectedDate = parseDate(val, format);
        if (selectedDate) {
          viewYear = selectedDate.getFullYear();
          viewMonth = selectedDate.getMonth();
        }
      }
      render();
    },
    clear() {
      selectedDate = null;
      rangeStart = null;
      rangeEnd = null;
      render();
    },
    open() {
      isOpen = true;
      render();
    },
    close() {
      isOpen = false;
      render();
    },
  };

  return instance;
}

registerWidget('datepicker', (el, opts) => datePicker(el, opts as unknown as DatePickerOptions));
export { datePicker as datepicker };
export default datePicker;
