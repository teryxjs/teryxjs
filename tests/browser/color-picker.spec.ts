import { test, expect } from '@playwright/test';
import { setupPage, createWidget } from './helpers';

test.describe('ColorPicker Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('clicking the trigger opens the color panel', async ({ page }) => {
    await createWidget(page, `
      Teryx.colorPicker('#target', { value: '#3b82f6' });
    `);
    await expect(page.locator('.tx-colorpicker-panel')).toBeHidden();

    await page.locator('.tx-colorpicker-trigger').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-colorpicker-panel')).toBeVisible();
  });

  test('swatch displays the current color', async ({ page }) => {
    await createWidget(page, `
      Teryx.colorPicker('#target', { value: '#ef4444' });
    `);
    const bg = await page.locator('.tx-colorpicker-swatch').evaluate(
      el => el.style.background
    );
    expect(bg).toContain('rgb(239, 68, 68)');
  });

  test('clicking a preset color changes the value', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__cp = (window as any).Teryx.colorPicker('#target', { value: '#3b82f6' });
    });
    await page.locator('.tx-colorpicker-trigger').click();
    await page.waitForTimeout(200);

    await page.locator('.tx-colorpicker-preset[data-color="#ef4444"]').click();
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__cp.getValue());
    expect(val).toBe('#ef4444');
  });

  test('changing the hue slider updates the color', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__cp = (window as any).Teryx.colorPicker('#target', { value: '#3b82f6' });
    });
    await page.locator('.tx-colorpicker-trigger').click();
    await page.waitForTimeout(200);

    const initialColor = await page.evaluate(() => (window as any).__cp.getValue());

    await page.locator('.tx-colorpicker-hue').fill('120');
    await page.locator('.tx-colorpicker-hue').dispatchEvent('input');
    await page.waitForTimeout(200);

    const newColor = await page.evaluate(() => (window as any).__cp.getValue());
    expect(newColor).not.toBe(initialColor);
  });

  test('typing a hex color in the input changes the value', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__cp = (window as any).Teryx.colorPicker('#target', { value: '#3b82f6' });
    });
    await page.locator('.tx-colorpicker-trigger').click();
    await page.waitForTimeout(200);

    await page.locator('.tx-colorpicker-input').fill('#22c55e');
    await page.locator('.tx-colorpicker-input').dispatchEvent('change');
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__cp.getValue());
    expect(val).toBe('#22c55e');
  });

  test('clicking outside closes the panel', async ({ page }) => {
    await createWidget(page, `
      Teryx.colorPicker('#target', { value: '#3b82f6' });
    `);
    await page.locator('.tx-colorpicker-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-colorpicker-panel')).toBeVisible();

    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-colorpicker-panel')).toBeHidden();
  });

  test('getValue and setValue work programmatically', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__cp = (window as any).Teryx.colorPicker('#target', { value: '#000000' });
    });
    const initial = await page.evaluate(() => (window as any).__cp.getValue());
    expect(initial).toBe('#000000');

    await page.evaluate(() => (window as any).__cp.setValue('#ffffff'));
    await page.waitForTimeout(200);

    const updated = await page.evaluate(() => (window as any).__cp.getValue());
    expect(updated).toBe('#ffffff');

    // The swatch should also reflect the new color
    const swatchBg = await page.locator('.tx-colorpicker-swatch').evaluate(
      el => el.style.background
    );
    expect(swatchBg).toContain('rgb(255, 255, 255)');
  });
});
