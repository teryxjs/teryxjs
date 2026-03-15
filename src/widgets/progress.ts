// ============================================================
// Teryx — Progress Bar Widget
// ============================================================

import type { ProgressOptions, WidgetInstance } from '../types';
import { uid, esc, cls, resolveTarget } from '../utils';
import { registerWidget } from '../core';

export function progress(target: string | HTMLElement, options: ProgressOptions): WidgetInstance & { setValue(v: number): void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-progress');
  const max = options.max || 100;
  const color = options.color || 'primary';
  const size = options.size || 'md';
  const pct = Math.min(100, (options.value / max) * 100);

  let html = '';

  if (options.segments?.length) {
    // Multi-segment progress
    html += `<div class="${cls('tx-progress', `tx-progress-${size}`, options.class)}" id="${esc(id)}">`;
    for (const seg of options.segments) {
      const segPct = (seg.value / max) * 100;
      html += `<div class="tx-progress-bar" style="width:${segPct}%;background:var(--tx-${seg.color})"`;
      if (seg.label) html += ` title="${esc(seg.label)}"`;
      html += '>';
      if (options.showValue) html += `${Math.round(segPct)}%`;
      html += '</div>';
    }
    html += '</div>';
  } else {
    // Single bar
    if (options.label) html += `<div class="tx-progress-label">${esc(options.label)}</div>`;
    html += `<div class="${cls(
      'tx-progress',
      `tx-progress-${size}`,
      `tx-progress-${color}`,
      options.striped && 'tx-progress-striped',
      options.animated && 'tx-progress-animated',
      options.class,
    )}" id="${esc(id)}">`;
    html += `<div class="tx-progress-bar" style="width:${pct}%"`;
    html += ` role="progressbar" aria-valuenow="${options.value}" aria-valuemin="0" aria-valuemax="${max}">`;
    if (options.showValue) html += `<span class="tx-progress-text">${Math.round(pct)}%</span>`;
    html += '</div></div>';
  }

  el.innerHTML = html;

  const progressEl = el.querySelector(`#${id}`) as HTMLElement;

  return {
    el: progressEl || el,
    destroy() { el.innerHTML = ''; },
    setValue(v: number) {
      const bar = (progressEl || el).querySelector('.tx-progress-bar') as HTMLElement;
      if (bar) {
        const newPct = Math.min(100, (v / max) * 100);
        bar.style.width = `${newPct}%`;
        bar.setAttribute('aria-valuenow', String(v));
        const text = bar.querySelector('.tx-progress-text');
        if (text) text.textContent = `${Math.round(newPct)}%`;
      }
    },
  };
}

registerWidget('progress', (el, opts) => progress(el, opts as unknown as ProgressOptions));
export default progress;
