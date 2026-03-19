import { test, expect } from '@playwright/test';

test.describe('Explorer — Slider demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-slider');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all six slider demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(6);
  });

  test('basic slider has track and thumb', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-slider-track')).toBeVisible();
    await expect(first.locator('.tx-slider-thumb')).toBeVisible();
  });

  test('range slider has two thumbs', async ({ page }) => {
    const rangeDemo = page.locator('.ex-demo').nth(1);
    const thumbs = rangeDemo.locator('.tx-slider-thumb');
    expect(await thumbs.count()).toBe(2);
  });

  test('marks slider has five marks', async ({ page }) => {
    const marksDemo = page.locator('.ex-demo').nth(2);
    const marks = marksDemo.locator('.tx-slider-mark');
    expect(await marks.count()).toBe(5);
  });

  test('vertical slider has vertical class', async ({ page }) => {
    const vertDemo = page.locator('.ex-demo').nth(3);
    await expect(vertDemo.locator('.tx-slider-vertical')).toBeVisible();
  });

  test('tooltip+input slider has tooltip and number input', async ({ page }) => {
    const tipDemo = page.locator('.ex-demo').nth(4);
    await expect(tipDemo.locator('.tx-slider-tooltip')).toBeVisible();
    await expect(tipDemo.locator('.tx-slider-input')).toBeVisible();
  });
});

test.describe('Explorer — Rating demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-rating');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all five rating demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('interactive rating starts at 3 and clicking star 5 sets 5', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    const initialActive = await firstDemo.locator('.tx-rating-star-active').count();
    expect(initialActive).toBe(3);

    await firstDemo.locator('.tx-rating-star').nth(4).dispatchEvent('click');
    await page.waitForTimeout(100);
    const afterActive = await firstDemo.locator('.tx-rating-star-active').count();
    expect(afterActive).toBe(5);
  });

  test('readonly rating cannot be changed by click', async ({ page }) => {
    const readonlyDemo = page.locator('.ex-demo').nth(1);
    await expect(readonlyDemo.locator('.tx-rating-readonly')).toBeVisible();
    const before = await readonlyDemo.locator('.tx-rating-star-active').count();
    expect(before).toBe(4);

    await readonlyDemo.locator('.tx-rating-star').nth(0).dispatchEvent('click');
    await page.waitForTimeout(100);
    const after = await readonlyDemo.locator('.tx-rating-star-active').count();
    expect(after).toBe(4);
  });

  test('small rating has sm class', async ({ page }) => {
    const smDemo = page.locator('.ex-demo').nth(2);
    await expect(smDemo.locator('.tx-rating-sm')).toBeVisible();
  });

  test('large rating has lg class', async ({ page }) => {
    const lgDemo = page.locator('.ex-demo').nth(3);
    await expect(lgDemo.locator('.tx-rating-lg')).toBeVisible();
  });

  test('10-star rating has 10 stars with 7 active', async ({ page }) => {
    const tenDemo = page.locator('.ex-demo').nth(4);
    const stars = tenDemo.locator('.tx-rating-star');
    expect(await stars.count()).toBe(10);
    const active = await tenDemo.locator('.tx-rating-star-active').count();
    expect(active).toBe(7);
  });
});

test.describe('Explorer — Tag Input demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-tag-input');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all three tag input demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('basic tag input has two initial chips', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    const chips = firstDemo.locator('.tx-tag-input-chip');
    expect(await chips.count()).toBe(2);
  });

  test('adding a tag via Enter key works', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    const input = firstDemo.locator('.tx-tag-input-field');
    await input.fill('React');
    await input.press('Enter');
    await page.waitForTimeout(100);
    const chips = firstDemo.locator('.tx-tag-input-chip');
    expect(await chips.count()).toBe(3);
  });

  test('removing a tag via X button works', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    const removeButtons = firstDemo.locator('.tx-tag-input-chip-remove');
    const countBefore = await firstDemo.locator('.tx-tag-input-chip').count();
    expect(countBefore).toBe(2);

    await removeButtons.first().click();
    await page.waitForTimeout(100);
    const countAfter = await firstDemo.locator('.tx-tag-input-chip').count();
    expect(countAfter).toBe(1);
  });

  test('max tags demo enforces limit', async ({ page }) => {
    const maxDemo = page.locator('.ex-demo').nth(2);
    const input = maxDemo.locator('.tx-tag-input-field');

    // Starts with 2, max 3
    expect(await maxDemo.locator('.tx-tag-input-chip').count()).toBe(2);

    await input.fill('Three');
    await input.press('Enter');
    await page.waitForTimeout(100);
    expect(await maxDemo.locator('.tx-tag-input-chip').count()).toBe(3);

    // Fourth should be blocked
    await input.fill('Four');
    await input.press('Enter');
    await page.waitForTimeout(100);
    expect(await maxDemo.locator('.tx-tag-input-chip').count()).toBe(3);
  });
});

test.describe('Explorer — Segmented demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-segmented');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all three segmented demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('basic segmented has three items with first active', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    const items = firstDemo.locator('.tx-segmented-item');
    expect(await items.count()).toBe(3);
    await expect(firstDemo.locator('.tx-segmented-active')).toHaveAttribute('data-value', 'day');
  });

  test('clicking a segmented item switches active', async ({ page }) => {
    const firstDemo = page.locator('.ex-demo').first();
    await firstDemo.locator('.tx-segmented-item[data-value="month"]').click();
    await page.waitForTimeout(100);
    await expect(firstDemo.locator('.tx-segmented-active')).toHaveAttribute('data-value', 'month');
  });

  test('segmented with icons renders SVG in each item', async ({ page }) => {
    const iconDemo = page.locator('.ex-demo').nth(1);
    const icons = iconDemo.locator('.tx-segmented-icon');
    expect(await icons.count()).toBe(3);
  });

  test('sizes demo renders sm, md, and lg variants', async ({ page }) => {
    const sizesDemo = page.locator('.ex-demo').nth(2);
    await expect(sizesDemo.locator('.tx-segmented-sm')).toBeVisible();
    await expect(sizesDemo.locator('.tx-segmented-md')).toBeVisible();
    await expect(sizesDemo.locator('.tx-segmented-lg')).toBeVisible();
  });
});
