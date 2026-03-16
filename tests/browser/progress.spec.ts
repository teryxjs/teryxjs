import { test, expect } from '@playwright/test';
import { setupPage, createWidget } from './helpers';

test.describe('Progress Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('bar width matches the value percentage', async ({ page }) => {
    await createWidget(page, `
      Teryx.progress('#target', { value: 60, max: 100 });
    `);
    const bar = page.locator('.tx-progress-bar');
    await expect(bar).toBeVisible();
    const width = await bar.evaluate(el => el.style.width);
    expect(width).toBe('60%');
  });

  test('showValue displays percentage text', async ({ page }) => {
    await createWidget(page, `
      Teryx.progress('#target', { value: 75, max: 100, showValue: true });
    `);
    await expect(page.locator('.tx-progress-text')).toHaveText('75%');
  });

  test('striped class is applied when striped option is true', async ({ page }) => {
    await createWidget(page, `
      Teryx.progress('#target', { value: 50, striped: true });
    `);
    await expect(page.locator('.tx-progress-striped')).toBeVisible();
  });

  test('animated class is applied when animated option is true', async ({ page }) => {
    await createWidget(page, `
      Teryx.progress('#target', { value: 50, animated: true });
    `);
    await expect(page.locator('.tx-progress-animated')).toBeVisible();
  });

  test('setValue updates bar width and text', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__prog = (window as any).Teryx.progress('#target', { value: 30, max: 100, showValue: true });
    });
    await expect(page.locator('.tx-progress-text')).toHaveText('30%');

    await page.evaluate(() => (window as any).__prog.setValue(85));
    await page.waitForTimeout(200);

    const width = await page.locator('.tx-progress-bar').evaluate(el => el.style.width);
    expect(width).toBe('85%');
    await expect(page.locator('.tx-progress-text')).toHaveText('85%');
  });

  test('multi-segment progress renders multiple bars', async ({ page }) => {
    await createWidget(page, `
      Teryx.progress('#target', {
        max: 100,
        value: 0,
        segments: [
          { value: 30, color: 'success', label: 'Done' },
          { value: 20, color: 'warning', label: 'In Progress' },
          { value: 10, color: 'danger', label: 'Failed' }
        ]
      });
    `);
    const bars = await page.locator('.tx-progress-bar').count();
    expect(bars).toBe(3);

    const firstWidth = await page.locator('.tx-progress-bar').first().evaluate(el => el.style.width);
    expect(firstWidth).toBe('30%');
  });
});
