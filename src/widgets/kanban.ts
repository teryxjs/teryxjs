// ============================================================
// Teryx — Kanban Board Widget
// ============================================================

import type { KanbanOptions, KanbanCard, KanbanColumn, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';
import { draggable, droppable } from './drag-drop';
import type { DraggableInstance, DroppableInstance } from './drag-drop';

export interface KanbanInstance extends WidgetInstance {
  getColumns(): KanbanColumn[];
  addCard(columnId: string, card: KanbanCard): void;
  removeCard(cardId: string): void;
  moveCard(cardId: string, toColumnId: string): void;
}

export function kanban(target: string | HTMLElement, options: KanbanOptions): KanbanInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-kanban');
  const isDraggable = options.draggable !== false;

  // Deep-copy columns so mutations don't affect caller
  const columns: KanbanColumn[] = JSON.parse(JSON.stringify(options.columns));

  const dragInstances: DraggableInstance[] = [];
  const dropInstances: DroppableInstance[] = [];

  function findCard(cardId: string): { card: KanbanCard; column: KanbanColumn } | null {
    for (const col of columns) {
      const card = col.items?.find((c) => c.id === cardId);
      if (card) return { card, column: col };
    }
    return null;
  }

  function renderCard(card: KanbanCard): string {
    if (options.cardTemplate) {
      return options.cardTemplate
        .replace(/\{\{id\}\}/g, esc(card.id))
        .replace(/\{\{title\}\}/g, esc(card.title))
        .replace(/\{\{description\}\}/g, esc(card.description || ''))
        .replace(/\{\{assignee\}\}/g, esc(card.assignee || ''))
        .replace(/\{\{priority\}\}/g, esc(card.priority || ''));
    }

    let html = `<div class="${cls('tx-kanban-card', card.priority && `tx-kanban-card-${card.priority}`)}" data-card-id="${esc(card.id)}">`;
    html += `<div class="tx-kanban-card-title">${esc(card.title)}</div>`;

    if (card.description) {
      html += `<div class="tx-kanban-card-desc">${esc(card.description)}</div>`;
    }

    if (card.labels && card.labels.length > 0) {
      html += '<div class="tx-kanban-card-labels">';
      for (const label of card.labels) {
        html += `<span class="tx-kanban-card-label">${esc(label)}</span>`;
      }
      html += '</div>';
    }

    const hasFooter = card.assignee || card.priority;
    if (hasFooter) {
      html += '<div class="tx-kanban-card-footer">';
      if (card.assignee) {
        html += `<span class="tx-kanban-card-assignee">${icon('user')} ${esc(card.assignee)}</span>`;
      }
      if (card.priority) {
        html += `<span class="tx-kanban-card-priority tx-kanban-priority-${esc(card.priority)}">${esc(card.priority)}</span>`;
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderColumn(col: KanbanColumn): string {
    const items = col.items || [];
    const isOverLimit = col.limit !== undefined && items.length > col.limit;

    let html = `<div class="${cls('tx-kanban-column', isOverLimit && 'tx-kanban-column-over-limit')}" data-column-id="${esc(col.id)}">`;

    html += '<div class="tx-kanban-column-header"';
    if (col.color) html += ` style="border-top: 3px solid ${esc(col.color)}"`;
    html += '>';
    html += `<span class="tx-kanban-column-title">${esc(col.title)}</span>`;
    html += `<span class="tx-kanban-column-count">${items.length}`;
    if (col.limit !== undefined) {
      html += ` / ${col.limit}`;
    }
    html += '</span>';
    html += '</div>';

    html += '<div class="tx-kanban-column-body">';
    for (const card of items) {
      html += renderCard(card);
    }
    if (items.length === 0) {
      html += '<div class="tx-kanban-empty">No items</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function destroyDragDrop(): void {
    for (const inst of dragInstances) inst.destroy();
    for (const inst of dropInstances) inst.destroy();
    dragInstances.length = 0;
    dropInstances.length = 0;
  }

  function setupDragDrop(): void {
    if (!isDraggable) return;
    const root = el.querySelector(`#${id}`) as HTMLElement;
    if (!root) return;

    root.querySelectorAll<HTMLElement>('.tx-kanban-card').forEach((cardEl) => {
      const cardId = cardEl.getAttribute('data-card-id')!;
      const colEl = cardEl.closest('.tx-kanban-column') as HTMLElement;
      const colId = colEl?.getAttribute('data-column-id') || '';
      dragInstances.push(
        draggable(cardEl, {
          data: { cardId, fromCol: colId },
          ghost: true,
        }),
      );
    });

    root.querySelectorAll<HTMLElement>('.tx-kanban-column-body').forEach((bodyEl) => {
      const colEl = bodyEl.closest('.tx-kanban-column') as HTMLElement;
      const colId = colEl?.getAttribute('data-column-id') || '';
      dropInstances.push(
        droppable(bodyEl, {
          hoverClass: 'tx-kanban-drop-hover',
          accept: (data: unknown) => {
            const d = data as { cardId: string; fromCol: string };
            return d.fromCol !== colId;
          },
          onDrop: (_dropEl: HTMLElement, data: unknown) => {
            const d = data as { cardId: string; fromCol: string };
            doMove(d.cardId, d.fromCol, colId);
          },
        }),
      );
    });
  }

  function doMove(cardId: string, fromColId: string, toColId: string): void {
    const fromCol = columns.find((c) => c.id === fromColId);
    const toCol = columns.find((c) => c.id === toColId);
    if (!fromCol || !toCol || !fromCol.items) return;

    const idx = fromCol.items.findIndex((c) => c.id === cardId);
    if (idx === -1) return;

    const [card] = fromCol.items.splice(idx, 1);
    if (!toCol.items) toCol.items = [];
    toCol.items.push(card);

    options.onMove?.(cardId, fromColId, toColId);
    emit('kanban:move', { id, cardId, fromCol: fromColId, toCol: toColId });
    render();
  }

  function bindEvents(): void {
    const root = el.querySelector(`#${id}`) as HTMLElement;
    if (!root) return;

    root.addEventListener('click', (e) => {
      const cardEl = (e.target as HTMLElement).closest('.tx-kanban-card') as HTMLElement;
      if (!cardEl) return;
      const cardId = cardEl.getAttribute('data-card-id');
      if (!cardId) return;
      const found = findCard(cardId);
      if (found && options.onCardClick) {
        options.onCardClick(found.card);
      }
      emit('kanban:cardclick', { id, card: found?.card });
    });
  }

  function render(): void {
    destroyDragDrop();

    let html = `<div class="${cls('tx-kanban', options.class)}" id="${esc(id)}">`;
    for (const col of columns) {
      html += renderColumn(col);
    }
    html += '</div>';
    el.innerHTML = html;

    bindEvents();
    requestAnimationFrame(() => setupDragDrop());
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      destroyDragDrop();
      el.innerHTML = '';
    },
    getColumns() {
      return JSON.parse(JSON.stringify(columns));
    },
    addCard(columnId: string, card: KanbanCard) {
      const col = columns.find((c) => c.id === columnId);
      if (!col) return;
      if (!col.items) col.items = [];
      col.items.push(JSON.parse(JSON.stringify(card)));
      render();
    },
    removeCard(cardId: string) {
      for (const col of columns) {
        if (!col.items) continue;
        const idx = col.items.findIndex((c) => c.id === cardId);
        if (idx !== -1) {
          col.items.splice(idx, 1);
          render();
          return;
        }
      }
    },
    moveCard(cardId: string, toColumnId: string) {
      const found = findCard(cardId);
      if (!found) return;
      doMove(cardId, found.column.id, toColumnId);
    },
  };
}

registerWidget('kanban', (el, opts) => kanban(el, opts as unknown as KanbanOptions));
export default kanban;
