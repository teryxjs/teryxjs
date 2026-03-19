import { test, expect } from '@playwright/test';

test.describe('Explorer — Transfer List demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-transfer-list');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all four transfer list demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('basic demo has two panels with custom titles and pre-selected item', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-transfer-list-left')).toBeVisible();
    await expect(first.locator('.tx-transfer-list-right')).toBeVisible();
    await expect(first.locator('.tx-transfer-title').nth(0)).toHaveText('Available');
    await expect(first.locator('.tx-transfer-title').nth(1)).toHaveText('Selected');
    // 4 in source, 1 in target (cherry)
    const leftItems = first.locator('.tx-transfer-list-left .tx-transfer-item');
    expect(await leftItems.count()).toBe(4);
    const rightItems = first.locator('.tx-transfer-list-right .tx-transfer-item');
    expect(await rightItems.count()).toBe(1);
  });

  test('searchable demo has search inputs and filters items', async ({ page }) => {
    const searchDemo = page.locator('.ex-demo').nth(1);
    const leftSearch = searchDemo.locator('.tx-transfer-search-input[data-side="left"]');
    await expect(leftSearch).toBeVisible();

    // Initially 6 source items
    const leftItems = searchDemo.locator('.tx-transfer-list-left .tx-transfer-item');
    expect(await leftItems.count()).toBe(6);

    // Search for "type" should show only TypeScript
    await leftSearch.fill('type');
    await page.waitForTimeout(100);
    expect(await leftItems.count()).toBe(1);
  });

  test('disabled items demo renders disabled items with disabled class', async ({ page }) => {
    const disabledDemo = page.locator('.ex-demo').nth(2);
    const disabledItems = disabledDemo.locator('.tx-transfer-item-disabled');
    expect(await disabledItems.count()).toBe(2);

    // Move all right should leave disabled "Admin" in left panel
    await disabledDemo.locator('[data-action="move-all-right"]').click();
    await page.waitForTimeout(100);
    const leftItems = disabledDemo.locator('.tx-transfer-list-left .tx-transfer-item');
    expect(await leftItems.count()).toBe(1);
  });

  test('onChange demo updates output text when items are transferred', async ({ page }) => {
    const callbackDemo = page.locator('.ex-demo').nth(3);
    const output = callbackDemo.locator('.tx-transfer-output');
    await expect(output).toContainText('Selected: md');

    // Move all right
    await callbackDemo.locator('[data-action="move-all-right"]').click();
    await page.waitForTimeout(100);
    await expect(output).toContainText('sm');
    await expect(output).toContainText('lg');
    await expect(output).toContainText('xl');
  });
});
