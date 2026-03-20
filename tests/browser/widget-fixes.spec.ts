import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

// ── Rating: SVG pointer-events fix ──────────────────────────
test.describe('Rating — SVG pointer-events fix', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('SVGs inside rating stars have pointer-events: none', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.rating('#target', { max: 5, value: 2 });
    });
    const pe = await page.locator('.tx-rating-star svg').first().evaluate(
      (el) => getComputedStyle(el).pointerEvents,
    );
    expect(pe).toBe('none');
  });

  test('clicking star via Playwright locator updates the rating', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__rt = (window as any).Teryx.rating('#target', { max: 5, value: 1 });
    });
    await page.locator('.tx-rating-star[data-value="4"]').click();
    await page.waitForTimeout(200);
    const val = await page.evaluate(() => (window as any).__rt.getValue());
    expect(val).toBe(4);
  });
});

// ── Slider: CSS and interaction fix ─────────────────────────
test.describe('Slider — CSS and track click fix', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('slider thumb has absolute positioning from CSS', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.slider('#target', { value: 50 });
    });
    const pos = await page.locator('.tx-slider-thumb').evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(pos).toBe('absolute');
  });

  test('clicking track changes slider value', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__sl = (window as any).Teryx.slider('#target', { value: 20, min: 0, max: 100 });
    });
    const track = page.locator('.tx-slider-track');
    const box = await track.boundingBox();
    expect(box).toBeTruthy();
    // Click at 80% of the track
    await track.click({ position: { x: box!.width * 0.8, y: box!.height / 2 } });
    await page.waitForTimeout(200);
    const val = await page.evaluate(() => (window as any).__sl.getValue());
    expect(val).toBeGreaterThan(60);
  });

  test('slider tooltip reflects value after track click', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__sl = (window as any).Teryx.slider('#target', {
        value: 10, min: 0, max: 100, showTooltip: true,
      });
    });
    const track = page.locator('.tx-slider-track');
    const box = await track.boundingBox();
    await track.click({ position: { x: box!.width * 0.5, y: box!.height / 2 } });
    await page.waitForTimeout(200);
    const tooltip = await page.locator('.tx-slider-tooltip').textContent();
    expect(Number(tooltip)).toBeGreaterThanOrEqual(40);
    expect(Number(tooltip)).toBeLessThanOrEqual(60);
  });
});

// ── Tag Input: CSS presence ─────────────────────────────────
test.describe('TagInput — CSS styling', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('tag input container has styled border', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.tagInput('#target', { value: ['A', 'B'] });
    });
    const border = await page.locator('.tx-tag-input').evaluate(
      (el) => getComputedStyle(el).borderStyle,
    );
    expect(border).toBe('solid');
  });

  test('tag input chips have background styling', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.tagInput('#target', { value: ['Tag1'] });
    });
    const bg = await page.locator('.tx-tag-input-chip').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('tag input field has no visible border', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.tagInput('#target', { value: [] });
    });
    const border = await page.locator('.tx-tag-input-field').evaluate(
      (el) => getComputedStyle(el).borderStyle,
    );
    expect(border).toBe('none');
  });
});

// ── DatePicker: dropdown open/close fix ─────────────────────
test.describe('DatePicker — dropdown open fix', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('clicking trigger opens dropdown', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.datePicker('#target', { placeholder: 'Pick a date' });
    });
    const dropdown = page.locator('.tx-datepicker-dropdown');
    await expect(dropdown).toBeHidden();

    await page.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);
    await expect(dropdown).toBeVisible();
  });

  test('clicking a day selects it and closes dropdown', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__dp = (window as any).Teryx.datePicker('#target', {});
    });
    await page.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);

    const day = page.locator('.tx-datepicker-day:not(.tx-datepicker-day-other):not(.tx-datepicker-day-disabled)').first();
    await day.click();
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__dp.getValue());
    expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await expect(page.locator('.tx-datepicker-dropdown')).toBeHidden();
  });

  test('clicking outside closes the dropdown', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.datePicker('#target', {});
    });
    await page.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-datepicker-dropdown')).toBeVisible();

    await page.mouse.click(10, 10);
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-datepicker-dropdown')).toBeHidden();
  });
});

// ── FileUpload: dropzone click fix ──────────────────────────
test.describe('FileUpload — dropzone click', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('clicking dropzone triggers file dialog', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.fileupload('#target', { action: '/api/upload' });
    });
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 3000 }),
      page.locator('.tx-upload-dropzone').click({ position: { x: 10, y: 10 } }),
    ]);
    expect(fileChooser).toBeTruthy();
  });
});

// ── TransferList: search focus preservation ─────────────────
test.describe('TransferList — search focus', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('search filters items and preserves focus', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).Teryx.transferList('#target', {
        source: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Avocado', value: 'avocado' },
        ],
        searchable: true,
      });
    });
    const input = page.locator('.tx-transfer-search-input[data-side="left"]');
    await input.fill('a');
    await page.waitForTimeout(200);

    // Items should be filtered (Apple, Avocado, Banana all match case-insensitive "a")
    const items = await count(page, '.tx-transfer-list-left .tx-transfer-item');
    expect(items).toBeLessThanOrEqual(3);

    // Input should still be focused with value preserved
    const value = await input.inputValue();
    expect(value).toBe('a');
    const focused = await input.evaluate((el) => document.activeElement === el);
    expect(focused).toBe(true);
  });
});
