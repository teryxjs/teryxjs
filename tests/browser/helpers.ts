import { Page, expect } from '@playwright/test';

/** Navigate to the test page and wait for Teryx to be ready. */
export async function setupPage(page: Page): Promise<void> {
  await page.goto('/test.html');
  await page.waitForFunction(() => (window as any).__ready === true);
  await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
}

/** Execute JS on the page and return result. */
export async function run<T>(page: Page, fn: string): Promise<T> {
  return page.evaluate(fn) as Promise<T>;
}

/** Create a widget via page.evaluate and wait for it. */
export async function createWidget(page: Page, code: string): Promise<void> {
  await page.evaluate(code);
  // Give xhtmlx a tick to process any xh-* attributes
  await page.waitForTimeout(100);
}

/** Mock an API endpoint to return fixed JSON data. */
export async function mockAPI(page: Page, url: string, data: unknown, status = 200): Promise<void> {
  await page.route(`**${url}*`, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

/** Count elements matching a selector. */
export async function count(page: Page, selector: string): Promise<number> {
  return page.locator(selector).count();
}

/** Get text content of all elements matching a selector. */
export async function texts(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).allTextContents();
}

/** Assert element exists. */
export async function assertExists(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector).first()).toBeVisible();
}

/** Assert element does not exist. */
export async function assertNotExists(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toHaveCount(0);
}
