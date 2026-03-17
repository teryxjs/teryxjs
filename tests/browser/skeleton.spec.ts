import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Skeleton Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders default skeleton with lines', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', {});
    `,
    );
    const lines = await count(page, '.tx-skeleton-line');
    expect(lines).toBe(3);
  });

  test('renders custom number of lines', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', { lines: 5 });
    `,
    );
    const lines = await count(page, '.tx-skeleton-line');
    expect(lines).toBe(5);
  });

  test('renders avatar when specified', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', { avatar: true });
    `,
    );
    await expect(page.locator('.tx-skeleton-avatar')).toBeVisible();
  });

  test('renders image placeholder when specified', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', { image: true });
    `,
    );
    await expect(page.locator('.tx-skeleton-image')).toBeVisible();
  });

  test('animated class is present by default', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', {});
    `,
    );
    await expect(page.locator('.tx-skeleton-animated')).toBeVisible();
  });

  test('no animated class when animated is false', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', { animated: false });
    `,
    );
    const animatedCount = await count(page, '.tx-skeleton-animated');
    expect(animatedCount).toBe(0);
  });

  test('renders all elements together', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.skeleton('#target', { avatar: true, image: true, lines: 4 });
    `,
    );
    await expect(page.locator('.tx-skeleton-avatar')).toBeVisible();
    await expect(page.locator('.tx-skeleton-image')).toBeVisible();
    const lines = await count(page, '.tx-skeleton-line');
    expect(lines).toBe(4);
  });
});
