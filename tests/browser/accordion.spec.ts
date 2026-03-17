import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, texts, assertExists, assertNotExists } from './helpers';

test.describe('Accordion Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders accordion items', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        items: [
          { id: 'a', title: 'Section A', content: 'Content A' },
          { id: 'b', title: 'Section B', content: 'Content B' },
          { id: 'c', title: 'Section C', content: 'Content C' },
        ]
      });
    `,
    );
    await expect(page.locator('.tx-accordion')).toBeVisible();
    expect(await count(page, '.tx-accordion-item')).toBe(3);
    const titles = await texts(page, '.tx-accordion-title');
    expect(titles).toEqual(['Section A', 'Section B', 'Section C']);
  });

  test('click toggles item open and closed', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'Section A', content: '<p>Content A</p>' },
          { id: 'b', title: 'Section B', content: '<p>Content B</p>' },
        ]
      });
    `,
    );

    // Initially both panels are hidden
    const panelA = page.locator('[data-item="a"] .tx-accordion-panel');
    await expect(panelA).toBeHidden();

    // Click to open
    await page.locator('[data-item="a"] .tx-accordion-header').click();
    await page.waitForTimeout(100);

    await expect(panelA).toBeVisible();
    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);

    // Click again to close
    await page.locator('[data-item="a"] .tx-accordion-header').click();
    await page.waitForTimeout(100);

    await expect(panelA).toBeHidden();
    await expect(page.locator('[data-item="a"]')).not.toHaveClass(/tx-accordion-open/);
  });

  test('single mode closes other items when opening one', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        animated: false,
        multiple: false,
        items: [
          { id: 'a', title: 'A', content: 'Content A', open: true },
          { id: 'b', title: 'B', content: 'Content B' },
        ]
      });
    `,
    );

    // A is open initially
    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);

    // Open B
    await page.locator('[data-item="b"] .tx-accordion-header').click();
    await page.waitForTimeout(100);

    // B should be open, A should be closed
    await expect(page.locator('[data-item="b"]')).toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="a"]')).not.toHaveClass(/tx-accordion-open/);
  });

  test('multiple mode keeps several items open', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        animated: false,
        multiple: true,
        items: [
          { id: 'a', title: 'A', content: 'Content A' },
          { id: 'b', title: 'B', content: 'Content B' },
          { id: 'c', title: 'C', content: 'Content C' },
        ]
      });
    `,
    );

    // Open A
    await page.locator('[data-item="a"] .tx-accordion-header').click();
    await page.waitForTimeout(100);

    // Open B
    await page.locator('[data-item="b"] .tx-accordion-header').click();
    await page.waitForTimeout(100);

    // Both should remain open
    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="b"]')).toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="c"]')).not.toHaveClass(/tx-accordion-open/);
  });

  test('initially open item renders expanded', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'A', content: '<p>Open content</p>', open: true },
          { id: 'b', title: 'B', content: 'Closed' },
        ]
      });
    `,
    );

    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="a"] .tx-accordion-panel')).toBeVisible();
    await expect(page.locator('[data-item="a"] .tx-accordion-header')).toHaveAttribute('aria-expanded', 'true');

    await expect(page.locator('[data-item="b"]')).not.toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="b"] .tx-accordion-panel')).toBeHidden();
  });

  test('disabled item does not toggle on click', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'A', content: 'Content', disabled: true },
        ]
      });
    `,
    );

    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-disabled/);
    await expect(page.locator('[data-item="a"] .tx-accordion-header')).toBeDisabled();

    // Click should not open it
    await page.locator('[data-item="a"] .tx-accordion-header').click({ force: true });
    await page.waitForTimeout(100);

    await expect(page.locator('[data-item="a"]')).not.toHaveClass(/tx-accordion-open/);
  });

  test('programmatic open method opens an item', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__acc = Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'A', content: 'Content A' },
          { id: 'b', title: 'B', content: 'Content B' },
        ]
      });
    `,
    );

    await expect(page.locator('[data-item="a"]')).not.toHaveClass(/tx-accordion-open/);

    await page.evaluate(() => (window as any).__acc.open('a'));
    await page.waitForTimeout(100);

    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="a"] .tx-accordion-panel')).toBeVisible();
  });

  test('programmatic close method closes an item', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__acc = Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'A', content: 'Content A', open: true },
        ]
      });
    `,
    );

    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);

    await page.evaluate(() => (window as any).__acc.close('a'));
    await page.waitForTimeout(100);

    await expect(page.locator('[data-item="a"]')).not.toHaveClass(/tx-accordion-open/);
    await expect(page.locator('[data-item="a"] .tx-accordion-panel')).toBeHidden();
  });

  test('programmatic toggle method toggles an item', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__acc = Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'A', content: 'Content A' },
        ]
      });
    `,
    );

    // Toggle open
    await page.evaluate(() => (window as any).__acc.toggle('a'));
    await page.waitForTimeout(100);
    await expect(page.locator('[data-item="a"]')).toHaveClass(/tx-accordion-open/);

    // Toggle closed
    await page.evaluate(() => (window as any).__acc.toggle('a'));
    await page.waitForTimeout(100);
    await expect(page.locator('[data-item="a"]')).not.toHaveClass(/tx-accordion-open/);
  });

  test('openAll opens all items and closeAll closes all', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__acc = Teryx.accordion('#target', {
        animated: false,
        multiple: true,
        items: [
          { id: 'a', title: 'A', content: 'A' },
          { id: 'b', title: 'B', content: 'B' },
          { id: 'c', title: 'C', content: 'C' },
        ]
      });
    `,
    );

    // Open all
    await page.evaluate(() => (window as any).__acc.openAll());
    await page.waitForTimeout(100);

    expect(await count(page, '.tx-accordion-open')).toBe(3);

    // Close all
    await page.evaluate(() => (window as any).__acc.closeAll());
    await page.waitForTimeout(100);

    expect(await count(page, '.tx-accordion-open')).toBe(0);
  });

  test('animated class is applied by default', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        items: [
          { id: 'a', title: 'A', content: 'Content' },
        ]
      });
    `,
    );

    await expect(page.locator('.tx-accordion-panel').first()).toHaveClass(/tx-accordion-animated/);
  });

  test('content renders inside accordion body', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        animated: false,
        items: [
          { id: 'a', title: 'A', content: '<strong>Bold text</strong>', open: true },
        ]
      });
    `,
    );

    const body = page.locator('.tx-accordion-body');
    await expect(body.locator('strong')).toHaveText('Bold text');
  });

  test('bordered class is applied by default', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        items: [
          { id: 'a', title: 'A', content: 'Content' },
        ]
      });
    `,
    );

    await expect(page.locator('.tx-accordion')).toHaveClass(/tx-accordion-bordered/);
  });

  test('bordered false removes bordered class', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.accordion('#target', {
        bordered: false,
        items: [
          { id: 'a', title: 'A', content: 'Content' },
        ]
      });
    `,
    );

    await expect(page.locator('.tx-accordion')).not.toHaveClass(/tx-accordion-bordered/);
  });

  test('destroy removes all accordion DOM content', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__acc = Teryx.accordion('#target', {
        items: [
          { id: 'a', title: 'A', content: 'Content' },
        ]
      });
    `,
    );

    await assertExists(page, '.tx-accordion');

    await page.evaluate(() => (window as any).__acc.destroy());
    await page.waitForTimeout(100);

    await assertNotExists(page, '.tx-accordion');
  });
});
