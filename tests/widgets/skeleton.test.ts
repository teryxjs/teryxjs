import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { skeleton } from '../../src/widgets/skeleton';

describe('Skeleton widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render default skeleton with 3 lines', () => {
    skeleton(container, {});

    const lines = container.querySelectorAll('.tx-skeleton-line');
    expect(lines.length).toBe(3);
  });

  it('should render custom number of lines', () => {
    skeleton(container, { lines: 5 });

    const lines = container.querySelectorAll('.tx-skeleton-line');
    expect(lines.length).toBe(5);
  });

  it('should render no lines when lines is 0', () => {
    skeleton(container, { lines: 0 });

    const lines = container.querySelectorAll('.tx-skeleton-line');
    expect(lines.length).toBe(0);
  });

  it('should render avatar when avatar is true', () => {
    skeleton(container, { avatar: true });

    const avatar = container.querySelector('.tx-skeleton-avatar');
    expect(avatar).not.toBeNull();
  });

  it('should not render avatar by default', () => {
    skeleton(container, {});

    const avatar = container.querySelector('.tx-skeleton-avatar');
    expect(avatar).toBeNull();
  });

  it('should render image placeholder when image is true', () => {
    skeleton(container, { image: true });

    const img = container.querySelector('.tx-skeleton-image');
    expect(img).not.toBeNull();
  });

  it('should not render image by default', () => {
    skeleton(container, {});

    const img = container.querySelector('.tx-skeleton-image');
    expect(img).toBeNull();
  });

  it('should have animated class by default', () => {
    skeleton(container, {});

    const el = container.querySelector('.tx-skeleton');
    expect(el!.classList.contains('tx-skeleton-animated')).toBe(true);
  });

  it('should not have animated class when animated is false', () => {
    skeleton(container, { animated: false });

    const el = container.querySelector('.tx-skeleton');
    expect(el!.classList.contains('tx-skeleton-animated')).toBe(false);
  });

  it('lines have varying widths', () => {
    skeleton(container, { lines: 3 });

    const lines = container.querySelectorAll('.tx-skeleton-line') as NodeListOf<HTMLElement>;
    expect(lines[0].style.width).toBe('100%');
    expect(lines[1].style.width).toBe('90%');
    expect(lines[2].style.width).toBe('75%');
  });

  it('should apply custom class', () => {
    skeleton(container, { class: 'my-skeleton' });

    const el = container.querySelector('.tx-skeleton');
    expect(el!.classList.contains('my-skeleton')).toBe(true);
  });

  it('should apply custom width', () => {
    skeleton(container, { width: '300px' });

    const el = container.querySelector('.tx-skeleton') as HTMLElement;
    expect(el.style.width).toBe('300px');
  });

  it('should apply custom height to image', () => {
    skeleton(container, { image: true, height: '200px' });

    const img = container.querySelector('.tx-skeleton-image') as HTMLElement;
    expect(img.style.height).toBe('200px');
  });

  it('should render avatar + lines together', () => {
    skeleton(container, { avatar: true, lines: 2 });

    const avatar = container.querySelector('.tx-skeleton-avatar');
    const lines = container.querySelectorAll('.tx-skeleton-line');
    expect(avatar).not.toBeNull();
    expect(lines.length).toBe(2);
  });

  it('should render image + lines together', () => {
    skeleton(container, { image: true, lines: 2 });

    const img = container.querySelector('.tx-skeleton-image');
    const lines = container.querySelectorAll('.tx-skeleton-line');
    expect(img).not.toBeNull();
    expect(lines.length).toBe(2);
  });

  it('should render avatar + image + lines together', () => {
    skeleton(container, { avatar: true, image: true, lines: 4 });

    expect(container.querySelector('.tx-skeleton-avatar')).not.toBeNull();
    expect(container.querySelector('.tx-skeleton-image')).not.toBeNull();
    expect(container.querySelectorAll('.tx-skeleton-line').length).toBe(4);
  });

  it('destroy() clears content', () => {
    const s = skeleton(container, {});
    s.destroy();
    expect(container.innerHTML).toBe('');
  });
});
