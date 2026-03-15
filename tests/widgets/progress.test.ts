import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { progress } from '../../src/widgets/progress';

describe('Progress widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render bar at correct width', () => {
    progress(container, { value: 50 });

    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.style.width).toBe('50%');
  });

  it('should render bar at 0% for value 0', () => {
    progress(container, { value: 0 });

    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });

  it('should render bar at 100% for value equal to max', () => {
    progress(container, { value: 100 });

    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('should respect custom max value', () => {
    progress(container, { value: 25, max: 50 });

    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });

  it('setValue() updates width', () => {
    const p = progress(container, { value: 30 });

    p.setValue(70);
    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('70%');
  });

  it('setValue() updates aria-valuenow', () => {
    const p = progress(container, { value: 30 });

    p.setValue(70);
    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('70');
  });

  it('showValue displays percentage text', () => {
    progress(container, { value: 75, showValue: true });

    const text = container.querySelector('.tx-progress-text');
    expect(text).not.toBeNull();
    expect(text!.textContent).toBe('75%');
  });

  it('setValue() updates displayed percentage text', () => {
    const p = progress(container, { value: 30, showValue: true });

    p.setValue(60);
    const text = container.querySelector('.tx-progress-text');
    expect(text!.textContent).toBe('60%');
  });

  it('showValue not rendered when false', () => {
    progress(container, { value: 50, showValue: false });

    const text = container.querySelector('.tx-progress-text');
    expect(text).toBeNull();
  });

  it('striped class applied', () => {
    progress(container, { value: 50, striped: true });

    const progressEl = container.querySelector('.tx-progress') as HTMLElement;
    expect(progressEl.classList.contains('tx-progress-striped')).toBe(true);
  });

  it('animated class applied', () => {
    progress(container, { value: 50, animated: true });

    const progressEl = container.querySelector('.tx-progress') as HTMLElement;
    expect(progressEl.classList.contains('tx-progress-animated')).toBe(true);
  });

  it('striped and animated together', () => {
    progress(container, { value: 50, striped: true, animated: true });

    const progressEl = container.querySelector('.tx-progress') as HTMLElement;
    expect(progressEl.classList.contains('tx-progress-striped')).toBe(true);
    expect(progressEl.classList.contains('tx-progress-animated')).toBe(true);
  });

  it('should render with correct size class', () => {
    progress(container, { value: 50, size: 'sm' });

    const progressEl = container.querySelector('.tx-progress');
    expect(progressEl!.classList.contains('tx-progress-sm')).toBe(true);
  });

  it('should render label', () => {
    progress(container, { value: 50, label: 'Loading...' });

    const label = container.querySelector('.tx-progress-label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe('Loading...');
  });

  it('should clamp value to max 100%', () => {
    progress(container, { value: 150 });

    const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('destroy() clears content', () => {
    const p = progress(container, { value: 50 });
    p.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should render multi-segment progress', () => {
    progress(container, {
      value: 0,
      segments: [
        { value: 30, color: 'success' },
        { value: 20, color: 'warning' },
        { value: 10, color: 'danger' },
      ],
    });

    const bars = container.querySelectorAll('.tx-progress-bar');
    expect(bars.length).toBe(3);
    expect((bars[0] as HTMLElement).style.width).toBe('30%');
    expect((bars[1] as HTMLElement).style.width).toBe('20%');
    expect((bars[2] as HTMLElement).style.width).toBe('10%');
  });
});
