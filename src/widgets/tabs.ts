// ============================================================
// Teryx — Tabs / TabPanel Widget
// ============================================================

import type { TabsOptions, TabItem, TabsInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function tabs(target: string | HTMLElement, options: TabsOptions): TabsInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-tabs');
  const variant = options.variant || 'tabs';
  const tabPosition = options.tabPosition || 'top';
  const isVertical = options.vertical || tabPosition === 'left' || tabPosition === 'right';

  let html = `<div class="${cls(
    'tx-tabs-container',
    `tx-tabs-${variant}`,
    `tx-tabs-pos-${tabPosition}`,
    isVertical && 'tx-tabs-vertical',
    options.class,
  )}" id="${esc(id)}">`;

  // Tab nav
  html += `<div class="tx-tabs-nav${options.scrollable ? ' tx-tabs-scrollable' : ''}" role="tablist">`;

  if (options.scrollable) {
    html += `<button class="tx-tabs-scroll-btn tx-tabs-scroll-left">${icon('chevronLeft')}</button>`;
  }

  const hasExplicitActive = options.items.some((i) => i.active);

  html += '<div class="tx-tabs-nav-inner">';
  for (let idx = 0; idx < options.items.length; idx++) {
    const item = options.items[idx];
    const isActive = item.active || (!hasExplicitActive && idx === 0);
    html += `<button class="${cls('tx-tab', isActive && 'tx-tab-active', item.disabled && 'tx-tab-disabled')}"`;
    html += ` role="tab"`;
    html += ` id="${esc(id)}-tab-${esc(item.id)}"`;
    html += ` data-tab="${esc(item.id)}"`;
    html += ` aria-selected="${isActive ? 'true' : 'false'}"`;
    html += ` aria-controls="${esc(id)}-panel-${esc(item.id)}"`;
    html += ` tabindex="${isActive ? '0' : '-1'}"`;
    if (item.disabled) html += ' disabled';
    html += '>';
    if (item.icon) html += `<span class="tx-tab-icon">${icon(item.icon)}</span>`;
    html += `<span class="tx-tab-text">${esc(item.title)}</span>`;
    if (item.badge) html += `<span class="tx-badge tx-badge-sm">${esc(item.badge)}</span>`;
    if (item.closable) html += `<span class="tx-tab-close">${icon('x')}</span>`;
    html += '</button>';
  }

  if (options.addable) {
    html += `<button class="tx-tab tx-tab-add" title="Add tab">${icon('plus')}</button>`;
  }
  html += '</div>';

  if (options.scrollable) {
    html += `<button class="tx-tabs-scroll-btn tx-tabs-scroll-right">${icon('chevronRight')}</button>`;
  }

  html += '</div>';

  // Tab panels
  html += '<div class="tx-tabs-content">';
  for (let idx = 0; idx < options.items.length; idx++) {
    const item = options.items[idx];
    const isActive = item.active || (!hasExplicitActive && idx === 0);
    html += `<div class="${cls('tx-tab-panel', isActive && 'tx-tab-panel-active')}"`;
    html += ` role="tabpanel"`;
    html += ` id="${esc(id)}-panel-${esc(item.id)}"`;
    html += ` data-tab="${esc(item.id)}"`;
    html += ` tabindex="0"`;
    html += ` aria-labelledby="${esc(id)}-tab-${esc(item.id)}"`;
    if (!isActive) html += ' aria-hidden="true"';
    html += '>';

    if (item.source) {
      html += `<div xh-get="${esc(item.source)}" xh-trigger="${isActive ? 'load' : 'none'}" xh-indicator="#${esc(id)}-panel-${esc(item.id)}-loading">`;
      html += `<div id="${esc(id)}-panel-${esc(item.id)}-loading" class="xh-indicator tx-loading-pad"><div class="tx-spinner"></div></div>`;
      html += '</div>';
    } else if (item.content) {
      html += item.content;
    }

    html += '</div>';
  }
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;
  let activeTabId = options.items.find((i) => i.active)?.id || options.items[0]?.id || '';

  function activate(tabId: string): void {
    if (tabId === activeTabId) return;

    // Deactivate old
    const oldTab = container.querySelector(`.tx-tab-active`);
    oldTab?.classList.remove('tx-tab-active');
    oldTab?.setAttribute('aria-selected', 'false');
    oldTab?.setAttribute('tabindex', '-1');
    const oldPanel = container.querySelector(`.tx-tab-panel-active`);
    if (oldPanel) {
      oldPanel.classList.remove('tx-tab-panel-active');
      oldPanel.setAttribute('aria-hidden', 'true');
    }

    // Activate new
    const newTab = container.querySelector(`.tx-tab[data-tab="${tabId}"]`);
    const newPanel = container.querySelector(`.tx-tab-panel[data-tab="${tabId}"]`);
    if (newTab) {
      newTab.classList.add('tx-tab-active');
      newTab.setAttribute('aria-selected', 'true');
      newTab.setAttribute('tabindex', '0');
    }
    if (newPanel) {
      newPanel.classList.add('tx-tab-panel-active');
      newPanel.removeAttribute('aria-hidden');

      // Lazy-load: trigger xhtmlx fetch if source panel hasn't been loaded
      const xhEl = newPanel.querySelector('[xh-get][xh-trigger="none"]');
      if (xhEl) {
        xhEl.setAttribute('xh-trigger', 'load');
        if (typeof (window as any).xhtmlx !== 'undefined') {
          (window as any).xhtmlx.process(xhEl as HTMLElement);
        }
      }
    }

    activeTabId = tabId;
    options.onChange?.(tabId);
    emit('tabs:change', { id, tabId });
  }

  // Click handler
  container.addEventListener('click', (e) => {
    // Tab close
    const closeBtn = (e.target as HTMLElement).closest('.tx-tab-close');
    if (closeBtn) {
      e.stopPropagation();
      const tab = closeBtn.closest('.tx-tab') as HTMLElement;
      const tabId = tab?.getAttribute('data-tab');
      if (tabId) {
        if (options.onClose && !options.onClose(tabId)) return;
        instance.removeTab(tabId);
      }
      return;
    }

    // Tab activate
    const tab = (e.target as HTMLElement).closest('.tx-tab:not(.tx-tab-add):not(.tx-tab-disabled)') as HTMLElement;
    if (tab) {
      const tabId = tab.getAttribute('data-tab');
      if (tabId) activate(tabId);
    }

    // Add tab
    const addBtn = (e.target as HTMLElement).closest('.tx-tab-add');
    if (addBtn && options.onAdd) {
      const newTab = options.onAdd();
      if (newTab) instance.addTab(newTab);
    }
  });

  // Keyboard navigation (roving tabindex with arrow keys, Home/End)
  container.addEventListener('keydown', (e) => {
    const tgt = e.target as HTMLElement;
    if (!tgt.classList.contains('tx-tab') || tgt.classList.contains('tx-tab-add')) return;

    const allTabs = Array.from(
      container.querySelectorAll('.tx-tab:not(.tx-tab-add):not(.tx-tab-disabled)'),
    ) as HTMLElement[];
    if (allTabs.length === 0) return;

    const currentIdx = allTabs.indexOf(tgt);
    let nextIdx = -1;

    const forward = isVertical ? 'ArrowDown' : 'ArrowRight';
    const backward = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case forward:
        e.preventDefault();
        nextIdx = (currentIdx + 1) % allTabs.length;
        break;
      case backward:
        e.preventDefault();
        nextIdx = (currentIdx - 1 + allTabs.length) % allTabs.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIdx = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIdx = allTabs.length - 1;
        break;
      default:
        return;
    }

    if (nextIdx >= 0 && nextIdx < allTabs.length) {
      const nextTab = allTabs[nextIdx];
      const nextTabId = nextTab.getAttribute('data-tab');
      if (nextTabId) {
        activate(nextTabId);
        nextTab.focus();
      }
    }
  });

  // Scroll buttons
  if (options.scrollable) {
    const inner = container.querySelector('.tx-tabs-nav-inner') as HTMLElement;
    container.querySelector('.tx-tabs-scroll-left')?.addEventListener('click', () => {
      inner.scrollBy({ left: -200, behavior: 'smooth' });
    });
    container.querySelector('.tx-tabs-scroll-right')?.addEventListener('click', () => {
      inner.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }

  const instance: TabsInstance = {
    el: container,
    destroy() {
      el.innerHTML = '';
    },
    activate,
    activeTab() {
      return activeTabId;
    },
    addTab(item: TabItem) {
      // Add tab button
      const nav = container.querySelector('.tx-tabs-nav-inner');
      const addBtn = nav?.querySelector('.tx-tab-add');
      const tabHtml = `<button class="tx-tab" role="tab" id="${esc(id)}-tab-${esc(item.id)}" data-tab="${esc(item.id)}" aria-selected="false" aria-controls="${esc(id)}-panel-${esc(item.id)}" tabindex="-1">${item.icon ? `<span class="tx-tab-icon">${icon(item.icon)}</span>` : ''}<span class="tx-tab-text">${esc(item.title)}</span>${item.closable ? `<span class="tx-tab-close">${icon('x')}</span>` : ''}</button>`;
      const tabEl = document.createElement('div');
      tabEl.innerHTML = tabHtml;
      const btn = tabEl.firstElementChild!;
      if (addBtn) nav?.insertBefore(btn, addBtn);
      else nav?.appendChild(btn);

      // Add panel
      const content = container.querySelector('.tx-tabs-content');
      const panelHtml = `<div class="tx-tab-panel" role="tabpanel" id="${esc(id)}-panel-${esc(item.id)}" data-tab="${esc(item.id)}" tabindex="0" aria-labelledby="${esc(id)}-tab-${esc(item.id)}" aria-hidden="true">${item.content || ''}</div>`;
      const panelEl = document.createElement('div');
      panelEl.innerHTML = panelHtml;
      content?.appendChild(panelEl.firstElementChild!);

      if (item.active) activate(item.id);
    },
    removeTab(tabId: string) {
      container.querySelector(`.tx-tab[data-tab="${tabId}"]`)?.remove();
      container.querySelector(`.tx-tab-panel[data-tab="${tabId}"]`)?.remove();

      // If active tab was removed, activate first available
      if (tabId === activeTabId) {
        const firstTab = container.querySelector('.tx-tab:not(.tx-tab-add)') as HTMLElement;
        if (firstTab) {
          const newId = firstTab.getAttribute('data-tab');
          if (newId) activate(newId);
        }
      }

      emit('tabs:remove', { id, tabId });
    },
    getTabs() {
      return Array.from(container.querySelectorAll('.tx-tab:not(.tx-tab-add)')).map((t) => t.getAttribute('data-tab')!);
    },
  };

  return instance;
}

registerWidget('tabs', (el, opts) => tabs(el, opts as unknown as TabsOptions));
export default tabs;
