import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

const IMAGES = [
  { src: 'https://picsum.photos/id/10/400/300', alt: 'Image A', caption: 'First image' },
  { src: 'https://picsum.photos/id/20/400/300', alt: 'Image B', caption: 'Second image' },
  { src: 'https://picsum.photos/id/30/400/300', alt: 'Image C' },
];

test.describe('Lightbox Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders thumbnail grid', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    const thumbs = await count(page, '.tx-lightbox-thumb');
    expect(thumbs).toBe(3);
  });

  test('clicking thumbnail opens viewer', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.locator('.tx-lightbox-thumb').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('.tx-lightbox-overlay')).toBeVisible();
    await expect(page.locator('.tx-lightbox-img')).toBeVisible();
  });

  test('displays image counter', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('1 / 3');
  });

  test('displays caption', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await expect(page.locator('.tx-lightbox-caption')).toHaveText('First image');
  });

  test('next/prev navigation works', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('1 / 3');

    await page.locator('.tx-lightbox-next').click();
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('2 / 3');

    await page.locator('.tx-lightbox-prev').click();
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('1 / 3');
  });

  test('programmatic goTo works', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await page.evaluate(() => (window as any).__lb.goTo(2));
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('3 / 3');
  });

  test('close button closes viewer', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await page.locator('[data-action="close"]').click();
    await page.waitForTimeout(300);
    const overlays = await count(page, '.tx-lightbox-overlay');
    expect(overlays).toBe(0);
  });

  test('keyboard Escape closes viewer', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const overlays = await count(page, '.tx-lightbox-overlay');
    expect(overlays).toBe(0);
  });

  test('keyboard arrow navigation works', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('2 / 3');

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-lightbox-counter')).toHaveText('1 / 3');
  });

  test('zoom controls are rendered when enabled', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs, zoom: true });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await expect(page.locator('[data-action="zoom-in"]')).toBeVisible();
    await expect(page.locator('[data-action="zoom-out"]')).toBeVisible();
  });

  test('rotate button rendered when enabled', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs, rotate: true });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await expect(page.locator('[data-action="rotate"]')).toBeVisible();
  });

  test('download button is present', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await page.evaluate(() => (window as any).__lb.open(0));
    await page.waitForTimeout(300);
    await expect(page.locator('[data-action="download"]')).toBeVisible();
  });

  test('destroy clears the widget', async ({ page }) => {
    await page.evaluate((imgs) => {
      (window as any).__lb = (window as any).Teryx.lightbox('#target', { images: imgs });
    }, IMAGES);
    await expect(page.locator('.tx-lightbox-grid')).toBeVisible();
    await page.evaluate(() => (window as any).__lb.destroy());
    await page.waitForTimeout(100);
    const grids = await count(page, '.tx-lightbox-grid');
    expect(grids).toBe(0);
  });
});
