import { test, expect } from '@playwright/test';
import { setupPage, createWidget, assertExists, assertNotExists } from './helpers';

test.describe('Card Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('title renders in card header', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'My Card Title',
        content: '<p>Body</p>'
      });
    `);

    await expect(page.locator('.tx-card')).toBeVisible();
    await expect(page.locator('.tx-card-title')).toHaveText('My Card Title');
  });

  test('body content renders', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        content: '<p class="test-content">Hello World</p>'
      });
    `);

    await expect(page.locator('.tx-card-body')).toBeVisible();
    await expect(page.locator('.test-content')).toHaveText('Hello World');
  });

  test('collapsible toggle hides and shows body', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Card',
        content: '<p>Collapsible content</p>',
        collapsible: true
      });
    `);

    const body = page.locator('.tx-card-body');
    const collapseBtn = page.locator('.tx-card-collapse-btn');

    // Initially visible
    await expect(body).toBeVisible();

    // Click to collapse
    await collapseBtn.click();
    await page.waitForTimeout(100);
    await expect(body).toBeHidden();

    // Click to expand
    await collapseBtn.click();
    await page.waitForTimeout(100);
    await expect(body).toBeVisible();
  });

  test('collapsed initial state hides body', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Card',
        content: '<p>Hidden content</p>',
        collapsible: true,
        collapsed: true
      });
    `);

    const body = page.locator('.tx-card-body');
    await expect(body).toBeHidden();

    // Expand with click
    await page.locator('.tx-card-collapse-btn').click();
    await page.waitForTimeout(100);
    await expect(body).toBeVisible();
  });

  test('closable hides the entire card', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Closable Card',
        content: '<p>Content</p>',
        closable: true
      });
    `);

    await expect(page.locator('.tx-card')).toBeVisible();
    await expect(page.locator('.tx-card-close-btn')).toBeVisible();

    await page.locator('.tx-card-close-btn').click();
    await page.waitForTimeout(100);

    await expect(page.locator('.tx-card')).toBeHidden();
  });

  test('tools render and click handler fires', async ({ page }) => {
    await createWidget(page, `
      window.__toolClicked = false;
      Teryx.card('#target', {
        title: 'Card with Tools',
        content: '<p>Content</p>',
        tools: [
          { icon: 'settings', tooltip: 'Settings', handler: () => { window.__toolClicked = true; } },
          { icon: 'refresh', tooltip: 'Refresh' },
        ]
      });
    `);

    // Tools should render (excluding collapse/close btns)
    const toolBtns = page.locator('.tx-card-tool:not(.tx-card-collapse-btn):not(.tx-card-close-btn)');
    expect(await toolBtns.count()).toBe(2);

    // First tool has tooltip
    await expect(toolBtns.first()).toHaveAttribute('title', 'Settings');

    // Click fires handler
    await toolBtns.first().click();
    await page.waitForTimeout(100);

    const clicked = await page.evaluate(() => (window as any).__toolClicked);
    expect(clicked).toBe(true);
  });

  test('footer renders', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Card',
        content: '<p>Body</p>',
        footer: '<span class="footer-text">Footer content</span>'
      });
    `);

    await expect(page.locator('.tx-card-footer')).toBeVisible();
    await expect(page.locator('.footer-text')).toHaveText('Footer content');
  });

  test('source generates xh-get attribute', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Remote Card',
        source: '/api/card-content'
      });
    `);

    const xhEl = page.locator('.tx-card-body [xh-get]');
    await expect(xhEl).toHaveAttribute('xh-get', '/api/card-content');
    await expect(xhEl).toHaveAttribute('xh-trigger', 'load');
  });

  test('image top renders image before header', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Card with Image',
        content: '<p>Content</p>',
        image: '/img/test.jpg',
        imagePosition: 'top'
      });
    `);

    const img = page.locator('.tx-card-img-top');
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute('src', '/img/test.jpg');
    await expect(img).toHaveClass(/tx-card-img-top/);
  });

  test('custom class is applied to the card', async ({ page }) => {
    await createWidget(page, `
      Teryx.card('#target', {
        title: 'Custom',
        content: '<p>Content</p>',
        class: 'my-custom-card'
      });
    `);

    await expect(page.locator('.tx-card')).toHaveClass(/my-custom-card/);
  });

  test('destroy removes all card DOM content', async ({ page }) => {
    await createWidget(page, `
      window.__card = Teryx.card('#target', {
        title: 'Destroy Me',
        content: '<p>Content</p>'
      });
    `);

    await assertExists(page, '.tx-card');

    await page.evaluate(() => (window as any).__card.destroy());
    await page.waitForTimeout(100);

    await assertNotExists(page, '.tx-card');
  });
});
