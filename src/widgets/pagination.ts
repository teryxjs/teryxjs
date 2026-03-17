// ============================================================
// Teryx — Pagination Widget
// ============================================================

import type { PaginationOptions, PaginationInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function pagination(target: string | HTMLElement, options: PaginationOptions): PaginationInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-pagination');
  let currentPage = options.current || 1;
  let totalItems = options.total;
  let pageSize = options.pageSize || 25;
  const maxVisible = options.maxVisible || 7;

  function totalPages(): number {
    return Math.ceil(totalItems / pageSize);
  }

  function render(): void {
    const pages = totalPages();
    let html = `<div class="${cls('tx-pagination', options.simple && 'tx-pagination-simple', options.class)}" id="${esc(id)}">`;

    if (options.showTotal) {
      const from = (currentPage - 1) * pageSize + 1;
      const to = Math.min(currentPage * pageSize, totalItems);
      html += `<span class="tx-pagination-total">${from}-${to} of ${totalItems}</span>`;
    }

    html += '<div class="tx-pagination-nav">';

    // First
    if (options.showFirst !== false) {
      html += `<button class="tx-pagination-btn tx-pagination-first"${currentPage <= 1 ? ' disabled' : ''}`;
      html += renderPageAction(1, options);
      html += `>${icon('chevronLeft')}${icon('chevronLeft')}</button>`;
    }

    // Prev
    html += `<button class="tx-pagination-btn tx-pagination-prev"${currentPage <= 1 ? ' disabled' : ''}`;
    html += renderPageAction(currentPage - 1, options);
    html += `>${icon('chevronLeft')}</button>`;

    if (!options.simple) {
      // Page numbers
      const range = getPageRange(currentPage, pages, maxVisible);
      if (range[0] > 1) {
        html += renderPageBtn(1, currentPage, options);
        if (range[0] > 2) html += '<span class="tx-pagination-ellipsis">...</span>';
      }
      for (const p of range) {
        html += renderPageBtn(p, currentPage, options);
      }
      if (range[range.length - 1] < pages) {
        if (range[range.length - 1] < pages - 1) html += '<span class="tx-pagination-ellipsis">...</span>';
        html += renderPageBtn(pages, currentPage, options);
      }
    } else {
      html += `<span class="tx-pagination-info">Page ${currentPage} of ${pages}</span>`;
    }

    // Next
    html += `<button class="tx-pagination-btn tx-pagination-next"${currentPage >= pages ? ' disabled' : ''}`;
    html += renderPageAction(currentPage + 1, options);
    html += `>${icon('chevronRight')}</button>`;

    // Last
    if (options.showLast !== false) {
      html += `<button class="tx-pagination-btn tx-pagination-last"${currentPage >= pages ? ' disabled' : ''}`;
      html += renderPageAction(pages, options);
      html += `>${icon('chevronRight')}${icon('chevronRight')}</button>`;
    }

    html += '</div>';

    // Page size changer
    if (options.showSizeChanger) {
      html += '<div class="tx-pagination-sizer">';
      html += '<select class="tx-select tx-select-sm tx-pagination-size-select">';
      const sizes = options.pageSizes || [10, 25, 50, 100];
      for (const s of sizes) {
        html += `<option value="${s}"${s === pageSize ? ' selected' : ''}>${s} / page</option>`;
      }
      html += '</select></div>';
    }

    // Page jumper
    if (options.showJumper) {
      html += '<div class="tx-pagination-jumper">';
      html += `Go to <input type="number" class="tx-input tx-input-sm tx-pagination-jump-input" min="1" max="${pages}" value="${currentPage}">`;
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;

    // Attach event listeners
    el.querySelectorAll('.tx-pagination-btn:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page') || '1', 10);
        if (page !== currentPage) {
          instance.goTo(page);
        }
      });
    });

    // Page size change
    el.querySelector('.tx-pagination-size-select')?.addEventListener('change', (e) => {
      pageSize = parseInt((e.target as HTMLSelectElement).value, 10);
      currentPage = 1;
      render();
      options.onChange?.(currentPage, pageSize);
      emit('pagination:change', { id, page: currentPage, pageSize });
    });

    // Jumper
    el.querySelector('.tx-pagination-jump-input')?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        const page = parseInt((e.target as HTMLInputElement).value, 10);
        if (page >= 1 && page <= totalPages()) {
          instance.goTo(page);
        }
      }
    });
  }

  render();

  const instance: PaginationInstance = {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    goTo(page: number) {
      const pages = totalPages();
      if (page < 1 || page > pages || page === currentPage) return;
      currentPage = page;
      render();
      options.onChange?.(currentPage, pageSize);
      emit('pagination:change', { id, page: currentPage, pageSize });
    },
    current() {
      return currentPage;
    },
    setTotal(total: number) {
      totalItems = total;
      if (currentPage > totalPages()) currentPage = totalPages();
      render();
    },
  };

  return instance;
}

function renderPageBtn(page: number, current: number, options: PaginationOptions): string {
  let html = `<button class="${cls('tx-pagination-btn tx-pagination-page', page === current && 'tx-pagination-active')}" data-page="${page}"`;
  html += renderPageAction(page, options);
  html += `>${page}</button>`;
  return html;
}

function renderPageAction(page: number, options: PaginationOptions): string {
  let attrs = ` data-page="${page}"`;
  if (options.source && options.target) {
    const url = options.source.replace('{{page}}', String(page));
    attrs += ` xh-get="${esc(url)}" xh-target="${esc(options.target)}" xh-trigger="click"`;
  }
  return attrs;
}

function getPageRange(current: number, total: number, maxVisible: number): number[] {
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

registerWidget('pagination', (el, opts) => pagination(el, opts as unknown as PaginationOptions));
export default pagination;
