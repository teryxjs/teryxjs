import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Carousel Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  const slidesConfig = `{
    slides: [
      { title: 'Slide 1', content: '<p>Content 1</p>' },
      { title: 'Slide 2', content: '<p>Content 2</p>' },
      { title: 'Slide 3', content: '<p>Content 3</p>' }
    ]
  }`;

  test('renders all slides', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.carousel('#target', ${slidesConfig});
    `,
    );
    const slides = await count(page, '.tx-carousel-slide');
    expect(slides).toBe(3);
  });

  test('renders next and prev arrow buttons', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.carousel('#target', ${slidesConfig});
    `,
    );
    await expect(page.locator('.tx-carousel-prev')).toBeVisible();
    await expect(page.locator('.tx-carousel-next')).toBeVisible();
  });

  test('renders dot indicators for each slide', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.carousel('#target', ${slidesConfig});
    `,
    );
    const indicators = await count(page, '.tx-carousel-indicator');
    expect(indicators).toBe(3);
    await expect(page.locator('.tx-carousel-indicator-active')).toHaveCount(1);
  });

  test('clicking a dot indicator changes the active slide', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.carousel('#target', ${slidesConfig});
    `,
    );
    await expect(page.locator('.tx-carousel-slide-active')).toHaveAttribute('data-index', '0');

    await page.locator('.tx-carousel-indicator[data-index="2"]').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-carousel-slide[data-index="2"]')).toHaveClass(/tx-carousel-slide-active/);
    await expect(page.locator('.tx-carousel-indicator[data-index="2"]')).toHaveClass(/tx-carousel-indicator-active/);
  });

  test('next button advances to the next slide', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.carousel('#target', ${slidesConfig});
    `,
    );
    await page.locator('.tx-carousel-next').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-carousel-slide[data-index="1"]')).toHaveClass(/tx-carousel-slide-active/);
  });

  test('prev button goes to the previous slide (with loop)', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.carousel('#target', ${slidesConfig});
    `,
    );
    // On the first slide, prev should loop to the last slide
    await page.locator('.tx-carousel-prev').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-carousel-slide[data-index="2"]')).toHaveClass(/tx-carousel-slide-active/);
  });

  test('loop wraps from last slide to first on next', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__car = (window as any).Teryx.carousel('#target', {
        slides: [
          { title: 'Slide 1', content: '<p>1</p>' },
          { title: 'Slide 2', content: '<p>2</p>' },
          { title: 'Slide 3', content: '<p>3</p>' },
        ],
      });
    });
    // Go to last slide
    await page.evaluate(() => (window as any).__car.goTo(2));
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-carousel-slide[data-index="2"]')).toHaveClass(/tx-carousel-slide-active/);

    // Next should wrap to first
    await page.evaluate(() => (window as any).__car.next());
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-carousel-slide[data-index="0"]')).toHaveClass(/tx-carousel-slide-active/);
  });
});
