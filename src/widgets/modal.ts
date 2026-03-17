// ============================================================
// Teryx — Modal / Dialog / Window Widget
// ============================================================

import type { ModalOptions, ModalInstance, ModalButton } from '../types';
import { uid, esc, cls, icon } from '../utils';
import { registerWidget, emit } from '../core';

const openModals: Set<ModalInstance> = new Set();

export function modal(options: ModalOptions): ModalInstance {
  const id = options.id || uid('tx-modal');
  const size = options.size || 'md';
  const closable = options.closable !== false;
  const keyboard = options.keyboard !== false;
  const hasBackdrop = options.backdrop !== false;
  const backdropStatic = options.backdrop === 'static';

  // Build modal HTML
  let html = `<div class="${cls('tx-modal-overlay', hasBackdrop && 'tx-modal-backdrop')}" id="${esc(id)}" role="dialog" aria-modal="true" style="display:none">`;
  html += `<div class="${cls('tx-modal', `tx-modal-${size}`, options.draggable && 'tx-modal-draggable', options.class)}"`;
  if (options.width) html += ` style="width:${esc(options.width)}"`;
  html += '>';

  // Header
  if (options.title || closable || options.maximizable) {
    html += `<div class="${cls('tx-modal-header', options.headerClass)}">`;
    if (options.title) {
      html += `<h3 class="tx-modal-title" id="${esc(id)}-title">${esc(options.title)}</h3>`;
    }
    html += '<div class="tx-modal-header-actions">';
    if (options.maximizable) {
      html += `<button class="tx-modal-action tx-modal-maximize" title="Maximize">${icon('maximize')}</button>`;
    }
    if (closable) {
      html += `<button class="tx-modal-action tx-modal-close" title="Close" aria-label="Close">${icon('x')}</button>`;
    }
    html += '</div></div>';
  }

  // Body
  html += `<div class="${cls('tx-modal-body', options.bodyClass)}"`;
  if (options.height) html += ` style="height:${esc(options.height)}"`;
  html += '>';

  if (options.source) {
    // Dynamic content via xhtmlx
    html += `<div xh-get="${esc(options.source)}" xh-trigger="load"`;
    if (options.template) html += ` xh-template="${esc(options.template)}"`;
    html += ` xh-indicator="#${esc(id)}-loading">`;
    html += `<div id="${esc(id)}-loading" class="xh-indicator tx-modal-loading"><div class="tx-spinner"></div></div>`;
    html += '</div>';
  } else if (options.content) {
    html += options.content;
  }

  html += '</div>';

  // Footer
  if (options.buttons?.length || options.footerContent) {
    html += '<div class="tx-modal-footer">';
    if (options.footerContent) html += options.footerContent;
    if (options.buttons) {
      html += '<div class="tx-modal-buttons">';
      for (const btn of options.buttons) {
        html += renderModalButton(btn, id);
      }
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</div></div>';

  // Append to body
  const container = document.createElement('div');
  container.innerHTML = html;
  const overlay = container.firstElementChild as HTMLElement;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.tx-modal') as HTMLElement;
  let maximized = false;

  const instance: ModalInstance = {
    el: overlay,
    open() {
      overlay.style.display = '';
      requestAnimationFrame(() => {
        overlay.classList.add('tx-modal-active');
        dialog.classList.add('tx-modal-enter');
      });
      openModals.add(instance);
      document.body.classList.add('tx-modal-open');

      // Process xhtmlx content after modal is visible
      if (options.source && typeof (window as any).xhtmlx !== 'undefined') {
        (window as any).xhtmlx.process(dialog);
      }

      emit('modal:open', { id, instance });
      options.onOpen?.();
    },
    close() {
      overlay.classList.remove('tx-modal-active');
      dialog.classList.remove('tx-modal-enter');
      dialog.classList.add('tx-modal-leave');
      setTimeout(() => {
        overlay.style.display = 'none';
        dialog.classList.remove('tx-modal-leave');
        openModals.delete(instance);
        if (openModals.size === 0) {
          document.body.classList.remove('tx-modal-open');
        }
        emit('modal:close', { id, instance });
        options.onClose?.();
      }, 200);
    },
    isOpen() {
      return overlay.classList.contains('tx-modal-active');
    },
    setContent(html: string) {
      const body = overlay.querySelector('.tx-modal-body');
      if (body) body.innerHTML = html;
    },
    setTitle(title: string) {
      const titleEl = overlay.querySelector('.tx-modal-title');
      if (titleEl) titleEl.textContent = title;
    },
    maximize() {
      if (!maximized) {
        dialog.classList.add('tx-modal-maximized');
        maximized = true;
        const btn = dialog.querySelector('.tx-modal-maximize');
        if (btn) btn.innerHTML = icon('minimize');
        options.onResize?.(window.innerWidth, window.innerHeight);
      }
    },
    restore() {
      if (maximized) {
        dialog.classList.remove('tx-modal-maximized');
        maximized = false;
        const btn = dialog.querySelector('.tx-modal-maximize');
        if (btn) btn.innerHTML = icon('maximize');
        options.onResize?.(dialog.offsetWidth, dialog.offsetHeight);
      }
    },
    destroy() {
      if (instance.isOpen()) instance.close();
      setTimeout(() => overlay.remove(), 250);
    },
  };

  // Event listeners
  // Close button
  overlay.querySelector('.tx-modal-close')?.addEventListener('click', () => instance.close());

  // Maximize button
  overlay.querySelector('.tx-modal-maximize')?.addEventListener('click', () => {
    maximized ? instance.restore() : instance.maximize();
  });

  // Backdrop click
  if (hasBackdrop && !backdropStatic) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) instance.close();
    });
  }

  // Keyboard
  if (keyboard && closable) {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && instance.isOpen()) {
        instance.close();
      }
    };
    document.addEventListener('keydown', keyHandler);
    // Store for cleanup
    (overlay as any)._keyHandler = keyHandler;
  }

  // Button handlers
  if (options.buttons) {
    const buttons = overlay.querySelectorAll('.tx-modal-btn');
    options.buttons.forEach((btn, i) => {
      const buttonEl = buttons[i];
      if (!buttonEl) return;
      buttonEl.addEventListener('click', () => {
        if (btn.action === 'close') {
          instance.close();
        } else if (btn.handler) {
          btn.handler();
        }
      });
    });
  }

  // Draggable
  if (options.draggable) {
    makeDraggable(dialog, dialog.querySelector('.tx-modal-header') as HTMLElement);
  }

  return instance;
}

function renderModalButton(btn: ModalButton, _id: string): string {
  const variant = btn.variant || 'secondary';
  return `<button class="${cls('tx-btn', `tx-btn-${variant}`, 'tx-modal-btn')}">${esc(btn.label)}</button>`;
}

function makeDraggable(el: HTMLElement, handle: HTMLElement | null): void {
  if (!handle) return;
  let startX = 0,
    startY = 0,
    origX = 0,
    origY = 0;

  handle.style.cursor = 'move';

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;

    const onMove = (e: MouseEvent) => {
      el.style.position = 'fixed';
      el.style.left = `${origX + (e.clientX - startX)}px`;
      el.style.top = `${origY + (e.clientY - startY)}px`;
      el.style.transform = 'none';
      el.style.margin = '0';
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// Declarative
registerWidget('modal', (el, opts) => {
  const instance = modal(opts as unknown as ModalOptions);
  el.addEventListener('click', () => instance.open());
  return instance;
});

export default modal;
