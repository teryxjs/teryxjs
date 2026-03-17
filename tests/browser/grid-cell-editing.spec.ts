import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget } from './helpers';

const USERS_DATA = {
  rows: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Editor' },
  ],
  total: 3,
};

test.describe('Grid Cell Editing', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders editable cells with data-editable attribute', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        editable: true,
        columns: [
          { field: 'name', label: 'Name', editable: true },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role', editable: true },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-table');

    const hasEditable = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('data-editable="true"') : false;
    });
    expect(hasEditable).toBe(true);
  });

  test('non-editable grid does not add data-editable attributes', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name', editable: true },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-table');

    const hasEditable = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('data-editable="true"') : false;
    });
    expect(hasEditable).toBe(false);
  });

  test('editable cells have correct editor-type attribute', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        editable: true,
        columns: [
          { field: 'name', label: 'Name', editable: true, editorType: 'text' },
          { field: 'email', label: 'Email', editable: true, editorType: 'number' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-table');

    const hasNumberEditor = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('data-editor-type="number"') : false;
    });
    expect(hasNumberEditor).toBe(true);
  });

  test('defaults editor-type to text when not specified', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        editable: true,
        columns: [
          { field: 'name', label: 'Name', editable: true },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-table');

    const hasTextEditor = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('data-editor-type="text"') : false;
    });
    expect(hasTextEditor).toBe(true);
  });

  test('editable cells have correct data-field attributes', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        editable: true,
        columns: [
          { field: 'name', label: 'Name', editable: true },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );

    await page.waitForSelector('.tx-table');

    const hasNameField = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('data-field="name"') && el.innerHTML.includes('data-editable="true"') : false;
    });
    expect(hasNameField).toBe(true);
  });
});
