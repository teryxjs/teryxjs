import { test, expect } from '@playwright/test';

test.describe('Explorer — Tree Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-tree');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(500);
  });

  test('renders all 6 tree demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(6);
  });

  test('basic tree renders tree nodes', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Tree');
    await expect(demo.locator('.tx-tree')).toBeVisible();

    const nodes = demo.locator('.tx-tree-node');
    expect(await nodes.count()).toBeGreaterThanOrEqual(3);

    // Check that labels are rendered
    const labels = demo.locator('.tx-tree-label');
    const texts = await labels.allTextContents();
    expect(texts).toContain('Documents');
    expect(texts).toContain('README.md');
  });

  test('checkboxes demo renders checkboxes and status text', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Checkboxes');

    const checkboxes = demo.locator('.tx-tree-checkbox');
    expect(await checkboxes.count()).toBeGreaterThanOrEqual(3);

    // Status element exists
    const status = demo.locator('.tx-tree-check-status');
    await expect(status).toBeVisible();
  });

  test('async loading demo uses /api/tree source', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Async Loading');
    await expect(demo.locator('.tx-tree')).toBeVisible();

    // Wait for xhtmlx to fetch and render data
    await page.waitForTimeout(1000);
    const labels = demo.locator('.tx-tree-label');
    expect(await labels.count()).toBeGreaterThanOrEqual(1);
  });

  test('custom icons demo renders icon SVGs', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Custom Icons');

    const icons = demo.locator('.tx-tree-icon');
    expect(await icons.count()).toBeGreaterThanOrEqual(3);

    // Check SVGs are inside icons
    const svgs = demo.locator('.tx-tree-icon svg');
    expect(await svgs.count()).toBeGreaterThanOrEqual(3);
  });

  test('search/filter demo has filter input and tree nodes', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Search / Filter');

    const input = demo.locator('.tx-tree-filter-input');
    await expect(input).toBeVisible();

    // All leaf nodes should be visible initially
    const labels = demo.locator('.tx-tree-label');
    expect(await labels.count()).toBeGreaterThanOrEqual(9);

    // Type a filter term
    await input.fill('Cat');
    await page.waitForTimeout(200);

    // Cat should still be visible, Dog and Elephant should be hidden
    const catNode = demo.locator('.tx-tree-node[data-id="f1a"]');
    await expect(catNode).toBeVisible();

    const dogNode = demo.locator('.tx-tree-node[data-id="f1b"]');
    await expect(dogNode).toBeHidden();
  });

  test('expand/collapse demo has control buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Expand All / Collapse All');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(2);

    const texts = await buttons.allTextContents();
    expect(texts).toContain('Expand All');
    expect(texts).toContain('Collapse All');

    // Click Expand All and verify nodes are expanded
    await buttons.nth(0).click();
    await page.waitForTimeout(200);
    const expanded = demo.locator('.tx-tree-expanded');
    expect(await expanded.count()).toBeGreaterThanOrEqual(3);

    // Click Collapse All and verify nodes are collapsed
    await buttons.nth(1).click();
    await page.waitForTimeout(200);
    const expandedAfter = demo.locator('.tx-tree-expanded');
    expect(await expandedAfter.count()).toBe(0);
  });
});
