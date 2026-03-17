// ============================================================
// Teryx — Grid / DataTable Widget
// ============================================================

import type { GridOptions, GridColumn, GridInstance, ToolbarItem } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget } from '../core';
import { t } from '../i18n';

export function grid(target: string | HTMLElement, options: GridOptions): GridInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-grid');
  const rowsField = options.rowsField || 'rows';
  const totalField = options.totalField || 'total';
  const sortParam = options.sortParam || 'sort';
  const orderParam = options.orderParam || 'order';
  const searchParam = options.searchParam || 'q';
  const pageParam = options.pageParam || 'page';
  const pageSizeParam = options.pageSizeParam || 'pageSize';
  const pageSize = options.pageSize || 25;
  const visibleCols = options.columns.filter((c) => !c.hidden);

  let html = `<div class="${cls('tx-grid', options.class)}" id="${esc(id)}">`;

  // --- Toolbar ---
  if (options.toolbar || options.searchable || options.columnMenu || options.exportable) {
    html += `<div class="tx-grid-toolbar">`;
    html += renderToolbar(options, id);
    html += `</div>`;
  }

  // --- Table body (xhtmlx-driven) ---
  const triggerParts = [options.trigger || 'load'];
  if (options.searchable) {
    triggerParts.push(`search from:#${esc(id)}-search`);
  }

  html += `<div class="tx-grid-body"${options.maxHeight ? ` style="max-height:${esc(options.maxHeight)};overflow:auto"` : ''}>`;
  html += `<div id="${esc(id)}-data"`;
  html += ` xh-get="${esc(options.source)}"`;
  html += ` xh-trigger="${triggerParts.join(', ')}"`;
  html += ` xh-indicator="#${esc(id)}-loading">`;

  // Inline xhtmlx template
  html += `<template>`;
  html += renderTableTemplate(visibleCols, options, id, rowsField, totalField, pageSize);
  html += `</template>`;

  // Loading indicator
  html += `<div id="${esc(id)}-loading" class="xh-indicator tx-grid-loading">`;
  html += `<div class="tx-spinner"></div>`;
  html += `</div>`;

  html += `</div>`; // #id-data

  // Row drop line indicator
  if (options.reorderable) {
    html += `<div id="${esc(id)}-row-drop-line" class="tx-grid-row-drop-line" style="display:none;"></div>`;
  }

  html += `</div>`; // .tx-grid-body

  html += `</div>`; // .tx-grid

  el.innerHTML = html;

  // --- Post-render: attach sort click handlers ---
  requestAnimationFrame(() => attachSortHandlers(el, id, options));

  // --- Post-render: attach row reorder ---
  if (options.reorderable) {
    requestAnimationFrame(() => attachRowReorder(el, id, options));
  }

  const instance: GridInstance = {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    reload() {
      const dataEl = document.getElementById(`${id}-data`);
      if (dataEl) {
        // Re-trigger xhtmlx fetch
        dataEl.removeAttribute('data-xh-processed');
        const evt = new CustomEvent('xh:reload');
        dataEl.dispatchEvent(evt);
        // Fallback: reprocess via xhtmlx API
        if (typeof (window as any).xhtmlx !== 'undefined') {
          (window as any).xhtmlx.process(dataEl);
        }
      }
    },
    getSelected() {
      const checked = el.querySelectorAll<HTMLInputElement>('.tx-grid-row-select:checked');
      return Array.from(checked).map((cb) => {
        try {
          return JSON.parse(cb.getAttribute('data-row') || '{}');
        } catch {
          return {};
        }
      });
    },
    clearSelection() {
      el.querySelectorAll<HTMLInputElement>('.tx-grid-row-select').forEach((cb) => {
        cb.checked = false;
      });
      const selectAll = el.querySelector<HTMLInputElement>('.tx-grid-select-all');
      if (selectAll) selectAll.checked = false;
    },
    setPage(page: number) {
      const dataEl = document.getElementById(`${id}-data`);
      if (dataEl) {
        const url = new URL(options.source, window.location.origin);
        url.searchParams.set(pageParam, String(page));
        dataEl.setAttribute('xh-get', url.pathname + url.search);
        instance.reload();
      }
    },
  };

  return instance;
}

// ----------------------------------------------------------
// Toolbar rendering
// ----------------------------------------------------------
function renderToolbar(options: GridOptions, id: string): string {
  let html = '<div class="tx-grid-toolbar-start">';

  if (options.toolbar) {
    for (const item of options.toolbar) {
      html += renderToolbarItem(item, id);
    }
  }

  html += '</div><div class="tx-grid-toolbar-end">';

  if (options.searchable) {
    html += `<div class="tx-input-group tx-input-sm">`;
    html += `<span class="tx-input-icon">${icon('search')}</span>`;
    html += `<input type="text" id="${esc(id)}-search"`;
    html += ` class="tx-input tx-grid-search"`;
    html += ` placeholder="${esc(t('grid.search'))}"`;
    html += ` name="${esc(options.searchParam || 'q')}">`;
    html += `</div>`;
  }

  if (options.columnMenu) {
    html += `<button class="tx-btn tx-btn-ghost tx-btn-sm tx-grid-col-btn" title="Columns">${icon('columns')}</button>`;
  }

  if (options.exportable) {
    html += `<button class="tx-btn tx-btn-ghost tx-btn-sm tx-grid-export-btn" title="Export">${icon('download')}</button>`;
  }

  html += '</div>';
  return html;
}

function renderToolbarItem(item: ToolbarItem, _id: string): string {
  switch (item.type) {
    case 'button': {
      const v = item.variant || 'secondary';
      let h = `<button class="${cls('tx-btn', `tx-btn-${v}`, 'tx-btn-sm')}"`;
      if (item.disabled) h += ' disabled';
      if (item.tooltip) h += ` title="${esc(item.tooltip)}"`;
      if (item.action) {
        const method = (item.method || 'post').toLowerCase();
        h += ` xh-${method}="${esc(item.action)}"`;
        if (item.target) h += ` xh-target="${esc(item.target)}"`;
      }
      h += '>';
      if (item.icon) h += `<span class="tx-btn-icon">${icon(item.icon)}</span>`;
      if (item.label) h += esc(item.label);
      h += '</button>';
      return h;
    }
    case 'separator':
      return '<div class="tx-toolbar-separator"></div>';
    case 'spacer':
      return '<div class="tx-toolbar-spacer"></div>';
    case 'text':
      return `<span class="tx-toolbar-text">${esc(item.content)}</span>`;
    case 'search':
      return `<input type="text" class="tx-input tx-input-sm" placeholder="${esc(item.placeholder || 'Search...')}">`;
    case 'select': {
      let h = '<select class="tx-select tx-select-sm">';
      for (const o of item.options) {
        h += `<option value="${esc(o.value)}"${o.value === item.value ? ' selected' : ''}>${esc(o.label)}</option>`;
      }
      h += '</select>';
      return h;
    }
    default:
      return '';
  }
}

// ----------------------------------------------------------
// Table template rendering
// ----------------------------------------------------------
function renderTableTemplate(
  cols: GridColumn[],
  options: GridOptions,
  id: string,
  rowsField: string,
  _totalField: string,
  _pageSize: number,
): string {
  const tableClasses = cls(
    'tx-table',
    options.striped && 'tx-table-striped',
    options.hoverable !== false && 'tx-table-hoverable',
    options.bordered && 'tx-table-bordered',
    options.compact && 'tx-table-compact',
    options.stickyHeader && 'tx-table-sticky',
  );

  let html = `<table class="${tableClasses}">`;

  // --- <thead> ---
  html += '<thead><tr>';

  // Grip column header for reorderable rows
  if (options.reorderable) {
    html += '<th class="tx-grid-grip-col"></th>';
  }

  if (options.rowNumbers) {
    html += '<th class="tx-grid-rownum-col">#</th>';
  }

  if (options.selectable) {
    html += '<th class="tx-grid-select-col"><input type="checkbox" class="tx-checkbox tx-grid-select-all"></th>';
  }

  for (const col of cols) {
    const thCls = cls(col.headerClass, col.align && `tx-text-${col.align}`, col.sortable && 'tx-grid-sortable');
    const style = col.width
      ? ` style="width:${esc(col.width)}"`
      : col.minWidth
        ? ` style="min-width:${esc(col.minWidth)}"`
        : '';
    html += `<th class="${thCls}" data-field="${esc(col.field)}"${style}>`;
    html += `<span class="tx-grid-header-text">${esc(col.label)}</span>`;
    if (col.sortable) {
      html += `<span class="tx-grid-sort-icon">${icon('sort')}</span>`;
    }
    html += '</th>';
  }

  html += '</tr>';

  // Column filters row
  if (cols.some((c) => c.filterable)) {
    html += '<tr class="tx-grid-filter-row">';
    if (options.reorderable) html += '<th></th>';
    if (options.rowNumbers) html += '<th></th>';
    if (options.selectable) html += '<th></th>';
    for (const col of cols) {
      html += '<th>';
      if (col.filterable) {
        html += renderColumnFilter(col, id);
      }
      html += '</th>';
    }
    html += '</tr>';
  }

  html += '</thead>';

  // --- <tbody> ---
  html += '<tbody>';

  const trCls = cls('tx-grid-row', options.rowClass);
  html += `<tr xh-each="${esc(rowsField)}" class="${trCls}">`;

  // Grip handle for reorderable rows
  if (options.reorderable) {
    html += `<td class="tx-grid-grip">${icon('grip')}</td>`;
  }

  if (options.rowNumbers) {
    html += '<td class="tx-grid-rownum-col" xh-text="$index"></td>';
  }

  if (options.selectable) {
    html += '<td class="tx-grid-select-col"><input type="checkbox" class="tx-checkbox tx-grid-row-select"></td>';
  }

  for (const col of cols) {
    const tdCls = cls(col.class, col.align && `tx-text-${col.align}`);
    html += `<td class="${tdCls}">`;

    if (col.template) {
      html += col.template;
    } else if (col.renderer) {
      html += renderCellByType(col);
    } else {
      html += `<span xh-text="${esc(col.field)}"></span>`;
    }

    html += '</td>';
  }

  // Row detail expand
  if (options.rowDetailTemplate) {
    html += `<td colspan="${cols.length}" class="tx-grid-detail" xh-show="$expanded">`;
    html += options.rowDetailTemplate;
    html += '</td>';
  }

  html += '</tr>';
  html += '</tbody>';

  // --- <tfoot> summary ---
  if (options.showSummary) {
    html += '<tfoot><tr class="tx-grid-summary">';
    if (options.reorderable) html += '<td></td>';
    if (options.rowNumbers) html += '<td></td>';
    if (options.selectable) html += '<td></td>';
    for (const col of cols) {
      if (col.summary) {
        html += `<td class="tx-text-${col.align || 'right'}" xh-text="${esc(col.field)}_${esc(col.summary)}"></td>`;
      } else {
        html += '<td></td>';
      }
    }
    html += '</tr></tfoot>';
  }

  html += '</table>';

  // Empty state
  html += `<div xh-if="!${esc(rowsField)}.length" class="tx-grid-empty">`;
  html += `<div class="tx-grid-empty-icon">${icon('file')}</div>`;
  html += `<div class="tx-grid-empty-text">${esc(options.emptyMessage || t('grid.noData'))}</div>`;
  html += '</div>';

  // Pagination
  if (options.paginated) {
    html += `<div class="tx-grid-footer">`;
    html += `<div class="tx-grid-footer-info">`;
    html += `<span xh-if="total" class="tx-grid-total">Showing <span xh-text="from"></span>-<span xh-text="to"></span> of <span xh-text="total"></span></span>`;
    html += `</div>`;
    html += `<div class="tx-grid-pagination" id="${esc(id)}-pagination">`;
    // Pagination controls will be driven by server response
    html += `<div xh-if="totalPages" class="tx-pagination">`;
    html += `<button class="tx-pagination-btn" xh-if="page" xh-attr-disabled="page === 1"`;
    html += ` xh-get="${esc(options.source)}?${esc(options.pageParam || 'page')}={{prevPage}}"`;
    html += ` xh-target="#${esc(id)}-data" xh-trigger="click">${icon('chevronLeft')}</button>`;
    html += `<span class="tx-pagination-info">Page <span xh-text="page"></span> of <span xh-text="totalPages"></span></span>`;
    html += `<button class="tx-pagination-btn" xh-if="page" xh-attr-disabled="page === totalPages"`;
    html += ` xh-get="${esc(options.source)}?${esc(options.pageParam || 'page')}={{nextPage}}"`;
    html += ` xh-target="#${esc(id)}-data" xh-trigger="click">${icon('chevronRight')}</button>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
  }

  return html;
}

function renderColumnFilter(col: GridColumn, id: string): string {
  const filterType = col.filterType || 'text';
  switch (filterType) {
    case 'select': {
      let h = `<select class="tx-select tx-select-sm tx-grid-filter" data-field="${esc(col.field)}">`;
      h += '<option value="">All</option>';
      if (col.filterOptions) {
        for (const o of col.filterOptions) {
          h += `<option value="${esc(o.value)}">${esc(o.label)}</option>`;
        }
      }
      h += '</select>';
      return h;
    }
    case 'boolean':
      return `<select class="tx-select tx-select-sm tx-grid-filter" data-field="${esc(col.field)}"><option value="">All</option><option value="true">Yes</option><option value="false">No</option></select>`;
    default:
      return `<input type="${filterType === 'number' ? 'number' : 'text'}" class="tx-input tx-input-sm tx-grid-filter" data-field="${esc(col.field)}" placeholder="Filter...">`;
  }
}

function renderCellByType(col: GridColumn): string {
  switch (col.renderer) {
    case 'badge':
      return `<span class="tx-badge" xh-text="${esc(col.field)}"></span>`;
    case 'boolean':
      return `<span xh-if="${esc(col.field)}" class="tx-text-success">${icon('check')}</span><span xh-unless="${esc(col.field)}" class="tx-text-muted">${icon('x')}</span>`;
    case 'link':
      return `<a xh-attr-href="${esc(col.field)}" xh-text="${esc(col.field)}" class="tx-link"></a>`;
    case 'image':
      return `<img xh-attr-src="${esc(col.field)}" class="tx-grid-cell-img" width="32" height="32">`;
    case 'progress': {
      const cfg = (col.rendererConfig || {}) as { max?: number };
      const max = cfg.max || 100;
      return `<div class="tx-progress tx-progress-sm"><div class="tx-progress-bar" xh-attr-style="width:calc({{${esc(col.field)}}} / ${max} * 100%)"></div></div>`;
    }
    case 'date':
      return `<span xh-text="${esc(col.field)}"></span>`;
    case 'number':
      return `<span class="tx-text-right" xh-text="${esc(col.field)}"></span>`;
    case 'actions':
      return col.template || `<div class="tx-grid-actions">${icon('moreHorizontal')}</div>`;
    default:
      return `<span xh-text="${esc(col.field)}"></span>`;
  }
}

// ----------------------------------------------------------
// Sort click handling (post-render)
// ----------------------------------------------------------
function attachSortHandlers(root: HTMLElement, id: string, options: GridOptions): void {
  // Use event delegation on the grid container
  root.addEventListener('click', (e) => {
    const th = (e.target as HTMLElement).closest('.tx-grid-sortable') as HTMLElement | null;
    if (!th) return;

    const field = th.getAttribute('data-field');
    if (!field) return;

    // Determine sort direction
    const currentSort = th.getAttribute('data-sort');
    const newSort = currentSort === 'asc' ? 'desc' : 'asc';

    // Clear other sort indicators
    root.querySelectorAll('.tx-grid-sortable').forEach((h) => {
      h.removeAttribute('data-sort');
      const sortIcon = h.querySelector('.tx-grid-sort-icon');
      if (sortIcon) sortIcon.innerHTML = icon('sort');
    });

    // Set new sort
    th.setAttribute('data-sort', newSort);
    const sortIcon = th.querySelector('.tx-grid-sort-icon');
    if (sortIcon) sortIcon.innerHTML = newSort === 'asc' ? icon('sortAsc') : icon('sortDesc');

    // Update the xh-get URL on the data container
    const dataEl = document.getElementById(`${id}-data`);
    if (dataEl) {
      const url = new URL(options.source, window.location.origin);
      url.searchParams.set(options.sortParam || 'sort', field);
      url.searchParams.set(options.orderParam || 'order', newSort);
      dataEl.setAttribute('xh-get', url.pathname + url.search);

      // Trigger xhtmlx to re-fetch
      dataEl.removeAttribute('data-xh-processed');
      if (typeof (window as any).xhtmlx !== 'undefined') {
        (window as any).xhtmlx.process(dataEl);
      }
    }
  });
}

// ----------------------------------------------------------
// Row drag reorder (post-render)
// ----------------------------------------------------------
function attachRowReorder(root: HTMLElement, id: string, options: GridOptions): void {
  const gridBody = root.querySelector('.tx-grid-body') as HTMLElement | null;
  if (!gridBody) return;

  const dropLine = document.getElementById(`${id}-row-drop-line`);
  let draggedRow: HTMLElement | null = null;
  let ghostRow: HTMLElement | null = null;
  let dragStartIndex = -1;

  // Use event delegation for grip handle mousedown
  gridBody.addEventListener('mousedown', (e: MouseEvent) => {
    const grip = (e.target as HTMLElement).closest('.tx-grid-grip') as HTMLElement | null;
    if (!grip) return;

    const tr = grip.closest('tr.tx-grid-row') as HTMLElement | null;
    if (!tr) return;

    e.preventDefault();
    draggedRow = tr;

    // Determine the index of the dragged row among siblings
    const tbody = tr.parentElement;
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll<HTMLElement>('tr.tx-grid-row'));
      dragStartIndex = rows.indexOf(tr);
    }

    // Create ghost row
    ghostRow = tr.cloneNode(true) as HTMLElement;
    ghostRow.classList.add('tx-grid-row-dragging');
    ghostRow.style.position = 'fixed';
    ghostRow.style.left = `${tr.getBoundingClientRect().left}px`;
    ghostRow.style.top = `${e.clientY}px`;
    ghostRow.style.width = `${tr.offsetWidth}px`;
    ghostRow.style.pointerEvents = 'none';
    ghostRow.style.zIndex = '9999';
    document.body.appendChild(ghostRow);

    tr.style.opacity = '0.4';

    const onMouseMove = (me: MouseEvent) => {
      if (!ghostRow || !draggedRow) return;

      ghostRow.style.top = `${me.clientY}px`;

      // Determine drop position
      const tbody = draggedRow.parentElement;
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll<HTMLElement>('tr.tx-grid-row'));
      if (dropLine) dropLine.style.display = 'none';

      for (const row of rows) {
        if (row === draggedRow) continue;
        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (me.clientY > rect.top && me.clientY < rect.bottom) {
          if (dropLine) {
            const parentRect = gridBody.getBoundingClientRect();
            dropLine.style.display = '';
            dropLine.style.position = 'absolute';
            dropLine.style.left = '0';
            dropLine.style.right = '0';
            if (me.clientY < midY) {
              dropLine.style.top = `${rect.top - parentRect.top}px`;
            } else {
              dropLine.style.top = `${rect.bottom - parentRect.top}px`;
            }
          }
          break;
        }
      }
    };

    const onMouseUp = (me: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (ghostRow) {
        ghostRow.remove();
        ghostRow = null;
      }
      if (dropLine) dropLine.style.display = 'none';

      if (draggedRow) {
        draggedRow.style.opacity = '';

        const tbody = draggedRow.parentElement;
        if (tbody) {
          const rows = Array.from(tbody.querySelectorAll<HTMLElement>('tr.tx-grid-row'));
          let dropIndex = dragStartIndex;

          for (let i = 0; i < rows.length; i++) {
            if (rows[i] === draggedRow) continue;
            const rect = rows[i].getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (me.clientY > rect.top && me.clientY < rect.bottom) {
              dropIndex = me.clientY < midY ? i : i + 1;
              if (dropIndex > dragStartIndex) dropIndex--;
              break;
            }
          }

          if (dropIndex !== dragStartIndex && dropIndex >= 0 && dropIndex < rows.length) {
            // Move the DOM row
            const targetRow = rows[dropIndex];
            if (dropIndex > dragStartIndex) {
              targetRow.after(draggedRow);
            } else {
              targetRow.before(draggedRow);
            }

            // Fire callback
            if (options.onReorder) {
              options.onReorder(dragStartIndex, dropIndex);
            }
          }
        }

        draggedRow = null;
        dragStartIndex = -1;
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// Declarative registration
registerWidget('grid', (el, opts) => grid(el, opts as unknown as GridOptions));

export default grid;
