import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('RichEditor Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders with toolbar and content area', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.richEditor('#target', {});
    `,
    );
    await expect(page.locator('.tx-rich-editor-toolbar')).toBeVisible();
    await expect(page.locator('.tx-rich-editor-content')).toBeVisible();
  });

  test('renders initial value', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.richEditor('#target', { value: '<p>Hello <strong>world</strong></p>' });
    `,
    );
    const html = await page.locator('.tx-rich-editor-content').innerHTML();
    expect(html).toContain('Hello');
    expect(html).toContain('<strong>world</strong>');
  });

  test('getValue returns current HTML', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__re = (window as any).Teryx.richEditor('#target', {
        value: '<p>test content</p>',
      });
    });
    const val = await page.evaluate(() => (window as any).__re.getValue());
    expect(val).toContain('test content');
  });

  test('setValue updates content', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__re = (window as any).Teryx.richEditor('#target', {
        value: '<p>old</p>',
      });
    });
    await page.evaluate(() => (window as any).__re.setValue('<p>new content</p>'));
    await page.waitForTimeout(100);

    const html = await page.locator('.tx-rich-editor-content').innerHTML();
    expect(html).toContain('new content');
  });

  test('readonly mode hides toolbar', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.richEditor('#target', { readonly: true, value: '<p>Read only text</p>' });
    `,
    );
    const toolbarCount = await count(page, '.tx-rich-editor-toolbar');
    expect(toolbarCount).toBe(0);
    await expect(page.locator('.tx-rich-editor-readonly')).toBeVisible();
  });

  test('custom toolbar renders specified buttons', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.richEditor('#target', { toolbar: ['bold', 'italic'] });
    `,
    );
    const buttons = await count(page, '.tx-rich-editor-btn');
    expect(buttons).toBe(2);
  });

  test('content area is editable', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.richEditor('#target', {});
    `,
    );
    const editable = await page.locator('.tx-rich-editor-content').getAttribute('contenteditable');
    expect(editable).toBe('true');
  });
});
