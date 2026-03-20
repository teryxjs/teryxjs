import { test, expect } from '@playwright/test';

// ── DataList: static data demos ─────────────────────────────
test.describe('Explorer — DataList demos (static data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-display-datalist');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders three datalist demos', async ({ page }) => {
    expect(await page.locator('.ex-demo').count()).toBe(3);
  });

  test('basic datalist shows notification items', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const items = first.locator('.tx-datalist-item');
    expect(await items.count()).toBeGreaterThan(0);
  });

  test('grid layout datalist shows items in grid', async ({ page }) => {
    const grid = page.locator('.ex-demo').nth(1);
    const items = grid.locator('.tx-datalist-item');
    expect(await items.count()).toBeGreaterThan(0);
    await expect(grid.locator('.tx-datalist-grid').first()).toBeVisible();
  });

  test('empty state shows empty message', async ({ page }) => {
    const empty = page.locator('.ex-demo').nth(2);
    const msg = empty.locator('.tx-datalist-empty-text');
    await expect(msg).toBeVisible();
    expect(await msg.textContent()).toContain('No notifications');
  });
});

// ── Steps: all demos clickable ──────────────────────────────
test.describe('Explorer — Steps demos (all clickable)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-steps');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('all three step demos have clickable steps', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const demo = page.locator('.ex-demo').nth(i);
      const clickable = await demo.locator('.tx-step-clickable').count();
      expect(clickable).toBeGreaterThan(0);
    }
  });

  test('clicking a step in horizontal demo changes current', async ({ page }) => {
    const demo = page.locator('.ex-demo').first();
    // Initial current is 1 (second step)
    const initialProcess = await demo.locator('.tx-step-process').count();
    expect(initialProcess).toBe(1);

    // Click the third step
    await demo.locator('.tx-step-clickable').nth(2).click();
    await page.waitForTimeout(200);
    // After click, the third step should be process
    const steps = demo.locator('.tx-step');
    const thirdClass = await steps.nth(2).getAttribute('class');
    expect(thirdClass).toContain('tx-step-process');
  });
});

// ── Skeleton: transition demo ───────────────────────────────
test.describe('Explorer — Skeleton demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-skeleton');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('first demo shows skeleton then transitions to content', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    // Initially shows skeleton
    await expect(first.locator('.tx-skeleton')).toBeVisible();

    // Wait for transition (1.5s + buffer)
    await page.waitForTimeout(2000);
    // Should now show content with Reload button
    await expect(first.locator('text=Profile loaded')).toBeVisible();
    await expect(first.getByRole('button', { name: 'Reload' })).toBeVisible();
  });
});

// ── File Upload: dropzone click ─────────────────────────────
test.describe('Explorer — File Upload demos (dropzone click)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-file-upload');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('clicking dropzone area opens file dialog', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    const dropzone = demo.locator('.tx-upload-dropzone');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 3000 }),
      dropzone.click({ position: { x: 10, y: 10 } }),
    ]);
    expect(fileChooser).toBeTruthy();
  });
});

// ── DatePicker: opens on click ──────────────────────────────
test.describe('Explorer — DatePicker demos (open fix)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-date-picker');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('clicking date picker trigger opens calendar dropdown', async ({ page }) => {
    const demo = page.locator('.ex-demo').first();
    await demo.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(300);
    await expect(demo.locator('.tx-datepicker-dropdown')).toBeVisible();
    await expect(demo.locator('.tx-datepicker-calendar')).toBeVisible();
  });

  test('clicking a day sets the input value', async ({ page }) => {
    const demo = page.locator('.ex-demo').first();
    await demo.locator('.tx-datepicker-trigger').click();
    await page.waitForTimeout(200);

    await demo.locator('.tx-datepicker-day:not(.tx-datepicker-day-other):not(.tx-datepicker-day-disabled)').first().click();
    await page.waitForTimeout(200);

    const val = await demo.locator('.tx-datepicker-input').inputValue();
    expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── Rating: click works via pointer-events fix ──────────────
test.describe('Explorer — Rating demos (click fix)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-rating');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('clicking star 5 on interactive rating sets 5 active stars', async ({ page }) => {
    const demo = page.locator('.ex-demo').first();
    expect(await demo.locator('.tx-rating-star-active').count()).toBe(3);

    await demo.locator('.tx-rating-star').nth(4).click();
    await page.waitForTimeout(200);
    expect(await demo.locator('.tx-rating-star-active').count()).toBe(5);
  });
});

// ── Slider: styled and interactive ──────────────────────────
test.describe('Explorer — Slider demos (CSS + interaction)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#data-entry-slider');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('slider thumb is absolutely positioned (CSS loaded)', async ({ page }) => {
    const pos = await page.locator('.tx-slider-thumb').first().evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(pos).toBe('absolute');
  });

  test('clicking slider track updates tooltip value', async ({ page }) => {
    const demo = page.locator('.ex-demo').first();
    const track = demo.locator('.tx-slider-track');
    const box = await track.boundingBox();
    await track.click({ position: { x: box!.width * 0.75, y: box!.height / 2 } });
    await page.waitForTimeout(200);
    const val = Number(await demo.locator('.tx-slider-tooltip').textContent());
    expect(val).toBeGreaterThan(50);
  });
});

// ── Dark mode: explorer CSS variables ───────────────────────
test.describe('Explorer — Dark mode', () => {
  test('explorer sidebar background changes in dark mode', async ({ page }) => {
    await page.goto('/explorer/');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);

    const lightBg = await page.locator('.ex-sidebar').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    // Toggle dark mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(200);
    const darkBg = await page.locator('.ex-sidebar').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    expect(lightBg).not.toBe(darkBg);
  });

  test('demo containers update background in dark mode', async ({ page }) => {
    await page.goto('/explorer/#navigation-steps');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(200);
    const bg = await page.locator('.ex-demo').first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // Dark mode elevated bg is #1e293b = rgb(30, 41, 59)
    expect(bg).toBe('rgb(30, 41, 59)');
  });
});

// ── Pagination: layout stability ────────────────────────────
test.describe('Explorer — Pagination layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-pagination');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('total text has min-width to prevent layout shift', async ({ page }) => {
    const fullDemo = page.locator('.ex-demo').nth(2);
    const total = fullDemo.locator('.tx-pagination-total');
    const minWidth = await total.evaluate((el) => getComputedStyle(el).minWidth);
    expect(minWidth).not.toBe('auto');
    expect(minWidth).not.toBe('0px');
  });
});
