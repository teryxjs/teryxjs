import { test, expect } from '@playwright/test';
import { setupPage, createWidget, assertExists } from './helpers';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders columns and cards', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.kanban('#target', {
        columns: [
          { id: 'todo', title: 'To Do', items: [
            { id: 'c1', title: 'Task 1' },
            { id: 'c2', title: 'Task 2' }
          ]},
          { id: 'doing', title: 'In Progress', items: [
            { id: 'c3', title: 'Task 3' }
          ]},
          { id: 'done', title: 'Done', items: [] }
        ]
      });
    `,
    );

    await expect(page.locator('.tx-kanban')).toBeVisible();
    expect(await page.locator('.tx-kanban-column').count()).toBe(3);
    expect(await page.locator('.tx-kanban-card').count()).toBe(3);
    await expect(page.locator('.tx-kanban-header-title').first()).toHaveText('To Do');
  });

  test('card click fires callback', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__clickedCard = null;
      Teryx.kanban('#target', {
        columns: [
          { id: 'col1', title: 'Col', items: [{ id: 'c1', title: 'Click Me' }] }
        ],
        onCardClick: (card) => { window.__clickedCard = card; }
      });
    `,
    );

    await page.locator('[data-card-id="c1"]').click();
    await page.waitForTimeout(100);

    const clicked = await page.evaluate(() => (window as any).__clickedCard);
    expect(clicked).toBeTruthy();
    expect(clicked.id).toBe('c1');
  });

  test('addCard adds a card to a column', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__kanban = Teryx.kanban('#target', {
        columns: [
          { id: 'col1', title: 'Col', items: [] }
        ]
      });
    `,
    );

    expect(await page.locator('.tx-kanban-card').count()).toBe(0);

    await page.evaluate(() => (window as any).__kanban.addCard('col1', { id: 'new1', title: 'New Card' }));
    await page.waitForTimeout(100);

    expect(await page.locator('.tx-kanban-card').count()).toBe(1);
    await expect(page.locator('.tx-kanban-card-title')).toHaveText('New Card');
  });

  test('removeCard removes a card', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__kanban = Teryx.kanban('#target', {
        columns: [
          { id: 'col1', title: 'Col', items: [{ id: 'c1', title: 'Remove Me' }] }
        ]
      });
    `,
    );

    expect(await page.locator('.tx-kanban-card').count()).toBe(1);

    await page.evaluate(() => (window as any).__kanban.removeCard('c1'));
    await page.waitForTimeout(100);

    expect(await page.locator('.tx-kanban-card').count()).toBe(0);
  });

  test('destroy clears all DOM content', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__kanban = Teryx.kanban('#target', {
        columns: [
          { id: 'col1', title: 'Col', items: [{ id: 'c1', title: 'Task' }] }
        ]
      });
    `,
    );

    await assertExists(page, '.tx-kanban');

    await page.evaluate(() => (window as any).__kanban.destroy());
    await page.waitForTimeout(100);

    expect(await page.locator('.tx-kanban').count()).toBe(0);
  });
});
