import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

test.describe('Slider Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders slider track and thumb', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.slider('#target', { value: 50 });
    });
    await expect(page.locator('.tx-slider-track')).toBeVisible();
    await expect(page.locator('.tx-slider-thumb')).toBeVisible();
  });

  test('getValue returns the value', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__sl = (window as any).Teryx.slider('#target', { value: 42 });
    });
    const val = await page.evaluate(() => (window as any).__sl.getValue());
    expect(val).toBe(42);
  });

  test('setValue updates the slider', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__sl = (window as any).Teryx.slider('#target', { value: 10 });
    });
    await page.evaluate(() => (window as any).__sl.setValue(75));
    await page.waitForTimeout(200);
    const val = await page.evaluate(() => (window as any).__sl.getValue());
    expect(val).toBe(75);
  });

  test('range mode renders two thumbs', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.slider('#target', { range: true, values: [20, 80] });
    });
    const thumbs = await count(page, '.tx-slider-thumb');
    expect(thumbs).toBe(2);
  });

  test('marks are rendered', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.slider('#target', { marks: { 0: 'Low', 50: 'Mid', 100: 'High' } });
    });
    const marks = await count(page, '.tx-slider-mark');
    expect(marks).toBe(3);
    await expect(page.locator('.tx-slider-mark-label').nth(0)).toHaveText('Low');
  });

  test('showInput renders number input', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__sl = (window as any).Teryx.slider('#target', { value: 50, showInput: true });
    });
    await expect(page.locator('.tx-slider-input')).toBeVisible();
    const val = await page.locator('.tx-slider-input').inputValue();
    expect(val).toBe('50');
  });
});
