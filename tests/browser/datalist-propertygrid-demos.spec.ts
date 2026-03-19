import { test, expect } from '@playwright/test';

test.describe('Explorer — DataList Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-datalist');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(500);
  });

  test('renders all 3 datalist demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('basic datalist loads items from API', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic DataList');
    await expect(demo.locator('.tx-datalist')).toBeVisible();

    // Wait for xhtmlx to fetch data
    await page.waitForTimeout(1000);
    const items = demo.locator('.tx-datalist-item');
    expect(await items.count()).toBeGreaterThanOrEqual(1);
  });

  test('grid layout datalist renders grid container', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Grid Layout');

    // Wait for xhtmlx to fetch data
    await page.waitForTimeout(1000);
    const grid = demo.locator('.tx-datalist-grid');
    expect(await grid.count()).toBeGreaterThanOrEqual(1);
  });

  test('empty state demo has datalist widget', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Empty State');
    await expect(demo.locator('.tx-datalist')).toBeVisible();
  });
});

test.describe('Explorer — PropertyGrid Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-propertygrid');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(500);
  });

  test('renders all 3 propertygrid demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('basic propertygrid renders table with rows', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic PropertyGrid');
    await expect(demo.locator('.tx-propgrid-table')).toBeVisible();

    const rows = demo.locator('.tx-propgrid-row');
    expect(await rows.count()).toBe(5);

    // Check property names
    const names = demo.locator('.tx-propgrid-name');
    const texts = await names.allTextContents();
    expect(texts).toContain('Name');
    expect(texts).toContain('Version');
    expect(texts).toContain('Stable');
  });

  test('editable propertygrid has input controls', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Editable PropertyGrid');

    // Check for various input types
    const textInputs = demo.locator('input[type="text"]');
    expect(await textInputs.count()).toBeGreaterThanOrEqual(1);

    const checkbox = demo.locator('input[type="checkbox"]');
    expect(await checkbox.count()).toBeGreaterThanOrEqual(1);

    const select = demo.locator('select');
    expect(await select.count()).toBeGreaterThanOrEqual(1);

    // Status element exists
    const status = demo.locator('.tx-propgrid-change-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Edit a property');
  });

  test('API-driven propertygrid loads from server', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('API-driven PropertyGrid');
    await expect(demo.locator('.tx-propgrid')).toBeVisible();

    // Wait for xhtmlx to fetch data
    await page.waitForTimeout(1000);
    const rows = demo.locator('.tx-propgrid-name');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Explorer — Descriptions Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-descriptions');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(500);
  });

  test('renders all 3 descriptions demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('basic descriptions renders items with labels and values', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Descriptions');
    await expect(demo.locator('.tx-descriptions')).toBeVisible();

    // Check header
    const header = demo.locator('.tx-descriptions-header');
    await expect(header).toHaveText('User Info');

    // Check items
    const items = demo.locator('.tx-descriptions-item');
    expect(await items.count()).toBe(6);

    // Check a specific label/value pair
    const labels = demo.locator('.tx-descriptions-label');
    const labelsTexts = await labels.allTextContents();
    expect(labelsTexts).toContain('Name');
    expect(labelsTexts).toContain('Role');
  });

  test('bordered descriptions has bordered class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Bordered Descriptions');

    const desc = demo.locator('.tx-descriptions');
    await expect(desc).toBeVisible();
    await expect(desc).toHaveClass(/tx-descriptions-bordered/);

    // Check 3-column layout
    const body = demo.locator('.tx-descriptions-body');
    await expect(body).toHaveClass(/tx-descriptions-cols-3/);

    const items = demo.locator('.tx-descriptions-item');
    expect(await items.count()).toBe(9);
  });

  test('vertical descriptions uses single column', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Vertical (Single Column)');

    const body = demo.locator('.tx-descriptions-body');
    await expect(body).toHaveClass(/tx-descriptions-cols-1/);

    const items = demo.locator('.tx-descriptions-item');
    expect(await items.count()).toBe(5);
  });
});
