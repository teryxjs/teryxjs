import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, texts } from './helpers';

test.describe('Pagination Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders page buttons for total items', async ({ page }) => {
    await createWidget(page, `
      Teryx.pagination('#target', { total: 100, pageSize: 10, current: 1 });
    `);
    await expect(page.locator('.tx-pagination')).toBeVisible();
    const pageButtons = await count(page, '.tx-pagination-page');
    expect(pageButtons).toBeGreaterThanOrEqual(7);
  });

  test('goTo changes the active page', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__pg = (window as any).Teryx.pagination('#target', { total: 100, pageSize: 10, current: 1 });
    });
    await expect(page.locator('.tx-pagination-active')).toHaveText('1');

    await page.evaluate(() => (window as any).__pg.goTo(5));
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-pagination-active')).toHaveText('5');
  });

  test('prev button navigates to previous page', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__pg = (window as any).Teryx.pagination('#target', { total: 100, pageSize: 10, current: 3 });
    });
    await expect(page.locator('.tx-pagination-active')).toHaveText('3');
    await page.locator('.tx-pagination-prev').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-pagination-active')).toHaveText('2');
  });

  test('next button navigates to next page', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__pg = (window as any).Teryx.pagination('#target', { total: 100, pageSize: 10, current: 3 });
    });
    await expect(page.locator('.tx-pagination-active')).toHaveText('3');
    await page.locator('.tx-pagination-next').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-pagination-active')).toHaveText('4');
  });

  test('prev button is disabled on first page', async ({ page }) => {
    await createWidget(page, `
      Teryx.pagination('#target', { total: 100, pageSize: 10, current: 1 });
    `);
    await expect(page.locator('.tx-pagination-prev')).toBeDisabled();
    await expect(page.locator('.tx-pagination-first')).toBeDisabled();
  });

  test('next button is disabled on last page', async ({ page }) => {
    await createWidget(page, `
      Teryx.pagination('#target', { total: 100, pageSize: 10, current: 10 });
    `);
    await expect(page.locator('.tx-pagination-next')).toBeDisabled();
    await expect(page.locator('.tx-pagination-last')).toBeDisabled();
  });

  test('simple mode shows page info text instead of page buttons', async ({ page }) => {
    await createWidget(page, `
      Teryx.pagination('#target', { total: 100, pageSize: 10, current: 3, simple: true });
    `);
    await expect(page.locator('.tx-pagination-simple')).toBeVisible();
    await expect(page.locator('.tx-pagination-info')).toHaveText('Page 3 of 10');
    const pageButtons = await count(page, '.tx-pagination-page');
    expect(pageButtons).toBe(0);
  });

  test('showTotal displays item range and total', async ({ page }) => {
    await createWidget(page, `
      Teryx.pagination('#target', { total: 100, pageSize: 25, current: 2, showTotal: true });
    `);
    await expect(page.locator('.tx-pagination-total')).toHaveText('26-50 of 100');
  });

  test('clicking a page number navigates to that page', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__pg = (window as any).Teryx.pagination('#target', { total: 100, pageSize: 10, current: 1 });
    });
    await page.locator('.tx-pagination-page[data-page="4"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-pagination-active')).toHaveText('4');
    const cur = await page.evaluate(() => (window as any).__pg.current());
    expect(cur).toBe(4);
  });
});
