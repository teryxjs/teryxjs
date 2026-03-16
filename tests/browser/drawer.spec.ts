import { test, expect } from '@playwright/test';
import { setupPage } from './helpers';

test.describe('Drawer Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('open makes the drawer visible', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'My Drawer',
        content: '<p>Drawer content</p>'
      });
    });
    await page.evaluate(() => (window as any).__dr.open());
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-drawer-overlay.tx-drawer-active')).toBeVisible();
    await expect(page.locator('.tx-drawer')).toBeVisible();
  });

  test('close hides the drawer', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'My Drawer',
        content: '<p>Content</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-drawer-active')).toBeVisible();

    await page.evaluate(() => (window as any).__dr.close());
    await page.waitForTimeout(400);

    await expect(page.locator('.tx-drawer-overlay')).toBeHidden();
  });

  test('clicking the backdrop closes the drawer', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'Backdrop Test',
        content: '<p>Content</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);

    await page.locator('.tx-drawer-overlay').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(400);

    const isOpen = await page.evaluate(() => (window as any).__dr.isOpen());
    expect(isOpen).toBe(false);
  });

  test('pressing Escape closes the drawer', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'Escape Test',
        content: '<p>Content</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const isOpen = await page.evaluate(() => (window as any).__dr.isOpen());
    expect(isOpen).toBe(false);
  });

  test('right position applies correct class', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'Right Drawer',
        position: 'right',
        content: '<p>Right</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-drawer-right')).toBeVisible();
  });

  test('left position applies correct class', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'Left Drawer',
        position: 'left',
        content: '<p>Left</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-drawer-left')).toBeVisible();
  });

  test('title renders in the drawer header', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'Drawer Title',
        content: '<p>Content</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-drawer-title')).toHaveText('Drawer Title');
  });

  test('close button is rendered and functional', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dr = (window as any).Teryx.drawer({
        title: 'Close Btn Test',
        content: '<p>Content</p>'
      });
      (window as any).__dr.open();
    });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-drawer-close')).toBeVisible();

    await page.locator('.tx-drawer-close').click();
    await page.waitForTimeout(400);

    const isOpen = await page.evaluate(() => (window as any).__dr.isOpen());
    expect(isOpen).toBe(false);
  });
});
