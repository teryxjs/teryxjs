import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { kanban } from '../../src/widgets/kanban';
import { on, off } from '../../src/core';
import type { KanbanColumn, KanbanCard } from '../../src/types';

function columns(): KanbanColumn[] {
  return [
    {
      id: 'todo',
      title: 'To Do',
      items: [
        { id: 'c1', title: 'Task 1', description: 'First task' },
        { id: 'c2', title: 'Task 2', labels: ['bug'] },
      ],
    },
    {
      id: 'doing',
      title: 'In Progress',
      items: [{ id: 'c3', title: 'Task 3', assignee: 'Alice', priority: 'high' }],
    },
    {
      id: 'done',
      title: 'Done',
      items: [],
    },
  ];
}

describe('Kanban widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render all columns', () => {
    kanban(container, { columns: columns() });
    const cols = container.querySelectorAll('.tx-kanban-column');
    expect(cols.length).toBe(3);
  });

  it('should render column titles', () => {
    kanban(container, { columns: columns() });
    const titles = container.querySelectorAll('.tx-kanban-header-title');
    expect(titles[0].textContent).toBe('To Do');
    expect(titles[1].textContent).toBe('In Progress');
    expect(titles[2].textContent).toBe('Done');
  });

  it('should render cards inside columns', () => {
    kanban(container, { columns: columns() });
    const todoCards = container.querySelector('[data-column-id="todo"]')!.querySelectorAll('.tx-kanban-card');
    expect(todoCards.length).toBe(2);
    const doingCards = container.querySelector('[data-column-id="doing"]')!.querySelectorAll('.tx-kanban-card');
    expect(doingCards.length).toBe(1);
    const doneCards = container.querySelector('[data-column-id="done"]')!.querySelectorAll('.tx-kanban-card');
    expect(doneCards.length).toBe(0);
  });

  it('should render card title and description', () => {
    kanban(container, { columns: columns() });
    const card = container.querySelector('[data-card-id="c1"]')!;
    expect(card.querySelector('.tx-kanban-card-title')!.textContent).toBe('Task 1');
    expect(card.querySelector('.tx-kanban-card-desc')!.textContent).toBe('First task');
  });

  it('should render card labels', () => {
    kanban(container, { columns: columns() });
    const card = container.querySelector('[data-card-id="c2"]')!;
    const labels = card.querySelectorAll('.tx-kanban-label');
    expect(labels.length).toBe(1);
    expect(labels[0].textContent).toBe('bug');
  });

  it('should render card assignee and priority', () => {
    kanban(container, { columns: columns() });
    const card = container.querySelector('[data-card-id="c3"]')!;
    expect(card.querySelector('.tx-kanban-card-assignee')!.textContent).toBe('Alice');
    expect(card.querySelector('.tx-kanban-card-priority')!.textContent).toBe('high');
    expect(card.querySelector('.tx-kanban-card-priority')!.classList.contains('tx-kanban-priority-high')).toBe(true);
  });

  it('should render column count', () => {
    kanban(container, { columns: columns() });
    const counts = container.querySelectorAll('.tx-kanban-header-count');
    expect(counts[0].textContent).toBe('2');
    expect(counts[1].textContent).toBe('1');
    expect(counts[2].textContent).toBe('0');
  });

  it('should fire onCardClick callback', () => {
    const onClick = vi.fn();
    kanban(container, { columns: columns(), onCardClick: onClick });
    const card = container.querySelector('[data-card-id="c1"]') as HTMLElement;
    card.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', title: 'Task 1' }));
  });

  it('should apply custom class', () => {
    kanban(container, { columns: columns(), class: 'my-kanban' });
    const board = container.querySelector('.tx-kanban')!;
    expect(board.classList.contains('my-kanban')).toBe(true);
  });

  it('should show limit in count and apply limit class', () => {
    const cols: KanbanColumn[] = [
      {
        id: 'wip',
        title: 'WIP',
        limit: 2,
        items: [
          { id: 'a', title: 'A' },
          { id: 'b', title: 'B' },
        ],
      },
    ];
    kanban(container, { columns: cols });
    const count = container.querySelector('.tx-kanban-header-count')!;
    expect(count.textContent).toBe('2 / 2');
    const col = container.querySelector('.tx-kanban-column')!;
    expect(col.classList.contains('tx-kanban-column-limit')).toBe(true);
  });

  it('should apply column color as border-top', () => {
    const cols: KanbanColumn[] = [{ id: 'col1', title: 'Red', color: '#ff0000', items: [] }];
    kanban(container, { columns: cols });
    const header = container.querySelector('.tx-kanban-header') as HTMLElement;
    expect(header.style.borderTop).toContain('rgb(255, 0, 0)');
  });

  it('getColumns() returns current column data', () => {
    const inst = kanban(container, { columns: columns() });
    const cols = inst.getColumns();
    expect(cols.length).toBe(3);
    expect(cols[0].items!.length).toBe(2);
  });

  it('addCard() adds a card to specified column', () => {
    const inst = kanban(container, { columns: columns() });
    inst.addCard('done', { id: 'c4', title: 'Task 4' });
    const doneCards = container.querySelector('[data-column-id="done"]')!.querySelectorAll('.tx-kanban-card');
    expect(doneCards.length).toBe(1);
    expect(doneCards[0].querySelector('.tx-kanban-card-title')!.textContent).toBe('Task 4');
  });

  it('removeCard() removes a card by id', () => {
    const inst = kanban(container, { columns: columns() });
    inst.removeCard('c1');
    const todoCards = container.querySelector('[data-column-id="todo"]')!.querySelectorAll('.tx-kanban-card');
    expect(todoCards.length).toBe(1);
  });

  it('destroy() clears content', () => {
    const inst = kanban(container, { columns: columns() });
    inst.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should use custom cardTemplate', () => {
    const cols: KanbanColumn[] = [
      {
        id: 'col1',
        title: 'Custom',
        items: [{ id: 'x', title: 'Hello', data: { extra: 'World' } }],
      },
    ];
    kanban(container, {
      columns: cols,
      cardTemplate: '<div class="tx-kanban-card" data-card-id="{{id}}"><b>{{title}}</b> - {{extra}}</div>',
    });
    const card = container.querySelector('[data-card-id="x"]')!;
    expect(card.innerHTML).toContain('<b>Hello</b> - World');
  });

  it('should emit kanban:cardClick event on the bus', () => {
    const handler = vi.fn();
    on('kanban:cardClick', handler);
    kanban(container, { columns: columns() });
    const card = container.querySelector('[data-card-id="c1"]') as HTMLElement;
    card.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c1' }));
    off('kanban:cardClick', handler);
  });
});
