import { test, expect } from '@playwright/test';

test.describe('Explorer — Rich Text Editor demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-rich-text-editor');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all four rich editor demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('default toolbar demo has toolbar buttons and editable area', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-rich-editor-toolbar')).toBeVisible();
    const buttons = first.locator('.tx-rich-editor-btn');
    expect(await buttons.count()).toBeGreaterThanOrEqual(7);
    const content = first.locator('.tx-rich-editor-content');
    await expect(content).toHaveAttribute('contenteditable', 'true');
  });

  test('pre-filled formatting demo shows bold, italic, underline', async ({ page }) => {
    const formattingDemo = page.locator('.ex-demo').nth(1);
    const content = formattingDemo.locator('.tx-rich-editor-content');
    await expect(content.locator('strong')).toContainText('Bold');
    await expect(content.locator('em')).toContainText('italic');
    await expect(content.locator('u')).toContainText('underline');
  });

  test('readonly demo has no toolbar and non-editable content', async ({ page }) => {
    const readonlyDemo = page.locator('.ex-demo').nth(2);
    await expect(readonlyDemo.locator('.tx-rich-editor-readonly')).toBeVisible();
    // No toolbar
    expect(await readonlyDemo.locator('.tx-rich-editor-toolbar').count()).toBe(0);
    const content = readonlyDemo.locator('.tx-rich-editor-content');
    await expect(content).toHaveAttribute('contenteditable', 'false');
  });

  test('get/set demo has Set and Get buttons', async ({ page }) => {
    const apiDemo = page.locator('.ex-demo').nth(3);
    const setBtn = apiDemo.locator('button', { hasText: 'Set Content' });
    const getBtn = apiDemo.locator('button', { hasText: 'Get Content' });
    await expect(setBtn).toBeVisible();
    await expect(getBtn).toBeVisible();

    // Click Set Content and verify content updates
    await setBtn.click();
    await page.waitForTimeout(200);
    const content = apiDemo.locator('.tx-rich-editor-content');
    await expect(content).toContainText('Updated via');
  });
});

test.describe('Explorer — File Upload demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-file-upload');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all four file upload demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('single upload has no drag-drop class', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    expect(await first.locator('.tx-upload-dragdrop').count()).toBe(0);
    const input = first.locator('.tx-upload-input');
    await expect(input).not.toHaveAttribute('multiple');
  });

  test('multiple files demo has multiple attribute', async ({ page }) => {
    const multiDemo = page.locator('.ex-demo').nth(1);
    const input = multiDemo.locator('.tx-upload-input');
    await expect(input).toHaveAttribute('multiple');
  });

  test('drag & drop demo has dragdrop class and dropzone', async ({ page }) => {
    const dragDemo = page.locator('.ex-demo').nth(2);
    await expect(dragDemo.locator('.tx-upload-dragdrop')).toBeVisible();
    await expect(dragDemo.locator('.tx-upload-dropzone')).toBeVisible();
  });

  test('accept types demo has accept attribute for images', async ({ page }) => {
    const acceptDemo = page.locator('.ex-demo').nth(3);
    const input = acceptDemo.locator('.tx-upload-input');
    await expect(input).toHaveAttribute('accept', 'image/*');
    // Should show max size hint
    await expect(acceptDemo.locator('.tx-upload-hint')).toBeVisible();
  });
});
