// ============================================================
// Teryx — Toast / Notification Widget
// ============================================================

import type { ToastOptions, ToastPosition, ToastType } from '../types';
import { uid, esc, cls, icon } from '../utils';
import { config, emit } from '../core';

const containers = new Map<string, HTMLElement>();

function getContainer(position: ToastPosition): HTMLElement {
  if (containers.has(position)) return containers.get(position)!;

  const el = document.createElement('div');
  el.className = `tx-toast-container tx-toast-${position}`;
  el.setAttribute('aria-live', 'polite');
  document.body.appendChild(el);
  containers.set(position, el);
  return el;
}

export function toast(options: ToastOptions): { dismiss: () => void } {
  const id = uid('tx-toast');
  const type: ToastType = options.type || 'info';
  const position = options.position || config.toastPosition;
  const duration = options.duration ?? config.toastDuration;
  const closable = options.closable !== false;

  const container = getContainer(position);

  const iconMap: Record<ToastType, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
  };

  let html = `<div class="${cls('tx-toast', `tx-toast-${type}`, options.class)}" id="${esc(id)}" role="alert">`;

  // Icon
  if (options.icon !== undefined) {
    html += `<div class="tx-toast-icon">${icon(options.icon)}</div>`;
  } else {
    html += `<div class="tx-toast-icon">${icon(iconMap[type])}</div>`;
  }

  // Content
  html += '<div class="tx-toast-content">';
  if (options.title) {
    html += `<div class="tx-toast-title">${esc(options.title)}</div>`;
  }
  html += `<div class="tx-toast-message">${esc(options.message)}</div>`;

  if (options.action) {
    html += `<button class="tx-toast-action tx-link">${esc(options.action.label)}</button>`;
  }

  html += '</div>';

  // Close button
  if (closable) {
    html += `<button class="tx-toast-close" aria-label="Close">${icon('x')}</button>`;
  }

  // Progress bar for auto-dismiss
  if (duration > 0) {
    html += `<div class="tx-toast-progress"><div class="tx-toast-progress-bar" style="animation-duration:${duration}ms"></div></div>`;
  }

  html += '</div>';

  const toastEl = document.createElement('div');
  toastEl.innerHTML = html;
  const toastNode = toastEl.firstElementChild as HTMLElement;

  // Add to container (prepend for top, append for bottom)
  if (position.startsWith('top')) {
    container.prepend(toastNode);
  } else {
    container.appendChild(toastNode);
  }

  // Animate in
  requestAnimationFrame(() => {
    toastNode.classList.add('tx-toast-enter');
  });

  let timer: ReturnType<typeof setTimeout> | null = null;
  const startTime = Date.now();
  let elapsed = 0;

  function dismiss(): void {
    if (timer) clearTimeout(timer);
    toastNode.classList.remove('tx-toast-enter');
    toastNode.classList.add('tx-toast-leave');
    setTimeout(() => {
      toastNode.remove();
      emit('toast:dismiss', { id });
    }, 300);
  }

  // Auto-dismiss
  if (duration > 0) {
    timer = setTimeout(dismiss, duration);

    // Pause on hover
    toastNode.addEventListener('mouseenter', () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      elapsed = Date.now() - startTime;
      const progressBar = toastNode.querySelector('.tx-toast-progress-bar') as HTMLElement;
      if (progressBar) progressBar.style.animationPlayState = 'paused';
    });

    toastNode.addEventListener('mouseleave', () => {
      const progressBar = toastNode.querySelector('.tx-toast-progress-bar') as HTMLElement;
      if (progressBar) progressBar.style.animationPlayState = 'running';
      timer = setTimeout(dismiss, Math.max(500, duration - elapsed));
    });
  }

  // Close button
  toastNode.querySelector('.tx-toast-close')?.addEventListener('click', dismiss);

  // Action button
  if (options.action) {
    toastNode.querySelector('.tx-toast-action')?.addEventListener('click', () => {
      options.action!.handler();
      dismiss();
    });
  }

  emit('toast:show', { id, type, message: options.message });

  return { dismiss };
}

// Convenience methods
toast.info = (message: string, opts?: Partial<ToastOptions>) => toast({ ...opts, message, type: 'info' });
toast.success = (message: string, opts?: Partial<ToastOptions>) => toast({ ...opts, message, type: 'success' });
toast.warning = (message: string, opts?: Partial<ToastOptions>) => toast({ ...opts, message, type: 'warning' });
toast.danger = (message: string, opts?: Partial<ToastOptions>) => toast({ ...opts, message, type: 'danger' });
toast.error = toast.danger;

export default toast;
