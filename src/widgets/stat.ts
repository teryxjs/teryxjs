// ============================================================
// Teryx — Stat / KPI Widget
// ============================================================

import type { StatOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget } from '../core';

export function stat(target: string | HTMLElement, options: StatOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-stat');
  const color = options.color || 'primary';

  // Static stat
  if (!options.source) {
    el.innerHTML = renderStat(options, id, color);
    return {
      el: el.querySelector(`#${id}`) || el,
      destroy() {
        el.innerHTML = '';
      },
    };
  }

  // Dynamic stat via xhtmlx
  let html = `<div xh-get="${esc(options.source)}" xh-trigger="load" xh-indicator="#${esc(id)}-loading" id="${esc(id)}-wrap">`;
  html += `<template>`;
  html += `<div class="${cls('tx-stat', `tx-stat-${color}`, options.class)}" id="${esc(id)}">`;
  html += '<div class="tx-stat-body">';
  html += '<div class="tx-stat-content">';
  html += `<div class="tx-stat-label" xh-text="label"></div>`;
  html += '<div class="tx-stat-value-row">';
  if (options.prefix) html += `<span class="tx-stat-prefix">${esc(options.prefix)}</span>`;
  html += `<span class="tx-stat-value" xh-text="value"></span>`;
  if (options.suffix) html += `<span class="tx-stat-suffix">${esc(options.suffix)}</span>`;
  html += '</div>';
  html += `<div xh-if="change" class="tx-stat-change"><span xh-text="change"></span></div>`;
  html += '</div>';
  html += `<div xh-if="icon" class="tx-stat-icon"><span class="tx-stat-icon-inner"></span></div>`;
  html += '</div></div>';
  html += `</template>`;
  html += `<div id="${esc(id)}-loading" class="xh-indicator tx-stat tx-stat-loading"><div class="tx-spinner"></div></div>`;
  html += '</div>';

  el.innerHTML = html;
  return {
    el: el.querySelector(`#${id}-wrap`) || el,
    destroy() {
      el.innerHTML = '';
    },
  };
}

function renderStat(options: StatOptions, id: string, color: string): string {
  let html = `<div class="${cls('tx-stat', `tx-stat-${color}`, options.class)}" id="${esc(id)}">`;
  html += '<div class="tx-stat-body">';
  html += '<div class="tx-stat-content">';
  html += `<div class="tx-stat-label">${esc(options.label)}</div>`;
  html += '<div class="tx-stat-value-row">';
  if (options.prefix) html += `<span class="tx-stat-prefix">${esc(options.prefix)}</span>`;
  html += `<span class="tx-stat-value">${esc(String(options.value))}</span>`;
  if (options.suffix) html += `<span class="tx-stat-suffix">${esc(options.suffix)}</span>`;
  html += '</div>';
  if (options.change) {
    const changeType = options.changeType || 'neutral';
    html += `<div class="tx-stat-change tx-stat-change-${changeType}">`;
    if (changeType === 'up') html += icon('arrowUp');
    else if (changeType === 'down') html += icon('arrowDown');
    html += `<span>${esc(options.change)}</span>`;
    html += '</div>';
  }
  html += '</div>';
  if (options.icon) {
    html += `<div class="tx-stat-icon"><span class="tx-stat-icon-inner">${icon(options.icon)}</span></div>`;
  }
  html += '</div>';

  // Sparkline
  if (options.sparkline?.length) {
    html += renderSparkline(options.sparkline, color);
  }

  html += '</div>';
  return html;
}

function renderSparkline(data: number[], color: string): string {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return `<div class="tx-stat-sparkline"><svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="var(--tx-${color})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
}

registerWidget('stat', (el, opts) => stat(el, opts as unknown as StatOptions));
export default stat;
