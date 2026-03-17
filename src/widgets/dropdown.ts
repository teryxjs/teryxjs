// ============================================================
// Teryx — Dropdown / Menu Widget
// ============================================================

import type { DropdownOptions, DropdownInstance, MenuItem, MenuOptions, MenuInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function dropdown(options: DropdownOptions): DropdownInstance {
  const id = options.id || uid('tx-dropdown');
  const align = options.align || 'left';
  const triggerEl = resolveTarget(options.trigger);

  // Build menu HTML
  const menuHtml = renderMenuItems(options.items, id);

  const menuEl = document.createElement('div');
  menuEl.className = cls('tx-dropdown-menu', `tx-dropdown-${align}`, options.class);
  menuEl.id = id;
  menuEl.setAttribute('role', 'menu');
  menuEl.style.display = 'none';
  menuEl.innerHTML = menuHtml;

  // Position relative to trigger
  triggerEl.style.position = 'relative';
  triggerEl.appendChild(menuEl);

  // Set aria attributes on trigger
  triggerEl.setAttribute('aria-haspopup', 'true');
  triggerEl.setAttribute('aria-expanded', 'false');

  let isOpen = false;
  let focusedIndex = -1;

  function getMenuItems(): HTMLElement[] {
    return Array.from(menuEl.querySelectorAll('.tx-dropdown-item:not(.tx-dropdown-item-disabled)')) as HTMLElement[];
  }

  function setFocusedItem(idx: number): void {
    const items = getMenuItems();
    items.forEach((item) => item.setAttribute('tabindex', '-1'));
    if (idx >= 0 && idx < items.length) {
      focusedIndex = idx;
      items[idx].setAttribute('tabindex', '0');
      items[idx].focus();
    } else {
      focusedIndex = -1;
    }
  }

  function open(): void {
    menuEl.style.display = '';
    requestAnimationFrame(() => menuEl.classList.add('tx-dropdown-open'));
    isOpen = true;
    triggerEl.setAttribute('aria-expanded', 'true');
    setFocusedItem(0);
    emit('dropdown:open', { id });
  }

  function close(): void {
    menuEl.classList.remove('tx-dropdown-open');
    setTimeout(() => {
      menuEl.style.display = 'none';
    }, 150);
    isOpen = false;
    focusedIndex = -1;
    triggerEl.setAttribute('aria-expanded', 'false');
    emit('dropdown:close', { id });
  }

  function toggle(): void {
    isOpen ? close() : open();
  }

  // Trigger click
  triggerEl.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.tx-dropdown-menu')) return;
    e.stopPropagation();
    toggle();
  });

  // Click outside
  const outsideClickHandler = (e: MouseEvent) => {
    if (isOpen && !menuEl.contains(e.target as Node) && !triggerEl.contains(e.target as Node)) {
      close();
    }
  };
  document.addEventListener('click', outsideClickHandler);

  // Keyboard navigation
  const keyHandler = (e: KeyboardEvent) => {
    if (!isOpen) return;

    const items = getMenuItems();
    if (items.length === 0) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        triggerEl.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedItem(focusedIndex < items.length - 1 ? focusedIndex + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedItem(focusedIndex > 0 ? focusedIndex - 1 : items.length - 1);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedItem(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedItem(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          items[focusedIndex].click();
        }
        break;
      case 'Tab':
        close();
        break;
    }
  };
  document.addEventListener('keydown', keyHandler);

  // Menu item clicks
  menuEl.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.tx-dropdown-item:not(.tx-dropdown-item-disabled)') as HTMLElement;
    if (!item) return;

    const idx = parseInt(item.getAttribute('data-index') || '0', 10);
    const menuItem = options.items[idx];
    if (menuItem && !menuItem.divider) {
      if (menuItem.handler) menuItem.handler(menuItem);
      close();
    }
  });

  const instance: DropdownInstance = {
    el: menuEl,
    destroy() {
      document.removeEventListener('click', outsideClickHandler);
      document.removeEventListener('keydown', keyHandler);
      menuEl.remove();
    },
    open,
    close,
    toggle,
  };

  return instance;
}

export function contextMenu(options: MenuOptions): MenuInstance {
  const id = options.id || uid('tx-menu');
  const menuEl = document.createElement('div');
  menuEl.className = cls('tx-context-menu', options.class);
  menuEl.id = id;
  menuEl.setAttribute('role', 'menu');
  menuEl.style.display = 'none';
  menuEl.innerHTML = renderMenuItems(options.items, id);
  document.body.appendChild(menuEl);

  let isOpen = false;

  function open(x?: number, y?: number): void {
    if (x !== undefined && y !== undefined) {
      menuEl.style.left = `${x}px`;
      menuEl.style.top = `${y}px`;
    }
    menuEl.style.display = '';
    requestAnimationFrame(() => menuEl.classList.add('tx-dropdown-open'));
    isOpen = true;
  }

  function close(): void {
    menuEl.classList.remove('tx-dropdown-open');
    setTimeout(() => {
      menuEl.style.display = 'none';
    }, 150);
    isOpen = false;
  }

  // Trigger
  if (options.trigger) {
    const triggerEl = resolveTarget(options.trigger);
    const eventName = options.event || 'contextmenu';
    triggerEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      open(e instanceof MouseEvent ? e.clientX : undefined, e instanceof MouseEvent ? e.clientY : undefined);
    });
  }

  // Click outside
  const ctxOutsideHandler = (e: MouseEvent) => {
    if (isOpen && !menuEl.contains(e.target as Node)) close();
  };
  document.addEventListener('click', ctxOutsideHandler);

  const ctxEscapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) close();
  };
  document.addEventListener('keydown', ctxEscapeHandler);

  // Item clicks
  menuEl.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.tx-dropdown-item:not(.tx-dropdown-item-disabled)') as HTMLElement;
    if (!item) return;
    const idx = parseInt(item.getAttribute('data-index') || '0', 10);
    const menuItem = options.items[idx];
    if (menuItem && !menuItem.divider && menuItem.handler) {
      menuItem.handler(menuItem);
    }
    close();
  });

  return {
    el: menuEl,
    destroy() {
      document.removeEventListener('click', ctxOutsideHandler);
      document.removeEventListener('keydown', ctxEscapeHandler);
      menuEl.remove();
    },
    open,
    close,
    toggle() {
      isOpen ? close() : open();
    },
  };
}

function renderMenuItems(items: MenuItem[], _id: string): string {
  let html = '';
  items.forEach((item, i) => {
    if (item.divider) {
      html += '<div class="tx-dropdown-divider" role="separator"></div>';
      return;
    }

    const itemCls = cls('tx-dropdown-item', item.disabled && 'tx-dropdown-item-disabled');

    if (item.href) {
      html += `<a class="${itemCls}" href="${esc(item.href)}" data-index="${i}" role="menuitem" tabindex="-1"`;
      if (item.target) html += ` target="${esc(item.target)}"`;
      html += '>';
    } else if (item.action) {
      html += `<button class="${itemCls}" data-index="${i}" role="menuitem" tabindex="-1"`;
      const method = (item.method || 'post').toLowerCase();
      html += ` xh-${method}="${esc(item.action)}"`;
      if (item.target) html += ` xh-target="${esc(item.target)}"`;
      html += '>';
    } else {
      html += `<button class="${itemCls}" data-index="${i}" role="menuitem" tabindex="-1">`;
    }

    if (item.icon) html += `<span class="tx-dropdown-item-icon">${icon(item.icon)}</span>`;
    if (item.checked !== undefined) {
      html += `<span class="tx-dropdown-item-check">${item.checked ? icon('check') : ''}</span>`;
    }
    html += `<span class="tx-dropdown-item-text">${esc(item.label || '')}</span>`;
    if (item.shortcut) html += `<span class="tx-dropdown-item-shortcut">${esc(item.shortcut)}</span>`;
    if (item.children?.length) html += `<span class="tx-dropdown-item-arrow">${icon('chevronRight')}</span>`;

    html += item.href ? '</a>' : '</button>';

    // Sub-menu
    if (item.children?.length) {
      html += '<div class="tx-dropdown-submenu" role="menu">';
      html += renderMenuItems(item.children, _id);
      html += '</div>';
    }
  });
  return html;
}

registerWidget('dropdown', (el, opts) => dropdown({ ...opts, trigger: el } as unknown as DropdownOptions));
export default dropdown;
