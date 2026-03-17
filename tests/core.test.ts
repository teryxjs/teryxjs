import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configure, config, registerWidget, initWidgets, on, off, emit } from '../src/core';

describe('core', () => {
  // ---- configure() ----
  describe('configure()', () => {
    const originalPrefix = config.prefix;
    const originalAutoInit = config.autoInit;
    const originalDebug = config.debug;
    const originalToastDuration = config.toastDuration;
    const originalToastPosition = config.toastPosition;

    afterEach(() => {
      // Restore defaults
      configure({
        prefix: originalPrefix,
        autoInit: originalAutoInit,
        debug: originalDebug,
        toastDuration: originalToastDuration,
        toastPosition: originalToastPosition,
      });
    });

    it('should have default config values', () => {
      expect(config.prefix).toBe('tx');
      expect(config.autoInit).toBe(true);
      expect(config.debug).toBe(false);
      expect(config.toastDuration).toBe(5000);
      expect(config.toastPosition).toBe('top-right');
    });

    it('should merge partial config', () => {
      configure({ prefix: 'my', debug: true });
      expect(config.prefix).toBe('my');
      expect(config.debug).toBe(true);
      // unchanged values stay
      expect(config.toastDuration).toBe(5000);
    });

    it('should overwrite a single key', () => {
      configure({ toastDuration: 3000 });
      expect(config.toastDuration).toBe(3000);
    });

    it('should overwrite toast position', () => {
      configure({ toastPosition: 'bottom-center' });
      expect(config.toastPosition).toBe('bottom-center');
    });
  });

  // ---- registerWidget() / initWidgets() ----
  describe('registerWidget() & initWidgets()', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it('should discover and initialize a declarative widget', () => {
      const factory = vi.fn((_el: HTMLElement, _opts: Record<string, unknown>) => ({}));
      registerWidget('test-widget', factory);

      container.innerHTML = '<div data-tx-widget="test-widget"></div>';
      initWidgets(container);

      expect(factory).toHaveBeenCalledTimes(1);
      const el = container.querySelector('[data-tx-widget]') as HTMLElement;
      expect(el.hasAttribute('data-tx-initialized')).toBe(true);
    });

    it('should not reinitialize already-initialized widgets', () => {
      const factory = vi.fn(() => ({}));
      registerWidget('no-repeat', factory);

      container.innerHTML = '<div data-tx-widget="no-repeat"></div>';
      initWidgets(container);
      initWidgets(container);

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should parse data-tx-* attributes into options', () => {
      const factory = vi.fn((_el: HTMLElement, opts: Record<string, unknown>) => opts);
      registerWidget('opts-widget', factory);

      container.innerHTML =
        '<div data-tx-widget="opts-widget" data-tx-name="hello" data-tx-count="42" data-tx-active="true"></div>';
      initWidgets(container);

      expect(factory).toHaveBeenCalledTimes(1);
      const opts = factory.mock.calls[0][1];
      expect(opts.name).toBe('hello');
      expect(opts.count).toBe(42);
      expect(opts.active).toBe(true);
    });

    it('should camelCase hyphenated data attributes', () => {
      const factory = vi.fn((_el: HTMLElement, opts: Record<string, unknown>) => opts);
      registerWidget('camel-widget', factory);

      container.innerHTML = '<div data-tx-widget="camel-widget" data-tx-page-size="10"></div>';
      initWidgets(container);

      const opts = factory.mock.calls[0][1];
      expect(opts.pageSize).toBe(10);
    });

    it('should skip unknown widget names and not throw', () => {
      container.innerHTML = '<div data-tx-widget="nonexistent"></div>';
      expect(() => initWidgets(container)).not.toThrow();
      const el = container.querySelector('[data-tx-widget]') as HTMLElement;
      expect(el.hasAttribute('data-tx-initialized')).toBe(false);
    });

    it('should initialize multiple widgets in one pass', () => {
      const factoryA = vi.fn(() => ({}));
      const factoryB = vi.fn(() => ({}));
      registerWidget('multi-a', factoryA);
      registerWidget('multi-b', factoryB);

      container.innerHTML = '<div data-tx-widget="multi-a"></div><div data-tx-widget="multi-b"></div>';
      initWidgets(container);

      expect(factoryA).toHaveBeenCalledTimes(1);
      expect(factoryB).toHaveBeenCalledTimes(1);
    });
  });

  // ---- Event bus ----
  describe('Event bus: on(), off(), emit()', () => {
    it('should call a handler when event is emitted', () => {
      const handler = vi.fn();
      on('test:event', handler);
      emit('test:event', 'arg1', 42);
      expect(handler).toHaveBeenCalledWith('arg1', 42);
      off('test:event', handler);
    });

    it('should not call a handler after off()', () => {
      const handler = vi.fn();
      on('test:off', handler);
      off('test:off', handler);
      emit('test:off');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for the same event', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      on('test:multi', h1);
      on('test:multi', h2);
      emit('test:multi', 'data');
      expect(h1).toHaveBeenCalledWith('data');
      expect(h2).toHaveBeenCalledWith('data');
      off('test:multi', h1);
      off('test:multi', h2);
    });

    it('should not throw when emitting an event with no handlers', () => {
      expect(() => emit('no-handlers')).not.toThrow();
    });

    it('should not throw when off-ing a handler that was never registered', () => {
      expect(() => off('unregistered', () => {})).not.toThrow();
    });

    it('should continue calling other handlers if one throws', () => {
      const bad = vi.fn(() => {
        throw new Error('oops');
      });
      const good = vi.fn();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      on('test:throw', bad);
      on('test:throw', good);
      emit('test:throw');

      expect(bad).toHaveBeenCalled();
      expect(good).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();

      off('test:throw', bad);
      off('test:throw', good);
      consoleError.mockRestore();
    });

    it('should only remove the specific handler passed to off()', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      on('test:specific', h1);
      on('test:specific', h2);
      off('test:specific', h1);
      emit('test:specific');

      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalled();
      off('test:specific', h2);
    });
  });
});
