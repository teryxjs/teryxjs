// ============================================================
// Teryx — DataList Widget (dynamic list/grid from API)
// ============================================================

import type { DataListOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget } from '../core';

export function datalist(target: string | HTMLElement, options: DataListOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-datalist');
  const itemsField = options.itemsField || 'items';
  const layout = options.layout || 'list';

  let html = `<div class="${cls('tx-datalist', `tx-datalist-${layout}`, options.class)}" id="${esc(id)}">`;

  html += `<div id="${esc(id)}-data"`;
  html += ` xh-get="${esc(options.source)}"`;
  html += ` xh-trigger="${options.trigger || 'load'}"`;
  html += ` xh-indicator="#${esc(id)}-loading">`;

  html += '<template>';

  if (layout === 'grid') {
    html += `<div class="tx-datalist-grid" style="--tx-grid-cols:${options.gridColumns || 3};--tx-grid-gap:${options.gridGap || '1rem'}">`;
  } else {
    html += '<div class="tx-datalist-items">';
  }

  html += `<div xh-each="${esc(itemsField)}" class="tx-datalist-item">`;
  html += options.itemTemplate;
  html += '</div>';

  html += '</div>';

  // Empty
  html += `<div xh-if="!${esc(itemsField)}.length" class="tx-datalist-empty">`;
  html += `<div class="tx-datalist-empty-icon">${icon('file')}</div>`;
  html += `<div class="tx-datalist-empty-text">${esc(options.emptyMessage || 'No items found')}</div>`;
  html += '</div>';

  html += '</template>';

  // Loading
  html += `<div id="${esc(id)}-loading" class="xh-indicator tx-loading-wrap">`;
  html += '<div class="tx-spinner"></div>';
  html += '</div>';

  html += '</div>'; // data
  html += '</div>'; // datalist

  el.innerHTML = html;

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('datalist', (el, opts) => datalist(el, opts as unknown as DataListOptions));
export default datalist;
