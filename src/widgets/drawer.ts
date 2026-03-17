// ============================================================
// Teryx — Drawer (Slide-out panel) Widget
// ============================================================

import type { DrawerOptions, DrawerInstance } from '../types';
import { uid, esc, cls, icon } from '../utils';
import { registerWidget, emit } from '../core';

const openDrawers = new Set<DrawerInstance>();

export function drawer(options: DrawerOptions): DrawerInstance {
  const id = options.id || uid('tx-drawer');
  const position = options.position || 'right';
  const size = options.size || '400px';
  const closable = options.closable !== false;
  const hasBackdrop = options.backdrop !== false;
  const backdropStatic = options.backdrop === 'static';

  let html = `<div class="${cls('tx-drawer-overlay', hasBackdrop && 'tx-drawer-backdrop')}" id="${esc(id)}" style="display:none">`;
  html += `<div class="${cls('tx-drawer', `tx-drawer-${position}`, options.class)}" style="--tx-drawer-size:${esc(size)}">`;

  // Header
  if (options.title || closable) {
    html += '<div class="tx-drawer-header">';
    if (options.title) html += `<h3 class="tx-drawer-title">${esc(options.title)}</h3>`;
    if (closable) html += `<button class="tx-drawer-close" aria-label="Close">${icon('x')}</button>`;
    html += '</div>';
  }

  // Body
  html += '<div class="tx-drawer-body">';
  if (options.source) {
    html += `<div xh-get="${esc(options.source)}" xh-trigger="none" xh-indicator="#${esc(id)}-loading">`;
    html += `<div id="${esc(id)}-loading" class="xh-indicator tx-loading-pad"><div class="tx-spinner"></div></div>`;
    html += '</div>';
  } else if (options.content) {
    html += options.content;
  }
  html += '</div>';

  html += '</div></div>';

  const container = document.createElement('div');
  container.innerHTML = html;
  const overlay = container.firstElementChild as HTMLElement;
  document.body.appendChild(overlay);

  const panel = overlay.querySelector('.tx-drawer') as HTMLElement;

  const instance: DrawerInstance = {
    el: overlay,
    open() {
      overlay.style.display = '';
      requestAnimationFrame(() => {
        overlay.classList.add('tx-drawer-active');
        panel.classList.add('tx-drawer-enter');
      });
      openDrawers.add(instance);
      document.body.classList.add('tx-drawer-open');

      // Trigger xhtmlx lazy load
      if (options.source) {
        const xhEl = panel.querySelector('[xh-trigger="none"]');
        if (xhEl) {
          xhEl.setAttribute('xh-trigger', 'load');
          if (typeof (window as any).xhtmlx !== 'undefined') {
            (window as any).xhtmlx.process(xhEl as HTMLElement);
          }
        }
      }

      emit('drawer:open', { id });
      options.onOpen?.();
    },
    close() {
      overlay.classList.remove('tx-drawer-active');
      panel.classList.remove('tx-drawer-enter');
      panel.classList.add('tx-drawer-leave');
      setTimeout(() => {
        overlay.style.display = 'none';
        panel.classList.remove('tx-drawer-leave');
        openDrawers.delete(instance);
        if (openDrawers.size === 0) {
          document.body.classList.remove('tx-drawer-open');
        }
        emit('drawer:close', { id });
        options.onClose?.();
      }, 300);
    },
    isOpen() {
      return overlay.classList.contains('tx-drawer-active');
    },
    destroy() {
      if (instance.isOpen()) instance.close();
      document.removeEventListener('keydown', escapeHandler);
      setTimeout(() => overlay.remove(), 350);
    },
  };

  // Close button
  overlay.querySelector('.tx-drawer-close')?.addEventListener('click', () => instance.close());

  // Backdrop click
  if (hasBackdrop && !backdropStatic) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) instance.close();
    });
  }

  // Escape
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && instance.isOpen()) instance.close();
  };
  document.addEventListener('keydown', escapeHandler);

  return instance;
}

registerWidget('drawer', (el, opts) => {
  const inst = drawer(opts as unknown as DrawerOptions);
  el.addEventListener('click', () => inst.open());
  return inst;
});

export default drawer;
