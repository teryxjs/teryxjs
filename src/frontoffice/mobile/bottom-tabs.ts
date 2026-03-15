// ============================================================
// Teryx — Mobile Bottom Tabs (Tab Bar Navigation)
// ============================================================
//
// A fixed-bottom tab bar inspired by iOS UITabBarController and
// Android BottomNavigationView. Supports icons, labels, numeric
// badges, and lazy-loaded content panels.
//
// Usage:
//   bottomTabs('#app', {
//     items: [
//       { id: 'home',    label: 'Home',    icon: 'home',  active: true, content: '<p>Home</p>' },
//       { id: 'search',  label: 'Search',  icon: 'search', source: '/api/search' },
//       { id: 'profile', label: 'Profile', icon: 'user',  badge: '3' },
//     ],
//   });

import { uid, esc, cls, icon, resolveTarget } from '../../utils';
import { registerWidget, emit } from '../../core';
import type { WidgetInstance } from '../../types';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface BottomTabItem {
  /** Unique tab identifier. */
  id: string;
  /** Tab label (shown below the icon). */
  label: string;
  /** Teryx icon name. */
  icon: string;
  /** Whether this tab is initially active. */
  active?: boolean;
  /** Badge value (e.g. unread count). Empty string or "dot" renders a dot badge. */
  badge?: string;
  /** Badge colour override. */
  badgeColor?: string;
  /** Static HTML content for the tab panel. */
  content?: string;
  /** Remote source URL — lazy-fetched via xhtmlx when activated. */
  source?: string;
  /** Disable the tab (greyed out, non-interactive). */
  disabled?: boolean;
  /** Custom CSS class on the tab button. */
  class?: string;
}

export interface BottomTabsOptions {
  /** Tab definitions. */
  items: BottomTabItem[];
  /** Widget id. */
  id?: string;
  /** Extra CSS class on the root container. */
  class?: string;
  /** Colour of the active tab icon/label (CSS value). */
  activeColor?: string;
  /** Colour of inactive tabs (CSS value). */
  inactiveColor?: string;
  /** Whether to show labels beneath icons (default true). */
  showLabels?: boolean;
  /** Whether switching tabs uses a crossfade animation (default true). */
  animated?: boolean;
  /** Called when the active tab changes. */
  onChange?: (tabId: string) => void;
}

export interface BottomTabsInstance extends WidgetInstance {
  /** Programmatically switch to a tab. */
  activate(tabId: string): void;
  /** Return the active tab id. */
  activeTab(): string;
  /** Update the badge for a tab. Pass empty string to clear. */
  setBadge(tabId: string, badge: string): void;
}

// ----------------------------------------------------------
//  CSS (injected once)
// ----------------------------------------------------------
const STYLE_ID = 'tx-bottom-tabs-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* Root wrapper — takes full height, flexes column */
.tx-bottom-tabs {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--tx-btabs-bg, #f8f9fa);
}

/* Panel viewport */
.tx-bottom-tabs-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Individual panel */
.tx-bottom-tabs-panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--tx-btabs-bg, #f8f9fa);
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}
.tx-bottom-tabs-panel.tx-btabs-panel-active {
  opacity: 1;
  pointer-events: auto;
  z-index: 1;
}
.tx-bottom-tabs-no-anim .tx-bottom-tabs-panel {
  transition: none;
}

/* Bar */
.tx-bottom-tabs-bar {
  display: flex;
  align-items: stretch;
  background: var(--tx-btabs-bar-bg, #ffffff);
  border-top: 1px solid var(--tx-btabs-bar-border, #e5e7eb);
  flex-shrink: 0;
  -webkit-user-select: none;
  user-select: none;
  /* Safe area for phones with home indicators */
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Tab button */
.tx-bottom-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 6px 0 4px;
  border: none;
  background: none;
  color: var(--tx-btabs-inactive, #9ca3af);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  gap: 2px;
  font-family: inherit;
}
.tx-bottom-tab:active {
  opacity: 0.7;
}
.tx-bottom-tab.tx-btab-active {
  color: var(--tx-btabs-active, #007aff);
}
.tx-bottom-tab.tx-btab-disabled {
  opacity: 0.35;
  pointer-events: none;
}

/* Icon wrapper */
.tx-bottom-tab-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}
.tx-bottom-tab-icon svg {
  width: 24px;
  height: 24px;
}

/* Label */
.tx-bottom-tab-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}
.tx-bottom-tabs-no-labels .tx-bottom-tab-label {
  display: none;
}
.tx-bottom-tabs-no-labels .tx-bottom-tab {
  min-height: 44px;
}

/* Badge */
.tx-bottom-tab-badge {
  position: absolute;
  top: -2px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--tx-btabs-badge, #ef4444);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
}
.tx-bottom-tab-badge-dot {
  min-width: 8px;
  width: 8px;
  height: 8px;
  padding: 0;
  top: 0;
  right: -4px;
}

/* Loading indicator inside panel */
.tx-bottom-tabs-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
`;
  document.head.appendChild(style);
}

// ----------------------------------------------------------
//  Widget implementation
// ----------------------------------------------------------

export function bottomTabs(
  target: string | HTMLElement,
  options: BottomTabsOptions,
): BottomTabsInstance {
  injectStyles();

  const el = resolveTarget(target);
  const id = options.id || uid('tx-btabs');
  const showLabels = options.showLabels !== false;
  const animated = options.animated !== false;

  let activeId = options.items.find(i => i.active)?.id || options.items[0]?.id || '';

  // --- Build HTML ---
  let html = `<div class="${cls(
    'tx-bottom-tabs',
    !showLabels && 'tx-bottom-tabs-no-labels',
    !animated && 'tx-bottom-tabs-no-anim',
    options.class,
  )}" id="${esc(id)}"`;
  if (options.activeColor) html += ` style="--tx-btabs-active:${esc(options.activeColor)};${options.inactiveColor ? `--tx-btabs-inactive:${esc(options.inactiveColor)}` : ''}"`;
  else if (options.inactiveColor) html += ` style="--tx-btabs-inactive:${esc(options.inactiveColor)}"`;
  html += '>';

  // Viewport with panels
  html += '<div class="tx-bottom-tabs-viewport">';
  for (const item of options.items) {
    const isActive = item.id === activeId;
    html += `<div class="${cls('tx-bottom-tabs-panel', isActive && 'tx-btabs-panel-active')}" data-tab="${esc(item.id)}">`;

    if (item.source) {
      const trigger = isActive ? 'load' : 'none';
      html += `<div xh-get="${esc(item.source)}" xh-trigger="${trigger}" xh-indicator="#${esc(id)}-panel-${esc(item.id)}-loading">`;
      html += `<div id="${esc(id)}-panel-${esc(item.id)}-loading" class="xh-indicator tx-bottom-tabs-loading"><div class="tx-spinner"></div></div>`;
      html += '</div>';
    } else if (item.content) {
      html += item.content;
    }

    html += '</div>';
  }
  html += '</div>';

  // Bar
  html += '<div class="tx-bottom-tabs-bar">';
  for (const item of options.items) {
    const isActive = item.id === activeId;
    html += `<button class="${cls(
      'tx-bottom-tab',
      isActive && 'tx-btab-active',
      item.disabled && 'tx-btab-disabled',
      item.class,
    )}" data-tab="${esc(item.id)}"`;
    if (item.disabled) html += ' disabled';
    html += '>';

    html += '<span class="tx-bottom-tab-icon">';
    html += icon(item.icon, 24);
    // Badge
    if (item.badge !== undefined && item.badge !== '') {
      if (item.badge === 'dot') {
        html += `<span class="tx-bottom-tab-badge tx-bottom-tab-badge-dot"${item.badgeColor ? ` style="background:${esc(item.badgeColor)}"` : ''}></span>`;
      } else {
        html += `<span class="tx-bottom-tab-badge"${item.badgeColor ? ` style="background:${esc(item.badgeColor)}"` : ''}>${esc(item.badge)}</span>`;
      }
    }
    html += '</span>';

    html += `<span class="tx-bottom-tab-label">${esc(item.label)}</span>`;
    html += '</button>';
  }
  html += '</div>';

  html += '</div>';

  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;
  const bar = container.querySelector('.tx-bottom-tabs-bar') as HTMLElement;

  // --- Activate logic ---

  function activate(tabId: string): void {
    if (tabId === activeId) return;

    // Deactivate old
    container.querySelector('.tx-btab-active')?.classList.remove('tx-btab-active');
    container.querySelector('.tx-btabs-panel-active')?.classList.remove('tx-btabs-panel-active');

    // Activate new
    const newBtn = bar.querySelector(`.tx-bottom-tab[data-tab="${tabId}"]`) as HTMLElement | null;
    const newPanel = container.querySelector(`.tx-bottom-tabs-panel[data-tab="${tabId}"]`) as HTMLElement | null;

    if (newBtn) newBtn.classList.add('tx-btab-active');
    if (newPanel) {
      newPanel.classList.add('tx-btabs-panel-active');

      // Lazy-load xhtmlx source if not yet triggered
      const xhEl = newPanel.querySelector('[xh-trigger="none"]') as HTMLElement | null;
      if (xhEl) {
        xhEl.setAttribute('xh-trigger', 'load');
        if (typeof (window as any).xhtmlx !== 'undefined') {
          (window as any).xhtmlx.process(xhEl);
        }
      }
    }

    activeId = tabId;
    options.onChange?.(tabId);
    emit('bottom-tabs:change', { id, tabId });
  }

  // --- Event listeners ---

  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.tx-bottom-tab:not(.tx-btab-disabled)') as HTMLElement | null;
    if (!btn) return;
    const tabId = btn.getAttribute('data-tab');
    if (tabId) activate(tabId);
  });

  // --- Instance ---

  const instance: BottomTabsInstance = {
    el: container,

    activate,

    activeTab(): string {
      return activeId;
    },

    setBadge(tabId: string, badge: string): void {
      const btn = bar.querySelector(`.tx-bottom-tab[data-tab="${tabId}"]`) as HTMLElement | null;
      if (!btn) return;
      const iconWrap = btn.querySelector('.tx-bottom-tab-icon') as HTMLElement;
      if (!iconWrap) return;

      // Remove existing badge
      const existing = iconWrap.querySelector('.tx-bottom-tab-badge');
      if (existing) existing.remove();

      if (!badge) return;

      if (badge === 'dot') {
        iconWrap.insertAdjacentHTML('beforeend', '<span class="tx-bottom-tab-badge tx-bottom-tab-badge-dot"></span>');
      } else {
        iconWrap.insertAdjacentHTML('beforeend', `<span class="tx-bottom-tab-badge">${esc(badge)}</span>`);
      }
    },

    destroy(): void {
      el.innerHTML = '';
    },
  };

  return instance;
}

// ----------------------------------------------------------
//  Declarative registration
// ----------------------------------------------------------
registerWidget('bottom-tabs', (el, opts) =>
  bottomTabs(el, opts as unknown as BottomTabsOptions),
);

export default bottomTabs;
