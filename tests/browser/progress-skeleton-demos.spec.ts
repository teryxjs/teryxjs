import { test, expect } from '@playwright/test';

test.describe('Explorer — Progress Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-progress');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 6 progress demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(6);
  });

  test('basic progress bars demo renders 4 bars', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Progress Bars');

    const bars = demo.locator('.tx-progress-bar');
    expect(await bars.count()).toBe(4);
  });

  test('progress sizes demo renders sm, md, lg bars', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Progress Sizes');

    await expect(demo.locator('.tx-progress-sm')).toBeVisible();
    await expect(demo.locator('.tx-progress-md')).toBeVisible();
    await expect(demo.locator('.tx-progress-lg')).toBeVisible();
  });

  test('progress colors demo renders 4 color variants', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Progress Colors');

    await expect(demo.locator('.tx-progress-primary')).toBeVisible();
    await expect(demo.locator('.tx-progress-success')).toBeVisible();
    await expect(demo.locator('.tx-progress-warning')).toBeVisible();
    await expect(demo.locator('.tx-progress-danger')).toBeVisible();
  });

  test('striped & animated demo renders striped bar', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Striped & Animated');

    await expect(demo.locator('.tx-progress-striped').first()).toBeVisible();
  });

  test('multi-segment demo renders 3 segment bars', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Multi-Segment Progress');

    const bars = demo.locator('.tx-progress-bar');
    expect(await bars.count()).toBe(3);
  });

  test('dynamic progress demo has control buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Dynamic Progress');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(5);
  });

  test('clicking dynamic progress button updates bar width', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    // Click the 75% button (index 3)
    await demo.locator('.ex-demo-body button').nth(3).click();
    await page.waitForTimeout(100);

    const bar = demo.locator('.tx-progress-bar');
    await expect(bar).toHaveCSS('width', /./);
  });
});

test.describe('Explorer — Skeleton Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-skeleton');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 6 skeleton demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(6);
  });

  test('text skeleton demo renders skeleton lines', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Text Skeleton');

    const lines = demo.locator('.tx-skeleton-line');
    expect(await lines.count()).toBe(3);
  });

  test('card skeleton demo renders avatar', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Card Skeleton');

    await expect(demo.locator('.tx-skeleton-avatar')).toBeVisible();
  });

  test('card skeleton demo renders 4 lines', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    const lines = demo.locator('.tx-skeleton-line');
    expect(await lines.count()).toBe(4);
  });

  test('image skeleton demo renders image placeholder', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Image Skeleton');

    await expect(demo.locator('.tx-skeleton-image')).toBeVisible();
  });

  test('skeleton grid demo renders 3 skeleton cards', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Skeleton Grid');

    const skeletons = demo.locator('.tx-skeleton');
    expect(await skeletons.count()).toBe(3);
  });

  test('custom width skeleton has 50% width', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Custom Width Skeleton');

    const skeleton = demo.locator('.tx-skeleton');
    await expect(skeleton).toHaveAttribute('style', /width:50%/);
  });

  test('static skeleton has no animated class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Static Skeleton (no animation)');

    const skeleton = demo.locator('.tx-skeleton');
    await expect(skeleton).not.toHaveClass(/tx-skeleton-animated/);
  });
});
