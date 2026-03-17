// ============================================================
// Teryx — Tooltip & Popover Widget
// ============================================================

import type { TooltipOptions, PopoverOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export interface TooltipInstance extends WidgetInstance {
  show(): void;
  hide(): void;
  isVisible(): boolean;
  setContent(content: string): void;
}

export interface PopoverInstance extends TooltipInstance {
  setTitle(title: string): void;
}

interface Coords {
  top: number;
  left: number;
  arrowPos: 'top' | 'bottom' | 'left' | 'right';
}

function computePosition(
  targetRect: DOMRect,
  floatingWidth: number,
  floatingHeight: number,
  position: 'top' | 'bottom' | 'left' | 'right',
  gap: number = 8,
): Coords {
  let top = 0;
  let left = 0;
  let arrowPos = position;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;

  switch (position) {
    case 'top':
      top = targetRect.top + scrollY - floatingHeight - gap;
      left = targetRect.left + scrollX + targetRect.width / 2 - floatingWidth / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + scrollY + gap;
      left = targetRect.left + scrollX + targetRect.width / 2 - floatingWidth / 2;
      break;
    case 'left':
      top = targetRect.top + scrollY + targetRect.height / 2 - floatingHeight / 2;
      left = targetRect.left + scrollX - floatingWidth - gap;
      break;
    case 'right':
      top = targetRect.top + scrollY + targetRect.height / 2 - floatingHeight / 2;
      left = targetRect.right + scrollX + gap;
      break;
  }

  if (position === 'top' && targetRect.top - floatingHeight - gap < 0) {
    top = targetRect.bottom + scrollY + gap;
    arrowPos = 'bottom';
  } else if (position === 'bottom' && targetRect.bottom + floatingHeight + gap > vpH) {
    top = targetRect.top + scrollY - floatingHeight - gap;
    arrowPos = 'top';
  } else if (position === 'left' && targetRect.left - floatingWidth - gap < 0) {
    top = targetRect.top + scrollY + targetRect.height / 2 - floatingHeight / 2;
    left = targetRect.right + scrollX + gap;
    arrowPos = 'right';
  } else if (position === 'right' && targetRect.right + floatingWidth + gap > vpW) {
    top = targetRect.top + scrollY + targetRect.height / 2 - floatingHeight / 2;
    left = targetRect.left + scrollX - floatingWidth - gap;
    arrowPos = 'left';
  }

  if (left < scrollX + 4) left = scrollX + 4;
  if (left + floatingWidth > scrollX + vpW - 4) left = scrollX + vpW - 4 - floatingWidth;
  return { top, left, arrowPos };
}

function arrowDirection(arrowPos: string): string {
  const map: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  return map[arrowPos] || 'top';
}

export function tooltip(target: string | HTMLElement, options: TooltipOptions): TooltipInstance {
  const triggerEl = resolveTarget(target);
  const id = uid('tx-tooltip');
  const position = options.position || 'top';
  const trigger = options.trigger || 'hover';
  const delay = options.delay ?? 0;
  const allowHtml = options.html ?? false;
  let content = options.content;
  let visible = false;
  let floatingEl: HTMLElement | null = null;
  let showTimer: ReturnType<typeof setTimeout> | undefined;

  function createFloating(): HTMLElement {
    const div = document.createElement('div');
    div.id = id;
    div.className = cls('tx-tooltip', options.class) || 'tx-tooltip';
    div.setAttribute('role', 'tooltip');
    let inner = '<div class="tx-tooltip-arrow"></div>';
    inner += '<div class="tx-tooltip-content">';
    inner += allowHtml ? content : esc(content);
    inner += '</div>';
    div.innerHTML = inner;
    div.style.position = 'absolute';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    document.body.appendChild(div);
    return div;
  }

  function positionFloating(): void {
    if (!floatingEl) return;
    const targetRect = triggerEl.getBoundingClientRect();
    const floatingRect = floatingEl.getBoundingClientRect();
    const coords = computePosition(targetRect, floatingRect.width, floatingRect.height, position);
    floatingEl.style.top = `${coords.top}px`;
    floatingEl.style.left = `${coords.left}px`;
    const arrow = floatingEl.querySelector('.tx-tooltip-arrow') as HTMLElement;
    if (arrow) arrow.className = `tx-tooltip-arrow tx-tooltip-arrow-${arrowDirection(coords.arrowPos)}`;
  }

  function show(): void {
    if (visible) return;
    floatingEl = createFloating();
    positionFloating();
    requestAnimationFrame(() => {
      if (floatingEl) {
        floatingEl.style.opacity = '1';
        floatingEl.style.pointerEvents = 'auto';
      }
    });
    visible = true;
    emit('tooltip:show', { id });
  }

  function hide(): void {
    clearTimeout(showTimer);
    if (!visible || !floatingEl) return;
    floatingEl.style.opacity = '0';
    floatingEl.style.pointerEvents = 'none';
    const el = floatingEl;
    setTimeout(() => el.remove(), 200);
    floatingEl = null;
    visible = false;
    emit('tooltip:hide', { id });
  }

  if (trigger === 'hover') {
    triggerEl.addEventListener('mouseenter', () => {
      if (delay > 0) {
        showTimer = setTimeout(show, delay);
      } else {
        show();
      }
    });
    triggerEl.addEventListener('mouseleave', () => {
      clearTimeout(showTimer);
      hide();
    });
  } else if (trigger === 'click') {
    triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      visible ? hide() : show();
    });
    document.addEventListener('click', (e) => {
      if (visible && floatingEl && !floatingEl.contains(e.target as Node) && !triggerEl.contains(e.target as Node))
        hide();
    });
  } else if (trigger === 'focus') {
    triggerEl.addEventListener('focus', () => {
      if (delay > 0) {
        showTimer = setTimeout(show, delay);
      } else {
        show();
      }
    });
    triggerEl.addEventListener('blur', () => {
      clearTimeout(showTimer);
      hide();
    });
  }

  const instance: TooltipInstance = {
    el: triggerEl,
    destroy() {
      hide();
    },
    show,
    hide,
    isVisible() {
      return visible;
    },
    setContent(newContent: string) {
      content = newContent;
      if (floatingEl) {
        const contentEl = floatingEl.querySelector('.tx-tooltip-content');
        if (contentEl) contentEl.innerHTML = allowHtml ? content : esc(content);
      }
    },
  };
  return instance;
}

export function popover(target: string | HTMLElement, options: PopoverOptions): PopoverInstance {
  const triggerEl = resolveTarget(target);
  const id = uid('tx-popover');
  const position = options.position || 'top';
  const trigger = options.trigger || 'click';
  const delay = options.delay ?? 0;
  const allowHtml = options.html ?? false;
  const closable = options.closable ?? true;
  let content = options.content;
  let title = options.title || '';
  let visible = false;
  let floatingEl: HTMLElement | null = null;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  function createFloating(): HTMLElement {
    const div = document.createElement('div');
    div.id = id;
    div.className = cls('tx-popover', options.class) || 'tx-popover';
    div.setAttribute('role', 'dialog');
    if (options.width) div.style.width = options.width;
    let inner = '<div class="tx-popover-arrow"></div>';
    if (title || closable) {
      inner += '<div class="tx-popover-header">';
      if (title) inner += `<div class="tx-popover-title">${esc(title)}</div>`;
      if (closable) inner += `<button class="tx-popover-close" type="button" aria-label="Close">${icon('x')}</button>`;
      inner += '</div>';
    }
    inner += '<div class="tx-popover-body">';
    inner += allowHtml ? content : esc(content);
    inner += '</div>';
    div.innerHTML = inner;
    div.style.position = 'absolute';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    document.body.appendChild(div);
    if (closable) {
      const closeBtn = div.querySelector('.tx-popover-close');
      closeBtn?.addEventListener('click', () => hide());
    }
    return div;
  }

  function positionFloating(): void {
    if (!floatingEl) return;
    const targetRect = triggerEl.getBoundingClientRect();
    const floatingRect = floatingEl.getBoundingClientRect();
    const coords = computePosition(targetRect, floatingRect.width, floatingRect.height, position);
    floatingEl.style.top = `${coords.top}px`;
    floatingEl.style.left = `${coords.left}px`;
    const arrow = floatingEl.querySelector('.tx-popover-arrow') as HTMLElement;
    if (arrow) arrow.className = `tx-popover-arrow tx-popover-arrow-${arrowDirection(coords.arrowPos)}`;
  }

  function show(): void {
    clearTimeout(hideTimer);
    if (visible) return;
    floatingEl = createFloating();
    positionFloating();
    requestAnimationFrame(() => {
      if (floatingEl) {
        floatingEl.style.opacity = '1';
        floatingEl.style.pointerEvents = 'auto';
      }
    });
    visible = true;
    emit('popover:show', { id });
  }

  function hide(): void {
    clearTimeout(showTimer);
    if (!visible || !floatingEl) return;
    floatingEl.style.opacity = '0';
    floatingEl.style.pointerEvents = 'none';
    const el = floatingEl;
    setTimeout(() => el.remove(), 200);
    floatingEl = null;
    visible = false;
    emit('popover:hide', { id });
  }

  if (trigger === 'hover') {
    triggerEl.addEventListener('mouseenter', () => {
      if (delay > 0) {
        showTimer = setTimeout(show, delay);
      } else {
        show();
      }
    });
    triggerEl.addEventListener('mouseleave', () => {
      clearTimeout(showTimer);
      hide();
      hideTimer = undefined;
    });
  } else if (trigger === 'click') {
    triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      visible ? hide() : show();
    });
    document.addEventListener('click', (e) => {
      if (visible && floatingEl && !floatingEl.contains(e.target as Node) && !triggerEl.contains(e.target as Node))
        hide();
    });
  } else if (trigger === 'focus') {
    triggerEl.addEventListener('focus', () => {
      if (delay > 0) {
        showTimer = setTimeout(show, delay);
      } else {
        show();
      }
    });
    triggerEl.addEventListener('blur', () => {
      clearTimeout(showTimer);
      hide();
    });
  }

  const instance: PopoverInstance = {
    el: triggerEl,
    destroy() {
      hide();
    },
    show,
    hide,
    isVisible() {
      return visible;
    },
    setContent(newContent: string) {
      content = newContent;
      if (floatingEl) {
        const bodyEl = floatingEl.querySelector('.tx-popover-body');
        if (bodyEl) bodyEl.innerHTML = allowHtml ? content : esc(content);
      }
    },
    setTitle(newTitle: string) {
      title = newTitle;
      if (floatingEl) {
        const titleEl = floatingEl.querySelector('.tx-popover-title');
        if (titleEl) titleEl.textContent = newTitle;
      }
    },
  };
  return instance;
}

registerWidget('tooltip', (el, opts) => tooltip(el, opts as unknown as TooltipOptions));
registerWidget('popover', (el, opts) => popover(el, opts as unknown as PopoverOptions));
export default tooltip;
