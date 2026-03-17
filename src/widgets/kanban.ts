// ============================================================
// Teryx — Kanban Board Widget
// ============================================================

import type { KanbanOptions, KanbanCard, KanbanColumn, WidgetInstance } from '../types';
import { uid, esc, cls, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

// ----------------------------------------------------------
//  Kanban instance interface
// ----------------------------------------------------------

export interface KanbanInstance extends WidgetInstance {
  /** Reload data (noop unless source is set). */
  reload(): void;
  /** Get all columns with their current card arrays. */
  getColumns(): KanbanColumn[];
  /** Add a card to a column. */
  addCard(columnId: string, card: KanbanCard): void;
  /** Remove a card by id. */
  removeCard(cardId: string): void;
}

// ----------------------------------------------------------
//  Render helpers
// ----------------------------------------------------------

function renderCard(card: KanbanCard, template?: string): string {
  if (template) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      if (key in card) return esc(String((card as unknown as Record<string, unknown>)[key] ?? ''));
      if (card.data && key in card.data) return esc(String(card.data[key] ?? ''));
      return '';
    });
  }

  let html = `<div class="tx-kanban-card" data-card-id="${esc(card.id)}">`;
  html += `<div class="tx-kanban-card-title">${esc(card.title)}</div>`;

  if (card.description) {
    html += `<div class="tx-kanban-card-desc">${esc(card.description)}</div>`;
  }

  if (card.labels && card.labels.length) {
    html += '<div class="tx-kanban-card-labels">';
    for (const label of card.labels) {
      html += `<span class="tx-kanban-label">${esc(label)}</span>`;
    }
    html += '</div>';
  }

  const meta: string[] = [];
  if (card.assignee) meta.push(`<span class="tx-kanban-card-assignee">${esc(card.assignee)}</span>`);
  if (card.priority)
    meta.push(
      `<span class="tx-kanban-card-priority tx-kanban-priority-${esc(card.priority)}">${esc(card.priority)}</span>`,
    );
  if (meta.length) {
    html += `<div class="tx-kanban-card-meta">${meta.join('')}</div>`;
  }

  html += '</div>';
  return html;
}

function renderColumn(col: KanbanColumn, options: KanbanOptions): string {
  const items = col.items ?? [];
  const limitReached = col.limit !== undefined && items.length >= col.limit;

  let html = `<div class="tx-kanban-column${limitReached ? ' tx-kanban-column-limit' : ''}" data-column-id="${esc(col.id)}">`;

  html += '<div class="tx-kanban-header"';
  if (col.color) html += ` style="border-top: 3px solid ${esc(col.color)}"`;
  html += '>';
  html += `<span class="tx-kanban-header-title">${esc(col.title)}</span>`;
  html += `<span class="tx-kanban-header-count">${items.length}`;
  if (col.limit !== undefined) html += ` / ${col.limit}`;
  html += '</span>';
  html += '</div>';

  html += '<div class="tx-kanban-body">';
  for (const card of items) {
    html += renderCard(card, options.cardTemplate);
  }
  html += '</div>';

  html += '</div>';
  return html;
}

// ----------------------------------------------------------
//  Drag state for kanban cards
// ----------------------------------------------------------

interface KanbanDragState {
  cardEl: HTMLElement;
  cardId: string;
  sourceColumnId: string;
  ghost: HTMLElement;
  offsetX: number;
  offsetY: number;
  indicator: HTMLElement;
}

let _dragState: KanbanDragState | null = null;

// ----------------------------------------------------------
//  Main widget factory
// ----------------------------------------------------------

export function kanban(target: string | HTMLElement, options: KanbanOptions): KanbanInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-kanban');

  let columnsData: KanbanColumn[] = options.columns.map((c) => ({
    ...c,
    items: c.items ? [...c.items] : [],
  }));

  function render(): void {
    let html = `<div class="${cls('tx-kanban', options.class)}" id="${esc(id)}">`;
    for (const col of columnsData) {
      html += renderColumn(col, options);
    }
    html += '</div>';
    el.innerHTML = html;
    bindEvents();
  }

  function bindEvents(): void {
    const root = el.querySelector(`#${id}`) as HTMLElement;
    if (!root) return;

    root.addEventListener('click', (e: Event) => {
      const cardTarget = (e.target as HTMLElement).closest('.tx-kanban-card') as HTMLElement | null;
      if (!cardTarget) return;
      const cardId = cardTarget.getAttribute('data-card-id');
      if (!cardId) return;
      const card = findCard(cardId);
      if (card && options.onCardClick) {
        options.onCardClick(card);
      }
      emit('kanban:cardClick', { cardId, card });
    });

    if (options.draggable) {
      bindDrag(root);
    }
  }

  function bindDrag(root: HTMLElement): void {
    root.addEventListener('mousedown', onPointerDown as EventListener);
    root.addEventListener('touchstart', onPointerDown as EventListener, { passive: false });
  }

  function onPointerDown(e: MouseEvent | TouchEvent): void {
    const cardTarget = (e.target as HTMLElement).closest('.tx-kanban-card') as HTMLElement | null;
    if (!cardTarget) return;
    const column = cardTarget.closest('.tx-kanban-column') as HTMLElement | null;
    if (!column) return;
    if ('button' in e && (e as MouseEvent).button !== 0) return;

    const { clientX, clientY } = getPointer(e);
    const rect = cardTarget.getBoundingClientRect();

    const ghost = cardTarget.cloneNode(true) as HTMLElement;
    ghost.classList.add('tx-kanban-ghost');
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.8';
    ghost.style.zIndex = '99999';
    ghost.style.width = `${cardTarget.offsetWidth}px`;
    ghost.style.left = `${clientX - (clientX - rect.left)}px`;
    ghost.style.top = `${clientY - (clientY - rect.top)}px`;
    document.body.appendChild(ghost);

    const indicator = document.createElement('div');
    indicator.className = 'tx-kanban-drop-indicator';
    indicator.style.display = 'none';

    _dragState = {
      cardEl: cardTarget,
      cardId: cardTarget.getAttribute('data-card-id') || '',
      sourceColumnId: column.getAttribute('data-column-id') || '',
      ghost,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      indicator,
    };

    cardTarget.classList.add('tx-kanban-card-dragging');

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
    document.addEventListener('touchcancel', onPointerUp);

    e.preventDefault();
  }

  function onPointerMove(e: MouseEvent | TouchEvent): void {
    if (!_dragState) return;
    const { clientX, clientY } = getPointer(e);

    _dragState.ghost.style.left = `${clientX - _dragState.offsetX}px`;
    _dragState.ghost.style.top = `${clientY - _dragState.offsetY}px`;

    const root = el.querySelector(`#${id}`) as HTMLElement;
    if (!root) return;

    const columns = root.querySelectorAll<HTMLElement>('.tx-kanban-column');
    let targetBody: HTMLElement | null = null;

    for (const col of columns) {
      const rect = col.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        targetBody = col.querySelector('.tx-kanban-body') as HTMLElement;
        col.classList.add('tx-kanban-column-hover');
      } else {
        col.classList.remove('tx-kanban-column-hover');
      }
    }

    if (targetBody) {
      if (_dragState.indicator.parentNode !== targetBody) {
        _dragState.indicator.remove();
        targetBody.appendChild(_dragState.indicator);
      }
      _dragState.indicator.style.display = '';
    } else {
      _dragState.indicator.style.display = 'none';
    }
  }

  function onPointerUp(e: MouseEvent | TouchEvent): void {
    if (!_dragState) return;
    const { clientX, clientY } = getPointer(e);

    const root = el.querySelector(`#${id}`) as HTMLElement;
    let targetColumnId: string | null = null;

    if (root) {
      const columns = root.querySelectorAll<HTMLElement>('.tx-kanban-column');
      for (const col of columns) {
        const rect = col.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          targetColumnId = col.getAttribute('data-column-id');
        }
        col.classList.remove('tx-kanban-column-hover');
      }
    }

    if (targetColumnId && targetColumnId !== _dragState.sourceColumnId) {
      moveCard(_dragState.cardId, _dragState.sourceColumnId, targetColumnId);
    }

    _dragState.cardEl.classList.remove('tx-kanban-card-dragging');
    _dragState.ghost.remove();
    _dragState.indicator.remove();
    _dragState = null;

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
    document.removeEventListener('touchcancel', onPointerUp);
  }

  function findCard(cardId: string): KanbanCard | null {
    for (const col of columnsData) {
      const card = (col.items ?? []).find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function moveCard(cardId: string, fromColId: string, toColId: string): void {
    const fromCol = columnsData.find((c) => c.id === fromColId);
    const toCol = columnsData.find((c) => c.id === toColId);
    if (!fromCol || !toCol) return;

    const idx = (fromCol.items ?? []).findIndex((c) => c.id === cardId);
    if (idx < 0) return;

    if (toCol.limit !== undefined && (toCol.items ?? []).length >= toCol.limit) return;

    const [card] = fromCol.items!.splice(idx, 1);
    if (!toCol.items) toCol.items = [];
    toCol.items.push(card);

    options.onMove?.(cardId, fromColId, toColId);
    emit('kanban:move', { cardId, fromCol: fromColId, toCol: toColId });

    render();
  }

  render();

  const root = el.querySelector(`#${id}`) as HTMLElement;

  const instance: KanbanInstance = {
    el: root,
    reload() {
      if (options.source) {
        fetch(options.source)
          .then((r) => r.json())
          .then((data: { columns?: KanbanColumn[] }) => {
            if (data.columns) {
              columnsData = data.columns.map((c) => ({
                ...c,
                items: c.items ? [...c.items] : [],
              }));
              render();
            }
          })
          .catch((err) => console.error('Teryx kanban reload error:', err));
      }
    },
    getColumns() {
      return columnsData.map((c) => ({ ...c, items: [...(c.items ?? [])] }));
    },
    addCard(columnId: string, card: KanbanCard) {
      const col = columnsData.find((c) => c.id === columnId);
      if (!col) return;
      if (!col.items) col.items = [];
      col.items.push(card);
      render();
    },
    removeCard(cardId: string) {
      for (const col of columnsData) {
        const idx = (col.items ?? []).findIndex((c) => c.id === cardId);
        if (idx >= 0) {
          col.items!.splice(idx, 1);
          render();
          return;
        }
      }
    },
    destroy() {
      el.innerHTML = '';
    },
  };

  return instance;
}

// ----------------------------------------------------------
//  Pointer helpers
// ----------------------------------------------------------

function getPointer(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
  if ('touches' in e) {
    const t = e.touches[0] || (e as TouchEvent).changedTouches[0];
    return { clientX: t.clientX, clientY: t.clientY };
  }
  return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
}

// ----------------------------------------------------------
//  Widget registration
// ----------------------------------------------------------

registerWidget('kanban', (el, opts) => kanban(el, opts as unknown as KanbanOptions));
export default kanban;
