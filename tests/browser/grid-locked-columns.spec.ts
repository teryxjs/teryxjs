import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget, count, texts } from './helpers';

const USERS_DATA = {
  rows: [
    {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      role: 'Admin',
      dept: 'Engineering',
    },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User', dept: 'Sales' },
    {
      id: 3,
      name: 'Charlie',
      email: 'charlie@example.com',
      role: 'Editor',
      dept: 'Marketing',
    },
  ],
  total: 3,
};

test.describe('Grid Locked Columns', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders locked-left, scrollable, and locked-right sections', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'id', label: 'ID', locked: 'left', width: '80px' },
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role' },
          { field: 'dept', label: 'Dept', locked: 'right', width: '120px' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-grid-locked-container');

    const leftSection = page.locator('.tx-grid-locked-left');
    const scrollableSection = page.locator('.tx-grid-scrollable');
    const rightSection = page.locator('.tx-grid-locked-right');

    await expect(leftSection).toHaveCount(1);
    await expect(scrollableSection).toHaveCount(1);
    await expect(rightSection).toHaveCount(1);
  });

  test('left locked section contains the correct column header', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'id', label: 'ID', locked: 'left' },
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-grid-locked-container');

    const leftHeaders = await texts(page, '.tx-grid-locked-left .tx-grid-header-text');
    expect(leftHeaders).toEqual(['ID']);
  });

  test('scrollable center contains unlocked columns', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'id', label: 'ID', locked: 'left' },
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role', locked: 'right' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-grid-locked-container');

    const centerHeaders = await texts(page, '.tx-grid-scrollable .tx-grid-header-text');
    expect(centerHeaders).toEqual(['Name', 'Email']);
  });

  test('does not render locked container when no columns are locked', async ({ page }) => {
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

    await page.waitForSelector('.tx-table');

    const lockedContainer = page.locator('.tx-grid-locked-container');
    await expect(lockedContainer).toHaveCount(0);
  });

  test('left-only locked columns omit right section', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'id', label: 'ID', locked: 'left' },
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-grid-locked-container');

    await expect(page.locator('.tx-grid-locked-left')).toHaveCount(1);
    await expect(page.locator('.tx-grid-scrollable')).toHaveCount(1);
    await expect(page.locator('.tx-grid-locked-right')).toHaveCount(0);
  });
});
