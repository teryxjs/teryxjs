import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget } from './helpers';

const PAGE1_DATA = {
  rows: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ],
  total: 6,
};

test.describe('Grid Infinite Scroll', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders sentinel element when infiniteScroll is true', async ({ page }) => {
    await mockAPI(page, '/api/users', PAGE1_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        infiniteScroll: true,
        maxHeight: '200px',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const sentinel = page.locator('.tx-grid-infinite-loader');
    const sentinelCount = await sentinel.count();
    expect(sentinelCount).toBe(1);
  });

  test('does not render sentinel when infiniteScroll is false', async ({ page }) => {
    await mockAPI(page, '/api/users', PAGE1_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const sentinel = page.locator('.tx-grid-infinite-loader');
    const sentinelCount = await sentinel.count();
    expect(sentinelCount).toBe(0);
  });

  test('does not render pagination footer when infiniteScroll is enabled', async ({ page }) => {
    await mockAPI(page, '/api/users', PAGE1_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        infiniteScroll: true,
        maxHeight: '200px',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const footer = page.locator('.tx-grid-footer');
    const footerCount = await footer.count();
    expect(footerCount).toBe(0);
  });

  test('sentinel is initially hidden', async ({ page }) => {
    await mockAPI(page, '/api/users', PAGE1_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        infiniteScroll: true,
        maxHeight: '200px',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const sentinel = page.locator('.tx-grid-infinite-loader');
    await expect(sentinel).toHaveAttribute('style', /display:\s*none/);
  });

  test('grid body has scroll container with maxHeight', async ({ page }) => {
    await mockAPI(page, '/api/users', PAGE1_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        infiniteScroll: true,
        maxHeight: '300px',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid-body');
    const body = page.locator('.tx-grid-body');
    await expect(body).toHaveAttribute('style', /max-height.*300px/);
  });
});
