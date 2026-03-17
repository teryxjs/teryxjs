// ============================================================
// Teryx — Property Grid (Sencha-style PropertyGrid)
// ============================================================

import type { DescriptionsOptions, DescriptionItem, WidgetInstance } from '../types';
import { uid, esc, cls, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export interface PropertyGridOptions {
  properties: PropertyItem[];
  source?: string;
  editable?: boolean;
  grouped?: boolean;
  class?: string;
  id?: string;
  nameWidth?: string;
  onChange?: (name: string, value: unknown) => void;
}

export interface PropertyItem {
  name: string;
  value: unknown;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'color' | 'select';
  label?: string;
  group?: string;
  readonly?: boolean;
  options?: { label: string; value: string }[];
}

export function propertyGrid(target: string | HTMLElement, options: PropertyGridOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-propgrid');
  const editable = options.editable ?? false;
  const nameWidth = options.nameWidth || '40%';

  function render(): void {
    let html = `<div class="${cls('tx-propgrid', options.class)}" id="${esc(id)}">`;

    if (options.source) {
      html += `<div xh-get="${esc(options.source)}" xh-trigger="load">`;
      html += `<template>`;
      html += `<table class="tx-table tx-table-bordered tx-propgrid-table">`;
      html += `<tbody><tr xh-each="properties">`;
      html += `<td class="tx-propgrid-name" style="width:${esc(nameWidth)}" xh-text="label"></td>`;
      html += `<td class="tx-propgrid-value" xh-text="value"></td>`;
      html += `</tr></tbody></table>`;
      html += `</template>`;
      html += `</div>`;
    } else {
      const groups = groupProperties(options.properties);

      html += `<table class="tx-table tx-table-bordered tx-propgrid-table">`;

      for (const [groupName, items] of groups) {
        if (groupName && groupName !== '__default' && options.grouped) {
          html += `<tbody class="tx-propgrid-group">`;
          html += `<tr class="tx-propgrid-group-header"><td colspan="2"><strong>${esc(groupName)}</strong></td></tr>`;
        } else {
          html += `<tbody>`;
        }

        for (const item of items) {
          html += `<tr class="tx-propgrid-row" data-prop="${esc(item.name)}">`;
          html += `<td class="tx-propgrid-name" style="width:${esc(nameWidth)}">${esc(item.label || item.name)}</td>`;
          html += `<td class="tx-propgrid-value">`;

          if (editable && !item.readonly) {
            html += renderEditor(item, id);
          } else {
            html += renderValue(item);
          }

          html += `</td></tr>`;
        }

        html += `</tbody>`;
      }

      html += `</table>`;
    }

    html += `</div>`;
    el.innerHTML = html;

    // Attach change handlers for editable mode
    if (editable) {
      const container = el.querySelector(`#${id}`)!;
      container.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        const row = input.closest('[data-prop]') as HTMLElement;
        if (!row) return;
        const propName = row.getAttribute('data-prop')!;
        const item = options.properties.find((p) => p.name === propName);
        if (!item) return;

        let value: unknown;
        if (item.type === 'boolean') {
          value = input.checked;
        } else if (item.type === 'number') {
          value = parseFloat(input.value);
        } else {
          value = input.value;
        }

        item.value = value;
        options.onChange?.(propName, value);
        emit('propertygrid:change', { id, name: propName, value });
      });
    }
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
  };
}

function renderValue(item: PropertyItem): string {
  const val = item.value;
  if (item.type === 'boolean') {
    return val ? '<span class="tx-text-success">true</span>' : '<span class="tx-text-muted">false</span>';
  }
  if (item.type === 'color' && typeof val === 'string') {
    return `<span class="tx-propgrid-color" style="background:${esc(val)}"></span> ${esc(val)}`;
  }
  return esc(String(val ?? ''));
}

function renderEditor(item: PropertyItem, _formId: string): string {
  const val = item.value;

  switch (item.type) {
    case 'boolean':
      return `<input type="checkbox" class="tx-checkbox"${val ? ' checked' : ''}>`;
    case 'number':
      return `<input type="number" class="tx-input tx-input-sm" value="${esc(String(val ?? ''))}">`;
    case 'date':
      return `<input type="date" class="tx-input tx-input-sm" value="${esc(String(val ?? ''))}">`;
    case 'color':
      return `<input type="color" class="tx-propgrid-color-input" value="${esc(String(val ?? '#000000'))}">`;
    case 'select':
      let h = '<select class="tx-select tx-select-sm">';
      if (item.options) {
        for (const o of item.options) {
          h += `<option value="${esc(o.value)}"${String(val) === o.value ? ' selected' : ''}>${esc(o.label)}</option>`;
        }
      }
      h += '</select>';
      return h;
    default:
      return `<input type="text" class="tx-input tx-input-sm" value="${esc(String(val ?? ''))}">`;
  }
}

function groupProperties(props: PropertyItem[]): Map<string, PropertyItem[]> {
  const map = new Map<string, PropertyItem[]>();
  for (const p of props) {
    const group = p.group || '__default';
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(p);
  }
  return map;
}

/** Descriptions widget — a read-only property grid variant. */
export function descriptions(target: string | HTMLElement, options: DescriptionsOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-desc');
  const columns = options.columns || 2;
  const bordered = options.bordered !== false;
  const size = options.size || 'md';

  let html = `<div class="${cls('tx-descriptions', `tx-descriptions-${size}`, bordered && 'tx-descriptions-bordered', options.class)}" id="${esc(id)}">`;

  if (options.title) {
    html += `<div class="tx-descriptions-header">${esc(options.title)}</div>`;
  }

  if (options.source) {
    html += `<div xh-get="${esc(options.source)}" xh-trigger="load">`;
    html += '<template>';
    html += `<div class="tx-descriptions-body tx-descriptions-cols-${columns}">`;
    html += `<div xh-each="items" class="tx-descriptions-item">`;
    html += `<span class="tx-descriptions-label" xh-text="label"></span>`;
    html += `<span class="tx-descriptions-value" xh-text="value"></span>`;
    html += `</div></div>`;
    html += '</template></div>';
  } else {
    html += `<div class="tx-descriptions-body tx-descriptions-cols-${columns}">`;
    for (const item of options.items) {
      const colspan = item.colspan ? ` style="grid-column:span ${item.colspan}"` : '';
      html += `<div class="tx-descriptions-item"${colspan}>`;
      html += `<span class="tx-descriptions-label">${esc(item.label)}</span>`;
      html += `<span class="tx-descriptions-value">${esc(item.value || item.field || '')}</span>`;
      html += `</div>`;
    }
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('propertygrid', (el, opts) => propertyGrid(el, opts as unknown as PropertyGridOptions));
registerWidget('descriptions', (el, opts) => descriptions(el, opts as unknown as DescriptionsOptions));

export default propertyGrid;
