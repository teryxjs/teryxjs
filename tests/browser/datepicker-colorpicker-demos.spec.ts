import { test, expect } from '@playwright/test';

test.describe('Explorer — Date Picker Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-date-picker');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 date picker demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  // ── Basic Date Picker ──
  test('basic date picker renders an input with value', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Date Picker');
    const input = demo.locator('.tx-datepicker-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('2026-03-18');
  });

  test('basic date picker has a calendar structure', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const calendar = demo.locator('.tx-datepicker-calendar');
    // Calendar is rendered in the DOM (inside the dropdown)
    expect(await calendar.count()).toBe(1);
  });

  test('basic date picker shows month and year in header', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const trigger = demo.locator('.tx-datepicker-trigger');
    await trigger.click();
    await expect(demo.locator('.tx-datepicker-title')).toContainText('2026');
  });

  // ── Date Range Picker ──
  test('range picker displays range value', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Date Range Picker');
    const input = demo.locator('.tx-datepicker-input');
    await expect(input).toHaveValue('2026-03-01 - 2026-03-15');
  });

  test('range picker has range-start and range-end markers in DOM', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    // Range markers are rendered inside the dropdown calendar
    expect(await demo.locator('.tx-datepicker-day-range-start').count()).toBeGreaterThan(0);
    expect(await demo.locator('.tx-datepicker-day-range-end').count()).toBeGreaterThan(0);
  });

  // ── Min / Max Constraints ──
  test('min/max picker renders and has disabled days', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Min / Max Constraints');
    const trigger = demo.locator('.tx-datepicker-trigger');
    await trigger.click();
    const disabled = demo.locator('.tx-datepicker-day-disabled');
    expect(await disabled.count()).toBeGreaterThan(0);
  });

  // ── Disabled Dates (weekends) ──
  test('disabled-dates picker renders and disables weekend days', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Disabled Dates (weekends)');
    const trigger = demo.locator('.tx-datepicker-trigger');
    await trigger.click();
    const disabled = demo.locator('.tx-datepicker-day-disabled');
    expect(await disabled.count()).toBeGreaterThan(0);
  });
});

test.describe('Explorer — Color Picker Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-color-picker');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 3 color picker demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  // ── Basic Color Picker ──
  test('basic color picker renders a trigger with swatch', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Color Picker');
    await expect(demo.locator('.tx-colorpicker-swatch')).toBeVisible();
    await expect(demo.locator('.tx-colorpicker-value')).toBeVisible();
  });

  test('basic color picker opens panel on click', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('.tx-colorpicker-trigger').click();
    await expect(demo.locator('.tx-colorpicker-panel')).toBeVisible();
  });

  test('basic color picker has hue slider and presets', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('.tx-colorpicker-trigger').click();
    await expect(demo.locator('.tx-colorpicker-hue')).toBeVisible();
    const presets = demo.locator('.tx-colorpicker-preset');
    expect(await presets.count()).toBeGreaterThan(0);
  });

  test('basic color picker has a text input', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('.tx-colorpicker-trigger').click();
    await expect(demo.locator('.tx-colorpicker-input')).toBeVisible();
  });

  // ── Custom Palette ──
  test('custom palette renders 9 preset buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Custom Palette');
    await demo.locator('.tx-colorpicker-trigger').click();
    const presets = demo.locator('.tx-colorpicker-preset');
    expect(await presets.count()).toBe(9);
  });

  // ── Presets Only (no text input) ──
  test('presets-only picker has no text input', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Presets Only (no text input)');
    await demo.locator('.tx-colorpicker-trigger').click();
    const input = demo.locator('.tx-colorpicker-input');
    expect(await input.count()).toBe(0);
  });

  test('presets-only picker still renders preset buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await demo.locator('.tx-colorpicker-trigger').click();
    const presets = demo.locator('.tx-colorpicker-preset');
    expect(await presets.count()).toBeGreaterThan(0);
  });
});
