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

  let isOpen = false;

  function open(): void {
    menuEl.style.display = '';
    requestAnimationFrame(() => menuEl.classList.add('tx-dropdown-open'));
    isOpen = true;
    emit('dropdown:open', { id });
  }

  function close(): void {
    menuEl.classList.remove('tx-dropdown-open');
    setTimeout(() => {
      menuEl.style.display = 'none';
    }, 150);
    isOpen = false;
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
  document.addEventListener('click', (e) => {
    if (isOpen && !menuEl.contains(e.target as Node) && !triggerEl.contains(e.target as Node)) {
      close();
    }
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

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
  document.addEventListener('click', (e) => {
    if (isOpen && !menuEl.contains(e.target as Node)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

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
      html += '<div class="tx-dropdown-divider"></div>';
      return;
    }

    const itemCls = cls('tx-dropdown-item', item.disabled && 'tx-dropdown-item-disabled');

    if (item.href) {
      html += `<a class="${itemCls}" href="${esc(item.href)}" data-index="${i}" role="menuitem"`;
      if (item.target) html += ` target="${esc(item.target)}"`;
      html += '>';
    } else if (item.action) {
      html += `<button class="${itemCls}" data-index="${i}" role="menuitem"`;
      const method = (item.method || 'post').toLowerCase();
      html += ` xh-${method}="${esc(item.action)}"`;
      if (item.target) html += ` xh-target="${esc(item.target)}"`;
      html += '>';
    } else {
      html += `<button class="${itemCls}" data-index="${i}" role="menuitem">`;
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
      html += '<div class="tx-dropdown-submenu">';
      html += renderMenuItems(item.children, _id);
      html += '</div>';
    }
  });
  return html;
}

registerWidget('dropdown', (el, opts) => dropdown({ ...opts, trigger: el } as unknown as DropdownOptions));
export default dropdown;
