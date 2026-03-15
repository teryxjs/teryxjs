import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rating } from '../../src/widgets/rating';

describe('Rating widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render correct number of stars (default 5)', () => {
    rating(container, {});

    const stars = container.querySelectorAll('.tx-rating-star');
    expect(stars.length).toBe(5);
  });

  it('should render custom number of stars', () => {
    rating(container, { max: 10 });

    const stars = container.querySelectorAll('.tx-rating-star');
    expect(stars.length).toBe(10);
  });

  it('should render initial value with active stars', () => {
    rating(container, { value: 3 });

    const activeStars = container.querySelectorAll('.tx-rating-star-active');
    expect(activeStars.length).toBe(3);
  });

  it('click sets value', () => {
    const r = rating(container, {});

    const star3 = container.querySelector('.tx-rating-star[data-value="3"]') as HTMLElement;
    star3.click();

    expect(r.getValue()).toBe(3);
  });

  it('clicking same star toggles off', () => {
    const r = rating(container, { value: 3 });

    // Click on star 3 again to toggle off
    const star3 = container.querySelector('.tx-rating-star[data-value="3"]') as HTMLElement;
    star3.click();

    expect(r.getValue()).toBe(0);
  });

  it('getValue() returns current value', () => {
    const r = rating(container, { value: 4 });
    expect(r.getValue()).toBe(4);
  });

  it('setValue() updates stars', () => {
    const r = rating(container, {});

    r.setValue(4);
    expect(r.getValue()).toBe(4);

    const activeStars = container.querySelectorAll('.tx-rating-star-active');
    expect(activeStars.length).toBe(4);
  });

  it('setValue() clamps to max', () => {
    const r = rating(container, { max: 5 });

    r.setValue(10);
    expect(r.getValue()).toBe(5);
  });

  it('setValue() clamps to 0 (min)', () => {
    const r = rating(container, { max: 5 });

    r.setValue(-1);
    expect(r.getValue()).toBe(0);
  });

  it('readonly mode prevents clicks', () => {
    const r = rating(container, { value: 3, readonly: true });

    const star5 = container.querySelector('.tx-rating-star[data-value="5"]') as HTMLElement;
    star5.click();

    // Value should not change
    expect(r.getValue()).toBe(3);
  });

  it('readonly class is applied', () => {
    rating(container, { readonly: true });

    const ratingEl = container.querySelector('.tx-rating');
    expect(ratingEl!.classList.contains('tx-rating-readonly')).toBe(true);
  });

  it('should call onChange callback when value changes', () => {
    const onChange = vi.fn();
    rating(container, { onChange });

    const star2 = container.querySelector('.tx-rating-star[data-value="2"]') as HTMLElement;
    star2.click();

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('should apply size class', () => {
    rating(container, { size: 'lg' });

    const ratingEl = container.querySelector('.tx-rating');
    expect(ratingEl!.classList.contains('tx-rating-lg')).toBe(true);
  });

  it('destroy() clears content', () => {
    const r = rating(container, {});
    r.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('each star has correct data-value attribute', () => {
    rating(container, { max: 5 });

    const stars = container.querySelectorAll('.tx-rating-star');
    stars.forEach((star, i) => {
      expect(star.getAttribute('data-value')).toBe(String(i + 1));
    });
  });

  it('stars contain SVG content', () => {
    rating(container, { value: 2 });

    const stars = container.querySelectorAll('.tx-rating-star');
    stars.forEach(star => {
      expect(star.innerHTML).toContain('<svg');
    });
  });
});
