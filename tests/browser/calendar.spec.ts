import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, mockAPI } from './helpers';

test.describe('Calendar Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('month view renders a table grid', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', { view: 'month', date: '2024-06-01' });
    `);
    await expect(page.locator('.tx-calendar')).toBeVisible();
    await expect(page.locator('.tx-calendar-month')).toBeVisible();
    // Should have 7 column headers for days of week
    const headers = await count(page, '.tx-calendar-month th');
    expect(headers).toBe(7);
  });

  test('day numbers are rendered in cells', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', { view: 'month', date: '2024-06-01' });
    `);
    const dayNums = await count(page, '.tx-calendar-day-num');
    expect(dayNums).toBeGreaterThan(28);
  });

  test('today is highlighted with a special class', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', { view: 'month' });
    `);
    await expect(page.locator('.tx-calendar-day-today')).toBeVisible();
  });

  test('prev/next buttons navigate months', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', { view: 'month', date: '2024-06-01' });
    `);
    await expect(page.locator('.tx-calendar-toolbar-center')).toContainText('June 2024');

    await page.locator('[data-action="next"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-calendar-toolbar-center')).toContainText('July 2024');

    await page.locator('[data-action="prev"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-calendar-toolbar-center')).toContainText('June 2024');
  });

  test('view switcher buttons change the view', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', { view: 'month', date: '2024-06-01' });
    `);
    await expect(page.locator('.tx-calendar-month')).toBeVisible();

    await page.locator('[data-view="week"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-calendar-timed')).toBeVisible();
    await expect(page.locator('.tx-calendar-month')).toHaveCount(0);
  });

  test('week view renders time slots', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', { view: 'week', date: '2024-06-10' });
    `);
    await expect(page.locator('.tx-calendar-timed')).toBeVisible();
    await expect(page.locator('.tx-calendar-timegrid')).toBeVisible();
    const timeSlots = await count(page, '.tx-calendar-time-slot-label');
    expect(timeSlots).toBe(24);
  });

  test('events render in the month view', async ({ page }) => {
    await createWidget(page, `
      Teryx.calendar('#target', {
        view: 'month',
        date: '2024-06-01',
        events: [
          { id: 'e1', title: 'Meeting', start: '2024-06-15' },
          { id: 'e2', title: 'Lunch', start: '2024-06-15' }
        ]
      });
    `);
    const events = await count(page, '.tx-calendar-event');
    expect(events).toBeGreaterThanOrEqual(2);
    await expect(page.locator('.tx-calendar-event').first()).toBeVisible();
  });

  test('addEvent adds an event and re-renders', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__cal = (window as any).Teryx.calendar('#target', {
        view: 'month',
        date: '2024-06-01',
        events: []
      });
    });
    let events = await count(page, '.tx-calendar-event');
    expect(events).toBe(0);

    await page.evaluate(() => {
      (window as any).__cal.addEvent({ id: 'new1', title: 'New Event', start: '2024-06-20' });
    });
    await page.waitForTimeout(200);

    events = await count(page, '.tx-calendar-event');
    expect(events).toBe(1);
    await expect(page.locator('.tx-calendar-event')).toHaveText('New Event');
  });
});
