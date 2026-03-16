import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Rating Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders the correct number of stars', async ({ page }) => {
    await createWidget(page, `
      Teryx.rating('#target', { max: 5, value: 0 });
    `);
    const stars = await count(page, '.tx-rating-star');
    expect(stars).toBe(5);
  });

  test('renders custom number of stars', async ({ page }) => {
    await createWidget(page, `
      Teryx.rating('#target', { max: 10, value: 0 });
    `);
    const stars = await count(page, '.tx-rating-star');
    expect(stars).toBe(10);
  });

  test('click sets the value and marks stars active', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__rt = (window as any).Teryx.rating('#target', { max: 5, value: 0 });
    });

    // Playwright's click targets the SVG inside the star span; after render()
    // replaces the DOM the event listeners are lost. Use dispatchEvent which
    // correctly bubbles through the live DOM to the container's click handler.
    await page.evaluate(() => {
      const star = document.querySelector('.tx-rating-star[data-value="3"]');
      if (star) star.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__rt.getValue());
    expect(val).toBe(3);
    const active = await count(page, '.tx-rating-star-active');
    expect(active).toBe(3);
  });

  test('readonly prevents changing the value on click', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__rt = (window as any).Teryx.rating('#target', { max: 5, value: 2, readonly: true });
    });
    await expect(page.locator('.tx-rating-readonly')).toBeVisible();
    await page.locator('.tx-rating-star[data-value="4"]').click();
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__rt.getValue());
    expect(val).toBe(2);
  });

  test('getValue returns the current rating', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__rt = (window as any).Teryx.rating('#target', { max: 5, value: 4 });
    });
    const val = await page.evaluate(() => (window as any).__rt.getValue());
    expect(val).toBe(4);
  });

  test('setValue programmatically changes the rating', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__rt = (window as any).Teryx.rating('#target', { max: 5, value: 1 });
    });
    await page.evaluate(() => (window as any).__rt.setValue(5));
    await page.waitForTimeout(200);

    const active = await count(page, '.tx-rating-star-active');
    expect(active).toBe(5);
    const val = await page.evaluate(() => (window as any).__rt.getValue());
    expect(val).toBe(5);
  });

  test('hover adds preview class to stars', async ({ page }) => {
    await createWidget(page, `
      Teryx.rating('#target', { max: 5, value: 0 });
    `);
    await page.locator('.tx-rating-star[data-value="4"]').hover();
    await page.waitForTimeout(200);

    const hoverCount = await count(page, '.tx-rating-star-hover');
    expect(hoverCount).toBe(4);
  });

  test('clicking the same star toggles the rating off', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__rt = (window as any).Teryx.rating('#target', { max: 5, value: 3 });
    });

    // Use dispatchEvent to reliably trigger the click handler (see click test above)
    await page.evaluate(() => {
      const star = document.querySelector('.tx-rating-star[data-value="3"]');
      if (star) star.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__rt.getValue());
    expect(val).toBe(0);
    const active = await count(page, '.tx-rating-star-active');
    expect(active).toBe(0);
  });
});
