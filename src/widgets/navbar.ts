// ============================================================
// Teryx — Navbar Widget
// ============================================================

import type { NavbarOptions, NavItem } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget } from '../core';

export function navbar(target: string | HTMLElement, options: NavbarOptions): { el: HTMLElement; destroy: () => void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-navbar');
  const variant = options.variant || 'light';

  let html = `<nav class="${cls(
    'tx-navbar',
    `tx-navbar-${variant}`,
    options.sticky && 'tx-navbar-sticky',
    options.class,
  )}" id="${esc(id)}">`;

  if (options.container) html += '<div class="tx-container">';

  html += '<div class="tx-navbar-inner">';

  // Brand
  html += '<div class="tx-navbar-start">';
  if (options.brand || options.brandImage) {
    html += `<a class="tx-navbar-brand" href="${esc(options.brandHref || '/')}">`;
    if (options.brandImage) html += `<img src="${esc(options.brandImage)}" class="tx-navbar-brand-img" alt="">`;
    if (options.brand) html += `<span class="tx-navbar-brand-text">${esc(options.brand)}</span>`;
    html += '</a>';
  }

  // Mobile toggle
  if (options.collapsible) {
    html += `<button class="tx-navbar-toggler" aria-label="Toggle navigation">${icon('menu')}</button>`;
  }
  html += '</div>';

  // Main nav items
  html += `<div class="tx-navbar-menu${options.collapsible ? ' tx-navbar-collapsible' : ''}" id="${esc(id)}-menu">`;
  html += '<div class="tx-navbar-nav">';
  html += renderNavItems(options.items);
  html += '</div>';

  // End items
  if (options.endItems?.length) {
    html += '<div class="tx-navbar-end">';
    html += renderNavItems(options.endItems);
    html += '</div>';
  }

  html += '</div>'; // menu
  html += '</div>'; // inner

  if (options.container) html += '</div>';
  html += '</nav>';

  el.innerHTML = html;

  const navEl = el.querySelector(`#${id}`) as HTMLElement;

  // Mobile toggle
  if (options.collapsible) {
    navEl.querySelector('.tx-navbar-toggler')?.addEventListener('click', () => {
      const menu = navEl.querySelector('.tx-navbar-collapsible');
      menu?.classList.toggle('tx-navbar-menu-open');
    });
  }

  // Dropdown toggles
  navEl.addEventListener('click', (e) => {
    const dropdownToggle = (e.target as HTMLElement).closest('.tx-navbar-dropdown-toggle');
    if (dropdownToggle) {
      e.preventDefault();
      const parent = dropdownToggle.closest('.tx-navbar-dropdown') as HTMLElement;
      parent?.classList.toggle('tx-navbar-dropdown-open');
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!navEl.contains(e.target as Node)) {
      navEl.querySelectorAll('.tx-navbar-dropdown-open').forEach((d) => d.classList.remove('tx-navbar-dropdown-open'));
    }
  });

  return {
    el: navEl,
    destroy() {
      el.innerHTML = '';
    },
  };
}

function renderNavItems(items: NavItem[]): string {
  let html = '';
  for (const item of items) {
    if (item.children?.length) {
      html += `<div class="tx-navbar-dropdown">`;
      html += `<a class="${cls('tx-navbar-item', 'tx-navbar-dropdown-toggle', item.active && 'tx-navbar-item-active')}" href="${esc(item.href || '#')}">`;
      if (item.icon) html += `<span class="tx-navbar-icon">${icon(item.icon)}</span>`;
      html += esc(item.label);
      html += `<span class="tx-navbar-caret">${icon('chevronDown')}</span>`;
      html += '</a>';
      html += '<div class="tx-navbar-dropdown-menu">';
      for (const child of item.children) {
        html += `<a class="${cls('tx-navbar-dropdown-item', child.active && 'tx-navbar-item-active', child.disabled && 'tx-navbar-item-disabled')}" href="${esc(child.href || '#')}">`;
        if (child.icon) html += `<span class="tx-navbar-icon">${icon(child.icon)}</span>`;
        html += esc(child.label);
        if (child.badge) html += `<span class="tx-badge tx-badge-sm">${esc(child.badge)}</span>`;
        html += '</a>';
      }
      html += '</div></div>';
    } else {
      html += `<a class="${cls('tx-navbar-item', item.active && 'tx-navbar-item-active', item.disabled && 'tx-navbar-item-disabled')}" href="${esc(item.href || '#')}">`;
      if (item.icon) html += `<span class="tx-navbar-icon">${icon(item.icon)}</span>`;
      html += esc(item.label);
      if (item.badge) html += `<span class="tx-badge tx-badge-sm">${esc(item.badge)}</span>`;
      html += '</a>';
    }
  }
  return html;
}

registerWidget('navbar', (el, opts) => navbar(el, opts as unknown as NavbarOptions));
export default navbar;
