import { test, expect } from '@playwright/test';

test.describe('Explorer — Form Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-form');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 6 form demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(6);
  });

  // ── Basic Form ──
  test('basic form renders 4 input fields', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Form');

    const inputs = demo.locator('input');
    expect(await inputs.count()).toBe(4);
  });

  test('basic form has submit and cancel buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const buttons = demo.locator('button');
    expect(await buttons.count()).toBe(2);
    await expect(buttons.nth(0)).toHaveText('Register');
    await expect(buttons.nth(1)).toHaveText('Reset');
  });

  test('basic form has correct input types', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('input[type="text"]')).toBeVisible();
    await expect(demo.locator('input[type="email"]')).toBeVisible();
    await expect(demo.locator('input[type="password"]')).toBeVisible();
    await expect(demo.locator('input[type="number"]')).toBeVisible();
  });

  // ── Select, Checkbox, Radio, Switch ──
  test('select/checkbox/radio/switch demo renders a select element', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Select, Checkbox, Radio & Switch');

    const select = demo.locator('select');
    expect(await select.count()).toBe(1);
  });

  test('select/checkbox/radio/switch demo has checkbox', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('input[type="checkbox"]').first()).toBeVisible();
  });

  test('select/checkbox/radio/switch demo has 3 radio buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    const radios = demo.locator('input[type="radio"]');
    expect(await radios.count()).toBe(3);
  });

  test('select/checkbox/radio/switch demo has switch', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.tx-switch-track')).toBeVisible();
  });

  // ── Form Validation ──
  test('validation demo renders required fields', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Form Validation');

    const required = demo.locator('.tx-form-required');
    expect(await required.count()).toBeGreaterThanOrEqual(2);
  });

  test('validation demo has textarea with rows', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    const textarea = demo.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('rows', '3');
  });

  test('validation demo shows help text', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    const help = demo.locator('.tx-form-help');
    expect(await help.count()).toBeGreaterThanOrEqual(1);
    await expect(help.first()).toHaveText('Max 200 characters');
  });

  // ── Layout modes ──
  test('vertical layout demo renders with vertical class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Vertical Layout (default)');

    await expect(demo.locator('.tx-form-vertical')).toBeVisible();
  });

  test('horizontal layout demo renders with horizontal class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Horizontal Layout');

    await expect(demo.locator('.tx-form-horizontal')).toBeVisible();
  });

  test('inline layout demo renders with inline class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Inline Layout');

    await expect(demo.locator('.tx-form-inline')).toBeVisible();
  });

  test('inline layout demo has select and text input', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('select')).toBeVisible();
    await expect(demo.locator('input[type="text"]')).toBeVisible();
  });
});
