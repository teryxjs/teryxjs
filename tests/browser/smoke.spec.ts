import { test, expect } from '@playwright/test';
import { setupPage } from './helpers';

test('test page loads and Teryx is available', async ({ page }) => {
  await setupPage(page);
  const hasTeryx = await page.evaluate(() => typeof (window as any).Teryx !== 'undefined');
  expect(hasTeryx).toBe(true);
});

test('can create a simple alert widget', async ({ page }) => {
  await setupPage(page);
  await page.evaluate(() => {
    (window as any).Teryx.alert('#target', { type: 'success', message: 'It works!' });
  });
  await expect(page.locator('.tx-alert-success')).toBeVisible();
  await expect(page.locator('.tx-alert-message')).toHaveText('It works!');
});
