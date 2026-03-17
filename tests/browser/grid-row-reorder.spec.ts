import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget, count } from './helpers';

const USERS_DATA = {
  rows: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ],
  total: 3,
};

test.describe('Grid Row Reorder', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders grip column when reorderable is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        reorderable: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    // Check for grip column header in template
    const hasGripCol = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('tx-grid-grip-col') : false;
    });
    expect(hasGripCol).toBe(true);
  });

  test('renders grip handle cells in row template', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        reorderable: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const hasGrip = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('tx-grid-grip') : false;
    });
    expect(hasGrip).toBe(true);
  });

  test('does not render grip column when reorderable is false', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
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
    const hasGripCol = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('tx-grid-grip-col') : false;
    });
    expect(hasGripCol).toBe(false);
  });

  test('renders row drop line element when reorderable is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        reorderable: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const dropLine = page.locator('.tx-grid-row-drop-line');
    const dropLineCount = await dropLine.count();
    expect(dropLineCount).toBe(1);
  });

  test('row drop line is initially hidden', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        reorderable: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const dropLine = page.locator('.tx-grid-row-drop-line');
    await expect(dropLine).toHaveAttribute('style', /display:\s*none/);
  });

  test('does not render row drop line when reorderable is not set', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
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
    const dropLine = page.locator('.tx-grid-row-drop-line');
    const dropLineCount = await dropLine.count();
    expect(dropLineCount).toBe(0);
  });

  test('grip handle contains the grip icon SVG', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        reorderable: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    // The grip icon is an SVG rendered via the icon('grip') utility
    const hasGripSvg = await page.evaluate(() => {
      const el = document.querySelector('#target');
      // Check template contains svg within the grip td
      return el ? el.innerHTML.includes('tx-grid-grip') && el.innerHTML.includes('<svg') : false;
    });
    expect(hasGripSvg).toBe(true);
  });
});
