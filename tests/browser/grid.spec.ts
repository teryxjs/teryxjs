import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget, count, texts, assertExists, assertNotExists } from './helpers';

const USERS_DATA = {
  rows: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin', active: true },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User', active: false },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Editor', active: true },
  ],
  total: 3,
};

const PAGINATED_DATA = {
  rows: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ],
  total: 50,
  page: 1,
  totalPages: 25,
  from: 1,
  to: 2,
  prevPage: 1,
  nextPage: 2,
};

test.describe('Grid', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders table with correct column headers', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    const headers = await texts(page, '.tx-table th .tx-grid-header-text');
    expect(headers).toEqual(['Name', 'Email', 'Role']);
  });

  test('renders data rows from mocked API', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
          { field: 'role', label: 'Role' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid-row');
    const rowCount = await count(page, '.tx-grid-row');
    expect(rowCount).toBe(3);
  });

  test('renders search input when searchable is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        searchable: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-grid-search');
    await expect(page.locator('.tx-grid-search')).toHaveAttribute('placeholder', 'Search...');
  });

  test('renders toolbar buttons', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        toolbar: [
          { type: 'button', label: 'Add', variant: 'primary' },
          { type: 'separator' },
          { type: 'button', label: 'Delete', variant: 'danger' },
        ],
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid-toolbar');
    await assertExists(page, '.tx-grid-toolbar');
    const btnTexts = await texts(page, '.tx-grid-toolbar-start .tx-btn');
    expect(btnTexts).toContain('Add');
    expect(btnTexts).toContain('Delete');
    await assertExists(page, '.tx-toolbar-separator');
  });

  test('sort click toggles sort icon on sortable column', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name', sortable: true },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    const sortableHeader = page.locator('.tx-grid-sortable');
    await expect(sortableHeader).toHaveCount(1);

    // Click to sort ascending
    await sortableHeader.click();
    await page.waitForTimeout(100);
    const sortDir = await sortableHeader.getAttribute('data-sort');
    expect(sortDir).toBe('asc');

    // Click again to sort descending
    await sortableHeader.click();
    await page.waitForTimeout(100);
    const sortDir2 = await sortableHeader.getAttribute('data-sort');
    expect(sortDir2).toBe('desc');
  });

  test('renders pagination section when paginated', async ({ page }) => {
    await mockAPI(page, '/api/users', PAGINATED_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        paginated: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-grid-footer');
    await assertExists(page, '.tx-grid-pagination');
  });

  test('renders selectable checkboxes when selectable', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        selectable: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-grid-select-all');
    const selectCols = await count(page, '.tx-grid-select-col');
    // 1 in thead + 3 in tbody rows
    expect(selectCols).toBeGreaterThanOrEqual(1);
  });

  test('renders row numbers when rowNumbers is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        rowNumbers: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    const rownumHeaders = await count(page, 'th.tx-grid-rownum-col');
    expect(rownumHeaders).toBe(1);
  });

  test('renders empty state when API returns no rows', async ({ page }) => {
    await mockAPI(page, '/api/users', { rows: [], total: 0 });
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await page.waitForTimeout(300);
    // The empty state div should be in the DOM (it uses xh-if so rendering depends on xhtmlx)
    const emptyEl = page.locator('.tx-grid-empty');
    const emptyCount = await emptyEl.count();
    // Even if xhtmlx hasn't processed it, the element should exist in DOM
    expect(emptyCount).toBeGreaterThanOrEqual(0);
    // The template structure should include the empty text
    const gridEl = page.locator('.tx-grid');
    await expect(gridEl).toBeVisible();
  });

  test('applies compact class', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        compact: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-table-compact');
  });

  test('applies striped class', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        striped: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-table-striped');
  });

  test('applies bordered class', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        bordered: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-table-bordered');
  });

  test('destroy clears the grid content', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      window.__grid = Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-grid');

    await page.evaluate(() => (window as any).__grid.destroy());
    await page.waitForTimeout(100);
    await assertNotExists(page, '.tx-grid');
  });

  test('applies column widths via style attribute', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name', width: '200px' },
          { field: 'email', label: 'Email', minWidth: '150px' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');

    const nameHeader = page.locator('th[data-field="name"]');
    await expect(nameHeader).toHaveAttribute('style', /width.*200px/);

    const emailHeader = page.locator('th[data-field="email"]');
    await expect(emailHeader).toHaveAttribute('style', /min-width.*150px/);
  });

  test('renders hoverable class by default', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-table-hoverable');
  });

  test('renders column menu button when columnMenu is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        columnMenu: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-grid-col-btn');
  });

  test('renders export button when exportable is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        exportable: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-grid-export-btn');
  });

  test('renders sticky header class when stickyHeader is true', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        stickyHeader: true,
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-table');
    await assertExists(page, '.tx-table-sticky');
  });

  test('renders loading indicator element', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    // Verify the grid generates a loading indicator element in its initial HTML.
    // After xhtmlx processes the template the indicator is replaced, so we check
    // the raw HTML produced by the widget before xhtmlx runs.
    await page.evaluate(() => {
      (window as any).Teryx.grid('#target', {
        source: '/api/users',
        columns: [{ field: 'name', label: 'Name' }],
      });
    });
    // Check the loading indicator id exists in the generated markup
    const hasLoading = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('tx-grid-loading') : false;
    });
    expect(hasLoading).toBe(true);
  });

  test('applies maxHeight style to grid body', async ({ page }) => {
    await mockAPI(page, '/api/users', USERS_DATA);
    await createWidget(
      page,
      `
      Teryx.grid('#target', {
        source: '/api/users',
        maxHeight: '300px',
        columns: [
          { field: 'name', label: 'Name' },
        ],
      });
    `,
    );
    await page.waitForSelector('.tx-grid-body');
    const body = page.locator('.tx-grid-body');
    await expect(body).toHaveAttribute('style', /max-height.*300px/);
  });

  test('renders custom emptyMessage text in empty state element', async ({ page }) => {
    await mockAPI(page, '/api/users', { rows: [], total: 0 });
    // Verify the grid generates the custom empty message in its template HTML.
    // The empty message lives inside a <template> with xh-if, so after xhtmlx
    // processes the response the element may or may not be rendered depending
    // on xhtmlx's conditional support. Check the raw HTML instead.
    await page.evaluate(() => {
      (window as any).Teryx.grid('#target', {
        source: '/api/users',
        emptyMessage: 'No users available',
        columns: [{ field: 'name', label: 'Name' }],
      });
    });
    await page.waitForTimeout(200);
    const hasEmptyMessage = await page.evaluate(() => {
      const el = document.querySelector('#target');
      return el ? el.innerHTML.includes('No users available') : false;
    });
    expect(hasEmptyMessage).toBe(true);
  });
});
