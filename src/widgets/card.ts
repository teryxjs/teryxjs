// ============================================================
// Teryx — Card / Panel Widget
// ============================================================

import type { CardOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function card(target: string | HTMLElement, options: CardOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-card');
  const collapsed = options.collapsed ?? false;

  let html = `<div class="${cls('tx-card', options.class)}" id="${esc(id)}">`;

  // Image (top position)
  if (options.image && (!options.imagePosition || options.imagePosition === 'top')) {
    html += `<img src="${esc(options.image)}" class="tx-card-img tx-card-img-top" alt="">`;
  }

  // Header
  if (options.title || options.tools?.length || options.collapsible || options.closable) {
    html += '<div class="tx-card-header">';
    if (options.title) html += `<h3 class="tx-card-title">${esc(options.title)}</h3>`;
    html += '<div class="tx-card-tools">';
    if (options.headerActions) html += options.headerActions;
    if (options.tools) {
      for (const tool of options.tools) {
        html += `<button class="tx-card-tool" title="${esc(tool.tooltip || '')}"`;
        if (tool.action) html += ` xh-post="${esc(tool.action)}"`;
        html += `>${icon(tool.icon)}</button>`;
      }
    }
    if (options.collapsible) {
      html += `<button class="tx-card-tool tx-card-collapse-btn" title="Toggle">${icon(collapsed ? 'chevronDown' : 'chevronUp')}</button>`;
    }
    if (options.closable) {
      html += `<button class="tx-card-tool tx-card-close-btn" title="Close">${icon('x')}</button>`;
    }
    html += '</div></div>';
  }

  // Body
  html += `<div class="tx-card-body"${collapsed ? ' style="display:none"' : ''}>`;
  if (options.loading) {
    html += '<div class="tx-card-loading"><div class="tx-spinner"></div></div>';
  } else if (options.source) {
    html += `<div xh-get="${esc(options.source)}" xh-trigger="load" xh-indicator="#${esc(id)}-loading">`;
    html += `<div id="${esc(id)}-loading" class="xh-indicator tx-loading-pad"><div class="tx-spinner"></div></div>`;
    html += '</div>';
  } else if (options.content) {
    html += options.content;
  }
  html += '</div>';

  // Footer
  if (options.footer) {
    html += `<div class="tx-card-footer">${options.footer}</div>`;
  }

  // Image (bottom position)
  if (options.image && options.imagePosition === 'bottom') {
    html += `<img src="${esc(options.image)}" class="tx-card-img tx-card-img-bottom" alt="">`;
  }

  html += '</div>';
  el.innerHTML = html;

  const cardEl = el.querySelector(`#${id}`) as HTMLElement;

  // Collapse toggle
  cardEl.querySelector('.tx-card-collapse-btn')?.addEventListener('click', () => {
    const body = cardEl.querySelector('.tx-card-body') as HTMLElement;
    const btn = cardEl.querySelector('.tx-card-collapse-btn');
    if (!body) return;
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? '' : 'none';
    if (btn) btn.innerHTML = icon(isHidden ? 'chevronUp' : 'chevronDown');
    emit('card:toggle', { id, collapsed: !isHidden });
  });

  // Close
  cardEl.querySelector('.tx-card-close-btn')?.addEventListener('click', () => {
    cardEl.style.display = 'none';
    emit('card:close', { id });
  });

  // Tool click handlers
  if (options.tools) {
    const toolBtns = cardEl.querySelectorAll('.tx-card-tool:not(.tx-card-collapse-btn):not(.tx-card-close-btn)');
    options.tools.forEach((tool, i) => {
      const btn = toolBtns[i];
      if (btn && tool.handler) {
        btn.addEventListener('click', () => tool.handler!());
      }
    });
  }

  return {
    el: cardEl,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('card', (el, opts) => card(el, opts as unknown as CardOptions));
export default card;
