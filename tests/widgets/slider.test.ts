import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { slider } from '../../src/widgets/slider';

describe('Slider widget', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('renders a slider track and thumb', () => {
    slider(container, {});
    expect(container.querySelector('.tx-slider-track')).not.toBeNull();
    expect(container.querySelector('.tx-slider-thumb')).not.toBeNull();
  });

  it('renders with default value (min)', () => {
    const s = slider(container, { min: 0, max: 100 });
    expect(s.getValue()).toBe(0);
  });

  it('renders with initial value', () => {
    const s = slider(container, { value: 50, min: 0, max: 100 });
    expect(s.getValue()).toBe(50);
  });

  it('getValue returns current value', () => {
    const s = slider(container, { value: 42 });
    expect(s.getValue()).toBe(42);
  });

  it('setValue updates value', () => {
    const s = slider(container, { min: 0, max: 100 });
    s.setValue(75);
    expect(s.getValue()).toBe(75);
  });

  it('setValue clamps to min/max', () => {
    const s = slider(container, { min: 10, max: 50 });
    s.setValue(0);
    expect(s.getValue()).toBe(10);
    s.setValue(100);
    expect(s.getValue()).toBe(50);
  });

  it('setValue snaps to step', () => {
    const s = slider(container, { min: 0, max: 100, step: 10 });
    s.setValue(23);
    expect(s.getValue()).toBe(20);
    s.setValue(27);
    expect(s.getValue()).toBe(30);
  });

  it('renders fill element', () => {
    slider(container, { value: 50 });
    const fill = container.querySelector('.tx-slider-fill') as HTMLElement;
    expect(fill).not.toBeNull();
  });

  it('shows tooltip on thumb', () => {
    slider(container, { value: 50, showTooltip: true });
    const tooltip = container.querySelector('.tx-slider-tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toBe('50');
  });

  it('hides tooltip when showTooltip is false', () => {
    slider(container, { value: 50, showTooltip: false });
    expect(container.querySelector('.tx-slider-tooltip')).toBeNull();
  });

  it('range mode renders two thumbs', () => {
    slider(container, { range: true, values: [20, 80] });
    const thumbs = container.querySelectorAll('.tx-slider-thumb');
    expect(thumbs.length).toBe(2);
  });

  it('range mode getValue returns tuple', () => {
    const s = slider(container, { range: true, values: [20, 80] });
    const val = s.getValue() as [number, number];
    expect(val).toEqual([20, 80]);
  });

  it('range mode setValue updates both thumbs', () => {
    const s = slider(container, { range: true, values: [20, 80] });
    s.setValue([30, 70]);
    expect(s.getValue()).toEqual([30, 70]);
  });

  it('renders marks', () => {
    slider(container, { marks: { 0: '0%', 50: '50%', 100: '100%' } });
    const marks = container.querySelectorAll('.tx-slider-mark');
    expect(marks.length).toBe(3);
  });

  it('renders mark labels', () => {
    slider(container, { marks: { 0: 'Low', 100: 'High' } });
    const labels = container.querySelectorAll('.tx-slider-mark-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toBe('Low');
    expect(labels[1].textContent).toBe('High');
  });

  it('showInput renders number input', () => {
    slider(container, { showInput: true, value: 50 });
    const input = container.querySelector('.tx-slider-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('50');
  });

  it('showInput in range mode renders two inputs', () => {
    slider(container, { range: true, showInput: true, values: [20, 80] });
    const inputs = container.querySelectorAll('.tx-slider-input');
    expect(inputs.length).toBe(2);
  });

  it('vertical mode adds vertical class', () => {
    slider(container, { vertical: true });
    expect(container.querySelector('.tx-slider-vertical')).not.toBeNull();
  });

  it('applies custom class', () => {
    slider(container, { class: 'my-slider' });
    expect(container.querySelector('.tx-slider')?.classList.contains('my-slider')).toBe(true);
  });

  it('destroy clears content', () => {
    const s = slider(container, {});
    s.destroy();
    expect(container.innerHTML).toBe('');
  });
});
