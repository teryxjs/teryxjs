import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { uid, esc, cls, attr, icon, debounce, throttle, clamp, resolveTarget, createElement } from '../src/utils';

describe('utils', () => {
  // ---- uid() ----
  describe('uid()', () => {
    it('should generate unique IDs', () => {
      const id1 = uid();
      const id2 = uid();
      expect(id1).not.toBe(id2);
    });

    it('should use default "tx" prefix', () => {
      const id = uid();
      expect(id).toMatch(/^tx-\d+$/);
    });

    it('should use a custom prefix', () => {
      const id = uid('mywidget');
      expect(id).toMatch(/^mywidget-\d+$/);
    });

    it('should increment the counter', () => {
      const id1 = uid('c');
      const id2 = uid('c');
      const n1 = parseInt(id1.split('-')[1], 10);
      const n2 = parseInt(id2.split('-')[1], 10);
      expect(n2).toBe(n1 + 1);
    });
  });

  // ---- esc() ----
  describe('esc()', () => {
    it('should escape ampersands', () => {
      expect(esc('a&b')).toBe('a&amp;b');
    });

    it('should escape angle brackets', () => {
      expect(esc('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape double quotes', () => {
      expect(esc('"hello"')).toBe('&quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(esc("it's")).toBe('it&#39;s');
    });

    it('should escape all special chars in one string', () => {
      expect(esc('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
    });

    it('should return string unchanged if no special chars', () => {
      expect(esc('hello world')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(esc('')).toBe('');
    });
  });

  // ---- cls() ----
  describe('cls()', () => {
    it('should join class names', () => {
      expect(cls('a', 'b', 'c')).toBe('a b c');
    });

    it('should filter out falsy values', () => {
      expect(cls('a', false, 'b', null, undefined, 'c')).toBe('a b c');
    });

    it('should return empty string when all falsy', () => {
      expect(cls(false, null, undefined)).toBe('');
    });

    it('should handle single class', () => {
      expect(cls('only')).toBe('only');
    });

    it('should handle no arguments', () => {
      expect(cls()).toBe('');
    });

    it('should handle conditional classes with boolean expressions', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cls('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')).toBe('btn btn-active');
    });
  });

  // ---- attr() ----
  describe('attr()', () => {
    it('should build a name-value attribute string', () => {
      expect(attr('id', 'myId')).toBe(' id="myId"');
    });

    it('should return boolean attribute for true', () => {
      expect(attr('disabled', true)).toBe(' disabled');
    });

    it('should return empty string for false', () => {
      expect(attr('disabled', false)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(attr('class', undefined)).toBe('');
    });

    it('should return empty string for null', () => {
      expect(attr('class', null)).toBe('');
    });

    it('should return empty string for empty string value', () => {
      expect(attr('title', '')).toBe('');
    });

    it('should handle numeric values', () => {
      expect(attr('tabindex', 0)).toBe(' tabindex="0"');
    });

    it('should escape value content', () => {
      expect(attr('title', 'say "hi"')).toBe(' title="say &quot;hi&quot;"');
    });
  });

  // ---- icon() ----
  describe('icon()', () => {
    it('should return an SVG string for a known icon', () => {
      const svg = icon('search');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should return empty string for an unknown icon', () => {
      expect(icon('nonexistent-icon')).toBe('');
    });

    it('should resize when size parameter is provided', () => {
      const svg = icon('search', 24);
      expect(svg).toContain('width="24"');
      expect(svg).toContain('height="24"');
    });

    it('should use original size when no size parameter', () => {
      const svg = icon('search');
      expect(svg).toContain('width="16"');
      expect(svg).toContain('height="16"');
    });

    it('should return SVG for multiple known icons', () => {
      const knownIcons = ['x', 'check', 'chevronDown', 'info', 'warning', 'star', 'starFilled'];
      for (const name of knownIcons) {
        expect(icon(name)).toContain('<svg');
      }
    });
  });

  // ---- debounce() ----
  describe('debounce()', () => {
    it('should delay execution', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('should reset the timer on subsequent calls', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('should pass arguments to the debounced function', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced('a', 'b');
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledWith('a', 'b');
      vi.useRealTimers();
    });
  });

  // ---- throttle() ----
  describe('throttle()', () => {
    it('should call immediately the first time', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should suppress calls within the throttle window', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      throttled();
      expect(fn).toHaveBeenCalledTimes(1); // still suppressed

      vi.advanceTimersByTime(50);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2); // enough time passed
      vi.useRealTimers();
    });

    it('should pass arguments through', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 0);
      throttled('x', 'y');
      expect(fn).toHaveBeenCalledWith('x', 'y');
    });
  });

  // ---- clamp() ----
  describe('clamp()', () => {
    it('should return value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should clamp to min when value is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should clamp to max when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle equal min and max', () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });

    it('should handle value equal to min', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it('should handle value equal to max', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should handle negative ranges', () => {
      expect(clamp(-3, -10, -1)).toBe(-3);
    });
  });

  // ---- resolveTarget() ----
  describe('resolveTarget()', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'resolve-test';
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it('should resolve a CSS selector to an element', () => {
      const el = resolveTarget('#resolve-test');
      expect(el).toBe(container);
    });

    it('should return the element directly if an HTMLElement is passed', () => {
      const el = resolveTarget(container);
      expect(el).toBe(container);
    });

    it('should throw if selector does not match any element', () => {
      expect(() => resolveTarget('#nonexistent-id-xyz')).toThrow('not found');
    });

    it('should resolve class selectors', () => {
      container.className = 'resolve-cls-test';
      const el = resolveTarget('.resolve-cls-test');
      expect(el).toBe(container);
    });
  });

  // ---- createElement() ----
  describe('createElement()', () => {
    it('should parse an HTML string into an element', () => {
      const el = createElement('<div class="test">Hello</div>');
      expect(el.tagName).toBe('DIV');
      expect(el.className).toBe('test');
      expect(el.textContent).toBe('Hello');
    });

    it('should handle elements with children', () => {
      const el = createElement('<ul><li>A</li><li>B</li></ul>');
      expect(el.tagName).toBe('UL');
      expect(el.children.length).toBe(2);
    });

    it('should trim whitespace', () => {
      const el = createElement('   <span>trimmed</span>   ');
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('trimmed');
    });

    it('should handle self-closing elements', () => {
      const el = createElement('<input type="text">');
      expect(el.tagName).toBe('INPUT');
      expect((el as HTMLInputElement).type).toBe('text');
    });

    it('should handle elements with attributes', () => {
      const el = createElement('<a href="/test" class="link">Link</a>');
      expect(el.tagName).toBe('A');
      expect((el as HTMLAnchorElement).getAttribute('href')).toBe('/test');
      expect(el.className).toBe('link');
    });
  });
});
