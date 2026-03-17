// ============================================================
// Teryx — Pivot Grid Widget
// ============================================================

import type { PivotOptions, WidgetInstance } from '../types';
import { uid, esc, cls, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

type AggFn = 'sum' | 'avg' | 'count' | 'min' | 'max';
type Row = Record<string, unknown>;

export interface PivotInstance extends WidgetInstance {
  refresh(data: Row[]): void;
  getAggregatedData(): Record<string, unknown>[];
}

function aggregate(values: number[], fn: AggFn): number {
  if (values.length === 0) return 0;
  switch (fn) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
  }
}

function groupKey(row: Row, fields: string[]): string {
  return fields.map((f) => String(row[f] ?? '')).join('|||');
}

function uniqueSorted(data: Row[], field: string): string[] {
  const set = new Set<string>();
  for (const row of data) set.add(String(row[field] ?? ''));
  return Array.from(set).sort();
}

interface PivotCell {
  rowKey: string;
  colKey: string;
  values: Map<string, number>;
}

function buildPivot(
  data: Row[],
  rowFields: string[],
  colFields: string[],
  valueFields: { field: string; aggregate: AggFn }[],
): {
  rowKeys: string[];
  colKeys: string[];
  cells: Map<string, PivotCell>;
  rowTotals: Map<string, Map<string, number>>;
  colTotals: Map<string, Map<string, number>>;
  grandTotals: Map<string, number>;
  rowLabels: Map<string, string[]>;
  colLabels: Map<string, string[]>;
} {
  const rowKeySet = new Set<string>();
  const colKeySet = new Set<string>();
  const buckets = new Map<string, Map<string, number[]>>();

  for (const row of data) {
    const rk = groupKey(row, rowFields);
    const ck = colFields.length > 0 ? groupKey(row, colFields) : '__all__';
    rowKeySet.add(rk);
    colKeySet.add(ck);

    const cellKey = `${rk}::${ck}`;
    if (!buckets.has(cellKey)) {
      buckets.set(cellKey, new Map());
    }
    const bucket = buckets.get(cellKey)!;
    for (const vf of valueFields) {
      const val = Number(row[vf.field]) || 0;
      if (!bucket.has(vf.field)) bucket.set(vf.field, []);
      bucket.get(vf.field)!.push(val);
    }
  }

  const rowKeys = Array.from(rowKeySet).sort();
  const colKeys = Array.from(colKeySet).sort();

  const cells = new Map<string, PivotCell>();
  for (const [cellKey, bucket] of buckets) {
    const [rk, ck] = cellKey.split('::');
    const values = new Map<string, number>();
    for (const vf of valueFields) {
      const raw = bucket.get(vf.field) || [];
      values.set(vf.field, aggregate(raw, vf.aggregate));
    }
    cells.set(cellKey, { rowKey: rk, colKey: ck, values });
  }

  // Row totals
  const rowTotals = new Map<string, Map<string, number>>();
  for (const rk of rowKeys) {
    const totals = new Map<string, number>();
    for (const vf of valueFields) {
      const vals: number[] = [];
      for (const ck of colKeys) {
        const cell = cells.get(`${rk}::${ck}`);
        if (cell) vals.push(cell.values.get(vf.field) || 0);
      }
      totals.set(vf.field, aggregate(vals, vf.aggregate === 'avg' ? 'avg' : 'sum'));
    }
    rowTotals.set(rk, totals);
  }

  // Column totals
  const colTotals = new Map<string, Map<string, number>>();
  for (const ck of colKeys) {
    const totals = new Map<string, number>();
    for (const vf of valueFields) {
      const vals: number[] = [];
      for (const rk of rowKeys) {
        const cell = cells.get(`${rk}::${ck}`);
        if (cell) vals.push(cell.values.get(vf.field) || 0);
      }
      totals.set(vf.field, aggregate(vals, vf.aggregate === 'avg' ? 'avg' : 'sum'));
    }
    colTotals.set(ck, totals);
  }

  // Grand totals
  const grandTotals = new Map<string, number>();
  for (const vf of valueFields) {
    const vals: number[] = [];
    for (const rk of rowKeys) {
      const rt = rowTotals.get(rk);
      if (rt) vals.push(rt.get(vf.field) || 0);
    }
    grandTotals.set(vf.field, aggregate(vals, vf.aggregate === 'avg' ? 'avg' : 'sum'));
  }

  // Label maps
  const rowLabels = new Map<string, string[]>();
  for (const rk of rowKeys) {
    rowLabels.set(rk, rk.split('|||'));
  }
  const colLabels = new Map<string, string[]>();
  for (const ck of colKeys) {
    colLabels.set(ck, ck.split('|||'));
  }

  return { rowKeys, colKeys, cells, rowTotals, colTotals, grandTotals, rowLabels, colLabels };
}

function formatNumber(val: number): string {
  return Number.isInteger(val) ? String(val) : val.toFixed(2);
}

export function pivotGrid(target: string | HTMLElement, options: PivotOptions): PivotInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-pivot');
  const rowFields = options.rows;
  const colFields = options.columns;
  const valueFields = options.values;

  let currentData: Row[] = [];
  const collapsed = new Set<string>();

  function render(): void {
    const pivot = buildPivot(currentData, rowFields, colFields, valueFields);
    const hasColFields = colFields.length > 0 && pivot.colKeys[0] !== '__all__';
    const valueCount = valueFields.length;

    let html = `<div class="${cls('tx-pivot', options.class)}" id="${esc(id)}">`;
    html += '<table class="tx-pivot-table">';

    // Header
    html += '<thead>';

    // Column field headers
    if (hasColFields) {
      html += '<tr class="tx-pivot-header">';
      html += `<th class="tx-pivot-corner" colspan="${rowFields.length}"></th>`;
      for (const ck of pivot.colKeys) {
        const labels = pivot.colLabels.get(ck)!;
        html += `<th class="tx-pivot-col-header" colspan="${valueCount}">${labels.map((l) => esc(l)).join(' / ')}</th>`;
      }
      html += `<th class="tx-pivot-total-header" colspan="${valueCount}">Grand Total</th>`;
      html += '</tr>';
    }

    // Value field headers
    html += '<tr class="tx-pivot-header tx-pivot-value-header">';
    for (const rf of rowFields) {
      html += `<th class="tx-pivot-row-field">${esc(rf)}</th>`;
    }
    if (hasColFields) {
      for (const _ck of pivot.colKeys) {
        for (const vf of valueFields) {
          html += `<th class="tx-pivot-value-field">${esc(vf.field)} (${esc(vf.aggregate)})</th>`;
        }
      }
    } else {
      for (const vf of valueFields) {
        html += `<th class="tx-pivot-value-field">${esc(vf.field)} (${esc(vf.aggregate)})</th>`;
      }
    }
    html += `<th class="tx-pivot-value-field tx-pivot-total-col">Total</th>`.repeat(valueCount);
    html += '</tr>';
    html += '</thead>';

    // Body
    html += '<tbody>';

    // Group by first row field for expandable groups
    if (rowFields.length > 1) {
      const firstFieldValues = uniqueSorted(currentData, rowFields[0]);
      for (const groupVal of firstFieldValues) {
        const isCollapsed = collapsed.has(groupVal);
        const groupRows = pivot.rowKeys.filter((rk) => rk.startsWith(groupVal + '|||') || rk === groupVal);

        // Group header row
        html += `<tr class="tx-pivot-group-row" data-group="${esc(groupVal)}">`;
        html += `<td class="tx-pivot-group-cell" colspan="${rowFields.length}">`;
        html += `<span class="tx-pivot-toggle">${isCollapsed ? '&#9654;' : '&#9660;'}</span> `;
        html += `${esc(groupVal)}`;
        html += '</td>';

        // Group subtotals
        const groupSubtotals = new Map<string, Map<string, number>>();
        if (hasColFields) {
          for (const ck of pivot.colKeys) {
            const totals = new Map<string, number>();
            for (const vf of valueFields) {
              const vals: number[] = [];
              for (const rk of groupRows) {
                const cell = pivot.cells.get(`${rk}::${ck}`);
                if (cell) vals.push(cell.values.get(vf.field) || 0);
              }
              totals.set(vf.field, aggregate(vals, vf.aggregate === 'avg' ? 'avg' : 'sum'));
            }
            groupSubtotals.set(ck, totals);
          }
          for (const ck of pivot.colKeys) {
            const totals = groupSubtotals.get(ck)!;
            for (const vf of valueFields) {
              html += `<td class="tx-pivot-cell tx-pivot-subtotal">${formatNumber(totals.get(vf.field) || 0)}</td>`;
            }
          }
        } else {
          for (const vf of valueFields) {
            const vals: number[] = [];
            for (const rk of groupRows) {
              const cell = pivot.cells.get(`${rk}::__all__`);
              if (cell) vals.push(cell.values.get(vf.field) || 0);
            }
            html += `<td class="tx-pivot-cell tx-pivot-subtotal">${formatNumber(aggregate(vals, vf.aggregate === 'avg' ? 'avg' : 'sum'))}</td>`;
          }
        }

        // Group row totals
        for (const vf of valueFields) {
          const vals: number[] = [];
          for (const rk of groupRows) {
            const rt = pivot.rowTotals.get(rk);
            if (rt) vals.push(rt.get(vf.field) || 0);
          }
          html += `<td class="tx-pivot-cell tx-pivot-total">${formatNumber(aggregate(vals, vf.aggregate === 'avg' ? 'avg' : 'sum'))}</td>`;
        }
        html += '</tr>';

        // Detail rows
        if (!isCollapsed) {
          for (const rk of groupRows) {
            html += renderDataRow(rk, pivot, hasColFields);
          }
        }
      }
    } else {
      for (const rk of pivot.rowKeys) {
        html += renderDataRow(rk, pivot, hasColFields);
      }
    }

    html += '</tbody>';

    // Footer — Grand totals
    html += '<tfoot>';
    html += '<tr class="tx-pivot-grand-total-row">';
    html += `<td class="tx-pivot-grand-total-label" colspan="${rowFields.length}">Grand Total</td>`;
    if (hasColFields) {
      for (const ck of pivot.colKeys) {
        const totals = pivot.colTotals.get(ck)!;
        for (const vf of valueFields) {
          html += `<td class="tx-pivot-cell tx-pivot-grand-total">${formatNumber(totals.get(vf.field) || 0)}</td>`;
        }
      }
    } else {
      for (const vf of valueFields) {
        html += `<td class="tx-pivot-cell tx-pivot-grand-total">${formatNumber(pivot.grandTotals.get(vf.field) || 0)}</td>`;
      }
    }
    for (const vf of valueFields) {
      html += `<td class="tx-pivot-cell tx-pivot-grand-total">${formatNumber(pivot.grandTotals.get(vf.field) || 0)}</td>`;
    }
    html += '</tr>';
    html += '</tfoot>';

    html += '</table></div>';
    el.innerHTML = html;

    bindEvents();
  }

  function renderDataRow(rk: string, pivot: ReturnType<typeof buildPivot>, hasColFields: boolean): string {
    const labels = pivot.rowLabels.get(rk)!;
    let html = '<tr class="tx-pivot-data-row">';
    for (const label of labels) {
      html += `<td class="tx-pivot-row-label">${esc(label)}</td>`;
    }

    if (hasColFields) {
      for (const ck of pivot.colKeys) {
        const cell = pivot.cells.get(`${rk}::${ck}`);
        for (const vf of valueFields) {
          const val = cell ? cell.values.get(vf.field) || 0 : 0;
          html += `<td class="tx-pivot-cell">${formatNumber(val)}</td>`;
        }
      }
    } else {
      const cell = pivot.cells.get(`${rk}::__all__`);
      for (const vf of valueFields) {
        const val = cell ? cell.values.get(vf.field) || 0 : 0;
        html += `<td class="tx-pivot-cell">${formatNumber(val)}</td>`;
      }
    }

    // Row total
    const rt = pivot.rowTotals.get(rk);
    for (const vf of valueFields) {
      const val = rt ? rt.get(vf.field) || 0 : 0;
      html += `<td class="tx-pivot-cell tx-pivot-total">${formatNumber(val)}</td>`;
    }
    html += '</tr>';
    return html;
  }

  function bindEvents(): void {
    const root = el.querySelector(`#${id}`) as HTMLElement;
    if (!root) return;

    root.querySelectorAll<HTMLElement>('.tx-pivot-group-row').forEach((row) => {
      row.addEventListener('click', () => {
        const group = row.getAttribute('data-group');
        if (!group) return;
        if (collapsed.has(group)) {
          collapsed.delete(group);
        } else {
          collapsed.add(group);
        }
        render();
        emit('pivot:toggle', { id, group, collapsed: collapsed.has(group) });
      });
    });
  }

  function loadData(data: Row[]): void {
    currentData = data;
    render();
  }

  // If source is a URL, fetch data
  if (options.source.startsWith('[') || options.source.startsWith('{')) {
    // Inline JSON
    try {
      loadData(JSON.parse(options.source));
    } catch {
      el.innerHTML = `<div class="${cls('tx-pivot', options.class)}" id="${esc(id)}"><p class="tx-pivot-empty">Invalid data</p></div>`;
    }
  } else if (options.source.startsWith('/') || options.source.startsWith('http')) {
    el.innerHTML = `<div class="${cls('tx-pivot', options.class)}" id="${esc(id)}"><div class="tx-pivot-loading"><div class="tx-spinner"></div></div></div>`;
    fetch(options.source)
      .then((r) => r.json())
      .then((data) => loadData(Array.isArray(data) ? data : data.data || []))
      .catch(() => {
        el.innerHTML = `<div class="${cls('tx-pivot', options.class)}" id="${esc(id)}"><p class="tx-pivot-empty">Failed to load data</p></div>`;
      });
  } else {
    // Empty state
    render();
  }

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    refresh(data: Row[]) {
      loadData(data);
    },
    getAggregatedData() {
      const pivot = buildPivot(currentData, rowFields, colFields, valueFields);
      const result: Record<string, unknown>[] = [];
      for (const rk of pivot.rowKeys) {
        const labels = pivot.rowLabels.get(rk)!;
        const row: Record<string, unknown> = {};
        rowFields.forEach((f, i) => {
          row[f] = labels[i];
        });
        const rt = pivot.rowTotals.get(rk);
        if (rt) {
          for (const vf of valueFields) {
            row[`${vf.field}_${vf.aggregate}`] = rt.get(vf.field) || 0;
          }
        }
        result.push(row);
      }
      return result;
    },
  };
}

registerWidget('pivot-grid', (el, opts) => pivotGrid(el, opts as unknown as PivotOptions));
export default pivotGrid;
