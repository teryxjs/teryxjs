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

    // Wait for xhtmlx to fetch and render data
    await page.waitForTimeout(500);
    const rows = firstDemo.locator('.tx-grid-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test('sorting demo has sortable column headers with sort icons', async ({ page }) => {
    const sortDemo = page.locator('.ex-demo').nth(1);
    await expect(sortDemo.locator('.ex-demo-header h3')).toHaveText('Sorting');

    // Wait for xhtmlx to render the template
    await page.waitForTimeout(500);
    const sortable = sortDemo.locator('.tx-grid-sortable');
    expect(await sortable.count()).toBeGreaterThanOrEqual(3);

    // Sort icons should be present
    const sortIcons = sortDemo.locator('.tx-grid-sort-icon');
    expect(await sortIcons.count()).toBeGreaterThanOrEqual(3);
  });

  test('filtering demo renders filter inputs', async ({ page }) => {
    const filterDemo = page.locator('.ex-demo').nth(2);
    await expect(filterDemo.locator('.ex-demo-header h3')).toHaveText('Column Filtering');

    await page.waitForTimeout(500);
    // Filter row with inputs
    const filters = filterDemo.locator('.tx-grid-filter');
    expect(await filters.count()).toBeGreaterThanOrEqual(1);
  });

  test('pagination demo renders grid with search and pagination controls', async ({ page }) => {
    const paginationDemo = page.locator('.ex-demo').nth(3);
    await expect(paginationDemo.locator('.ex-demo-header h3')).toHaveText('Pagination');
    await expect(paginationDemo.locator('.tx-grid')).toBeVisible();
    await expect(paginationDemo.locator('.tx-grid-search')).toBeVisible();

    // Wait for data to load and pagination to appear
    await page.waitForTimeout(500);
    const paginationInfo = paginationDemo.locator('.tx-grid-footer');
    expect(await paginationInfo.count()).toBeGreaterThanOrEqual(1);
  });

  test('grouping demo has groupBy data attribute', async ({ page }) => {
    const groupDemo = page.locator('.ex-demo').nth(4);
    await expect(groupDemo.locator('.ex-demo-header h3')).toHaveText('Row Grouping');
    await expect(groupDemo.locator('.tx-grid')).toBeVisible();
    const dataEl = groupDemo.locator('[data-group-by]');
    expect(await dataEl.count()).toBeGreaterThanOrEqual(1);
  });

  test('editing demo renders editable cells after data loads', async ({ page }) => {
    const editDemo = page.locator('.ex-demo').nth(5);
    await expect(editDemo.locator('.ex-demo-header h3')).toHaveText('Inline Cell Editing');
    await expect(editDemo.locator('.tx-grid')).toBeVisible();

    // Wait for data to load so editable cells are rendered
    await page.waitForTimeout(500);
    const editableCells = editDemo.locator('td[data-editable="true"]');
    expect(await editableCells.count()).toBeGreaterThanOrEqual(1);
  });

  test('frozen columns demo has locked column layout', async ({ page }) => {
    const frozenDemo = page.locator('.ex-demo').nth(6);
    await expect(frozenDemo.locator('.ex-demo-header h3')).toHaveText('Frozen Columns');
    await expect(frozenDemo.locator('.tx-grid')).toBeVisible();

    // Locked container is rendered immediately (part of template structure)
    const lockedContainer = frozenDemo.locator('.tx-grid-locked-container');
    expect(await lockedContainer.count()).toBeGreaterThanOrEqual(1);
    const leftLocked = frozenDemo.locator('.tx-grid-locked-left');
    expect(await leftLocked.count()).toBeGreaterThanOrEqual(1);
  });

  test('scrollable grid demo has max-height constraint', async ({ page }) => {
    const scrollDemo = page.locator('.ex-demo').nth(7);
    await expect(scrollDemo.locator('.ex-demo-header h3')).toHaveText('Scrollable Grid');
    await expect(scrollDemo.locator('.tx-grid')).toBeVisible();
    const gridBody = scrollDemo.locator('.tx-grid-body');
    const style = await gridBody.getAttribute('style');
    expect(style).toContain('max-height');
  });

  test('row reorder demo has row number column', async ({ page }) => {
    const reorderDemo = page.locator('.ex-demo').nth(8);
    await expect(reorderDemo.locator('.ex-demo-header h3')).toHaveText('Row Reorder');
    await expect(reorderDemo.locator('.tx-grid')).toBeVisible();

    // Wait for data to render
    await page.waitForTimeout(500);
    const rownumCols = reorderDemo.locator('.tx-grid-rownum-col');
    expect(await rownumCols.count()).toBeGreaterThanOrEqual(1);
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
