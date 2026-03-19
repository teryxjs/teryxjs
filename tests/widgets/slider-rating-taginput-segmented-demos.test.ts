import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { slider } from '../../src/widgets/slider';
import { rating } from '../../src/widgets/rating';
import { tagInput } from '../../src/widgets/tag-input';
import { segmented } from '../../src/widgets/segmented';

/**
 * Unit tests for the Explorer demo configurations of
 * Slider, Rating, Tag Input, and Segmented widgets.
 *
 * These mirror the exact option combos used in
 * pages/explorer/index.html to ensure every demo variant works.
 */

describe('Explorer demo — Slider variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('basic slider (value 40)', () => {
    const s = slider(container, { value: 40, min: 0, max: 100 });
    expect(s.getValue()).toBe(40);
    expect(container.querySelector('.tx-slider-track')).not.toBeNull();
    expect(container.querySelector('.tx-slider-thumb')).not.toBeNull();
  });

  it('dual thumb / range slider', () => {
    const s = slider(container, {
      range: true,
      values: [20, 80],
      min: 0,
      max: 100,
    });
    expect(s.getValue()).toEqual([20, 80]);
    const thumbs = container.querySelectorAll('.tx-slider-thumb');
    expect(thumbs.length).toBe(2);
    expect(container.querySelector('.tx-slider-range')).not.toBeNull();
  });

  it('slider with marks', () => {
    slider(container, {
      value: 50,
      min: 0,
      max: 100,
      marks: { 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' },
    });
    const marks = container.querySelectorAll('.tx-slider-mark');
    expect(marks.length).toBe(5);
    const labels = container.querySelectorAll('.tx-slider-mark-label');
    expect(labels.length).toBe(5);
    expect(labels[0].textContent).toBe('0%');
    expect(labels[4].textContent).toBe('100%');
  });

  it('vertical slider', () => {
    slider(container, { value: 60, min: 0, max: 100, vertical: true });
    expect(container.querySelector('.tx-slider-vertical')).not.toBeNull();
  });

  it('tooltip and number input slider', () => {
    slider(container, {
      value: 30,
      min: 0,
      max: 100,
      showTooltip: true,
      showInput: true,
    });
    expect(container.querySelector('.tx-slider-tooltip')).not.toBeNull();
    expect(container.querySelector('.tx-slider-tooltip')!.textContent).toBe('30');
    const input = container.querySelector('.tx-slider-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('30');
  });

  it('step slider (step 10)', () => {
    const s = slider(container, {
      value: 50,
      min: 0,
      max: 100,
      step: 10,
    });
    expect(s.getValue()).toBe(50);
    s.setValue(53);
    expect(s.getValue()).toBe(50);
    s.setValue(57);
    expect(s.getValue()).toBe(60);
  });
});

describe('Explorer demo — Rating variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('interactive rating (value 3, md)', () => {
    const r = rating(container, { value: 3, max: 5, size: 'md' });
    expect(r.getValue()).toBe(3);
    const active = container.querySelectorAll('.tx-rating-star-active');
    expect(active.length).toBe(3);
    expect(container.querySelector('.tx-rating-md')).not.toBeNull();
  });

  it('readonly rating (value 4)', () => {
    const r = rating(container, { value: 4, max: 5, readonly: true });
    expect(r.getValue()).toBe(4);
    expect(container.querySelector('.tx-rating-readonly')).not.toBeNull();

    // Clicking should not change value
    const star5 = container.querySelector('.tx-rating-star[data-value="5"]') as HTMLElement;
    star5.click();
    expect(r.getValue()).toBe(4);
  });

  it('small rating (value 2)', () => {
    const r = rating(container, { value: 2, max: 5, size: 'sm' });
    expect(r.getValue()).toBe(2);
    expect(container.querySelector('.tx-rating-sm')).not.toBeNull();
    const active = container.querySelectorAll('.tx-rating-star-active');
    expect(active.length).toBe(2);
  });

  it('large rating (value 5)', () => {
    const r = rating(container, { value: 5, max: 5, size: 'lg' });
    expect(r.getValue()).toBe(5);
    expect(container.querySelector('.tx-rating-lg')).not.toBeNull();
    const active = container.querySelectorAll('.tx-rating-star-active');
    expect(active.length).toBe(5);
  });

  it('10-star rating (value 7)', () => {
    const r = rating(container, { value: 7, max: 10 });
    expect(r.getValue()).toBe(7);
    const stars = container.querySelectorAll('.tx-rating-star');
    expect(stars.length).toBe(10);
    const active = container.querySelectorAll('.tx-rating-star-active');
    expect(active.length).toBe(7);
  });
});

describe('Explorer demo — Tag Input variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('basic tag input with initial tags', () => {
    const t = tagInput(container, {
      value: ['JavaScript', 'TypeScript'],
      placeholder: 'Add a tag...',
    });
    expect(t.getValue()).toEqual(['JavaScript', 'TypeScript']);
    const chips = container.querySelectorAll('.tx-tag-input-chip');
    expect(chips.length).toBe(2);
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    expect(input.placeholder).toBe('Add a tag...');
  });

  it('tag input with suggestions', () => {
    const t = tagInput(container, {
      placeholder: 'Type to see suggestions...',
      suggestions: ['React', 'Vue', 'Angular', 'Svelte', 'Solid'],
    });
    expect(t.getValue()).toEqual([]);
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    expect(input.placeholder).toBe('Type to see suggestions...');

    // Suggestions container should exist but be hidden
    const sugBox = container.querySelector('.tx-tag-input-suggestions') as HTMLElement;
    expect(sugBox).not.toBeNull();
  });

  it('tag input max tags (limit 3)', () => {
    const t = tagInput(container, {
      value: ['One', 'Two'],
      maxTags: 3,
      placeholder: 'Max 3 tags',
    });
    expect(t.getValue()).toEqual(['One', 'Two']);

    t.addTag('Three');
    expect(t.getValue()).toEqual(['One', 'Two', 'Three']);

    // Fourth tag should be rejected
    t.addTag('Four');
    expect(t.getValue()).toEqual(['One', 'Two', 'Three']);
  });
});

describe('Explorer demo — Segmented variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('basic segmented (Day / Week / Month)', () => {
    const s = segmented(container, {
      items: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
      ],
    });
    expect(s.getValue()).toBe('day');
    const buttons = container.querySelectorAll('.tx-segmented-item');
    expect(buttons.length).toBe(3);
    const active = container.querySelector('.tx-segmented-active');
    expect(active!.getAttribute('data-value')).toBe('day');
  });

  it('segmented with icons', () => {
    const s = segmented(container, {
      items: [
        { label: 'Home', value: 'home', icon: 'home' },
        { label: 'Settings', value: 'settings', icon: 'settings' },
        { label: 'User', value: 'user', icon: 'user' },
      ],
    });
    expect(s.getValue()).toBe('home');
    const icons = container.querySelectorAll('.tx-segmented-icon');
    expect(icons.length).toBe(3);
    icons.forEach((ic) => {
      expect(ic.innerHTML).toContain('<svg');
    });
  });

  it('segmented sizes (sm, md, lg)', () => {
    const items = [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ];

    const smWrap = document.createElement('div');
    container.appendChild(smWrap);
    segmented(smWrap, { items, size: 'sm' });
    expect(smWrap.querySelector('.tx-segmented-sm')).not.toBeNull();

    const mdWrap = document.createElement('div');
    container.appendChild(mdWrap);
    segmented(mdWrap, { items, size: 'md' });
    expect(mdWrap.querySelector('.tx-segmented-md')).not.toBeNull();

    const lgWrap = document.createElement('div');
    container.appendChild(lgWrap);
    segmented(lgWrap, { items, size: 'lg' });
    expect(lgWrap.querySelector('.tx-segmented-lg')).not.toBeNull();
  });
});
