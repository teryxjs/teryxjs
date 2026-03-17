// ============================================================
// Teryx — Rating / Stars Widget
// ============================================================

import type { RatingOptions, WidgetInstance } from '../types';
import { uid, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function rating(
  target: string | HTMLElement,
  options: RatingOptions,
): WidgetInstance & { getValue(): number; setValue(v: number): void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-rating');
  const max = options.max || 5;
  const size = options.size || 'md';
  const readonly = options.readonly ?? false;
  let value = options.value || 0;

  function render(): void {
    let html = `<div class="${cls('tx-rating', `tx-rating-${size}`, readonly && 'tx-rating-readonly', options.class)}" id="${id}">`;
    for (let i = 1; i <= max; i++) {
      html += `<span class="tx-rating-star${i <= value ? ' tx-rating-star-active' : ''}" data-value="${i}">`;
      html += i <= value ? icon('starFilled') : icon('star');
      html += '</span>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  render();

  const container = el.querySelector(`#${id}`) as HTMLElement;

  if (!readonly) {
    // Hover preview
    container.addEventListener('mouseover', (e) => {
      const star = (e.target as HTMLElement).closest('.tx-rating-star') as HTMLElement;
      if (!star) return;
      const hoverVal = parseInt(star.getAttribute('data-value') || '0', 10);
      container.querySelectorAll('.tx-rating-star').forEach((s, i) => {
        if (i < hoverVal) {
          s.classList.add('tx-rating-star-hover');
          s.innerHTML = icon('starFilled');
        } else {
          s.classList.remove('tx-rating-star-hover');
          if (i >= value) s.innerHTML = icon('star');
        }
      });
    });

    container.addEventListener('mouseleave', () => {
      container.querySelectorAll('.tx-rating-star').forEach((s, i) => {
        s.classList.remove('tx-rating-star-hover');
        s.innerHTML = i < value ? icon('starFilled') : icon('star');
        if (i < value) s.classList.add('tx-rating-star-active');
        else s.classList.remove('tx-rating-star-active');
      });
    });

    // Click
    container.addEventListener('click', (e) => {
      const star = (e.target as HTMLElement).closest('.tx-rating-star') as HTMLElement;
      if (!star) return;
      const newVal = parseInt(star.getAttribute('data-value') || '0', 10);
      value = newVal === value ? 0 : newVal; // Toggle off if clicking same
      render();
      options.onChange?.(value);
      emit('rating:change', { id, value });
    });
  }

  return {
    el: container,
    destroy() {
      el.innerHTML = '';
    },
    getValue() {
      return value;
    },
    setValue(v: number) {
      value = Math.max(0, Math.min(max, v));
      render();
    },
  };
}

registerWidget('rating', (el, opts) => rating(el, opts as unknown as RatingOptions));
export default rating;
