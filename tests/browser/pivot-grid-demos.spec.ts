import { test, expect } from '@playwright/test';

test.describe('Explorer — Pivot Grid Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-pivot-grid');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(500);
  });

  test('renders all 5 pivot grid demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('basic pivot renders table with column headers', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Pivot');
    await expect(demo.locator('.tx-pivot-table')).toBeVisible();

    // Check column headers for Q1, Q2
    const colHeaders = demo.locator('.tx-pivot-col-header');
    const texts = await colHeaders.allTextContents();
    expect(texts).toContain('Q1');
    expect(texts).toContain('Q2');

    // Check row labels for regions
    const rowLabels = demo.locator('.tx-pivot-row-label');
    const rowTexts = await rowLabels.allTextContents();
    expect(rowTexts).toContain('North');
    expect(rowTexts).toContain('South');
    expect(rowTexts).toContain('East');
  });

  test('basic pivot renders grand total row', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const grandTotal = demo.locator('.tx-pivot-grand-total-row');
    await expect(grandTotal).toBeVisible();
    await expect(demo.locator('.tx-pivot-grand-total-label')).toContainText('Grand Total');
  });

  test('multiple value fields shows both revenue and units headers', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Multiple Value Fields');

    const valueHeaders = demo.locator('.tx-pivot-value-field');
    const texts = await valueHeaders.allTextContents();
    expect(texts.some((t) => t.includes('revenue'))).toBe(true);
    expect(texts.some((t) => t.includes('units'))).toBe(true);
  });

  test('all aggregate functions shows sum, avg, count, min, max headers', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('All Aggregate Functions');

    const valueHeaders = demo.locator('.tx-pivot-value-field');
    const texts = await valueHeaders.allTextContents();
    expect(texts.some((t) => t.includes('sum'))).toBe(true);
    expect(texts.some((t) => t.includes('avg'))).toBe(true);
    expect(texts.some((t) => t.includes('count'))).toBe(true);
    expect(texts.some((t) => t.includes('min'))).toBe(true);
    expect(texts.some((t) => t.includes('max'))).toBe(true);
  });

  test('collapsible groups renders group rows with toggle arrows', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Collapsible Groups');

    const groupRows = demo.locator('.tx-pivot-group-row');
    expect(await groupRows.count()).toBe(3);

    const toggles = demo.locator('.tx-pivot-toggle');
    expect(await toggles.count()).toBe(3);
  });

  test('collapsible groups can collapse and expand', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);

    // Initially 6 detail rows (3 regions x 2 products)
    const dataRowsBefore = demo.locator('.tx-pivot-data-row');
    expect(await dataRowsBefore.count()).toBe(6);

    // Click first group row to collapse
    await demo.locator('.tx-pivot-group-row').first().click();
    await page.waitForTimeout(300);

    // After collapsing one group, 4 detail rows remain
    const dataRowsAfter = demo.locator('.tx-pivot-data-row');
    expect(await dataRowsAfter.count()).toBe(4);

    // Click again to expand
    await demo.locator('.tx-pivot-group-row').first().click();
    await page.waitForTimeout(300);

    const dataRowsExpanded = demo.locator('.tx-pivot-data-row');
    expect(await dataRowsExpanded.count()).toBe(6);
  });

  test('export demo renders pivot table and export buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Export Aggregated Data');
    await expect(demo.locator('.tx-pivot-table')).toBeVisible();

    // Check for export buttons
    const csvBtn = demo.locator('button:has-text("Export CSV")');
    await expect(csvBtn).toBeVisible();
    const jsonBtn = demo.locator('button:has-text("Export JSON")');
    await expect(jsonBtn).toBeVisible();
  });
});
