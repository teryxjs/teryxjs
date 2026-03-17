import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Timeline Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders all timeline items', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.timeline('#target', {
        items: [
          { title: 'Step 1', content: 'First step', status: 'completed' },
          { title: 'Step 2', content: 'Second step', status: 'active' },
          { title: 'Step 3', content: 'Third step', status: 'pending' }
        ]
      });
    `,
    );
    const items = await count(page, '.tx-timeline-item');
    expect(items).toBe(3);
  });

  test('items have correct status classes', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.timeline('#target', {
        items: [
          { title: 'Done', status: 'completed' },
          { title: 'Current', status: 'active' },
          { title: 'Next', status: 'pending' }
        ]
      });
    `,
    );
    await expect(page.locator('.tx-timeline-completed')).toBeVisible();
    await expect(page.locator('.tx-timeline-active')).toBeVisible();
    await expect(page.locator('.tx-timeline-pending')).toBeVisible();
  });

  test('time is rendered when provided', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.timeline('#target', {
        items: [
          { title: 'Event', time: '2024-01-15 10:00', status: 'completed' }
        ]
      });
    `,
    );
    await expect(page.locator('.tx-timeline-time')).toHaveText('2024-01-15 10:00');
  });

  test('content body is rendered when provided', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.timeline('#target', {
        items: [
          { title: 'Event', content: 'Detailed description here', status: 'active' }
        ]
      });
    `,
    );
    await expect(page.locator('.tx-timeline-body')).toHaveText('Detailed description here');
  });

  test('completed items render check icons in markers', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.timeline('#target', {
        items: [
          { title: 'Done', status: 'completed' }
        ]
      });
    `,
    );
    const marker = page.locator('.tx-timeline-completed .tx-timeline-marker');
    await expect(marker).toBeVisible();
    // The marker should contain an SVG icon (check icon)
    const hasSvg = await marker.locator('svg').count();
    expect(hasSvg).toBeGreaterThanOrEqual(1);
  });
});
