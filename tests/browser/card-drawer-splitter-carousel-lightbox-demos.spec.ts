import { test, expect } from '@playwright/test';

test.describe('Explorer — Card demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#layout-card');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all four card demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('basic card has title, collapse and close buttons', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-card-title')).toHaveText('Project Update');
    await expect(first.locator('.tx-card-collapse-btn')).toBeVisible();
    await expect(first.locator('.tx-card-close-btn')).toBeVisible();
  });

  test('image card renders image element', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    await expect(second.locator('.tx-card-img')).toBeVisible();
    await expect(second.locator('.tx-card-footer')).toContainText('Photo credit');
  });

  test('card with actions has tool buttons and footer', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    const tools = third.locator('.tx-card-tool');
    expect(await tools.count()).toBe(2);
    await expect(third.locator('.tx-card-footer')).toContainText('Approve');
  });

  test('horizontal layout renders three cards', async ({ page }) => {
    const fourth = page.locator('.ex-demo').nth(3);
    const cards = fourth.locator('.tx-card');
    expect(await cards.count()).toBe(3);
  });

  test('collapse button toggles card body', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const body = first.locator('.tx-card-body');
    await expect(body).toBeVisible();
    await first.locator('.tx-card-collapse-btn').click();
    await expect(body).toBeHidden();
    await first.locator('.tx-card-collapse-btn').click();
    await expect(body).toBeVisible();
  });
});

test.describe('Explorer — Drawer demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#layout-drawer');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders two drawer demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(2);
  });

  test('position demo has four buttons', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const buttons = first.locator('[data-drawer-position]');
    expect(await buttons.count()).toBe(4);
  });

  test('clicking left drawer button opens a left-positioned drawer', async ({ page }) => {
    const btn = page.locator('[data-drawer-position="left"]');
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('.tx-drawer-left')).toBeVisible();
    // Close via backdrop
    await page.locator('.tx-drawer-overlay').click({ position: { x: 750, y: 300 } });
    await page.waitForTimeout(400);
  });

  test('size demo has three size buttons', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    const buttons = second.locator('[data-drawer-size]');
    expect(await buttons.count()).toBe(3);
  });
});

test.describe('Explorer — Splitter demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#layout-splitter');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders three splitter demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('horizontal splitter has gutter', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-splitter-horizontal')).toBeVisible();
    await expect(first.locator('.tx-splitter-gutter-horizontal')).toBeVisible();
    const panels = first.locator('.tx-splitter-panel');
    expect(await panels.count()).toBe(2);
  });

  test('vertical splitter has vertical gutter', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    await expect(second.locator('.tx-splitter-vertical')).toBeVisible();
    await expect(second.locator('.tx-splitter-gutter-vertical')).toBeVisible();
  });

  test('nested splitter has both horizontal and vertical gutters', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    await expect(third.locator('.tx-splitter-gutter-horizontal')).toBeVisible();
    await expect(third.locator('.tx-splitter-gutter-vertical')).toBeVisible();
  });
});

test.describe('Explorer — Carousel demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#layout-carousel');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders three carousel demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('basic carousel has slides and indicators', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const slides = first.locator('.tx-carousel-slide');
    expect(await slides.count()).toBe(3);
    const indicators = first.locator('.tx-carousel-indicator');
    expect(await indicators.count()).toBe(3);
  });

  test('basic carousel navigation works', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    // First slide is active
    await expect(first.locator('.tx-carousel-slide').first()).toHaveClass(/tx-carousel-slide-active/);
    // Click next
    await first.locator('.tx-carousel-next').click();
    await page.waitForTimeout(200);
    await expect(first.locator('.tx-carousel-slide').nth(1)).toHaveClass(/tx-carousel-slide-active/);
  });

  test('no-indicators carousel has arrows but no dots', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    const indicators = third.locator('.tx-carousel-indicator');
    expect(await indicators.count()).toBe(0);
    await expect(third.locator('.tx-carousel-prev')).toBeVisible();
    await expect(third.locator('.tx-carousel-next')).toBeVisible();
  });
});

test.describe('Explorer — Lightbox demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#layout-lightbox');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders three lightbox demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('single image has one thumbnail', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const thumbs = first.locator('.tx-lightbox-thumb');
    expect(await thumbs.count()).toBe(1);
  });

  test('gallery has six thumbnails', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    const thumbs = second.locator('.tx-lightbox-thumb');
    expect(await thumbs.count()).toBe(6);
  });

  test('clicking a thumbnail opens the lightbox viewer', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await first.locator('.tx-lightbox-thumb').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('.tx-lightbox-overlay')).toBeVisible();
    // Close via close button
    await page.locator('.tx-lightbox-close').click();
    await page.waitForTimeout(300);
  });

  test('zoom & rotate lightbox has toolbar actions', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    await third.locator('.tx-lightbox-thumb').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-action="zoom-in"]')).toBeVisible();
    await expect(page.locator('[data-action="zoom-out"]')).toBeVisible();
    await expect(page.locator('[data-action="rotate"]')).toBeVisible();
    await page.locator('.tx-lightbox-close').click();
    await page.waitForTimeout(300);
  });
});
