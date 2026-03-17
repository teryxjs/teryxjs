import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { kanban } from '../../src/widgets/kanban';

const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    items: [
      { id: 'c1', title: 'Task 1', description: 'First task' },
      { id: 'c2', title: 'Task 2', labels: ['bug'], priority: 'high' },
    ],
  },
  {
    id: 'doing',
    title: 'In Progress',
    items: [{ id: 'c3', title: 'Task 3', assignee: 'Alice' }],
  },
  {
    id: 'done',
    title: 'Done',
    items: [],
  },
];

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
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

  it('should render columns', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const cols = container.querySelectorAll('.tx-kanban-column');
    expect(cols.length).toBe(3);
  });

  it('should render column titles', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const titles = container.querySelectorAll('.tx-kanban-column-title');
    expect(titles[0].textContent).toBe('To Do');
    expect(titles[1].textContent).toBe('In Progress');
    expect(titles[2].textContent).toBe('Done');
  });

  it('should render cards within columns', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const todoCards = container.querySelector('[data-column-id="todo"]')!.querySelectorAll('.tx-kanban-card');
    expect(todoCards.length).toBe(2);
    const doingCards = container.querySelector('[data-column-id="doing"]')!.querySelectorAll('.tx-kanban-card');
    expect(doingCards.length).toBe(1);
  });

  it('should render card title and description', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const card = container.querySelector('[data-card-id="c1"]')!;
    expect(card.querySelector('.tx-kanban-card-title')!.textContent).toBe('Task 1');
    expect(card.querySelector('.tx-kanban-card-desc')!.textContent).toBe('First task');
  });

  it('should render card labels', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const card = container.querySelector('[data-card-id="c2"]')!;
    const labels = card.querySelectorAll('.tx-kanban-card-label');
    expect(labels.length).toBe(1);
    expect(labels[0].textContent).toBe('bug');
  });

  it('should render card assignee', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const card = container.querySelector('[data-card-id="c3"]')!;
    expect(card.querySelector('.tx-kanban-card-assignee')!.textContent).toContain('Alice');
  });

  it('should render card priority', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const card = container.querySelector('[data-card-id="c2"]')!;
    expect(card.querySelector('.tx-kanban-card-priority')!.textContent).toBe('high');
    expect(card.classList.contains('tx-kanban-card-high')).toBe(true);
  });

  it('should show column count', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const counts = container.querySelectorAll('.tx-kanban-column-count');
    expect(counts[0].textContent).toBe('2');
    expect(counts[1].textContent).toBe('1');
    expect(counts[2].textContent).toBe('0');
  });

  it('should show WIP limit in column count', () => {
    const cols = deepCopy(COLUMNS);
    cols[0].limit = 3;
    kanban(container, { columns: cols });
    const count = container.querySelector('[data-column-id="todo"] .tx-kanban-column-count')!;
    expect(count.textContent).toBe('2 / 3');
  });

  it('should add over-limit class when column exceeds limit', () => {
    const cols = deepCopy(COLUMNS);
    cols[0].limit = 1;
    kanban(container, { columns: cols });
    const col = container.querySelector('[data-column-id="todo"]')!;
    expect(col.classList.contains('tx-kanban-column-over-limit')).toBe(true);
  });

  it('should show empty message for empty columns', () => {
    kanban(container, { columns: deepCopy(COLUMNS) });
    const empty = container.querySelector('[data-column-id="done"] .tx-kanban-empty');
    expect(empty).not.toBeNull();
    expect(empty!.textContent).toBe('No items');
  });

  it('should apply column color as header border', () => {
    const cols = deepCopy(COLUMNS);
    cols[0].color = '#ff0000';
    kanban(container, { columns: cols });
    const header = container.querySelector('[data-column-id="todo"] .tx-kanban-column-header') as HTMLElement;
    expect(header.style.borderTop).toContain('rgb(255, 0, 0)');
  });

  it('getColumns() returns deep copy of columns', () => {
    const k = kanban(container, { columns: deepCopy(COLUMNS) });
    const cols = k.getColumns();
    expect(cols.length).toBe(3);
    expect(cols[0].items!.length).toBe(2);
    // Mutation shouldn't affect the widget
    cols[0].items!.push({ id: 'x', title: 'X' });
    expect(k.getColumns()[0].items!.length).toBe(2);
  });

  it('addCard() adds a card to a column', () => {
    const k = kanban(container, { columns: deepCopy(COLUMNS) });
    k.addCard('done', { id: 'c4', title: 'Task 4' });
    const doneCards = container.querySelector('[data-column-id="done"]')!.querySelectorAll('.tx-kanban-card');
    expect(doneCards.length).toBe(1);
    expect(k.getColumns()[2].items!.length).toBe(1);
  });

  it('removeCard() removes a card', () => {
    const k = kanban(container, { columns: deepCopy(COLUMNS) });
    k.removeCard('c1');
    const todoCards = container.querySelector('[data-column-id="todo"]')!.querySelectorAll('.tx-kanban-card');
    expect(todoCards.length).toBe(1);
    expect(k.getColumns()[0].items!.length).toBe(1);
  });

  it('moveCard() moves a card between columns', () => {
    const onMove = vi.fn();
    const k = kanban(container, { columns: deepCopy(COLUMNS), onMove });
    k.moveCard('c1', 'doing');
    expect(onMove).toHaveBeenCalledWith('c1', 'todo', 'doing');
    expect(k.getColumns()[0].items!.length).toBe(1);
    expect(k.getColumns()[1].items!.length).toBe(2);
  });

  it('onCardClick fires when a card is clicked', () => {
    const onCardClick = vi.fn();
    kanban(container, { columns: deepCopy(COLUMNS), onCardClick });
    const cardEl = container.querySelector('[data-card-id="c1"]') as HTMLElement;
    cardEl.click();
    expect(onCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', title: 'Task 1' }));
  });

  it('should use custom cardTemplate when provided', () => {
    kanban(container, {
      columns: deepCopy(COLUMNS),
      cardTemplate: '<div class="custom-card" data-card-id="{{id}}"><b>{{title}}</b></div>',
    });
    const customs = container.querySelectorAll('.custom-card');
    expect(customs.length).toBe(3);
    expect(customs[0].querySelector('b')!.textContent).toBe('Task 1');
  });

  it('destroy() clears content', () => {
    const k = kanban(container, { columns: deepCopy(COLUMNS) });
    k.destroy();
    expect(container.innerHTML).toBe('');
  });
});
