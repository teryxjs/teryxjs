import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { kanban } from '../../src/widgets/kanban';

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

describe('Kanban Board demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic Columns', () => {
    const COLUMNS = [
      {
        id: 'backlog',
        title: 'Backlog',
        color: '#94a3b8',
        items: [
          { id: 'b1', title: 'Research competitors', description: 'Analyse top 5 competitors' },
          { id: 'b2', title: 'Write RFC', description: 'Draft proposal document' },
        ],
      },
      {
        id: 'todo',
        title: 'To Do',
        color: '#3b82f6',
        items: [{ id: 't1', title: 'Design mockups', description: 'Create Figma screens', assignee: 'Alice' }],
      },
      {
        id: 'doing',
        title: 'In Progress',
        color: '#f59e0b',
        items: [{ id: 'd1', title: 'Build API', description: 'REST endpoints', assignee: 'Bob', priority: 'high' }],
      },
      { id: 'done', title: 'Done', color: '#22c55e', items: [] },
    ];

    it('renders four columns', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const cols = container.querySelectorAll('.tx-kanban-column');
      expect(cols.length).toBe(4);
    });

    it('renders column titles', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const titles = container.querySelectorAll('.tx-kanban-column-title');
      expect(titles[0].textContent).toBe('Backlog');
      expect(titles[1].textContent).toBe('To Do');
      expect(titles[2].textContent).toBe('In Progress');
      expect(titles[3].textContent).toBe('Done');
    });

    it('renders correct card counts per column', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const backlogCards = container.querySelector('[data-column-id="backlog"]')!.querySelectorAll('.tx-kanban-card');
      expect(backlogCards.length).toBe(2);
      const doneCards = container.querySelector('[data-column-id="done"]')!.querySelectorAll('.tx-kanban-card');
      expect(doneCards.length).toBe(0);
    });

    it('renders column header colors', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const header = container.querySelector('[data-column-id="backlog"] .tx-kanban-column-header') as HTMLElement;
      expect(header.style.borderTop).toContain('rgb(148, 163, 184)');
    });

    it('shows empty message for empty column', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const empty = container.querySelector('[data-column-id="done"] .tx-kanban-empty');
      expect(empty).not.toBeNull();
      expect(empty!.textContent).toBe('No items');
    });
  });

  describe('Drag Cards', () => {
    const COLUMNS = [
      {
        id: 'open',
        title: 'Open',
        color: '#3b82f6',
        items: [
          { id: 'drag1', title: 'Drag me!', description: 'Drop into another column' },
          { id: 'drag2', title: 'Me too', description: 'Try dragging this card' },
        ],
      },
      {
        id: 'wip',
        title: 'Work In Progress',
        color: '#f59e0b',
        items: [{ id: 'drag3', title: 'Ongoing work', assignee: 'Eve' }],
      },
      { id: 'closed', title: 'Closed', color: '#22c55e', items: [] },
    ];

    it('renders draggable board with three columns', () => {
      kanban(container, { columns: deepCopy(COLUMNS), draggable: true });
      const cols = container.querySelectorAll('.tx-kanban-column');
      expect(cols.length).toBe(3);
    });

    it('moveCard fires onMove callback', () => {
      const onMove = vi.fn();
      const kb = kanban(container, { columns: deepCopy(COLUMNS), draggable: true, onMove });
      kb.moveCard('drag1', 'wip');
      expect(onMove).toHaveBeenCalledWith('drag1', 'open', 'wip');
    });

    it('moveCard updates column card counts', () => {
      const kb = kanban(container, { columns: deepCopy(COLUMNS), draggable: true });
      kb.moveCard('drag1', 'closed');
      const openCards = container.querySelector('[data-column-id="open"]')!.querySelectorAll('.tx-kanban-card');
      const closedCards = container.querySelector('[data-column-id="closed"]')!.querySelectorAll('.tx-kanban-card');
      expect(openCards.length).toBe(1);
      expect(closedCards.length).toBe(1);
    });
  });

  describe('WIP Limits', () => {
    const COLUMNS = [
      {
        id: 'wip-todo',
        title: 'To Do',
        color: '#3b82f6',
        limit: 5,
        items: [
          { id: 'wip1', title: 'Task A' },
          { id: 'wip2', title: 'Task B' },
          { id: 'wip3', title: 'Task C' },
        ],
      },
      {
        id: 'wip-doing',
        title: 'In Progress',
        color: '#f59e0b',
        limit: 2,
        items: [
          { id: 'wip4', title: 'Task D', priority: 'high' },
          { id: 'wip5', title: 'Task E', priority: 'medium' },
          { id: 'wip6', title: 'Task F' },
        ],
      },
      {
        id: 'wip-done',
        title: 'Done',
        color: '#22c55e',
        items: [{ id: 'wip7', title: 'Task G' }],
      },
    ];

    it('displays WIP limit in column count', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const count = container.querySelector('[data-column-id="wip-todo"] .tx-kanban-column-count')!;
      expect(count.textContent).toBe('3 / 5');
    });

    it('adds over-limit class when column exceeds limit', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const doingCol = container.querySelector('[data-column-id="wip-doing"]')!;
      expect(doingCol.classList.contains('tx-kanban-column-over-limit')).toBe(true);
    });

    it('does not add over-limit class when within limit', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const todoCol = container.querySelector('[data-column-id="wip-todo"]')!;
      expect(todoCol.classList.contains('tx-kanban-column-over-limit')).toBe(false);
    });

    it('column without limit does not show limit text', () => {
      kanban(container, { columns: deepCopy(COLUMNS) });
      const count = container.querySelector('[data-column-id="wip-done"] .tx-kanban-column-count')!;
      expect(count.textContent).toBe('1');
    });
  });

  describe('Custom Card Templates', () => {
    const TEMPLATE =
      '<div class="custom-tpl" data-card-id="{{id}}">' +
      '<div class="tpl-title">{{title}}</div>' +
      '<div class="tpl-assignee">{{assignee}}</div>' +
      '<div class="tpl-priority">{{priority}}</div>' +
      '</div>';

    const COLUMNS = [
      {
        id: 'tpl-todo',
        title: 'To Do',
        items: [
          { id: 'tpl1', title: 'Custom layout', assignee: 'Alice', priority: 'high' },
          { id: 'tpl2', title: 'Styled cards', assignee: 'Bob', priority: 'low' },
        ],
      },
      {
        id: 'tpl-doing',
        title: 'In Progress',
        items: [{ id: 'tpl3', title: 'Template engine', assignee: 'Carol', priority: 'medium' }],
      },
      { id: 'tpl-done', title: 'Done', items: [] },
    ];

    it('renders cards using custom template', () => {
      kanban(container, { columns: deepCopy(COLUMNS), cardTemplate: TEMPLATE });
      const customCards = container.querySelectorAll('.custom-tpl');
      expect(customCards.length).toBe(3);
    });

    it('interpolates title in custom template', () => {
      kanban(container, { columns: deepCopy(COLUMNS), cardTemplate: TEMPLATE });
      const first = container.querySelector('[data-card-id="tpl1"]')!;
      expect(first.querySelector('.tpl-title')!.textContent).toBe('Custom layout');
    });

    it('interpolates assignee in custom template', () => {
      kanban(container, { columns: deepCopy(COLUMNS), cardTemplate: TEMPLATE });
      const first = container.querySelector('[data-card-id="tpl1"]')!;
      expect(first.querySelector('.tpl-assignee')!.textContent).toBe('Alice');
    });

    it('interpolates priority in custom template', () => {
      kanban(container, { columns: deepCopy(COLUMNS), cardTemplate: TEMPLATE });
      const first = container.querySelector('[data-card-id="tpl1"]')!;
      expect(first.querySelector('.tpl-priority')!.textContent).toBe('high');
    });
  });

  describe('Add / Remove Cards', () => {
    const COLUMNS = [
      {
        id: 'ar-todo',
        title: 'To Do',
        items: [{ id: 'ar1', title: 'Existing task', description: 'Already here' }],
      },
      { id: 'ar-doing', title: 'In Progress', items: [] },
      { id: 'ar-done', title: 'Done', items: [] },
    ];

    it('addCard appends a card to the specified column', () => {
      const kb = kanban(container, { columns: deepCopy(COLUMNS) });
      kb.addCard('ar-todo', { id: 'new1', title: 'New Task #1' });
      const cards = container.querySelector('[data-column-id="ar-todo"]')!.querySelectorAll('.tx-kanban-card');
      expect(cards.length).toBe(2);
    });

    it('addCard renders the new card title', () => {
      const kb = kanban(container, { columns: deepCopy(COLUMNS) });
      kb.addCard('ar-todo', { id: 'new1', title: 'New Task #1' });
      const card = container.querySelector('[data-card-id="new1"]')!;
      expect(card.querySelector('.tx-kanban-card-title')!.textContent).toBe('New Task #1');
    });

    it('removeCard removes a card from the board', () => {
      const kb = kanban(container, { columns: deepCopy(COLUMNS) });
      kb.removeCard('ar1');
      const cards = container.querySelector('[data-column-id="ar-todo"]')!.querySelectorAll('.tx-kanban-card');
      expect(cards.length).toBe(0);
    });

    it('removeCard followed by addCard works correctly', () => {
      const kb = kanban(container, { columns: deepCopy(COLUMNS) });
      kb.removeCard('ar1');
      kb.addCard('ar-doing', { id: 'new2', title: 'Replacement' });
      const todoCnt = container.querySelector('[data-column-id="ar-todo"]')!.querySelectorAll('.tx-kanban-card').length;
      const doingCnt = container
        .querySelector('[data-column-id="ar-doing"]')!
        .querySelectorAll('.tx-kanban-card').length;
      expect(todoCnt).toBe(0);
      expect(doingCnt).toBe(1);
    });

    it('getColumns reflects add and remove operations', () => {
      const kb = kanban(container, { columns: deepCopy(COLUMNS) });
      kb.addCard('ar-done', { id: 'new3', title: 'Done item' });
      kb.removeCard('ar1');
      const cols = kb.getColumns();
      const todo = cols.find((c) => c.id === 'ar-todo')!;
      const done = cols.find((c) => c.id === 'ar-done')!;
      expect(todo.items!.length).toBe(0);
      expect(done.items!.length).toBe(1);
    });
  });
});
