import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget } from './helpers';

const USERS_DATA = {
  rows: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  ],
  total: 2,
};

test.describe('Grid Column Reorder', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders drop indicator element when columnReorder is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columnReorder: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const indicator = page.locator('.tx-grid-drop-indicator');
    const indicatorCount = await indicator.count();
    expect(indicatorCount).toBe(1);
  });

  test('does not render drop indicator when columnReorder is false', async ({ page }) => {
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
    const indicator = page.locator('.tx-grid-drop-indicator');
    const indicatorCount = await indicator.count();
    expect(indicatorCount).toBe(0);
  });

  test('drop indicator is initially hidden', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columnReorder: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid');
    const indicator = page.locator('.tx-grid-drop-indicator');
    await expect(indicator).toHaveAttribute('style', /display:\s*none/);
  });

  test('column headers have data-field attributes for reorder targeting', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columnReorder: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    const nameHeader = page.locator('th[data-field="name"]');
    await expect(nameHeader).toHaveCount(1);
    const emailHeader = page.locator('th[data-field="email"]');
    await expect(emailHeader).toHaveCount(1);
    const roleHeader = page.locator('th[data-field="role"]');
    await expect(roleHeader).toHaveCount(1);
  });

  test('mousedown on header creates ghost element during drag', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columnReorder: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    const nameHeader = page.locator('th[data-field="name"]');
    const box = await nameHeader.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      // Ghost should be created
      await page.waitForTimeout(50);
      const ghostCount = await page.locator('.tx-grid-header-dragging').count();
      expect(ghostCount).toBe(1);
      await page.mouse.up();
    }
  });
});
