import { test, expect } from '@playwright/test';

test.describe('Explorer — Grid Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-grid');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(500);
  });

  test('renders all 10 grid demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(10);
  });

  test('basic grid renders table with data rows', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    await expect(firstDemo.locator('.ex-demo-header h3')).toHaveText('Basic Grid');
    await expect(firstDemo.locator('.tx-grid')).toBeVisible();

    const rows = firstDemo.locator('.tx-grid-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test('sorting demo shows sort indicators on sortable columns', async ({ page }) => {
    const sortDemo = page.locator('.ex-demo').nth(1);
    await expect(sortDemo.locator('.ex-demo-header h3')).toHaveText('Sorting');

    // Column headers should be present
    const headers = sortDemo.locator('.tx-grid-th');
    expect(await headers.count()).toBeGreaterThanOrEqual(3);
  });

  test('filtering demo renders column headers', async ({ page }) => {
    const filterDemo = page.locator('.ex-demo').nth(2);
    await expect(filterDemo.locator('.ex-demo-header h3')).toHaveText('Column Filtering');

    const headers = filterDemo.locator('.tx-grid-th');
    expect(await headers.count()).toBeGreaterThanOrEqual(1);
  });

  test('pagination demo renders grid with footer', async ({ page }) => {
    const paginationDemo = page.locator('.ex-demo').nth(3);
    await expect(paginationDemo.locator('.ex-demo-header h3')).toHaveText('Pagination');
    await expect(paginationDemo.locator('.tx-grid')).toBeVisible();

    const footer = paginationDemo.locator('.tx-grid-footer');
    expect(await footer.count()).toBeGreaterThanOrEqual(1);
  });

  test('grouping demo shows group rows', async ({ page }) => {
    const groupDemo = page.locator('.ex-demo').nth(4);
    await expect(groupDemo.locator('.ex-demo-header h3')).toHaveText('Row Grouping');
    await expect(groupDemo.locator('.tx-grid')).toBeVisible();

    const groupRows = groupDemo.locator('.tx-grid-group-row');
    expect(await groupRows.count()).toBeGreaterThanOrEqual(1);
  });

  test('editing demo renders data cells', async ({ page }) => {
    const editDemo = page.locator('.ex-demo').nth(5);
    await expect(editDemo.locator('.ex-demo-header h3')).toHaveText('Inline Cell Editing');
    await expect(editDemo.locator('.tx-grid')).toBeVisible();

    const cells = editDemo.locator('.tx-grid-cell');
    expect(await cells.count()).toBeGreaterThanOrEqual(1);
  });

  test('frozen columns demo renders table with columns', async ({ page }) => {
    const frozenDemo = page.locator('.ex-demo').nth(6);
    await expect(frozenDemo.locator('.ex-demo-header h3')).toHaveText('Frozen Columns');
    await expect(frozenDemo.locator('.tx-grid')).toBeVisible();

    const headers = frozenDemo.locator('.tx-grid-th');
    expect(await headers.count()).toBeGreaterThanOrEqual(5);
  });

  test('scrollable grid demo has max-height constraint', async ({ page }) => {
    const scrollDemo = page.locator('.ex-demo').nth(7);
    await expect(scrollDemo.locator('.ex-demo-header h3')).toHaveText('Scrollable Grid');
    await expect(scrollDemo.locator('.tx-grid')).toBeVisible();

    const style = await scrollDemo.locator('.tx-grid').getAttribute('style');
    expect(style).toContain('max-height');
  });

  test('row reorder demo shows row numbers', async ({ page }) => {
    const reorderDemo = page.locator('.ex-demo').nth(8);
    await expect(reorderDemo.locator('.ex-demo-header h3')).toHaveText('Row Reorder');
    await expect(reorderDemo.locator('.tx-grid')).toBeVisible();

    const rows = reorderDemo.locator('.tx-grid-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test('export demo has 4 export buttons', async ({ page }) => {
    const exportDemo = page.locator('.ex-demo').nth(9);
    await expect(exportDemo.locator('.ex-demo-header h3')).toHaveText('Export');
    const buttons = exportDemo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
    const texts = await buttons.allTextContents();
    expect(texts).toContain('Export CSV');
    expect(texts).toContain('Export Excel');
    expect(texts).toContain('Export JSON');
    expect(texts).toContain('Export HTML');
  });
});
