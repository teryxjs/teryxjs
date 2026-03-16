import { test, expect } from '@playwright/test';
import { setupPage, createWidget, assertExists, assertNotExists } from './helpers';

test.describe('Modal', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('open makes modal visible, close hides it', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Test Modal',
        content: '<p>Hello modal</p>',
      });
    `);
    // Modal should be hidden initially
    const overlay = page.locator('.tx-modal-overlay');
    await expect(overlay).toHaveCSS('display', 'none');

    // Open
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);
    await expect(overlay).not.toHaveCSS('display', 'none');
    await expect(overlay).toHaveClass(/tx-modal-active/);

    // Close
    await page.evaluate(() => (window as any).__modal.close());
    await page.waitForTimeout(300);
    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('renders title correctly', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'My Dialog',
        content: '<p>Content here</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);
    const title = page.locator('.tx-modal-title');
    await expect(title).toHaveText('My Dialog');
  });

  test('renders content inside modal body', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Content Test',
        content: '<p class="custom-content">Modal body text</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);
    const content = page.locator('.tx-modal-body .custom-content');
    await expect(content).toHaveText('Modal body text');
  });

  test('close button click closes the modal', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Close Test',
        content: '<p>Content</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    const closeBtn = page.locator('.tx-modal-close');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await page.waitForTimeout(300);

    const overlay = page.locator('.tx-modal-overlay');
    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('escape key closes the modal', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Escape Test',
        content: '<p>Content</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const overlay = page.locator('.tx-modal-overlay');
    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('backdrop click closes the modal', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Backdrop Test',
        content: '<p>Content</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    // Click on the overlay (backdrop), not the modal dialog itself
    const overlay = page.locator('.tx-modal-overlay');
    await overlay.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(300);

    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('static backdrop does not close on backdrop click', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Static Backdrop',
        content: '<p>Content</p>',
        backdrop: 'static',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    // Click on the overlay background
    const overlay = page.locator('.tx-modal-overlay');
    await overlay.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(300);

    // Modal should remain open
    await expect(overlay).toHaveClass(/tx-modal-active/);
  });

  test('setContent updates modal body', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Update Content',
        content: '<p>Original</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      (window as any).__modal.setContent('<p class="updated">New content</p>');
    });
    const updated = page.locator('.tx-modal-body .updated');
    await expect(updated).toHaveText('New content');
  });

  test('size classes are applied correctly', async ({ page }) => {
    // Small
    await createWidget(page, `
      window.__modalSm = Teryx.modal({
        title: 'Small',
        content: '<p>Small modal</p>',
        size: 'sm',
      });
    `);
    const smDialog = page.locator('.tx-modal-sm');
    await expect(smDialog).toHaveCount(1);

    // Large
    await createWidget(page, `
      window.__modalLg = Teryx.modal({
        title: 'Large',
        content: '<p>Large modal</p>',
        size: 'lg',
      });
    `);
    const lgDialog = page.locator('.tx-modal-lg');
    await expect(lgDialog).toHaveCount(1);
  });

  test('footer buttons are rendered', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'With Buttons',
        content: '<p>Content</p>',
        buttons: [
          { label: 'Cancel', variant: 'secondary', action: 'close' },
          { label: 'Save', variant: 'primary' },
        ],
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    await assertExists(page, '.tx-modal-footer');
    const buttons = page.locator('.tx-modal-btn');
    await expect(buttons).toHaveCount(2);

    const buttonTexts = await buttons.allTextContents();
    expect(buttonTexts).toContain('Cancel');
    expect(buttonTexts).toContain('Save');
  });

  test('footer button with action close closes the modal', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Button Close',
        content: '<p>Content</p>',
        buttons: [
          { label: 'Cancel', variant: 'secondary', action: 'close' },
        ],
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    await page.locator('.tx-modal-btn').click();
    await page.waitForTimeout(300);

    const overlay = page.locator('.tx-modal-overlay').first();
    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('draggable modal gets draggable class and cursor', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Draggable',
        content: '<p>Drag me</p>',
        draggable: true,
      });
    `);
    await expect(page.locator('.tx-modal-draggable')).toHaveCount(1);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    const header = page.locator('.tx-modal-draggable .tx-modal-header');
    await expect(header).toHaveCSS('cursor', 'move');
  });

  test('maximize and restore toggle maximized class', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Maximize Test',
        content: '<p>Content</p>',
        maximizable: true,
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    // Maximize
    await page.evaluate(() => (window as any).__modal.maximize());
    await page.waitForTimeout(100);
    await assertExists(page, '.tx-modal-maximized');

    // Restore
    await page.evaluate(() => (window as any).__modal.restore());
    await page.waitForTimeout(100);
    await assertNotExists(page, '.tx-modal-maximized');
  });

  test('isOpen returns correct state', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'State Test',
        content: '<p>Content</p>',
      });
    `);

    let isOpen = await page.evaluate(() => (window as any).__modal.isOpen());
    expect(isOpen).toBe(false);

    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    isOpen = await page.evaluate(() => (window as any).__modal.isOpen());
    expect(isOpen).toBe(true);

    await page.evaluate(() => (window as any).__modal.close());
    await page.waitForTimeout(300);

    isOpen = await page.evaluate(() => (window as any).__modal.isOpen());
    expect(isOpen).toBe(false);
  });

  test('setTitle updates modal title', async ({ page }) => {
    await createWidget(page, `
      window.__modal = Teryx.modal({
        title: 'Original Title',
        content: '<p>Content</p>',
      });
    `);
    await page.evaluate(() => (window as any).__modal.open());
    await page.waitForTimeout(200);

    await page.evaluate(() => (window as any).__modal.setTitle('New Title'));
    const title = page.locator('.tx-modal-title');
    await expect(title).toHaveText('New Title');
  });
});
