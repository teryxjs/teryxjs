// ============================================================
// Teryx — Sidebar Widget
// ============================================================

import type { SidebarOptions, SidebarItem, SidebarInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function sidebar(target: string | HTMLElement, options: SidebarOptions): SidebarInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-sidebar');
  const variant = options.variant || 'dark';
  const collapsed = options.collapsed ?? false;

  let html = `<aside class="${cls(
    'tx-sidebar',
    `tx-sidebar-${variant}`,
    collapsed && 'tx-sidebar-collapsed',
    options.mini && 'tx-sidebar-mini',
    options.collapsible && 'tx-sidebar-collapsible',
    options.class,
  )}" id="${esc(id)}"`;
  if (options.width) html += ` style="--tx-sidebar-width:${esc(options.width)}"`;
  html += '>';

  // Brand
  if (options.brand || options.brandImage) {
    html += '<div class="tx-sidebar-brand">';
    if (options.brandImage) html += `<img src="${esc(options.brandImage)}" class="tx-sidebar-brand-img" alt="">`;
    if (options.brand) {
      const href = options.brandHref || '/';
      html += `<a class="tx-sidebar-brand-text" href="${esc(href)}">${esc(options.brand)}</a>`;
    }
    if (options.collapsible) {
      html += `<button class="tx-sidebar-toggle">${icon('chevronLeft')}</button>`;
    }
    html += '</div>';
  }

  // Nav items
  html += '<nav class="tx-sidebar-nav">';
  html += renderSidebarItems(options.items, 0);
  html += '</nav>';

  // Footer
  if (options.footer) {
    html += `<div class="tx-sidebar-footer">${options.footer}</div>`;
  }

  html += '</aside>';
  el.innerHTML = html;

  const sidebarEl = el.querySelector(`#${id}`) as HTMLElement;
  let isCollapsed = collapsed;

  // Toggle button
  sidebarEl.querySelector('.tx-sidebar-toggle')?.addEventListener('click', () => {
    instance.toggle();
  });

  // Submenu toggles
  sidebarEl.addEventListener('click', (e) => {
    const toggle = (e.target as HTMLElement).closest('.tx-sidebar-submenu-toggle');
    if (toggle) {
      e.preventDefault();
      const item = toggle.closest('.tx-sidebar-item-group') as HTMLElement;
      if (item) {
        item.classList.toggle('tx-sidebar-item-open');
        const sub = item.querySelector('.tx-sidebar-submenu') as HTMLElement;
        if (sub) {
          sub.style.display = item.classList.contains('tx-sidebar-item-open') ? '' : 'none';
        }
      }
    }
  });

  const instance: SidebarInstance = {
    el: sidebarEl,
    destroy() {
      el.innerHTML = '';
    },
    collapse() {
      sidebarEl.classList.add('tx-sidebar-collapsed');
      isCollapsed = true;
      emit('sidebar:collapse', { id });
    },
    expand() {
      sidebarEl.classList.remove('tx-sidebar-collapsed');
      isCollapsed = false;
      emit('sidebar:expand', { id });
    },
    toggle() {
      isCollapsed ? instance.expand() : instance.collapse();
    },
    isCollapsed() {
      return isCollapsed;
    },
  };

  return instance;
}

function renderSidebarItems(items: SidebarItem[], depth: number): string {
  let html = '';
  for (const item of items) {
    if (item.section) {
      html += `<div class="tx-sidebar-section">${esc(item.label)}</div>`;
      if (item.children) html += renderSidebarItems(item.children, depth);
      continue;
    }

    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      html += `<div class="${cls('tx-sidebar-item-group', item.active && 'tx-sidebar-item-open')}">`;
      html += `<a class="${cls('tx-sidebar-item', item.active && 'tx-sidebar-item-active', item.disabled && 'tx-sidebar-item-disabled')}" href="${esc(item.href || '#')}" style="--depth:${depth}">`;
      if (item.icon) html += `<span class="tx-sidebar-icon">${icon(item.icon)}</span>`;
      html += `<span class="tx-sidebar-text">${esc(item.label)}</span>`;
      if (item.badge)
        html += `<span class="tx-badge tx-badge-sm${item.badgeType ? ` tx-badge-${esc(item.badgeType)}` : ''}">${esc(item.badge)}</span>`;
      html += `<span class="tx-sidebar-submenu-toggle">${icon('chevronDown')}</span>`;
      html += '</a>';
      html += `<div class="tx-sidebar-submenu"${!item.active ? ' style="display:none"' : ''}>`;
      html += renderSidebarItems(item.children!, depth + 1);
      html += '</div></div>';
    } else {
      html += `<a class="${cls('tx-sidebar-item', item.active && 'tx-sidebar-item-active', item.disabled && 'tx-sidebar-item-disabled')}" href="${esc(item.href || '#')}" style="--depth:${depth}">`;
      if (item.icon) html += `<span class="tx-sidebar-icon">${icon(item.icon)}</span>`;
      html += `<span class="tx-sidebar-text">${esc(item.label)}</span>`;
      if (item.badge)
        html += `<span class="tx-badge tx-badge-sm${item.badgeType ? ` tx-badge-${esc(item.badgeType)}` : ''}">${esc(item.badge)}</span>`;
      html += '</a>';
    }
  }
  return html;
}

registerWidget('sidebar', (el, opts) => sidebar(el, opts as unknown as SidebarOptions));
export default sidebar;
