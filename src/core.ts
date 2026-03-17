// ============================================================
// Teryx — Core Framework
// ============================================================

import type { TeryxConfig } from './types';

const defaults: TeryxConfig = {
  prefix: 'tx',
  autoInit: true,
  toastPosition: 'top-right',
  toastDuration: 5000,
  debug: false,
};

export const config: TeryxConfig = { ...defaults };

/** Merge user config into global config. */
export function configure(opts: Partial<TeryxConfig>): void {
  Object.assign(config, opts);
}

// ----------------------------------------------------------
//  Widget registry (for declarative data-tx-widget usage)
// ----------------------------------------------------------
type WidgetFactory = (el: HTMLElement, options: Record<string, unknown>) => unknown;

const registry = new Map<string, WidgetFactory>();

/** Register a widget factory for declarative discovery. */
export function registerWidget(name: string, factory: WidgetFactory): void {
  registry.set(name, factory);
}

// ----------------------------------------------------------
//  Declarative child-element → options mapping
//
//  <tx-column field="name" label="Name" sortable>  →  columns: [{ field, label, sortable:true }]
//  <tx-field name="email" type="email" required>   →  fields:  [{ name, type, required:true }]
//  <tx-tab title="Users">Content</tx-tab>          →  items:   [{ title, content:'Content' }]
// ----------------------------------------------------------

/** Map of child tag name → parent options key. */
const childTagMap: Record<string, string> = {
  'tx-column': 'columns',
  'tx-col': 'columns',
  'tx-field': 'fields',
  'tx-tab': 'items',
  'tx-item': 'items',
  'tx-step': 'items',
  'tx-slide': 'slides',
  'tx-tier': 'tiers',
  'tx-quote': 'quotes',
  'tx-node': 'nodes',
  'tx-button': 'buttons',
  'tx-action': 'items',
  'tx-nav-item': 'items',
  'tx-link': 'links',
  'tx-social': 'social',
  'tx-feature': 'items',
  'tx-event': 'events',
  'tx-series': 'series',
  'tx-segment': 'segments',
  'tx-option': 'options',
  'tx-toolbar': 'toolbar',
  'tx-tool': 'tools',
  'tx-menu-item': 'contextMenu',
};

/** Attributes that should be parsed as boolean (true if present, even without value). */
const boolAttrs = new Set([
  'sortable',
  'required',
  'disabled',
  'readonly',
  'hidden',
  'checked',
  'multiple',
  'closable',
  'active',
  'open',
  'expanded',
  'leaf',
  'collapsible',
  'collapsed',
  'recommended',
  'included',
  'searchable',
  'paginated',
  'striped',
  'hoverable',
  'bordered',
  'compact',
  'selectable',
  'filterable',
  'editable',
  'resizable',
  'draggable',
  'sticky',
  'animated',
  'dismissible',
  'pill',
  'outline',
  'block',
  'loading',
  'external',
  'section',
  'divider',
  'allDay',
]);

/** Parse all attributes of an element into a plain object. */
function parseElementAttrs(el: Element): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const a of Array.from(el.attributes)) {
    const key = a.name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

    // Boolean attribute (present without value, or value="true"/"false")
    if (boolAttrs.has(key) || boolAttrs.has(a.name)) {
      obj[key] = a.value === '' || a.value === 'true';
      continue;
    }

    // Try JSON parse (for arrays/objects like options='[...]')
    if (a.value.startsWith('[') || a.value.startsWith('{')) {
      try {
        obj[key] = JSON.parse(a.value);
        continue;
      } catch {
        /* fall through */
      }
    }

    // Try numeric
    if (a.value !== '' && !isNaN(Number(a.value))) {
      obj[key] = Number(a.value);
      continue;
    }

    obj[key] = a.value;
  }
  return obj;
}

/** Recursively parse tx-* child elements into option arrays. */
function parseChildren(el: HTMLElement): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {};
  let idCounter = 0;

  for (const child of Array.from(el.children)) {
    const tag = child.tagName.toLowerCase();
    const optKey = childTagMap[tag];
    if (!optKey) continue;

    const childOpts = parseElementAttrs(child);

    // Auto-generate id if missing (for tabs, steps, accordion items, etc.)
    if (!childOpts['id'] && ['items', 'tiers', 'nodes'].includes(optKey)) {
      childOpts['id'] = `_auto_${++idCounter}`;
    }

    // Capture innerHTML as `content` (for tabs, accordion, steps, cards)
    // Only if the child has actual content and no `content` attribute
    const innerContent = child.innerHTML.trim();
    if (innerContent && !childOpts['content']) {
      // Check if inner content is just more tx-* children (don't treat as content)
      const hasOnlyTxChildren = Array.from(child.children).every((c) => c.tagName.toLowerCase().startsWith('tx-'));
      if (!hasOnlyTxChildren || child.children.length === 0) {
        childOpts['content'] = innerContent;
      }
    }

    // Recursively parse nested tx-* children (e.g. sidebar items with children, footer cols with links)
    const nested = parseChildren(child as HTMLElement);
    for (const [nKey, nVal] of Object.entries(nested)) {
      childOpts[nKey] = nVal;
    }

    if (!result[optKey]) result[optKey] = [];
    result[optKey].push(childOpts);
  }

  return result;
}

/** Parse data-tx-* attributes into an options object. */
function parseDataAttrs(el: HTMLElement): Record<string, unknown> {
  const opts: Record<string, unknown> = {};
  for (const a of Array.from(el.attributes)) {
    if (a.name.startsWith('data-tx-') && a.name !== 'data-tx-widget' && a.name !== 'data-tx-initialized') {
      const key = a.name.slice(8).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

      // Boolean
      if (boolAttrs.has(key)) {
        opts[key] = a.value === '' || a.value === 'true';
        continue;
      }

      // JSON
      try {
        opts[key] = JSON.parse(a.value);
        continue;
      } catch {
        /* not JSON */
      }

      // Numeric
      if (a.value !== '' && !isNaN(Number(a.value))) {
        opts[key] = Number(a.value);
        continue;
      }

      opts[key] = a.value;
    }
  }
  return opts;
}

/** Discover and instantiate all declarative widgets inside root. */
export function initWidgets(root: HTMLElement | Document = document): void {
  const elements = root.querySelectorAll<HTMLElement>('[data-tx-widget]');
  elements.forEach((el) => {
    if (el.hasAttribute('data-tx-initialized')) return;
    const name = el.getAttribute('data-tx-widget')!;
    const factory = registry.get(name);
    if (!factory) {
      if (config.debug) console.warn(`Teryx: unknown widget "${name}"`);
      return;
    }

    // Merge: data-tx-* attributes + child element parsing
    const attrOpts = parseDataAttrs(el);
    const childOpts = parseChildren(el);
    const merged = { ...attrOpts, ...childOpts };

    factory(el, merged);
    el.setAttribute('data-tx-initialized', '');
  });
}

// ----------------------------------------------------------
//  Event bus (lightweight pub/sub)
// ----------------------------------------------------------
type Handler = (...args: unknown[]) => void;
const bus = new Map<string, Set<Handler>>();

export function on(event: string, handler: Handler): void {
  if (!bus.has(event)) bus.set(event, new Set());
  bus.get(event)!.add(handler);
}

export function off(event: string, handler: Handler): void {
  bus.get(event)?.delete(handler);
}

export function emit(event: string, ...args: unknown[]): void {
  bus.get(event)?.forEach((h) => {
    try {
      h(...args);
    } catch (e) {
      console.error(`Teryx event "${event}" handler error:`, e);
    }
  });
}

// ----------------------------------------------------------
//  Auto-init on DOMContentLoaded + MutationObserver
// ----------------------------------------------------------
if (typeof document !== 'undefined') {
  const run = () => {
    if (config.autoInit) initWidgets();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  const observer = new MutationObserver((mutations) => {
    if (!config.autoInit) return;
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (node instanceof HTMLElement) {
          if (node.hasAttribute('data-tx-widget') || node.querySelector('[data-tx-widget]')) {
            initWidgets(node.parentElement || document);
          }
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
