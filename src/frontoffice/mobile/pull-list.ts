// ============================================================
// Teryx — Mobile Pull List
// (Pull-to-refresh, infinite scroll, grouped items, swipe actions)
// ============================================================
//
// A touch-optimised list component designed for mobile viewports.
// Renders items from a remote JSON source via xhtmlx, with built-in
// pull-to-refresh, progressive infinite-scroll loading, optional
// section grouping, and per-row left/right swipe actions.
//
// Usage:
//   pullList('#feed', {
//     source: '/api/messages',
//     itemTemplate: '<div class="msg">{{title}}</div>',
//     pullToRefresh: true,
//     infiniteScroll: true,
//     groups: { field: 'category' },
//     swipeActions: {
//       right: [{ label: 'Delete', icon: 'trash', color: '#ef4444', handler: (item) => {} }],
//     },
//   });

import { uid, esc, cls, icon, resolveTarget, throttle, createElement } from '../../utils';
import { registerWidget, emit } from '../../core';
import type { WidgetInstance } from '../../types';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface PullListSwipeAction {
  /** Visible label. */
  label: string;
  /** Teryx icon name. */
  icon?: string;
  /** Background colour for the action strip. */
  color?: string;
  /** Called with the data item when tapped. */
  handler?: (item: Record<string, unknown>) => void;
}

export interface PullListGroupConfig {
  /** JSON field used to group items. */
  field: string;
  /** Optional header template — receives the group key as `{{key}}`. */
  headerTemplate?: string;
  /** Whether group sections are collapsible (default false). */
  collapsible?: boolean;
}

export interface PullListOptions {
  /** API endpoint that returns JSON. */
  source: string;
  /** xhtmlx-style template for a single item row. */
  itemTemplate: string;
  /** JSON field containing the array of items (default "items"). */
  itemsField?: string;
  /** JSON field containing the total count for infinite scroll. */
  totalField?: string;
  /** Enable pull-to-refresh (default true). */
  pullToRefresh?: boolean;
  /** Enable infinite scroll (default false). */
  infiniteScroll?: boolean;
  /** Items per page for infinite scroll (default 20). */
  pageSize?: number;
  /** Query param name for page (default "page"). */
  pageParam?: string;
  /** Query param name for page size (default "pageSize"). */
  pageSizeParam?: string;
  /** Grouping configuration. */
  groups?: PullListGroupConfig;
  /** Swipe actions exposed on each row. */
  swipeActions?: {
    left?: PullListSwipeAction[];
    right?: PullListSwipeAction[];
  };
  /** Empty-state message. */
  emptyMessage?: string;
  /** Extra CSS class on the root element. */
  class?: string;
  /** Widget id. */
  id?: string;
  /** Called after data loads/reloads. */
  onLoad?: (items: unknown[]) => void;
  /** Called when an item row is tapped. */
  onItemTap?: (item: Record<string, unknown>, el: HTMLElement) => void;
}

export interface PullListInstance extends WidgetInstance {
  /** Force a full reload (re-fetch page 1). */
  reload(): void;
  /** Load the next page (if infinite scroll is enabled). */
  loadMore(): void;
  /** Return the currently loaded items. */
  getItems(): Record<string, unknown>[];
}

// ----------------------------------------------------------
//  CSS (injected once)
// ----------------------------------------------------------
const STYLE_ID = 'tx-pull-list-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* Container */
.tx-pull-list {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--tx-pull-list-bg, #f8f9fa);
}

/* Pull-to-refresh indicator */
.tx-pull-list-ptr {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 0;
  overflow: hidden;
  transition: height 200ms ease;
  background: var(--tx-pull-list-bg, #f8f9fa);
  z-index: 5;
}
.tx-pull-list-ptr-spinner {
  animation: tx-ptr-spin 0.8s linear infinite;
}
@keyframes tx-ptr-spin {
  to { transform: rotate(360deg); }
}
.tx-pull-list-ptr-text {
  font-size: 13px;
  color: #6b7280;
  margin-left: 8px;
}

/* Items wrapper */
.tx-pull-list-items {
  position: relative;
}

/* Single item row */
.tx-pull-list-item {
  position: relative;
  overflow: hidden;
  background: var(--tx-pull-list-item-bg, #ffffff);
  border-bottom: 1px solid var(--tx-pull-list-divider, #e5e7eb);
  min-height: 44px;
  display: flex;
  align-items: stretch;
}
.tx-pull-list-item:active {
  background: var(--tx-pull-list-item-active, #f3f4f6);
}

/* Item content (the user template lives here) */
.tx-pull-list-item-content {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  transition: transform 200ms ease;
  background: inherit;
  z-index: 2;
  display: flex;
  align-items: center;
}

/* Swipe action strips behind the item */
.tx-pull-list-swipe-strip {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  z-index: 1;
}
.tx-pull-list-swipe-strip-left {
  left: 0;
}
.tx-pull-list-swipe-strip-right {
  right: 0;
}
.tx-pull-list-swipe-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 0 12px;
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  gap: 2px;
  font-family: inherit;
}
.tx-pull-list-swipe-btn svg {
  width: 20px;
  height: 20px;
}

/* Group header */
.tx-pull-list-group-header {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tx-pull-list-group-color, #6b7280);
  background: var(--tx-pull-list-group-bg, #f3f4f6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--tx-pull-list-divider, #e5e7eb);
  min-height: 32px;
  display: flex;
  align-items: center;
  cursor: default;
}
.tx-pull-list-group-header.tx-pull-list-group-collapsible {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.tx-pull-list-group-header.tx-pull-list-group-collapsible::after {
  content: '';
  margin-left: auto;
  border: solid var(--tx-pull-list-group-color, #6b7280);
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: transform 200ms ease;
}
.tx-pull-list-group-header.tx-pull-list-group-collapsed::after {
  transform: rotate(-45deg);
}
.tx-pull-list-group-items.tx-pull-list-group-collapsed {
  display: none;
}

/* Infinite scroll sentinel */
.tx-pull-list-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  min-height: 44px;
}
.tx-pull-list-sentinel-spinner svg {
  animation: tx-ptr-spin 0.8s linear infinite;
}

/* Empty state */
.tx-pull-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  color: #9ca3af;
}
.tx-pull-list-empty-icon svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
}
.tx-pull-list-empty-text {
  font-size: 15px;
}
`;
  document.head.appendChild(style);
}

// ----------------------------------------------------------
//  Widget implementation
// ----------------------------------------------------------

export function pullList(
  target: string | HTMLElement,
  options: PullListOptions,
): PullListInstance {
  injectStyles();

  const el = resolveTarget(target);
  const widgetId = options.id || uid('tx-pull-list');
  const itemsField = options.itemsField || 'items';
  const totalField = options.totalField || 'total';
  const ptrEnabled = options.pullToRefresh !== false;
  const infiniteEnabled = options.infiniteScroll === true;
  const pageSize = options.pageSize || 20;
  const pageParam = options.pageParam || 'page';
  const pageSizeParam = options.pageSizeParam || 'pageSize';

  // State ----
  let items: Record<string, unknown>[] = [];
  let currentPage = 1;
  let totalItems = Infinity;
  let loading = false;
  let refreshing = false;

  // Build shell ----
  const container = createElement(
    `<div class="${cls('tx-pull-list', options.class)}" id="${esc(widgetId)}">` +
      (ptrEnabled
        ? `<div class="tx-pull-list-ptr">
             <span class="tx-pull-list-ptr-spinner">${icon('refresh', 18)}</span>
             <span class="tx-pull-list-ptr-text">Pull to refresh</span>
           </div>`
        : '') +
      `<div class="tx-pull-list-items"></div>` +
      (infiniteEnabled
        ? `<div class="tx-pull-list-sentinel" style="display:none">
             <span class="tx-pull-list-sentinel-spinner">${icon('spinner', 20)}</span>
           </div>`
        : '') +
    `</div>`,
  );
  el.innerHTML = '';
  el.appendChild(container);

  const listBody = container.querySelector('.tx-pull-list-items') as HTMLElement;
  const ptrEl = container.querySelector('.tx-pull-list-ptr') as HTMLElement | null;
  const sentinelEl = container.querySelector('.tx-pull-list-sentinel') as HTMLElement | null;

  // --- Data fetching ---

  function buildUrl(page: number): string {
    const sep = options.source.includes('?') ? '&' : '?';
    return `${options.source}${sep}${encodeURIComponent(pageParam)}=${page}&${encodeURIComponent(pageSizeParam)}=${pageSize}`;
  }

  async function fetchData(page: number, append: boolean): Promise<void> {
    if (loading) return;
    loading = true;

    try {
      const resp = await fetch(buildUrl(page));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      const newItems: Record<string, unknown>[] = json[itemsField] ?? [];
      totalItems = json[totalField] ?? Infinity;

      if (append) {
        items = items.concat(newItems);
      } else {
        items = newItems;
      }

      currentPage = page;
      render();
      options.onLoad?.(items);
      emit('pull-list:load', { id: widgetId, page, items });
    } catch (err) {
      console.error('Teryx pull-list: fetch error', err);
    } finally {
      loading = false;
    }
  }

  // --- Rendering ---

  function renderSwipeStrip(side: 'left' | 'right', actions: PullListSwipeAction[]): string {
    let h = `<div class="tx-pull-list-swipe-strip tx-pull-list-swipe-strip-${side}">`;
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i];
      h += `<button class="tx-pull-list-swipe-btn" style="background:${esc(a.color || '#007aff')}" data-swipe-side="${side}" data-swipe-index="${i}">`;
      if (a.icon) h += icon(a.icon, 20);
      h += `<span>${esc(a.label)}</span>`;
      h += '</button>';
    }
    h += '</div>';
    return h;
  }

  function renderItem(item: Record<string, unknown>, idx: number): string {
    // Interpolate the template with item fields
    let rendered = options.itemTemplate.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => {
      const val = item[key];
      return val !== undefined && val !== null ? esc(String(val)) : '';
    });

    const hasLeft = options.swipeActions?.left && options.swipeActions.left.length > 0;
    const hasRight = options.swipeActions?.right && options.swipeActions.right.length > 0;

    let h = `<div class="tx-pull-list-item" data-item-index="${idx}">`;
    if (hasLeft) h += renderSwipeStrip('left', options.swipeActions!.left!);
    if (hasRight) h += renderSwipeStrip('right', options.swipeActions!.right!);
    h += `<div class="tx-pull-list-item-content">${rendered}</div>`;
    h += '</div>';
    return h;
  }

  function render(): void {
    if (items.length === 0) {
      listBody.innerHTML =
        `<div class="tx-pull-list-empty">` +
        `<div class="tx-pull-list-empty-icon">${icon('file', 40)}</div>` +
        `<div class="tx-pull-list-empty-text">${esc(options.emptyMessage || 'No items')}</div>` +
        `</div>`;
      if (sentinelEl) sentinelEl.style.display = 'none';
      return;
    }

    let html = '';

    if (options.groups) {
      const grouped = new Map<string, { items: Record<string, unknown>[]; indices: number[] }>();
      items.forEach((item, idx) => {
        const key = String(item[options.groups!.field] ?? '');
        if (!grouped.has(key)) grouped.set(key, { items: [], indices: [] });
        grouped.get(key)!.items.push(item);
        grouped.get(key)!.indices.push(idx);
      });

      for (const [key, group] of grouped) {
        const headerContent = options.groups.headerTemplate
          ? options.groups.headerTemplate.replace(/\{\{key\}\}/g, esc(key))
          : esc(key);
        const collapsible = options.groups.collapsible === true;

        html += `<div class="tx-pull-list-group" data-group="${esc(key)}">`;
        html += `<div class="${cls('tx-pull-list-group-header', collapsible && 'tx-pull-list-group-collapsible')}">${headerContent}</div>`;
        html += '<div class="tx-pull-list-group-items">';
        group.items.forEach((item, gi) => {
          html += renderItem(item, group.indices[gi]);
        });
        html += '</div></div>';
      }
    } else {
      items.forEach((item, idx) => {
        html += renderItem(item, idx);
      });
    }

    listBody.innerHTML = html;

    // Infinite-scroll sentinel visibility
    if (sentinelEl) {
      sentinelEl.style.display = items.length < totalItems ? '' : 'none';
    }

    // Attach swipe gesture listeners after render
    attachSwipeListeners();
  }

  // --- Swipe gesture ---

  function attachSwipeListeners(): void {
    const hasSwipe = options.swipeActions &&
      ((options.swipeActions.left && options.swipeActions.left.length > 0) ||
       (options.swipeActions.right && options.swipeActions.right.length > 0));
    if (!hasSwipe) return;

    const leftActions = options.swipeActions?.left ?? [];
    const rightActions = options.swipeActions?.right ?? [];

    listBody.querySelectorAll<HTMLElement>('.tx-pull-list-item').forEach((row) => {
      const contentEl = row.querySelector('.tx-pull-list-item-content') as HTMLElement;
      if (!contentEl) return;

      let startX = 0;
      let currentX = 0;
      let swiping = false;
      const maxSwipe = 72 * Math.max(leftActions.length, rightActions.length, 1);

      contentEl.addEventListener('touchstart', (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        swiping = true;
        contentEl.style.transition = 'none';
      }, { passive: true });

      contentEl.addEventListener('touchmove', (e: TouchEvent) => {
        if (!swiping) return;
        const dx = e.touches[0].clientX - startX;
        // Clamp: left-actions reveal on right-swipe (dx>0), right-actions on left-swipe (dx<0)
        if (dx > 0 && leftActions.length === 0) return;
        if (dx < 0 && rightActions.length === 0) return;
        currentX = Math.max(-maxSwipe, Math.min(maxSwipe, dx));
        contentEl.style.transform = `translateX(${currentX}px)`;
      }, { passive: true });

      contentEl.addEventListener('touchend', () => {
        swiping = false;
        contentEl.style.transition = 'transform 200ms ease';
        // Snap: if dragged more than half the action width, stay open; otherwise close
        const threshold = 36;
        if (Math.abs(currentX) > threshold) {
          const snap = currentX > 0
            ? 72 * leftActions.length
            : -(72 * rightActions.length);
          contentEl.style.transform = `translateX(${snap}px)`;
        } else {
          contentEl.style.transform = 'translateX(0)';
        }
        currentX = 0;
      }, { passive: true });
    });

    // Action button taps
    listBody.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.tx-pull-list-swipe-btn') as HTMLElement | null;
      if (!btn) return;

      const row = btn.closest('.tx-pull-list-item') as HTMLElement;
      const itemIdx = parseInt(row?.getAttribute('data-item-index') || '', 10);
      const side = btn.getAttribute('data-swipe-side') as 'left' | 'right';
      const swipeIdx = parseInt(btn.getAttribute('data-swipe-index') || '', 10);
      const actions = side === 'left' ? leftActions : rightActions;
      const action = actions[swipeIdx];
      const item = items[itemIdx];

      if (action && item) {
        action.handler?.(item);
        // Reset swipe position
        const contentEl = row.querySelector('.tx-pull-list-item-content') as HTMLElement;
        if (contentEl) {
          contentEl.style.transition = 'transform 200ms ease';
          contentEl.style.transform = 'translateX(0)';
        }
      }
    });
  }

  // --- Item tap ---
  listBody.addEventListener('click', (e) => {
    if (!options.onItemTap) return;
    const itemEl = (e.target as HTMLElement).closest('.tx-pull-list-item') as HTMLElement | null;
    if (!itemEl) return;
    // Ignore if a swipe button was tapped
    if ((e.target as HTMLElement).closest('.tx-pull-list-swipe-btn')) return;
    const idx = parseInt(itemEl.getAttribute('data-item-index') || '', 10);
    const item = items[idx];
    if (item) options.onItemTap(item, itemEl);
  });

  // --- Group collapse ---
  if (options.groups?.collapsible) {
    listBody.addEventListener('click', (e) => {
      const header = (e.target as HTMLElement).closest('.tx-pull-list-group-collapsible') as HTMLElement | null;
      if (!header) return;
      header.classList.toggle('tx-pull-list-group-collapsed');
      const groupItems = header.nextElementSibling as HTMLElement;
      if (groupItems) groupItems.classList.toggle('tx-pull-list-group-collapsed');
    });
  }

  // --- Pull-to-refresh ---
  if (ptrEnabled && ptrEl) {
    let ptrStartY = 0;
    let ptrDelta = 0;
    let ptrActive = false;

    container.addEventListener('touchstart', (e: TouchEvent) => {
      if (container.scrollTop > 0 || refreshing || loading) return;
      ptrStartY = e.touches[0].clientY;
      ptrActive = true;
    }, { passive: true });

    container.addEventListener('touchmove', (e: TouchEvent) => {
      if (!ptrActive) return;
      ptrDelta = Math.max(0, e.touches[0].clientY - ptrStartY);
      const displayHeight = Math.min(ptrDelta * 0.5, 60);
      ptrEl!.style.height = `${displayHeight}px`;

      const textEl = ptrEl!.querySelector('.tx-pull-list-ptr-text') as HTMLElement;
      if (textEl) {
        textEl.textContent = displayHeight >= 50 ? 'Release to refresh' : 'Pull to refresh';
      }
    }, { passive: true });

    container.addEventListener('touchend', async () => {
      if (!ptrActive) return;
      ptrActive = false;
      const reached = ptrDelta * 0.5 >= 50;

      if (reached && !refreshing) {
        refreshing = true;
        const textEl = ptrEl!.querySelector('.tx-pull-list-ptr-text') as HTMLElement;
        if (textEl) textEl.textContent = 'Refreshing...';
        ptrEl!.style.height = '50px';

        await fetchData(1, false);

        refreshing = false;
        emit('pull-list:refresh', { id: widgetId });
      }

      ptrEl!.style.height = '0';
      ptrDelta = 0;
    }, { passive: true });
  }

  // --- Infinite scroll ---
  if (infiniteEnabled) {
    const scrollHandler = throttle(() => {
      if (loading || items.length >= totalItems) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        instance.loadMore();
      }
    }, 200);

    container.addEventListener('scroll', scrollHandler, { passive: true });
  }

  // --- Public API ---
  const instance: PullListInstance = {
    el: container,

    reload(): void {
      currentPage = 1;
      totalItems = Infinity;
      fetchData(1, false);
    },

    loadMore(): void {
      if (loading || items.length >= totalItems) return;
      fetchData(currentPage + 1, true);
    },

    getItems(): Record<string, unknown>[] {
      return items.slice();
    },

    destroy(): void {
      el.innerHTML = '';
    },
  };

  // Initial load
  fetchData(1, false);

  return instance;
}

// ----------------------------------------------------------
//  Declarative registration
// ----------------------------------------------------------
registerWidget('pull-list', (el, opts) =>
  pullList(el, opts as unknown as PullListOptions),
);

export default pullList;
