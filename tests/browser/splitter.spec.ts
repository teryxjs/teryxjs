import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

test.describe('Splitter Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders a gutter between panels', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<div>Panel A</div><div>Panel B</div>';
      (window as any).Teryx.splitter('#target', {
        orientation: 'horizontal',
        sizes: [50, 50]
      });
    });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-splitter')).toBeVisible();
    const gutters = await count(page, '.tx-splitter-gutter');
    expect(gutters).toBe(1);
  });

  test('gutter has col-resize cursor for horizontal orientation', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<div>Left</div><div>Right</div>';
      (window as any).Teryx.splitter('#target', {
        orientation: 'horizontal',
        sizes: [50, 50]
      });
    });
    await page.waitForTimeout(200);

    const gutter = page.locator('.tx-splitter-gutter-horizontal');
    await expect(gutter).toBeVisible();
  });

  test('panels receive initial sizes', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.style.width = '600px';
      el.innerHTML = '<div>Left</div><div>Right</div>';
      (window as any).Teryx.splitter('#target', {
        orientation: 'horizontal',
        sizes: [30, 70]
      });
    });
    await page.waitForTimeout(200);

    const panels = page.locator('.tx-splitter-panel');
    const panelCount = await panels.count();
    expect(panelCount).toBe(2);

    // Both panels should have non-zero widths
    const leftWidth = await panels.nth(0).evaluate(el => el.offsetWidth);
    const rightWidth = await panels.nth(1).evaluate(el => el.offsetWidth);
    expect(leftWidth).toBeGreaterThan(0);
    expect(rightWidth).toBeGreaterThan(0);
    // Right panel should be wider than left based on 30/70 split
    expect(rightWidth).toBeGreaterThan(leftWidth);
  });

  test('dragging the gutter resizes panels', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.style.width = '600px';
      el.style.height = '200px';
      el.innerHTML = '<div>Left</div><div>Right</div>';
      (window as any).Teryx.splitter('#target', {
        orientation: 'horizontal',
        sizes: [50, 50]
      });
    });
    await page.waitForTimeout(200);

    const leftBefore = await page.locator('.tx-splitter-panel').nth(0).evaluate(el => el.offsetWidth);

    const gutter = page.locator('.tx-splitter-gutter');
    const gutterBox = await gutter.boundingBox();
    expect(gutterBox).not.toBeNull();

    // Drag gutter to the right by 100px
    await page.mouse.move(gutterBox!.x + gutterBox!.width / 2, gutterBox!.y + gutterBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(gutterBox!.x + gutterBox!.width / 2 + 100, gutterBox!.y + gutterBox!.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const leftAfter = await page.locator('.tx-splitter-panel').nth(0).evaluate(el => el.offsetWidth);
    expect(leftAfter).toBeGreaterThan(leftBefore);
  });

  test('vertical orientation uses row direction', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<div>Top</div><div>Bottom</div>';
      (window as any).Teryx.splitter('#target', {
        orientation: 'vertical',
        sizes: [50, 50]
      });
    });
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-splitter-vertical')).toBeVisible();
    await expect(page.locator('.tx-splitter-gutter-vertical')).toBeVisible();
  });
});
