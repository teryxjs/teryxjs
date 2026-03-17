import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, texts, assertExists, assertNotExists } from './helpers';

test.describe('Steps Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  const stepItems = `[
    { title: 'Account', description: 'Create your account', content: '<p>Step 1 content</p>' },
    { title: 'Profile', description: 'Fill your profile', content: '<p>Step 2 content</p>' },
    { title: 'Review', description: 'Review your info', content: '<p>Step 3 content</p>' },
    { title: 'Done', description: 'Complete', content: '<p>Step 4 content</p>' },
  ]`;

  test('renders step indicators with numbers', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        items: ${stepItems}
      });
    `,
    );

    await expect(page.locator('.tx-steps')).toBeVisible();
    expect(await count(page, '.tx-step')).toBe(4);

    // Step numbers for non-finished, non-current steps
    const stepNumbers = await texts(page, '.tx-step-number');
    // Step 1 is "process" (current), so it has a number too
    expect(stepNumbers.length).toBeGreaterThanOrEqual(1);

    // Titles
    const titles = await texts(page, '.tx-step-title');
    expect(titles).toEqual(['Account', 'Profile', 'Review', 'Done']);
  });

  test('current step is highlighted with process status', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        current: 1,
        items: ${stepItems}
      });
    `,
    );

    // Step 0 should be "finish", step 1 "process", rest "wait"
    const steps = page.locator('.tx-step');
    await expect(steps.nth(0)).toHaveClass(/tx-step-finish/);
    await expect(steps.nth(1)).toHaveClass(/tx-step-process/);
    await expect(steps.nth(2)).toHaveClass(/tx-step-wait/);
    await expect(steps.nth(3)).toHaveClass(/tx-step-wait/);
  });

  test('next advances to the next step', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        current: 0,
        items: ${stepItems}
      });
    `,
    );

    // Initially at step 0
    let current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(0);

    // Next
    await page.evaluate(() => (window as any).__steps.next());
    await page.waitForTimeout(100);

    current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(1);

    await expect(page.locator('.tx-step').nth(0)).toHaveClass(/tx-step-finish/);
    await expect(page.locator('.tx-step').nth(1)).toHaveClass(/tx-step-process/);
  });

  test('prev goes back to the previous step', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        current: 2,
        items: ${stepItems}
      });
    `,
    );

    let current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(2);

    await page.evaluate(() => (window as any).__steps.prev());
    await page.waitForTimeout(100);

    current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(1);

    await expect(page.locator('.tx-step').nth(1)).toHaveClass(/tx-step-process/);
  });

  test('goTo jumps to a specific step', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        current: 0,
        items: ${stepItems}
      });
    `,
    );

    await page.evaluate(() => (window as any).__steps.goTo(3));
    await page.waitForTimeout(100);

    const current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(3);

    // All previous steps should be finish
    await expect(page.locator('.tx-step').nth(0)).toHaveClass(/tx-step-finish/);
    await expect(page.locator('.tx-step').nth(1)).toHaveClass(/tx-step-finish/);
    await expect(page.locator('.tx-step').nth(2)).toHaveClass(/tx-step-finish/);
    await expect(page.locator('.tx-step').nth(3)).toHaveClass(/tx-step-process/);
  });

  test('boundary: cannot go past last step or before first', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        current: 3,
        items: ${stepItems}
      });
    `,
    );

    // Try to go past last
    await page.evaluate(() => (window as any).__steps.next());
    await page.waitForTimeout(100);
    let current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(3);

    // Go to first
    await page.evaluate(() => (window as any).__steps.goTo(0));
    await page.waitForTimeout(100);

    // Try to go before first
    await page.evaluate(() => (window as any).__steps.prev());
    await page.waitForTimeout(100);
    current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(0);
  });

  test('finished steps show check icon', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        current: 2,
        items: ${stepItems}
      });
    `,
    );

    // Steps 0 and 1 are "finish" and should have check icon
    const finishedSteps = page.locator('.tx-step-finish');
    expect(await finishedSteps.count()).toBe(2);

    // Each finished step has a check icon
    for (let i = 0; i < 2; i++) {
      await expect(finishedSteps.nth(i).locator('.tx-step-icon')).toBeVisible();
    }

    // The process step has a number, not an icon
    await expect(page.locator('.tx-step-process .tx-step-number')).toBeVisible();
  });

  test('step descriptions render', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        items: ${stepItems}
      });
    `,
    );

    const descriptions = await texts(page, '.tx-step-description');
    expect(descriptions).toEqual(['Create your account', 'Fill your profile', 'Review your info', 'Complete']);
  });

  test('step content renders for current step', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        current: 0,
        items: ${stepItems}
      });
    `,
    );

    await expect(page.locator('.tx-steps-content')).toBeVisible();
    await expect(page.locator('.tx-steps-content p')).toHaveText('Step 1 content');

    // Navigate to step 2
    await page.evaluate(() => (window as any).__steps.goTo(1));
    await page.waitForTimeout(100);

    await expect(page.locator('.tx-steps-content p')).toHaveText('Step 2 content');
  });

  test('clickable steps navigate on click', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        current: 0,
        clickable: true,
        items: ${stepItems}
      });
    `,
    );

    // All steps should have clickable class
    const clickableSteps = page.locator('.tx-step-clickable');
    expect(await clickableSteps.count()).toBe(4);

    // Click on step 3 (index 2)
    await clickableSteps.nth(2).click();
    await page.waitForTimeout(100);

    const current = await page.evaluate(() => (window as any).__steps.current());
    expect(current).toBe(2);
    await expect(page.locator('.tx-step').nth(2)).toHaveClass(/tx-step-process/);
  });

  test('onChange callback fires on step change', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__changedTo = null;
      window.__steps = Teryx.steps('#target', {
        current: 0,
        items: ${stepItems},
        onChange: (step) => { window.__changedTo = step; }
      });
    `,
    );

    await page.evaluate(() => (window as any).__steps.next());
    await page.waitForTimeout(100);

    const changedTo = await page.evaluate(() => (window as any).__changedTo);
    expect(changedTo).toBe(1);

    await page.evaluate(() => (window as any).__steps.goTo(3));
    await page.waitForTimeout(100);

    const changedTo2 = await page.evaluate(() => (window as any).__changedTo);
    expect(changedTo2).toBe(3);
  });

  test('horizontal direction class is applied by default', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        items: ${stepItems}
      });
    `,
    );

    await expect(page.locator('.tx-steps')).toHaveClass(/tx-steps-horizontal/);
  });

  test('vertical direction class is applied', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        direction: 'vertical',
        items: ${stepItems}
      });
    `,
    );

    await expect(page.locator('.tx-steps')).toHaveClass(/tx-steps-vertical/);
  });

  test('connectors render between steps', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.steps('#target', {
        items: ${stepItems}
      });
    `,
    );

    // Connectors between steps: should be items.length - 1
    expect(await count(page, '.tx-step-connector')).toBe(3);
  });

  test('destroy removes all steps DOM content', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__steps = Teryx.steps('#target', {
        items: ${stepItems}
      });
    `,
    );

    await assertExists(page, '.tx-steps');

    await page.evaluate(() => (window as any).__steps.destroy());
    await page.waitForTimeout(100);

    await assertNotExists(page, '.tx-steps');
  });
});
