import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

test.describe('MessageBox Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('alert shows a modal with message', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.messageBox.alert('This is an alert');
    });
    await page.waitForTimeout(300);

    await expect(page.locator('.tx-modal-overlay')).toBeVisible();
    await expect(page.locator('.tx-msgbox-message')).toHaveText('This is an alert');
  });

  test('confirm resolves true when OK is clicked', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__confirmResult = null;
      (window as any).Teryx.messageBox.confirm('Are you sure?').then((v: boolean) => {
        (window as any).__confirmResult = v;
      });
    });
    await page.waitForTimeout(300);

    // Click OK button (second button in confirm)
    await page.locator('.tx-modal-btn').filter({ hasText: 'OK' }).click();
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => (window as any).__confirmResult);
    expect(result).toBe(true);
  });

  test('confirm resolves false when Cancel is clicked', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__confirmResult = null;
      (window as any).Teryx.messageBox.confirm('Are you sure?').then((v: boolean) => {
        (window as any).__confirmResult = v;
      });
    });
    await page.waitForTimeout(300);

    await page.locator('.tx-modal-btn').filter({ hasText: 'Cancel' }).click();
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => (window as any).__confirmResult);
    expect(result).toBe(false);
  });

  test('buttons are rendered in the modal footer', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.messageBox({
        message: 'Choose an action',
        buttons: [
          { text: 'Save', value: 'save', variant: 'primary' },
          { text: 'Discard', value: 'discard', variant: 'danger' },
          { text: 'Cancel', value: 'cancel', variant: 'secondary' },
        ],
      });
    });
    await page.waitForTimeout(300);

    const buttons = await count(page, '.tx-modal-btn');
    expect(buttons).toBe(3);
  });

  test('icon renders in the message box', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.messageBox.alert('Info message');
    });
    await page.waitForTimeout(300);

    await expect(page.locator('.tx-msgbox-icon')).toBeVisible();
    const hasSvg = await page.locator('.tx-msgbox-icon svg').count();
    expect(hasSvg).toBeGreaterThanOrEqual(1);
  });

  test('close resolves the promise with "close"', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__closeResult = null;
      (window as any).Teryx.messageBox({
        message: 'Close me',
        title: 'Test',
        closable: true,
        buttons: [{ text: 'OK', value: 'ok', variant: 'primary' }],
      }).then((v: string) => {
        (window as any).__closeResult = v;
      });
    });
    await page.waitForTimeout(300);

    // Click the modal close button (X)
    await page.locator('.tx-modal-close').click();
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => (window as any).__closeResult);
    expect(result).toBe('close');
  });

  test('custom buttons resolve with their value', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__btnResult = null;
      (window as any).Teryx.messageBox({
        message: 'Pick one',
        buttons: [
          { text: 'Yes', value: 'yes', variant: 'success' },
          { text: 'No', value: 'no', variant: 'danger' },
        ],
      }).then((v: string) => {
        (window as any).__btnResult = v;
      });
    });
    await page.waitForTimeout(300);

    await page.locator('.tx-modal-btn').filter({ hasText: 'Yes' }).click();
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => (window as any).__btnResult);
    expect(result).toBe('yes');
  });
});
