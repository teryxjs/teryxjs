import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { draggable, droppable } from '../../src/widgets/drag-drop';
import { on, off } from '../../src/core';

describe('Drag & Drop — draggable()', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '100px';
    container.style.height = '100px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should add tx-draggable class to the element', () => {
    draggable(container, { data: 'test' });
    expect(container.classList.contains('tx-draggable')).toBe(true);
  });

  it('destroy() removes tx-draggable class', () => {
    const inst = draggable(container, { data: 'test' });
    inst.destroy();
    expect(container.classList.contains('tx-draggable')).toBe(false);
  });

  it('should return the element via .el', () => {
    const inst = draggable(container, { data: 42 });
    expect(inst.el).toBe(container);
  });

  it('should fire onDragStart callback on mousedown+mousemove', () => {
    const onStart = vi.fn();
    draggable(container, { data: { id: 1 }, onDragStart: onStart });

    container.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 10, clientY: 10, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20, bubbles: true }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(container, { id: 1 });

    // Clean up drag state
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 20, clientY: 20, bubbles: true }));
  });

  it('should fire onDragEnd callback on mouseup after drag', () => {
    const onEnd = vi.fn();
    draggable(container, { data: 'payload', onDragEnd: onEnd });

    container.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 10, clientY: 10, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 25, clientY: 25, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 25, clientY: 25, bubbles: true }));

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith(container, 'payload');
  });

  it('should emit drag:start event on the event bus', () => {
    const handler = vi.fn();
    on('drag:start', handler);

    draggable(container, { data: 'bus-test' });

    container.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ data: 'bus-test' }));

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 15, clientY: 15, bubbles: true }));
    off('drag:start', handler);
  });

  it('should emit drag:end event on the event bus', () => {
    const handler = vi.fn();
    on('drag:end', handler);

    draggable(container, { data: 'end-bus' });

    container.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 15, clientY: 15, bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    off('drag:end', handler);
  });

  it('should throw if handle selector does not exist', () => {
    expect(() => draggable(container, { handle: '.nonexistent' })).toThrow(/handle/);
  });

  it('should apply custom dragging class from options', () => {
    draggable(container, { data: 'cls', class: 'my-drag' });

    container.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, bubbles: true }));

    expect(container.classList.contains('my-drag')).toBe(true);

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 15, clientY: 15, bubbles: true }));
    expect(container.classList.contains('my-drag')).toBe(false);
  });
});

describe('Drag & Drop — droppable()', () => {
  let dropZone: HTMLDivElement;

  beforeEach(() => {
    dropZone = document.createElement('div');
    dropZone.style.width = '200px';
    dropZone.style.height = '200px';
    document.body.appendChild(dropZone);
  });

  afterEach(() => {
    dropZone.remove();
  });

  it('should add tx-droppable class to the element', () => {
    droppable(dropZone, {});
    expect(dropZone.classList.contains('tx-droppable')).toBe(true);
  });

  it('destroy() removes tx-droppable class', () => {
    const inst = droppable(dropZone, {});
    inst.destroy();
    expect(dropZone.classList.contains('tx-droppable')).toBe(false);
  });

  it('should return the element via .el', () => {
    const inst = droppable(dropZone, {});
    expect(inst.el).toBe(dropZone);
  });

  it('should fire onDrop when a draggable is dropped on it', () => {
    const onDrop = vi.fn();
    const dragEl = document.createElement('div');
    dragEl.style.width = '50px';
    dragEl.style.height = '50px';
    document.body.appendChild(dragEl);

    // Mock getBoundingClientRect for the drop zone
    const rectSpy = vi.spyOn(dropZone, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 200,
      top: 0,
      bottom: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    draggable(dragEl, { data: { item: 'A' } });
    droppable(dropZone, { onDrop });

    // Simulate drag and drop
    dragEl.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 25, clientY: 25, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(dropZone, { item: 'A' });

    rectSpy.mockRestore();
    dragEl.remove();
  });

  it('should emit drag:drop event on the bus', () => {
    const handler = vi.fn();
    on('drag:drop', handler);

    const dragEl = document.createElement('div');
    document.body.appendChild(dragEl);

    vi.spyOn(dropZone, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 200,
      top: 0,
      bottom: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    draggable(dragEl, { data: 'bus-drop' });
    droppable(dropZone, {});

    dragEl.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 50, clientY: 50, bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);

    off('drag:drop', handler);
    dragEl.remove();
  });

  it('should reject drop when accept returns false', () => {
    const onDrop = vi.fn();
    const dragEl = document.createElement('div');
    document.body.appendChild(dragEl);

    vi.spyOn(dropZone, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 200,
      top: 0,
      bottom: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    draggable(dragEl, { data: 'rejected' });
    droppable(dropZone, {
      accept: () => false,
      onDrop,
    });

    dragEl.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 50, clientY: 50, bubbles: true }));

    expect(onDrop).not.toHaveBeenCalled();

    dragEl.remove();
  });
});
