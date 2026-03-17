import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('TagInput Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders with initial tags', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tagInput('#target', { value: ['alpha', 'beta', 'gamma'] });
    `,
    );
    const chips = await count(page, '.tx-tag-input-chip');
    expect(chips).toBe(3);
  });

  test('renders with no tags', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tagInput('#target', { placeholder: 'Add tags...' });
    `,
    );
    const chips = await count(page, '.tx-tag-input-chip');
    expect(chips).toBe(0);
    await expect(page.locator('.tx-tag-input-field')).toHaveAttribute('placeholder', 'Add tags...');
  });

  test('getValue returns current tags', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__ti = (window as any).Teryx.tagInput('#target', {
        value: ['foo', 'bar'],
      });
    });
    const val = await page.evaluate(() => (window as any).__ti.getValue());
    expect(val).toEqual(['foo', 'bar']);
  });

  test('addTag programmatically adds a tag', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__ti = (window as any).Teryx.tagInput('#target', { value: ['a'] });
    });
    await page.evaluate(() => (window as any).__ti.addTag('b'));
    await page.waitForTimeout(100);

    const chips = await count(page, '.tx-tag-input-chip');
    expect(chips).toBe(2);
    const val = await page.evaluate(() => (window as any).__ti.getValue());
    expect(val).toEqual(['a', 'b']);
  });

  test('removeTag programmatically removes a tag', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__ti = (window as any).Teryx.tagInput('#target', { value: ['a', 'b', 'c'] });
    });
    await page.evaluate(() => (window as any).__ti.removeTag('b'));
    await page.waitForTimeout(100);

    const val = await page.evaluate(() => (window as any).__ti.getValue());
    expect(val).toEqual(['a', 'c']);
  });

  test('clicking remove button removes a tag', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__ti = (window as any).Teryx.tagInput('#target', { value: ['a', 'b', 'c'] });
    });

    await page.evaluate(() => {
      const btn = document.querySelector('.tx-tag-input-chip-remove[data-remove="b"]');
      if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__ti.getValue());
    expect(val).toEqual(['a', 'c']);
  });

  test('clear removes all tags', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__ti = (window as any).Teryx.tagInput('#target', { value: ['a', 'b'] });
    });
    await page.evaluate(() => (window as any).__ti.clear());
    await page.waitForTimeout(100);

    const chips = await count(page, '.tx-tag-input-chip');
    expect(chips).toBe(0);
  });
});
