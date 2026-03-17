// ============================================================
// Teryx — Drag & Drop Infrastructure
// ============================================================

import { uid, cls } from '../utils';
import { registerWidget, emit } from '../core';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface DraggableOptions {
  /** Arbitrary payload attached to the drag operation. */
  data?: unknown;
  /** CSS selector for the drag handle within the element. If omitted the whole element is the handle. */
  handle?: string;
  /** Create a semi-transparent ghost clone while dragging. */
  ghost?: boolean;
  /** Callback fired when dragging starts. */
  onDragStart?: (el: HTMLElement, data: unknown) => void;
  /** Callback fired when dragging ends. */
  onDragEnd?: (el: HTMLElement, data: unknown) => void;
  /** Extra CSS class added to the element while it is being dragged. */
  class?: string;
}

export interface DroppableOptions {
  /** Filter function — return true to accept the dragged payload. */
  accept?: (data: unknown) => boolean;
  /** Callback fired while a draggable hovers over this drop target. */
  onDragOver?: (el: HTMLElement, data: unknown) => void;
  /** Callback fired when a draggable leaves this drop target. */
  onDragLeave?: (el: HTMLElement, data: unknown) => void;
  /** Callback fired when an accepted payload is dropped. */
  onDrop?: (el: HTMLElement, data: unknown) => void;
  /** CSS class added to the droppable while a valid draggable hovers over it. */
  hoverClass?: string;
}

export interface DraggableInstance {
  /** The draggable element. */
  el: HTMLElement;
  /** Tear down all listeners. */
  destroy(): void;
}

export interface DroppableInstance {
  /** The droppable element. */
  el: HTMLElement;
  /** Tear down the droppable registration. */
  destroy(): void;
}

// ----------------------------------------------------------
//  Internal state
// ----------------------------------------------------------

interface DragState {
  el: HTMLElement;
  data: unknown;
  ghost: HTMLElement | null;
  offsetX: number;
  offsetY: number;
  options: DraggableOptions;
  started: boolean;
}

let _active: DragState | null = null;

const _droppables = new Set<{
  el: HTMLElement;
  options: DroppableOptions;
}>();

// ----------------------------------------------------------
//  Ghost helpers
// ----------------------------------------------------------

function createGhost(source: HTMLElement): HTMLElement {
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.id = uid('tx-drag-ghost');
  ghost.classList.add('tx-drag-ghost');
  ghost.style.position = 'fixed';
  ghost.style.pointerEvents = 'none';
  ghost.style.opacity = '0.7';
  ghost.style.zIndex = '99999';
  ghost.style.margin = '0';
  ghost.style.width = `${source.offsetWidth}px`;
  ghost.style.height = `${source.offsetHeight}px`;
  document.body.appendChild(ghost);
  return ghost;
}

function positionGhost(ghost: HTMLElement, clientX: number, clientY: number, offsetX: number, offsetY: number): void {
  ghost.style.left = `${clientX - offsetX}px`;
  ghost.style.top = `${clientY - offsetY}px`;
}

function removeGhost(ghost: HTMLElement | null): void {
  if (ghost && ghost.parentNode) {
    ghost.parentNode.removeChild(ghost);
  }
}

// ----------------------------------------------------------
//  Hit-testing droppables
// ----------------------------------------------------------

function droppableAt(x: number, y: number): { el: HTMLElement; options: DroppableOptions } | null {
  for (const entry of _droppables) {
    const rect = entry.el.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return entry;
    }
  }
  return null;
}

// ----------------------------------------------------------
//  Unified pointer helpers (mouse + touch)
// ----------------------------------------------------------

function getPointer(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
  if ('touches' in e) {
    const t = e.touches[0] || (e as TouchEvent).changedTouches[0];
    return { clientX: t.clientX, clientY: t.clientY };
  }
  return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
}

// ----------------------------------------------------------
//  Core move / end handlers (attached to document)
// ----------------------------------------------------------

let _currentHover: { el: HTMLElement; options: DroppableOptions } | null = null;

function handleMove(e: MouseEvent | TouchEvent): void {
  if (!_active) return;
  const { clientX, clientY } = getPointer(e);

  // First real movement — fire drag:start
  if (!_active.started) {
    _active.started = true;
    const dragClass = _active.options.class || 'tx-dragging';
    _active.el.classList.add(dragClass);
    _active.options.onDragStart?.(_active.el, _active.data);
    emit('drag:start', { el: _active.el, data: _active.data });
  }

  // Move ghost
  if (_active.ghost) {
    positionGhost(_active.ghost, clientX, clientY, _active.offsetX, _active.offsetY);
  }

  // Hit-test droppables
  const hit = droppableAt(clientX, clientY);

  if (hit && hit !== _currentHover) {
    // Leaving old
    if (_currentHover) {
      if (_currentHover.options.hoverClass) _currentHover.el.classList.remove(_currentHover.options.hoverClass);
      _currentHover.options.onDragLeave?.(_currentHover.el, _active.data);
      emit('drag:leave', { el: _currentHover.el, data: _active.data });
    }
    // Check accept
    const accepted = hit.options.accept ? hit.options.accept(_active.data) : true;
    if (accepted) {
      _currentHover = hit;
      if (hit.options.hoverClass) hit.el.classList.add(hit.options.hoverClass);
      hit.options.onDragOver?.(hit.el, _active.data);
      emit('drag:over', { el: hit.el, data: _active.data });
    } else {
      _currentHover = null;
    }
  } else if (!hit && _currentHover) {
    if (_currentHover.options.hoverClass) _currentHover.el.classList.remove(_currentHover.options.hoverClass);
    _currentHover.options.onDragLeave?.(_currentHover.el, _active.data);
    emit('drag:leave', { el: _currentHover.el, data: _active.data });
    _currentHover = null;
  }
}

function handleEnd(e: MouseEvent | TouchEvent): void {
  if (!_active) return;
  const { clientX, clientY } = getPointer(e);

  // Drop
  if (_active.started) {
    const hit = droppableAt(clientX, clientY);
    if (hit) {
      const accepted = hit.options.accept ? hit.options.accept(_active.data) : true;
      if (accepted) {
        hit.options.onDrop?.(hit.el, _active.data);
        emit('drag:drop', { el: hit.el, data: _active.data });
      }
      if (hit.options.hoverClass) hit.el.classList.remove(hit.options.hoverClass);
    }

    const dragClass = _active.options.class || 'tx-dragging';
    _active.el.classList.remove(dragClass);
    _active.options.onDragEnd?.(_active.el, _active.data);
    emit('drag:end', { el: _active.el, data: _active.data });
  }

  removeGhost(_active.ghost);
  _active = null;
  _currentHover = null;
}

// Ensure document-level listeners are attached exactly once.
let _docListenersAttached = false;

function ensureDocListeners(): void {
  if (_docListenersAttached) return;
  if (typeof document === 'undefined') return;
  _docListenersAttached = true;

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchmove', handleMove, { passive: true });
  document.addEventListener('touchend', handleEnd);
  document.addEventListener('touchcancel', handleEnd);
}

// ----------------------------------------------------------
//  Public API
// ----------------------------------------------------------

/**
 * Make an element draggable.
 *
 * Returns a `DraggableInstance` with a `destroy()` method to remove listeners.
 */
export function draggable(el: HTMLElement, options: DraggableOptions = {}): DraggableInstance {
  ensureDocListeners();

  el.classList.add('tx-draggable');

  const handleEl = options.handle ? el.querySelector<HTMLElement>(options.handle) : el;
  if (!handleEl) {
    throw new Error(`Teryx draggable: handle "${options.handle}" not found inside element`);
  }

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    // Only left mouse button or touch
    if ('button' in e && (e as MouseEvent).button !== 0) return;

    const { clientX, clientY } = getPointer(e);
    const rect = el.getBoundingClientRect();

    const ghost = options.ghost !== false ? createGhost(el) : null;
    if (ghost) positionGhost(ghost, clientX, clientY, clientX - rect.left, clientY - rect.top);

    _active = {
      el,
      data: options.data,
      ghost,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      options,
      started: false,
    };

    e.preventDefault();
  };

  handleEl.addEventListener('mousedown', onPointerDown as EventListener);
  handleEl.addEventListener('touchstart', onPointerDown as EventListener, { passive: false });

  return {
    el,
    destroy() {
      handleEl.removeEventListener('mousedown', onPointerDown as EventListener);
      handleEl.removeEventListener('touchstart', onPointerDown as EventListener);
      el.classList.remove('tx-draggable');
    },
  };
}

/**
 * Make an element a drop target.
 *
 * Returns a `DroppableInstance` with a `destroy()` method to deregister.
 */
export function droppable(el: HTMLElement, options: DroppableOptions = {}): DroppableInstance {
  ensureDocListeners();

  el.classList.add('tx-droppable');

  const entry = { el, options };
  _droppables.add(entry);

  return {
    el,
    destroy() {
      _droppables.delete(entry);
      el.classList.remove('tx-droppable');
    },
  };
}

// ----------------------------------------------------------
//  Widget registration (declarative usage)
// ----------------------------------------------------------

registerWidget('draggable', (el, opts) => draggable(el, opts as unknown as DraggableOptions));
registerWidget('droppable', (el, opts) => droppable(el, opts as unknown as DroppableOptions));
