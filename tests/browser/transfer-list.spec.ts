import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

const SOURCE = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
];

test.describe('TransferList Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders two panels with titles', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).Teryx.transferList('#target', { source: src });
    }, SOURCE);
    await expect(page.locator('.tx-transfer-list-left')).toBeVisible();
    await expect(page.locator('.tx-transfer-list-right')).toBeVisible();
    await expect(page.locator('.tx-transfer-title').nth(0)).toHaveText('Source');
    await expect(page.locator('.tx-transfer-title').nth(1)).toHaveText('Target');
  });

  test('renders custom titles', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).Teryx.transferList('#target', { source: src, titles: ['Available', 'Selected'] });
    }, SOURCE);
    await expect(page.locator('.tx-transfer-title').nth(0)).toHaveText('Available');
    await expect(page.locator('.tx-transfer-title').nth(1)).toHaveText('Selected');
  });

  test('renders all items in the source panel', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).Teryx.transferList('#target', { source: src });
    }, SOURCE);
    const items = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    expect(items).toBe(4);
  });

  test('pre-selected target keys appear in right panel', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).Teryx.transferList('#target', { source: src, target: ['banana', 'date'] });
    }, SOURCE);
    const leftItems = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    const rightItems = await count(page, '.tx-transfer-list-right .tx-transfer-item');
    expect(leftItems).toBe(2);
    expect(rightItems).toBe(2);
  });

  test('getTargetKeys returns current target keys', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', {
        source: src,
        target: ['cherry'],
      });
    }, SOURCE);
    const keys = await page.evaluate(() => (window as any).__tl.getTargetKeys());
    expect(keys).toEqual(['cherry']);
  });

  test('setTargetKeys updates both panels', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', { source: src });
    }, SOURCE);
    await page.evaluate(() => (window as any).__tl.setTargetKeys(['apple', 'banana']));
    await page.waitForTimeout(100);

    const leftItems = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    const rightItems = await count(page, '.tx-transfer-list-right .tx-transfer-item');
    expect(leftItems).toBe(2);
    expect(rightItems).toBe(2);

    const keys = await page.evaluate(() => (window as any).__tl.getTargetKeys());
    expect(keys).toEqual(expect.arrayContaining(['apple', 'banana']));
  });

  test('selecting and moving items right', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', { source: src });
    }, SOURCE);

    // Check the first item in the left panel
    await page.locator('.tx-transfer-list-left .tx-transfer-checkbox').first().check();
    await page.waitForTimeout(100);

    // Click move-right button
    await page.locator('[data-action="move-right"]').click();
    await page.waitForTimeout(100);

    const rightItems = await count(page, '.tx-transfer-list-right .tx-transfer-item');
    expect(rightItems).toBe(1);
  });

  test('move all right transfers all items', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', { source: src });
    }, SOURCE);

    await page.locator('[data-action="move-all-right"]').click();
    await page.waitForTimeout(100);

    const leftItems = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    const rightItems = await count(page, '.tx-transfer-list-right .tx-transfer-item');
    expect(leftItems).toBe(0);
    expect(rightItems).toBe(4);
  });

  test('move all left transfers all items back', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', {
        source: src,
        target: ['apple', 'banana', 'cherry', 'date'],
      });
    }, SOURCE);

    await page.locator('[data-action="move-all-left"]').click();
    await page.waitForTimeout(100);

    const leftItems = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    const rightItems = await count(page, '.tx-transfer-list-right .tx-transfer-item');
    expect(leftItems).toBe(4);
    expect(rightItems).toBe(0);
  });

  test('search filters items', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).Teryx.transferList('#target', { source: src, searchable: true });
    }, SOURCE);

    await expect(page.locator('.tx-transfer-search-input[data-side="left"]')).toBeVisible();
    await page.locator('.tx-transfer-search-input[data-side="left"]').fill('app');
    await page.waitForTimeout(100);

    const items = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    expect(items).toBe(1);
  });

  test('disabled items cannot be transferred', async ({ page }) => {
    const src = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana', disabled: true },
    ];
    await page.evaluate((s) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', { source: s });
    }, src);

    // Move all right — disabled item should stay
    await page.locator('[data-action="move-all-right"]').click();
    await page.waitForTimeout(100);

    const leftItems = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    const rightItems = await count(page, '.tx-transfer-list-right .tx-transfer-item');
    expect(leftItems).toBe(1);
    expect(rightItems).toBe(1);
  });

  test('destroy clears the widget', async ({ page }) => {
    await page.evaluate((src) => {
      (window as any).__tl = (window as any).Teryx.transferList('#target', { source: src });
    }, SOURCE);
    await expect(page.locator('.tx-transfer')).toBeVisible();

    await page.evaluate(() => (window as any).__tl.destroy());
    await page.waitForTimeout(100);

    const transfers = await count(page, '.tx-transfer');
    expect(transfers).toBe(0);
  });
});
