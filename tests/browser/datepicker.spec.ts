import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

test.describe('DatePicker Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders input with calendar icon', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.datePicker('#target', {});
    });
    await expect(page.locator('.tx-datepicker-input')).toBeVisible();
    await expect(page.locator('.tx-datepicker-icon')).toBeVisible();
  });

  test('clicking input opens calendar', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.datePicker('#target', {});
    });
    await page.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-datepicker-calendar')).toBeVisible();
  });

  test('selecting a day updates input value', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dp = (window as any).Teryx.datePicker('#target', { value: '2024-06-01' });
    });
    await page.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);
    await page.locator('.tx-datepicker-day[data-day="15"]').click();
    await page.waitForTimeout(200);
    const val = await page.evaluate(() => (window as any).__dp.getValue());
    expect(val).toBe('2024-06-15');
  });

  test('prev/next navigation changes month', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.datePicker('#target', { value: '2024-06-15' });
    });
    await page.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-datepicker-title')).toContainText('June');
    await page.locator('.tx-datepicker-next').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-datepicker-title')).toContainText('July');
  });

  test('inline mode shows calendar directly', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.datePicker('#target', { inline: true });
    });
    await expect(page.locator('.tx-datepicker-inline')).toBeVisible();
    await expect(page.locator('.tx-datepicker-calendar')).toBeVisible();
  });
});
