import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

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
  { id: 'done', title: 'Done', items: [] },
];

test.describe('Kanban Board Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders columns with titles', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    const colCount = await count(page, '.tx-kanban-column');
    expect(colCount).toBe(3);
    await expect(page.locator('.tx-kanban-column-title').nth(0)).toHaveText('To Do');
    await expect(page.locator('.tx-kanban-column-title').nth(1)).toHaveText('In Progress');
    await expect(page.locator('.tx-kanban-column-title').nth(2)).toHaveText('Done');
  });

  test('renders cards in correct columns', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    const todoCards = await count(page, '[data-column-id="todo"] .tx-kanban-card');
    const doingCards = await count(page, '[data-column-id="doing"] .tx-kanban-card');
    const doneCards = await count(page, '[data-column-id="done"] .tx-kanban-card');
    expect(todoCards).toBe(2);
    expect(doingCards).toBe(1);
    expect(doneCards).toBe(0);
  });

  test('renders card content', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    const card = page.locator('[data-card-id="c1"]');
    await expect(card.locator('.tx-kanban-card-title')).toHaveText('Task 1');
    await expect(card.locator('.tx-kanban-card-desc')).toHaveText('First task');
  });

  test('renders card labels', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    const labels = await count(page, '[data-card-id="c2"] .tx-kanban-card-label');
    expect(labels).toBe(1);
    await expect(page.locator('[data-card-id="c2"] .tx-kanban-card-label').first()).toHaveText('bug');
  });

  test('renders card assignee and priority', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await expect(page.locator('[data-card-id="c3"] .tx-kanban-card-assignee')).toContainText('Alice');
    await expect(page.locator('[data-card-id="c2"] .tx-kanban-card-priority')).toHaveText('high');
  });

  test('shows column counts', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await expect(page.locator('.tx-kanban-column-count').nth(0)).toHaveText('2');
    await expect(page.locator('.tx-kanban-column-count').nth(1)).toHaveText('1');
    await expect(page.locator('.tx-kanban-column-count').nth(2)).toHaveText('0');
  });

  test('shows WIP limit and over-limit class', async ({ page }) => {
    const cols = JSON.parse(JSON.stringify(COLUMNS));
    cols[0].limit = 1;
    await page.evaluate((c) => {
      (window as any).Teryx.kanban('#target', { columns: c });
    }, cols);
    await expect(page.locator('[data-column-id="todo"] .tx-kanban-column-count')).toHaveText('2 / 1');
    await expect(page.locator('[data-column-id="todo"]')).toHaveClass(/tx-kanban-column-over-limit/);
  });

  test('shows empty message in empty column', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await expect(page.locator('[data-column-id="done"] .tx-kanban-empty')).toHaveText('No items');
  });

  test('addCard adds a card to a column', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).__kb = (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await page.evaluate(() => {
      (window as any).__kb.addCard('done', { id: 'c4', title: 'Task 4' });
    });
    await page.waitForTimeout(100);
    const doneCards = await count(page, '[data-column-id="done"] .tx-kanban-card');
    expect(doneCards).toBe(1);
    await expect(page.locator('[data-card-id="c4"] .tx-kanban-card-title')).toHaveText('Task 4');
  });

  test('removeCard removes a card', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).__kb = (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await page.evaluate(() => {
      (window as any).__kb.removeCard('c1');
    });
    await page.waitForTimeout(100);
    const todoCards = await count(page, '[data-column-id="todo"] .tx-kanban-card');
    expect(todoCards).toBe(1);
  });

  test('moveCard moves a card between columns', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).__kb = (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await page.evaluate(() => {
      (window as any).__kb.moveCard('c1', 'doing');
    });
    await page.waitForTimeout(100);
    const todoCards = await count(page, '[data-column-id="todo"] .tx-kanban-card');
    const doingCards = await count(page, '[data-column-id="doing"] .tx-kanban-card');
    expect(todoCards).toBe(1);
    expect(doingCards).toBe(2);
  });

  test('getColumns returns current state', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).__kb = (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    const colData = await page.evaluate(() => (window as any).__kb.getColumns());
    expect(colData.length).toBe(3);
    expect(colData[0].items.length).toBe(2);
    expect(colData[1].items.length).toBe(1);
  });

  test('destroy clears the widget', async ({ page }) => {
    await page.evaluate((cols) => {
      (window as any).__kb = (window as any).Teryx.kanban('#target', { columns: cols });
    }, COLUMNS);
    await expect(page.locator('.tx-kanban')).toBeVisible();
    await page.evaluate(() => (window as any).__kb.destroy());
    await page.waitForTimeout(100);
    const boards = await count(page, '.tx-kanban');
    expect(boards).toBe(0);
  });
});
