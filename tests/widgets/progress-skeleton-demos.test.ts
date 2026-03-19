import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { progress } from '../../src/widgets/progress';
import { skeleton } from '../../src/widgets/skeleton';

// ── Progress demos — unit tests ──
describe('Progress demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Basic Progress Bars ──
  describe('Basic Progress Bars', () => {
    it('renders a progress bar with correct percentage', () => {
      progress(container, { value: 65, showValue: true });
      const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
      expect(bar).not.toBeNull();
      expect(bar.style.width).toBe('65%');
    });

    it('renders multiple progress bars at different values', () => {
      [25, 50, 75, 100].forEach((v) => {
        const row = document.createElement('div');
        container.appendChild(row);
        progress(row, { value: v, label: v + '%', showValue: true });
      });
      const bars = container.querySelectorAll('.tx-progress-bar');
      expect(bars.length).toBe(4);
    });

    it('shows percentage text when showValue is true', () => {
      progress(container, { value: 40, showValue: true });
      const text = container.querySelector('.tx-progress-text');
      expect(text).not.toBeNull();
      expect(text!.textContent).toBe('40%');
    });

    it('renders label when label is provided', () => {
      progress(container, { value: 50, label: 'Loading' });
      const label = container.querySelector('.tx-progress-label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toBe('Loading');
    });
  });

  // ── Sizes ──
  describe('Progress Sizes', () => {
    it('renders sm progress', () => {
      progress(container, { value: 60, size: 'sm' });
      expect(container.querySelector('.tx-progress-sm')).not.toBeNull();
    });

    it('renders md progress', () => {
      progress(container, { value: 60, size: 'md' });
      expect(container.querySelector('.tx-progress-md')).not.toBeNull();
    });

    it('renders lg progress', () => {
      progress(container, { value: 60, size: 'lg' });
      expect(container.querySelector('.tx-progress-lg')).not.toBeNull();
    });
  });

  // ── Colors ──
  describe('Progress Colors', () => {
    it('renders primary color', () => {
      progress(container, { value: 60, color: 'primary' });
      expect(container.querySelector('.tx-progress-primary')).not.toBeNull();
    });

    it('renders success color', () => {
      progress(container, { value: 60, color: 'success' });
      expect(container.querySelector('.tx-progress-success')).not.toBeNull();
    });

    it('renders warning color', () => {
      progress(container, { value: 60, color: 'warning' });
      expect(container.querySelector('.tx-progress-warning')).not.toBeNull();
    });

    it('renders danger color', () => {
      progress(container, { value: 60, color: 'danger' });
      expect(container.querySelector('.tx-progress-danger')).not.toBeNull();
    });
  });

  // ── Striped & Animated ──
  describe('Striped & Animated', () => {
    it('renders striped progress', () => {
      progress(container, { value: 70, striped: true });
      expect(container.querySelector('.tx-progress-striped')).not.toBeNull();
    });

    it('renders animated progress', () => {
      progress(container, { value: 70, striped: true, animated: true });
      expect(container.querySelector('.tx-progress-animated')).not.toBeNull();
    });
  });

  // ── Multi-Segment ──
  describe('Multi-Segment Progress', () => {
    it('renders multiple segments', () => {
      progress(container, {
        value: 0,
        max: 100,
        showValue: true,
        segments: [
          { value: 30, color: 'success', label: 'Done' },
          { value: 20, color: 'warning', label: 'In Progress' },
          { value: 10, color: 'danger', label: 'Blocked' },
        ],
      });
      const bars = container.querySelectorAll('.tx-progress-bar');
      expect(bars.length).toBe(3);
    });

    it('each segment has correct width', () => {
      progress(container, {
        value: 0,
        max: 100,
        segments: [
          { value: 40, color: 'success' },
          { value: 30, color: 'warning' },
        ],
      });
      const bars = container.querySelectorAll('.tx-progress-bar') as NodeListOf<HTMLElement>;
      expect(bars[0].style.width).toBe('40%');
      expect(bars[1].style.width).toBe('30%');
    });
  });

  // ── Dynamic Progress (setValue) ──
  describe('Dynamic Progress (setValue)', () => {
    it('updates bar width via setValue', () => {
      const inst = progress(container, { value: 0, showValue: true });
      inst.setValue(50);
      const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
      expect(bar.style.width).toBe('50%');
    });

    it('updates text via setValue', () => {
      const inst = progress(container, { value: 0, showValue: true });
      inst.setValue(75);
      const text = container.querySelector('.tx-progress-text');
      expect(text!.textContent).toBe('75%');
    });

    it('clamps value at 100%', () => {
      const inst = progress(container, { value: 0, showValue: true });
      inst.setValue(200);
      const bar = container.querySelector('.tx-progress-bar') as HTMLElement;
      expect(bar.style.width).toBe('100%');
    });
  });
});

// ── Skeleton demos — unit tests ──
describe('Skeleton demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Text Skeleton ──
  describe('Text Skeleton', () => {
    it('renders 3 skeleton lines by default', () => {
      skeleton(container, {});
      const lines = container.querySelectorAll('.tx-skeleton-line');
      expect(lines.length).toBe(3);
    });

    it('renders specified number of lines', () => {
      skeleton(container, { lines: 5 });
      const lines = container.querySelectorAll('.tx-skeleton-line');
      expect(lines.length).toBe(5);
    });
  });

  // ── Card Skeleton (avatar + lines) ──
  describe('Card Skeleton', () => {
    it('renders avatar placeholder when avatar is true', () => {
      skeleton(container, { avatar: true, lines: 4 });
      expect(container.querySelector('.tx-skeleton-avatar')).not.toBeNull();
    });

    it('renders 4 lines with avatar', () => {
      skeleton(container, { avatar: true, lines: 4 });
      const lines = container.querySelectorAll('.tx-skeleton-line');
      expect(lines.length).toBe(4);
    });
  });

  // ── Image Skeleton ──
  describe('Image Skeleton', () => {
    it('renders image placeholder when image is true', () => {
      skeleton(container, { image: true, lines: 2, height: '120px' });
      expect(container.querySelector('.tx-skeleton-image')).not.toBeNull();
    });

    it('sets custom height on image placeholder', () => {
      skeleton(container, { image: true, lines: 2, height: '120px' });
      const img = container.querySelector('.tx-skeleton-image') as HTMLElement;
      expect(img.style.height).toBe('120px');
    });

    it('renders 2 lines alongside image', () => {
      skeleton(container, { image: true, lines: 2 });
      const lines = container.querySelectorAll('.tx-skeleton-line');
      expect(lines.length).toBe(2);
    });
  });

  // ── Skeleton Grid ──
  describe('Skeleton Grid', () => {
    it('renders multiple skeleton cards in a grid', () => {
      for (let i = 0; i < 3; i++) {
        const col = document.createElement('div');
        container.appendChild(col);
        skeleton(col, { avatar: true, lines: 2 });
      }
      const skeletons = container.querySelectorAll('.tx-skeleton');
      expect(skeletons.length).toBe(3);
    });
  });

  // ── Custom Width ──
  describe('Custom Width Skeleton', () => {
    it('applies custom width', () => {
      skeleton(container, { lines: 2, width: '50%' });
      const el = container.querySelector('.tx-skeleton') as HTMLElement;
      expect(el.style.width).toBe('50%');
    });
  });

  // ── Static Skeleton (no animation) ──
  describe('Static Skeleton (no animation)', () => {
    it('omits animated class when animated is false', () => {
      skeleton(container, { lines: 3, animated: false });
      expect(container.querySelector('.tx-skeleton-animated')).toBeNull();
    });

    it('includes animated class by default', () => {
      skeleton(container, { lines: 3 });
      expect(container.querySelector('.tx-skeleton-animated')).not.toBeNull();
    });
  });

  // ── Destroy ──
  describe('Skeleton destroy', () => {
    it('removes content on destroy', () => {
      const inst = skeleton(container, { lines: 3 });
      expect(container.querySelector('.tx-skeleton')).not.toBeNull();
      inst.destroy();
      expect(container.querySelector('.tx-skeleton')).toBeNull();
    });
  });
});
