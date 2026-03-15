// ============================================================
// Teryx — Mobile Sheet (Bottom Sheet / Action Sheet)
// ============================================================
//
// A slide-up panel from the bottom of the screen, commonly used
// for action lists, confirmations, or supplementary content.
// Supports modal and non-modal modes, drag-to-dismiss, and
// snap points for half/full height.
//
// Usage:
//   const s = sheet({
//     title: 'Choose action',
//     actions: [
//       { label: 'Share', icon: 'externalLink', handler: () => {} },
//       { label: 'Delete', icon: 'trash', destructive: true, handler: () => {} },
//     ],
//   });
//   s.open();

import { uid, esc, cls, icon } from '../../utils';
import { registerWidget, emit } from '../../core';
import type { WidgetInstance } from '../../types';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface SheetAction {
  /** Label text shown to the user. */
  label: string;
  /** Icon name from the Teryx icon set. */
  icon?: string;
  /** Mark as destructive (red text). */
  destructive?: boolean;
  /** Disable this action. */
  disabled?: boolean;
  /** Handler invoked when the action is tapped. */
  handler?: () => void;
}

export interface SheetOptions {
  /** Widget id. */
  id?: string;
  /** Optional title displayed at the top of the sheet. */
  title?: string;
  /** Optional descriptive text below the title. */
  message?: string;
  /** List of actions rendered as tappable rows. */
  actions?: SheetAction[];
  /** Arbitrary HTML content (used when actions is empty). */
  content?: string;
  /** Remote source URL — fetched via xhtmlx. */
  source?: string;
  /** Whether the sheet is modal with a backdrop (default true). */
  modal?: boolean;
  /** Show a Cancel button at the bottom (default true when actions are present). */
  showCancel?: boolean;
  /** Label for the cancel button (default "Cancel"). */
  cancelLabel?: string;
  /** Allow drag-to-dismiss (default true). */
  draggable?: boolean;
  /** Snap points as viewport-height fractions, e.g. [0.5, 1] (default [1]). */
  snapPoints?: number[];
  /** Extra CSS class. */
  class?: string;
  /** Called when the sheet finishes opening. */
  onOpen?: () => void;
  /** Called when the sheet finishes closing. */
  onClose?: () => void;
}

export interface SheetInstance extends WidgetInstance {
  /** Slide the sheet into view. */
  open(): void;
  /** Dismiss the sheet. */
  close(): void;
  /** Whether the sheet is currently visible. */
  isOpen(): boolean;
}

// ----------------------------------------------------------
//  CSS (injected once)
// ----------------------------------------------------------
const STYLE_ID = 'tx-sheet-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* Overlay */
.tx-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
}
.tx-sheet-overlay.tx-sheet-modal {
  background: rgba(0,0,0,0.4);
}
.tx-sheet-overlay.tx-sheet-open {
  opacity: 1;
  pointer-events: auto;
}

/* Sheet panel */
.tx-sheet {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  background: var(--tx-sheet-bg, #ffffff);
  border-radius: 14px 14px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
}
.tx-sheet-open .tx-sheet {
  transform: translateY(0);
}

/* Drag handle */
.tx-sheet-handle {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
  cursor: grab;
  flex-shrink: 0;
}
.tx-sheet-handle::after {
  content: '';
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: var(--tx-sheet-handle, #d1d5db);
}

/* Header */
.tx-sheet-header {
  text-align: center;
  padding: 4px 16px 12px;
  flex-shrink: 0;
}
.tx-sheet-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--tx-sheet-title-color, #111827);
}
.tx-sheet-message {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--tx-sheet-message-color, #6b7280);
}

/* Actions list */
.tx-sheet-actions {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--tx-sheet-divider, #e5e7eb);
  flex-shrink: 0;
}
.tx-sheet-action {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 50px;
  padding: 0 20px;
  border: none;
  border-bottom: 1px solid var(--tx-sheet-divider, #e5e7eb);
  background: none;
  font-size: 17px;
  color: var(--tx-sheet-action-color, #007aff);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  text-align: left;
  font-family: inherit;
}
.tx-sheet-action:last-child {
  border-bottom: none;
}
.tx-sheet-action:active {
  background: var(--tx-sheet-action-active, #f3f4f6);
}
.tx-sheet-action-destructive {
  color: var(--tx-sheet-destructive, #ef4444);
}
.tx-sheet-action-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.tx-sheet-action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.tx-sheet-action-icon svg {
  width: 20px;
  height: 20px;
}

/* Body (free-form content / source) */
.tx-sheet-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

/* Cancel group */
.tx-sheet-cancel-gap {
  height: 8px;
  background: var(--tx-sheet-cancel-gap-bg, #f3f4f6);
  flex-shrink: 0;
}
.tx-sheet-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 50px;
  padding: 0 20px;
  border: none;
  background: var(--tx-sheet-bg, #ffffff);
  font-size: 17px;
  font-weight: 600;
  color: var(--tx-sheet-action-color, #007aff);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  font-family: inherit;
}
.tx-sheet-cancel:active {
  background: var(--tx-sheet-action-active, #f3f4f6);
}

/* Loading inside source-driven sheet */
.tx-sheet-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}
`;
  document.head.appendChild(style);
}

// ----------------------------------------------------------
//  Widget implementation
// ----------------------------------------------------------

export function sheet(options: SheetOptions): SheetInstance {
  injectStyles();

  const id = options.id || uid('tx-sheet');
  const isModal = options.modal !== false;
  const draggable = options.draggable !== false;
  const hasActions = options.actions && options.actions.length > 0;
  const showCancel = options.showCancel ?? hasActions;
  const cancelLabel = options.cancelLabel || 'Cancel';

  // --- Build HTML ---
  let html = `<div class="${cls('tx-sheet-overlay', isModal && 'tx-sheet-modal', options.class)}" id="${esc(id)}">`;
  html += '<div class="tx-sheet">';

  // Drag handle
  if (draggable) {
    html += '<div class="tx-sheet-handle"></div>';
  }

  // Header
  if (options.title || options.message) {
    html += '<div class="tx-sheet-header">';
    if (options.title) html += `<h3 class="tx-sheet-title">${esc(options.title)}</h3>`;
    if (options.message) html += `<p class="tx-sheet-message">${esc(options.message)}</p>`;
    html += '</div>';
  }

  // Actions
  if (hasActions) {
    html += '<div class="tx-sheet-actions">';
    for (let i = 0; i < options.actions!.length; i++) {
      const action = options.actions![i];
      html += `<button class="${cls(
        'tx-sheet-action',
        action.destructive && 'tx-sheet-action-destructive',
        action.disabled && 'tx-sheet-action-disabled',
      )}" data-action-index="${i}"`;
      if (action.disabled) html += ' disabled';
      html += '>';
      if (action.icon) {
        html += `<span class="tx-sheet-action-icon">${icon(action.icon, 20)}</span>`;
      }
      html += esc(action.label);
      html += '</button>';
    }
    html += '</div>';
  }

  // Free-form content
  if (!hasActions) {
    html += '<div class="tx-sheet-body">';
    if (options.source) {
      html += `<div xh-get="${esc(options.source)}" xh-trigger="none" xh-indicator="#${esc(id)}-loading">`;
      html += `<div id="${esc(id)}-loading" class="xh-indicator tx-sheet-loading"><div class="tx-spinner"></div></div>`;
      html += '</div>';
    } else if (options.content) {
      html += options.content;
    }
    html += '</div>';
  }

  // Cancel button
  if (showCancel) {
    html += '<div class="tx-sheet-cancel-gap"></div>';
    html += `<button class="tx-sheet-cancel">${esc(cancelLabel)}</button>`;
  }

  html += '</div></div>';

  // --- Mount ---
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const overlay = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(overlay);

  const panel = overlay.querySelector('.tx-sheet') as HTMLElement;

  // --- Drag-to-dismiss ---
  if (draggable) {
    const handle = overlay.querySelector('.tx-sheet-handle') as HTMLElement;
    let startY = 0;
    let currentY = 0;
    let dragging = false;

    handle.addEventListener('touchstart', (e: TouchEvent) => {
      if (!instance.isOpen()) return;
      startY = e.touches[0].clientY;
      currentY = 0;
      dragging = true;
      panel.style.transition = 'none';
    }, { passive: true });

    handle.addEventListener('touchmove', (e: TouchEvent) => {
      if (!dragging) return;
      currentY = Math.max(0, e.touches[0].clientY - startY);
      panel.style.transform = `translateY(${currentY}px)`;
    }, { passive: true });

    handle.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      panel.style.transform = '';
      if (currentY > 100) {
        instance.close();
      }
    }, { passive: true });
  }

  // --- Instance ---
  const instance: SheetInstance = {
    el: overlay,

    open(): void {
      overlay.style.display = '';
      requestAnimationFrame(() => {
        overlay.classList.add('tx-sheet-open');
      });
      document.body.classList.add('tx-sheet-body-lock');

      // Trigger xhtmlx fetch for source-driven sheets
      if (options.source) {
        const xhEl = panel.querySelector('[xh-trigger="none"]') as HTMLElement | null;
        if (xhEl) {
          xhEl.setAttribute('xh-trigger', 'load');
          if (typeof (window as any).xhtmlx !== 'undefined') {
            (window as any).xhtmlx.process(xhEl);
          }
        }
      }

      emit('sheet:open', { id });
      options.onOpen?.();
    },

    close(): void {
      overlay.classList.remove('tx-sheet-open');
      setTimeout(() => {
        document.body.classList.remove('tx-sheet-body-lock');
        emit('sheet:close', { id });
        options.onClose?.();
      }, 300);
    },

    isOpen(): boolean {
      return overlay.classList.contains('tx-sheet-open');
    },

    destroy(): void {
      if (instance.isOpen()) instance.close();
      setTimeout(() => overlay.remove(), 350);
    },
  };

  // --- Event listeners ---

  // Action buttons
  if (hasActions) {
    overlay.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.tx-sheet-action') as HTMLElement | null;
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-action-index') || '', 10);
      const action = options.actions![idx];
      if (action && !action.disabled) {
        action.handler?.();
        instance.close();
      }
    });
  }

  // Cancel button
  overlay.querySelector('.tx-sheet-cancel')?.addEventListener('click', () => instance.close());

  // Backdrop tap
  if (isModal) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) instance.close();
    });
  }

  // Escape key
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && instance.isOpen()) instance.close();
  };
  document.addEventListener('keydown', keyHandler);

  return instance;
}

// ----------------------------------------------------------
//  Declarative registration
// ----------------------------------------------------------
registerWidget('sheet', (el, opts) => {
  const inst = sheet(opts as unknown as SheetOptions);
  el.addEventListener('click', () => inst.open());
  return inst;
});

export default sheet;
