import { test, expect } from '@playwright/test';
import { setupPage, createWidget, assertExists, count } from './helpers';

test.describe('Toast', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders a toast and auto-dismisses', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Auto dismiss', duration: 500 });
    `,
    );
    await page.waitForTimeout(100);
    const toast = page.locator('.tx-toast');
    await expect(toast.first()).toBeVisible();

    // Wait for auto-dismiss (500ms) plus animation (300ms) plus margin
    await page.waitForTimeout(1000);
    await expect(page.locator('.tx-toast')).toHaveCount(0);
  });

  test('toast stays when duration is 0', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Persistent toast', duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    const toast = page.locator('.tx-toast');
    await expect(toast.first()).toBeVisible();

    // Wait and verify it stays
    await page.waitForTimeout(1500);
    await expect(toast.first()).toBeVisible();
  });

  test('toast.info convenience method renders info type', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast.info('Info message', { duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-toast-info');
    const message = page.locator('.tx-toast-message');
    await expect(message.first()).toHaveText('Info message');
  });

  test('toast.success convenience method renders success type', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast.success('Success message', { duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-toast-success');
    const message = page.locator('.tx-toast-message');
    await expect(message.first()).toHaveText('Success message');
  });

  test('toast.warning convenience method renders warning type', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast.warning('Warning message', { duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-toast-warning');
    const message = page.locator('.tx-toast-message');
    await expect(message.first()).toHaveText('Warning message');
  });

  test('toast.danger convenience method renders danger type', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast.danger('Error message', { duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-toast-danger');
    const message = page.locator('.tx-toast-message');
    await expect(message.first()).toHaveText('Error message');
  });

  test('close button dismisses the toast', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Close me', duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    const toast = page.locator('.tx-toast');
    await expect(toast.first()).toBeVisible();

    const closeBtn = page.locator('.tx-toast-close');
    await closeBtn.first().click();
    await page.waitForTimeout(400);

    await expect(page.locator('.tx-toast')).toHaveCount(0);
  });

  test('position class is applied to container', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Bottom left', position: 'bottom-left', duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-toast-container.tx-toast-bottom-left');
  });

  test('title renders in toast', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Body text', title: 'Important', duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    const title = page.locator('.tx-toast-title');
    await expect(title.first()).toHaveText('Important');
  });

  test('multiple toasts can be shown simultaneously', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Toast 1', duration: 0 });
      Teryx.toast({ message: 'Toast 2', duration: 0 });
      Teryx.toast({ message: 'Toast 3', duration: 0 });
    `,
    );
    await page.waitForTimeout(200);
    const toastCount = await count(page, '.tx-toast');
    expect(toastCount).toBe(3);
  });

  test('dismiss function removes the toast', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__toastResult = Teryx.toast({ message: 'Dismiss me', duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    const toast = page.locator('.tx-toast');
    await expect(toast.first()).toBeVisible();

    await page.evaluate(() => (window as any).__toastResult.dismiss());
    await page.waitForTimeout(400);

    await expect(page.locator('.tx-toast')).toHaveCount(0);
  });

  test('toast renders progress bar when duration is positive', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'Progress toast', duration: 5000 });
    `,
    );
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-toast-progress');
    await assertExists(page, '.tx-toast-progress-bar');
  });

  test('toast without title does not render title element', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.toast({ message: 'No title', duration: 0 });
    `,
    );
    await page.waitForTimeout(100);
    const titleCount = await count(page, '.tx-toast-title');
    expect(titleCount).toBe(0);
  });
});
