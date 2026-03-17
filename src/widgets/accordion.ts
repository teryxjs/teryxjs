// ============================================================
// Teryx — Accordion Widget
// ============================================================

import type { AccordionOptions, AccordionInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function accordion(target: string | HTMLElement, options: AccordionOptions): AccordionInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-accordion');
  const multiple = options.multiple ?? false;
  const animated = options.animated !== false;

  let html = `<div class="${cls('tx-accordion', options.bordered !== false && 'tx-accordion-bordered', options.class)}" id="${esc(id)}">`;

  for (const item of options.items) {
    const isOpen = item.open ?? false;
    html += `<div class="${cls('tx-accordion-item', isOpen && 'tx-accordion-open', item.disabled && 'tx-accordion-disabled')}" data-item="${esc(item.id)}">`;

    // Header
    html += `<button class="tx-accordion-header" role="button" aria-expanded="${isOpen}" aria-controls="${esc(id)}-panel-${esc(item.id)}"`;
    html += ` id="${esc(id)}-header-${esc(item.id)}"`;
    if (item.disabled) html += ' disabled';
    html += '>';
    if (item.icon) html += `<span class="tx-accordion-icon">${icon(item.icon)}</span>`;
    html += `<span class="tx-accordion-title">${esc(item.title)}</span>`;
    html += `<span class="tx-accordion-arrow">${icon('chevronDown')}</span>`;
    html += '</button>';

    // Panel
    html += `<div class="tx-accordion-panel${animated ? ' tx-accordion-animated' : ''}" id="${esc(id)}-panel-${esc(item.id)}" role="region" aria-labelledby="${esc(id)}-header-${esc(item.id)}"`;
    if (!isOpen) html += ' style="display:none"';
    html += '>';
    html += '<div class="tx-accordion-body">';

    if (item.source) {
      html += `<div xh-get="${esc(item.source)}" xh-trigger="${isOpen ? 'load' : 'none'}">`;
      html += '<div class="xh-indicator tx-loading-pad"><div class="tx-spinner"></div></div>';
      html += '</div>';
    } else if (item.content) {
      html += item.content;
    }

    html += '</div></div></div>';
  }

  html += '</div>';
  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;

  function toggleItem(itemId: string, force?: boolean): void {
    const item = container.querySelector(`[data-item="${itemId}"]`) as HTMLElement;
    if (!item || item.classList.contains('tx-accordion-disabled')) return;

    const isOpen = item.classList.contains('tx-accordion-open');
    const shouldOpen = force !== undefined ? force : !isOpen;

    if (shouldOpen === isOpen) return;

    if (shouldOpen && !multiple) {
      // Close others
      container.querySelectorAll('.tx-accordion-open').forEach((other) => {
        if (other !== item) closeItem(other as HTMLElement);
      });
    }

    if (shouldOpen) {
      openItem(item);
    } else {
      closeItem(item);
    }

    emit('accordion:toggle', { id, itemId, open: shouldOpen });
  }

  function openItem(item: HTMLElement): void {
    item.classList.add('tx-accordion-open');
    const header = item.querySelector('.tx-accordion-header');
    if (header) header.setAttribute('aria-expanded', 'true');

    const panel = item.querySelector('.tx-accordion-panel') as HTMLElement;
    if (panel) {
      panel.style.display = '';
      if (animated) {
        panel.style.maxHeight = '0';
        requestAnimationFrame(() => {
          panel.style.maxHeight = panel.scrollHeight + 'px';
          setTimeout(() => {
            panel.style.maxHeight = '';
          }, 300);
        });
      }

      // Lazy-load xhtmlx content
      const xhEl = panel.querySelector('[xh-trigger="none"]');
      if (xhEl) {
        xhEl.setAttribute('xh-trigger', 'load');
        if (typeof (window as any).xhtmlx !== 'undefined') {
          (window as any).xhtmlx.process(xhEl as HTMLElement);
        }
      }
    }
  }

  function closeItem(item: HTMLElement): void {
    const panel = item.querySelector('.tx-accordion-panel') as HTMLElement;
    if (panel && animated) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0';
        setTimeout(() => {
          panel.style.display = 'none';
          panel.style.maxHeight = '';
          item.classList.remove('tx-accordion-open');
        }, 300);
      });
    } else {
      if (panel) panel.style.display = 'none';
      item.classList.remove('tx-accordion-open');
    }

    const header = item.querySelector('.tx-accordion-header');
    if (header) header.setAttribute('aria-expanded', 'false');
  }

  // Click handler
  container.addEventListener('click', (e) => {
    const header = (e.target as HTMLElement).closest('.tx-accordion-header') as HTMLElement;
    if (!header) return;
    const item = header.closest('[data-item]') as HTMLElement;
    if (item) {
      const itemId = item.getAttribute('data-item')!;
      toggleItem(itemId);
    }
  });

  // Keyboard navigation: Arrow Up/Down between headers, Home/End, Enter/Space to toggle
  container.addEventListener('keydown', (e) => {
    const tgt = e.target as HTMLElement;
    if (!tgt.classList.contains('tx-accordion-header')) return;

    const allHeaders = Array.from(container.querySelectorAll('.tx-accordion-header:not([disabled])')) as HTMLElement[];
    if (allHeaders.length === 0) return;

    const currentIdx = allHeaders.indexOf(tgt);
    let nextIdx = -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIdx = (currentIdx + 1) % allHeaders.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIdx = (currentIdx - 1 + allHeaders.length) % allHeaders.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIdx = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIdx = allHeaders.length - 1;
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const item = tgt.closest('[data-item]') as HTMLElement;
        if (item) {
          const itemId = item.getAttribute('data-item')!;
          toggleItem(itemId);
        }
        return;
      }
      default:
        return;
    }

    if (nextIdx >= 0 && nextIdx < allHeaders.length) {
      allHeaders[nextIdx].focus();
    }
  });

  const instance: AccordionInstance = {
    el: container,
    destroy() {
      el.innerHTML = '';
    },
    toggle(itemId) {
      toggleItem(itemId);
    },
    open(itemId) {
      toggleItem(itemId, true);
    },
    close(itemId) {
      toggleItem(itemId, false);
    },
    openAll() {
      options.items.forEach((i) => toggleItem(i.id, true));
    },
    closeAll() {
      options.items.forEach((i) => toggleItem(i.id, false));
    },
  };

  return instance;
}

registerWidget('accordion', (el, opts) => accordion(el, opts as unknown as AccordionOptions));
export default accordion;
