import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { steps } from '../../src/widgets/steps';

describe('Steps widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicItems = [
    { title: 'Step 1', description: 'First step' },
    { title: 'Step 2', description: 'Second step' },
    { title: 'Step 3', description: 'Third step' },
  ];

  it('should render step indicators', () => {
    steps(container, { items: basicItems });

    const stepEls = container.querySelectorAll('.tx-step');
    expect(stepEls.length).toBe(3);
  });

  it('should render step titles', () => {
    steps(container, { items: basicItems });

    const titles = container.querySelectorAll('.tx-step-title');
    expect(titles[0].textContent).toBe('Step 1');
    expect(titles[1].textContent).toBe('Step 2');
    expect(titles[2].textContent).toBe('Step 3');
  });

  it('should render step descriptions', () => {
    steps(container, { items: basicItems });

    const descs = container.querySelectorAll('.tx-step-description');
    expect(descs[0].textContent).toBe('First step');
  });

  it('next() advances to next step', () => {
    const s = steps(container, { items: basicItems });

    expect(s.current()).toBe(0);
    s.next();
    expect(s.current()).toBe(1);
    s.next();
    expect(s.current()).toBe(2);
  });

  it('next() does not go beyond last step', () => {
    const s = steps(container, { items: basicItems, current: 2 });

    s.next();
    expect(s.current()).toBe(2); // stays at last
  });

  it('prev() goes to previous step', () => {
    const s = steps(container, { items: basicItems, current: 2 });

    s.prev();
    expect(s.current()).toBe(1);
    s.prev();
    expect(s.current()).toBe(0);
  });

  it('prev() does not go below zero', () => {
    const s = steps(container, { items: basicItems, current: 0 });

    s.prev();
    expect(s.current()).toBe(0); // stays at first
  });

  it('goTo() jumps to specific step', () => {
    const s = steps(container, { items: basicItems });

    s.goTo(2);
    expect(s.current()).toBe(2);
  });

  it('goTo() does not go to invalid step', () => {
    const s = steps(container, { items: basicItems });

    s.goTo(10);
    expect(s.current()).toBe(0);

    s.goTo(-1);
    expect(s.current()).toBe(0);
  });

  it('goTo() does nothing when jumping to current step', () => {
    const onChange = vi.fn();
    const s = steps(container, { items: basicItems, current: 1, onChange });

    s.goTo(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('current() returns the current step index', () => {
    const s = steps(container, { items: basicItems, current: 1 });
    expect(s.current()).toBe(1);
  });

  it('step status classes reflect progress', () => {
    steps(container, { items: basicItems, current: 1 });

    const stepEls = container.querySelectorAll('.tx-step');
    // Step 0 should be "finish" (completed)
    expect(stepEls[0].classList.contains('tx-step-finish')).toBe(true);
    // Step 1 should be "process" (current)
    expect(stepEls[1].classList.contains('tx-step-process')).toBe(true);
    // Step 2 should be "wait"
    expect(stepEls[2].classList.contains('tx-step-wait')).toBe(true);
  });

  it('completed steps show check icon', () => {
    steps(container, { items: basicItems, current: 2 });

    const finishSteps = container.querySelectorAll('.tx-step-finish');
    expect(finishSteps.length).toBe(2);

    // Check icons contain SVG
    finishSteps.forEach((s) => {
      const icon = s.querySelector('.tx-step-icon');
      expect(icon).not.toBeNull();
      expect(icon!.innerHTML).toContain('<svg');
    });
  });

  it('waiting steps show step number', () => {
    steps(container, { items: basicItems, current: 0 });

    const waitStep = container.querySelector('.tx-step-wait');
    expect(waitStep).not.toBeNull();

    const number = waitStep!.querySelector('.tx-step-number');
    expect(number).not.toBeNull();
  });

  it('should call onChange callback', () => {
    const onChange = vi.fn();
    const s = steps(container, { items: basicItems, onChange });

    s.next();
    expect(onChange).toHaveBeenCalledWith(1);

    s.prev();
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('should render step content for current step', () => {
    const items = [
      { title: 'S1', content: '<p>Step 1 content</p>' },
      { title: 'S2', content: '<p>Step 2 content</p>' },
    ];
    steps(container, { items });

    const content = container.querySelector('.tx-steps-content');
    expect(content).not.toBeNull();
    expect(content!.innerHTML).toContain('Step 1 content');
  });

  it('should render connectors between steps', () => {
    steps(container, { items: basicItems });

    const connectors = container.querySelectorAll('.tx-step-connector');
    expect(connectors.length).toBe(2); // 3 steps = 2 connectors
  });

  it('destroy() clears content', () => {
    const s = steps(container, { items: basicItems });
    s.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should apply horizontal direction class', () => {
    steps(container, { items: basicItems, direction: 'horizontal' });

    const stepsEl = container.querySelector('.tx-steps');
    expect(stepsEl!.classList.contains('tx-steps-horizontal')).toBe(true);
  });

  it('should apply vertical direction class', () => {
    steps(container, { items: basicItems, direction: 'vertical' });

    const stepsEl = container.querySelector('.tx-steps');
    expect(stepsEl!.classList.contains('tx-steps-vertical')).toBe(true);
  });

  it('should respect custom status on items', () => {
    const items = [{ title: 'S1', status: 'error' as const }, { title: 'S2' }];
    steps(container, { items, current: 1 });

    const errorStep = container.querySelector('.tx-step-error');
    expect(errorStep).not.toBeNull();
  });
});
