import { test, expect } from '@playwright/test';

test.describe('Explorer — Drag & Drop Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#utilities-drag-drop');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 drag & drop demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('sortable list demo renders 5 items', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Sortable List');

    const items = demo.locator('[data-testid="dd-sortable-list"] .tx-dd-sortable-item');
    expect(await items.count()).toBe(5);
  });

  test('sortable list items have tx-draggable class', async ({ page }) => {
    const items = page.locator('[data-testid="dd-sortable-list"] .tx-draggable');
    expect(await items.count()).toBe(5);
  });

  test('drag between containers demo renders two panels', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Drag Between Containers');

    await expect(demo.locator('[data-testid="dd-source-panel"]')).toBeVisible();
    await expect(demo.locator('[data-testid="dd-target-panel"]')).toBeVisible();
  });

  test('source panel has 3 draggable items', async ({ page }) => {
    const sourceItems = page.locator('[data-testid="dd-source-panel"] .tx-dd-between-item');
    expect(await sourceItems.count()).toBe(3);
  });

  test('target panel starts empty', async ({ page }) => {
    const targetItems = page.locator('[data-testid="dd-target-panel"] .tx-dd-between-item');
    expect(await targetItems.count()).toBe(0);
  });

  test('drag handle demo renders 3 cards', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Drag Handle');

    const cards = demo.locator('[data-testid="dd-handle-list"] .tx-draggable');
    expect(await cards.count()).toBe(3);
  });

  test('drag handle cards contain handle elements', async ({ page }) => {
    const handles = page.locator('[data-testid="dd-handle-list"] .dd-handle');
    expect(await handles.count()).toBe(3);
  });

  test('accept filter demo renders drop zone', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Drop Zone with Accept Filter');

    await expect(demo.locator('[data-testid="dd-accept-zone"]')).toBeVisible();
  });

  test('accept filter demo has 3 draggable chips', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    const chips = demo.locator('.tx-dd-filter-chip');
    expect(await chips.count()).toBe(3);
  });
});

test.describe('Explorer — Export Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#utilities-export');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 5 export demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('Export CSV demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Export CSV');
    await expect(demo.locator('[data-testid="export-csv-btn"]')).toBeVisible();
    await expect(demo.locator('[data-testid="export-csv-btn"]')).toHaveText('Export CSV');
  });

  test('Export Excel demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Export Excel');
    await expect(demo.locator('[data-testid="export-excel-btn"]')).toBeVisible();
  });

  test('Export JSON demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Export JSON');
    await expect(demo.locator('[data-testid="export-json-btn"]')).toBeVisible();
  });

  test('Export HTML demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Export HTML');
    await expect(demo.locator('[data-testid="export-html-btn"]')).toBeVisible();
  });

  test('All Formats demo renders 4 export buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('All Formats');

    const buttons = demo.locator('[data-testid="export-all-group"] button');
    expect(await buttons.count()).toBe(4);
  });

  test('All Formats demo renders preview table with 5 data rows', async ({ page }) => {
    const table = page.locator('[data-testid="export-preview-table"]');
    await expect(table).toBeVisible();

    const headerCells = table.locator('thead th');
    expect(await headerCells.count()).toBe(5);

    const dataRows = table.locator('tbody tr');
    expect(await dataRows.count()).toBe(5);
  });

  test('preview table headers match expected columns', async ({ page }) => {
    const table = page.locator('[data-testid="export-preview-table"]');
    const headers = table.locator('thead th');

    await expect(headers.nth(0)).toHaveText('ID');
    await expect(headers.nth(1)).toHaveText('Name');
    await expect(headers.nth(2)).toHaveText('Role');
    await expect(headers.nth(3)).toHaveText('Department');
    await expect(headers.nth(4)).toHaveText('Salary');
  });

  test('CSV export button triggers download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="export-csv-btn"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('team.csv');
  });

  test('Excel export button triggers download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="export-excel-btn"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('team.xls');
  });

  test('JSON export button triggers download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="export-json-btn"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('team.json');
  });

  test('HTML export button triggers download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="export-html-btn"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('team.html');
  });
});
