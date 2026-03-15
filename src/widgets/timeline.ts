// ============================================================
// Teryx — Timeline Widget
// ============================================================

import type { TimelineOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget } from '../core';

export function timeline(target: string | HTMLElement, options: TimelineOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-timeline');

  let html = `<div class="${cls('tx-timeline', options.alternate && 'tx-timeline-alternate', options.class)}" id="${esc(id)}">`;

  if (options.source) {
    html += `<div xh-get="${esc(options.source)}" xh-trigger="load">`;
    html += '<template>';
    html += `<div xh-each="items" class="tx-timeline-item">`;
    html += '<div class="tx-timeline-marker"></div>';
    html += '<div class="tx-timeline-content">';
    html += '<div class="tx-timeline-header">';
    html += '<span class="tx-timeline-title" xh-text="title"></span>';
    html += '<span class="tx-timeline-time" xh-text="time"></span>';
    html += '</div>';
    html += '<div class="tx-timeline-body" xh-text="content"></div>';
    html += '</div></div>';
    html += '</template>';
    html += '</div>';
  } else {
    for (const item of options.items) {
      const status = item.status || 'pending';
      html += `<div class="${cls('tx-timeline-item', `tx-timeline-${status}`)}">`;

      // Marker
      html += '<div class="tx-timeline-marker"';
      if (item.color) html += ` style="--tx-timeline-color:var(--tx-${item.color})"`;
      html += '>';
      if (item.icon) html += icon(item.icon);
      else if (status === 'completed') html += icon('check');
      html += '</div>';

      // Content
      html += '<div class="tx-timeline-content">';
      html += '<div class="tx-timeline-header">';
      html += `<span class="tx-timeline-title">${esc(item.title)}</span>`;
      if (item.time) html += `<span class="tx-timeline-time">${esc(item.time)}</span>`;
      html += '</div>';
      if (item.content) html += `<div class="tx-timeline-body">${esc(item.content)}</div>`;
      html += '</div>';

      html += '</div>';
    }
  }

  html += '</div>';
  el.innerHTML = html;

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() { el.innerHTML = ''; },
  };
}

registerWidget('timeline', (el, opts) => timeline(el, opts as unknown as TimelineOptions));
export default timeline;
