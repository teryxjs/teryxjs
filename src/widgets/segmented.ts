// ============================================================
// Teryx — Segmented Button (Sencha-style SegmentedButton)
// ============================================================

import type { SegmentedOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export interface SegmentedInstance extends WidgetInstance {
  getValue(): string;
  setValue(value: string): void;
}

export function segmented(target: string | HTMLElement, options: SegmentedOptions): SegmentedInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-segmented');
  const size = options.size || 'md';
  let currentValue = options.value || options.items[0]?.value || '';

  function render(): void {
    let html = `<div class="${cls(
      'tx-segmented',
      `tx-segmented-${size}`,
      options.block && 'tx-segmented-block',
      options.class,
    )}" id="${esc(id)}" role="radiogroup">`;

    for (const item of options.items) {
      const active = item.value === currentValue;
      html += `<button class="${cls('tx-segmented-item', active && 'tx-segmented-active')}"`;
      html += ` role="radio" aria-checked="${active}"`;
      html += ` data-value="${esc(item.value)}"`;
      if (item.disabled) html += ' disabled';
      html += '>';
      if (item.icon) html += `<span class="tx-segmented-icon">${icon(item.icon)}</span>`;
      html += `<span class="tx-segmented-label">${esc(item.label)}</span>`;
      html += '</button>';
    }

    html += '</div>';
    el.innerHTML = html;

    // Click handlers
    el.querySelector(`#${id}`)?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.tx-segmented-item:not([disabled])') as HTMLElement;
      if (!btn) return;
      const value = btn.getAttribute('data-value')!;
      if (value !== currentValue) {
        currentValue = value;
        render();
        options.onChange?.(currentValue);
        emit('segmented:change', { id, value: currentValue });
      }
    });
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() { el.innerHTML = ''; },
    getValue() { return currentValue; },
    setValue(value: string) {
      currentValue = value;
      render();
    },
  };
}

registerWidget('segmented', (el, opts) => segmented(el, opts as unknown as SegmentedOptions));
export default segmented;
