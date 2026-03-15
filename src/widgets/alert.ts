// ============================================================
// Teryx — Alert Widget
// ============================================================

import type { AlertOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget } from '../core';

const alertIcons: Record<string, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export function alert(target: string | HTMLElement, options: AlertOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-alert');
  const type = options.type || 'info';

  let html = `<div class="${cls('tx-alert', `tx-alert-${type}`, options.dismissible && 'tx-alert-dismissible', options.class)}" id="${esc(id)}" role="alert">`;

  if (options.icon !== false) {
    html += `<div class="tx-alert-icon">${icon(alertIcons[type] || 'info')}</div>`;
  }

  html += '<div class="tx-alert-content">';
  if (options.title) html += `<div class="tx-alert-title">${esc(options.title)}</div>`;
  html += `<div class="tx-alert-message">${esc(options.message)}</div>`;
  html += '</div>';

  if (options.dismissible) {
    html += `<button class="tx-alert-close" aria-label="Close">${icon('x')}</button>`;
  }

  html += '</div>';
  el.innerHTML = html;

  const alertEl = el.querySelector(`#${id}`) as HTMLElement;

  // Dismiss
  alertEl.querySelector('.tx-alert-close')?.addEventListener('click', () => {
    alertEl.classList.add('tx-alert-leaving');
    setTimeout(() => { alertEl.remove(); }, 200);
  });

  return {
    el: alertEl,
    destroy() { el.innerHTML = ''; },
  };
}

registerWidget('alert', (el, opts) => alert(el, opts as unknown as AlertOptions));
export default alert;
