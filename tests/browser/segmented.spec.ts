import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Segmented Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders all segment items', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.segmented('#target', {
        items: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' }
        ]
      });
    `,
    );
    const items = await count(page, '.tx-segmented-item');
    expect(items).toBe(3);
    await expect(page.locator('.tx-segmented-label').nth(0)).toHaveText('Day');
    await expect(page.locator('.tx-segmented-label').nth(1)).toHaveText('Week');
    await expect(page.locator('.tx-segmented-label').nth(2)).toHaveText('Month');
  });

  test('clicking an item switches the active selection', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__seg = (window as any).Teryx.segmented('#target', {
        value: 'day',
        items: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ],
      });
    });
    await expect(page.locator('.tx-segmented-active .tx-segmented-label')).toHaveText('Day');

    await page.locator('.tx-segmented-item[data-value="week"]').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-segmented-active .tx-segmented-label')).toHaveText('Week');
    const val = await page.evaluate(() => (window as any).__seg.getValue());
    expect(val).toBe('week');
  });

  test('getValue returns the current selection', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__seg = (window as any).Teryx.segmented('#target', {
        value: 'month',
        items: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ],
      });
    });
    const val = await page.evaluate(() => (window as any).__seg.getValue());
    expect(val).toBe('month');
  });

  test('setValue programmatically changes the selection', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__seg = (window as any).Teryx.segmented('#target', {
        value: 'day',
        items: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ],
      });
    });
    await page.evaluate(() => (window as any).__seg.setValue('month'));
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-segmented-active .tx-segmented-label')).toHaveText('Month');
  });

  test('disabled item cannot be selected', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__seg = (window as any).Teryx.segmented('#target', {
        value: 'day',
        items: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week', disabled: true },
          { label: 'Month', value: 'month' },
        ],
      });
    });
    const disabledBtn = page.locator('.tx-segmented-item[data-value="week"]');
    await expect(disabledBtn).toBeDisabled();

    await disabledBtn.click({ force: true });
    await page.waitForTimeout(200);

    const val = await page.evaluate(() => (window as any).__seg.getValue());
    expect(val).toBe('day');
  });

  test('block option applies block class', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.segmented('#target', {
        block: true,
        items: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' }
        ]
      });
    `,
    );
    await expect(page.locator('.tx-segmented-block')).toBeVisible();
  });
});
