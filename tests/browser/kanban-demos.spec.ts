import { test, expect } from '@playwright/test';

test.describe('Explorer — Kanban Board demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#specialized-kanban-board');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all five kanban demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('basic columns demo renders four columns', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const cols = first.locator('.tx-kanban-column');
    expect(await cols.count()).toBe(4);
  });

  test('basic columns demo shows column titles', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const titles = first.locator('.tx-kanban-column-title');
    await expect(titles.nth(0)).toHaveText('Backlog');
    await expect(titles.nth(1)).toHaveText('To Do');
    await expect(titles.nth(2)).toHaveText('In Progress');
    await expect(titles.nth(3)).toHaveText('Done');
  });

  test('basic columns demo renders cards in columns', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const backlogCards = first.locator('[data-column-id="backlog"] .tx-kanban-card');
    expect(await backlogCards.count()).toBe(2);
    const doneCards = first.locator('[data-column-id="done"] .tx-kanban-card');
    expect(await doneCards.count()).toBe(0);
  });

  test('drag cards demo has three columns', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    const cols = second.locator('.tx-kanban-column');
    expect(await cols.count()).toBe(3);
  });

  test('drag cards demo renders draggable cards', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    const cards = second.locator('.tx-kanban-card');
    expect(await cards.count()).toBe(3);
  });

  test('WIP limits demo shows limit text in column count', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    const todoCount = third.locator('[data-column-id="wip-todo"] .tx-kanban-column-count');
    await expect(todoCount).toHaveText('3 / 5');
  });

  test('WIP limits demo marks over-limit column', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    const doingCol = third.locator('[data-column-id="wip-doing"]');
    await expect(doingCol).toHaveClass(/tx-kanban-column-over-limit/);
  });

  test('custom card templates demo renders custom elements', async ({ page }) => {
    const fourth = page.locator('.ex-demo').nth(3);
    const customCards = fourth.locator('.custom-tpl');
    expect(await customCards.count()).toBe(3);
  });

  test('add/remove demo has action buttons', async ({ page }) => {
    const fifth = page.locator('.ex-demo').nth(4);
    const addBtn = fifth.locator('button', { hasText: 'Add Card' });
    const removeBtn = fifth.locator('button', { hasText: 'Remove First' });
    await expect(addBtn).toBeVisible();
    await expect(removeBtn).toBeVisible();
  });

  test('add button adds a card to the board', async ({ page }) => {
    const fifth = page.locator('.ex-demo').nth(4);
    const initialCount = await fifth.locator('[data-column-id="ar-todo"] .tx-kanban-card').count();
    expect(initialCount).toBe(1);

    await fifth.locator('button', { hasText: 'Add Card' }).click();
    await page.waitForTimeout(200);

    const afterCount = await fifth.locator('[data-column-id="ar-todo"] .tx-kanban-card').count();
    expect(afterCount).toBe(2);
  });

  test('remove button removes a card from the board', async ({ page }) => {
    const fifth = page.locator('.ex-demo').nth(4);
    const initialCount = await fifth.locator('[data-column-id="ar-todo"] .tx-kanban-card').count();
    expect(initialCount).toBe(1);

    await fifth.locator('button', { hasText: 'Remove First' }).click();
    await page.waitForTimeout(200);

    const afterCount = await fifth.locator('[data-column-id="ar-todo"] .tx-kanban-card').count();
    expect(afterCount).toBe(0);
  });

  test('empty column shows empty message', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('[data-column-id="done"] .tx-kanban-empty')).toHaveText('No items');
  });
});
