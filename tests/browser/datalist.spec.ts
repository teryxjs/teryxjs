import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, count } from './helpers';

test.describe('DataList Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders items from API source', async ({ page }) => {
    await mockAPI(page, '/api/items', {
      items: [
        { name: 'Item 1', desc: 'Description 1' },
        { name: 'Item 2', desc: 'Description 2' },
        { name: 'Item 3', desc: 'Description 3' }
      ]
    });

    await page.evaluate(() => {
      (window as any).Teryx.datalist('#target', {
        source: '/api/items',
        itemTemplate: '<strong xh-text="name"></strong><span xh-text="desc"></span>'
      });
    });
    await page.waitForTimeout(500);

    await expect(page.locator('.tx-datalist')).toBeVisible();
    const items = await count(page, '.tx-datalist-item');
    expect(items).toBe(3);
  });

  test('empty state is shown when no items are returned', async ({ page }) => {
    await mockAPI(page, '/api/empty', { items: [] });

    await page.evaluate(() => {
      (window as any).Teryx.datalist('#target', {
        source: '/api/empty',
        itemTemplate: '<span xh-text="name"></span>',
        emptyMessage: 'Nothing here'
      });
    });
    await page.waitForTimeout(500);

    // The datalist container should exist in the DOM
    await expect(page.locator('.tx-datalist')).toBeAttached();
    // No items should be rendered
    const items = await count(page, '.tx-datalist-item');
    expect(items).toBe(0);
  });

  test('grid layout applies the grid class', async ({ page }) => {
    await mockAPI(page, '/api/grid-items', {
      items: [{ name: 'A' }, { name: 'B' }]
    });

    await page.evaluate(() => {
      (window as any).Teryx.datalist('#target', {
        source: '/api/grid-items',
        layout: 'grid',
        gridColumns: 3,
        itemTemplate: '<span xh-text="name"></span>'
      });
    });
    await page.waitForTimeout(500);

    // The datalist should have the grid layout class on the container
    await expect(page.locator('.tx-datalist-grid').first()).toBeAttached();
  });

  test('list layout is the default', async ({ page }) => {
    await mockAPI(page, '/api/list-items', {
      items: [{ name: 'X' }]
    });

    await page.evaluate(() => {
      (window as any).Teryx.datalist('#target', {
        source: '/api/list-items',
        itemTemplate: '<span xh-text="name"></span>'
      });
    });
    await page.waitForTimeout(500);

    await expect(page.locator('.tx-datalist-list')).toBeVisible();
  });

  test('loading indicator is present before data loads', async ({ page }) => {
    // Delay the API response to observe the loading state
    await page.route('**/api/slow*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [{ name: 'Loaded' }] })
      });
    });

    await page.evaluate(() => {
      (window as any).Teryx.datalist('#target', {
        source: '/api/slow',
        itemTemplate: '<span xh-text="name"></span>'
      });
    });

    // The loading indicator element should be present in the DOM
    await expect(page.locator('.tx-datalist .xh-indicator')).toBeAttached();
  });
});
