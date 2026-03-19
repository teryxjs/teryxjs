import { test, expect } from '@playwright/test';

test.describe('Explorer — Calendar demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#specialized-calendar');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all five calendar demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('month view demo renders calendar with month table', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.ex-demo-header h3')).toHaveText('Month View');
    await expect(first.locator('.tx-calendar')).toBeVisible();
    await expect(first.locator('.tx-calendar-month')).toBeVisible();
  });

  test('month view shows day numbers', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const dayNums = first.locator('.tx-calendar-day-num');
    expect(await dayNums.count()).toBeGreaterThan(20);
  });

  test('week view demo renders 7 day columns', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    await expect(second.locator('.ex-demo-header h3')).toHaveText('Week View');
    const cols = second.locator('.tx-calendar-day-col');
    expect(await cols.count()).toBe(7);
  });

  test('week view renders time grid', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    await expect(second.locator('.tx-calendar-timegrid')).toBeVisible();
  });

  test('day view demo renders single day column', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    await expect(third.locator('.ex-demo-header h3')).toHaveText('Day View');
    const cols = third.locator('.tx-calendar-day-col');
    expect(await cols.count()).toBe(1);
  });

  test('toolbar contains prev, next, and today buttons', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('[data-action="prev"]')).toBeVisible();
    await expect(first.locator('[data-action="next"]')).toBeVisible();
    await expect(first.locator('[data-action="today"]')).toBeVisible();
  });

  test('toolbar contains view switcher buttons', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('[data-view="month"]')).toBeVisible();
    await expect(first.locator('[data-view="week"]')).toBeVisible();
    await expect(first.locator('[data-view="day"]')).toBeVisible();
  });

  test('clicking next advances the month', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    const titleBefore = await first.locator('.tx-calendar-toolbar-center').textContent();
    await first.locator('[data-action="next"]').click();
    await page.waitForTimeout(100);
    const titleAfter = await first.locator('.tx-calendar-toolbar-center').textContent();
    expect(titleAfter).not.toBe(titleBefore);
  });

  test('events & navigation demo has log box and action buttons', async ({ page }) => {
    const fourth = page.locator('.ex-demo').nth(3);
    await expect(fourth.locator('.ex-demo-header h3')).toHaveText('Events & Navigation');
    // Action buttons
    const prevBtn = fourth.locator('.tx-btn', { hasText: 'Prev' });
    const todayBtn = fourth.locator('.tx-btn', { hasText: 'Today' });
    const nextBtn = fourth.locator('.tx-btn', { hasText: 'Next' });
    await expect(prevBtn).toBeVisible();
    await expect(todayBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();
  });

  test('remote events source demo renders a calendar', async ({ page }) => {
    const fifth = page.locator('.ex-demo').nth(4);
    await expect(fifth.locator('.ex-demo-header h3')).toHaveText('Remote Events Source');
    await expect(fifth.locator('.tx-calendar')).toBeVisible();
  });
});

test.describe('Explorer — Timeline demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#specialized-timeline');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all four timeline demos', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('basic timeline demo renders items', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.ex-demo-header h3')).toHaveText('Basic Timeline');
    const items = first.locator('.tx-timeline-item');
    expect(await items.count()).toBe(4);
  });

  test('basic timeline shows titles', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-timeline-title').first()).toHaveText('v0.1.0');
  });

  test('basic timeline shows time labels', async ({ page }) => {
    const first = page.locator('.ex-demo').first();
    await expect(first.locator('.tx-timeline-time').first()).toHaveText('Jan 2026');
  });

  test('alternating timeline has alternate class', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    await expect(second.locator('.ex-demo-header h3')).toHaveText('Alternating Timeline');
    await expect(second.locator('.tx-timeline-alternate')).toBeVisible();
  });

  test('alternating timeline renders items', async ({ page }) => {
    const second = page.locator('.ex-demo').nth(1);
    const items = second.locator('.tx-timeline-item');
    expect(await items.count()).toBe(5);
  });

  test('colored timeline renders four items with colors', async ({ page }) => {
    const third = page.locator('.ex-demo').nth(2);
    await expect(third.locator('.ex-demo-header h3')).toHaveText('Colored Timeline');
    const items = third.locator('.tx-timeline-item');
    expect(await items.count()).toBe(4);
  });

  test('timeline with icons renders SVG icons in markers', async ({ page }) => {
    const fourth = page.locator('.ex-demo').nth(3);
    await expect(fourth.locator('.ex-demo-header h3')).toHaveText('Timeline with Icons');
    const svgs = fourth.locator('.tx-timeline-marker svg');
    expect(await svgs.count()).toBeGreaterThanOrEqual(3);
  });

  test('timeline with icons renders all items', async ({ page }) => {
    const fourth = page.locator('.ex-demo').nth(3);
    const items = fourth.locator('.tx-timeline-item');
    expect(await items.count()).toBe(4);
  });
});
