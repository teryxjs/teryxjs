// ============================================================
// Teryx — Splitter / Split Panel Widget
// ============================================================

import type { SplitterOptions, WidgetInstance } from '../types';
import { uid, cls, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function splitter(target: string | HTMLElement, options: SplitterOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-splitter');
  const orientation = options.orientation || 'horizontal';
  const gutterSize = options.gutterSize || 8;
  const minSize = options.minSize || 50;

  const container = el as HTMLElement;
  container.id = id;
  container.classList.add('tx-splitter', `tx-splitter-${orientation}`, ...(options.class ? [options.class] : []));

  const panels = Array.from(container.children).filter(c => c instanceof HTMLElement) as HTMLElement[];
  if (panels.length < 2) return { el: container, destroy() {} };

  const sizes = options.sizes || panels.map(() => 100 / panels.length);
  const isHorizontal = orientation === 'horizontal';

  // Set initial sizes and insert gutters
  const gutters: HTMLElement[] = [];
  panels.forEach((panel, i) => {
    panel.classList.add('tx-splitter-panel');
    panel.style[isHorizontal ? 'width' : 'height'] = `calc(${sizes[i]}% - ${(gutterSize * (panels.length - 1)) / panels.length}px)`;
    panel.style.flexShrink = '0';

    if (i < panels.length - 1) {
      const gutter = document.createElement('div');
      gutter.className = `tx-splitter-gutter tx-splitter-gutter-${orientation}`;
      gutter.style[isHorizontal ? 'width' : 'height'] = `${gutterSize}px`;
      gutter.setAttribute('data-index', String(i));
      panel.after(gutter);
      gutters.push(gutter);
    }
  });

  container.style.display = 'flex';
  container.style.flexDirection = isHorizontal ? 'row' : 'column';

  // Drag handling
  gutters.forEach((gutter, i) => {
    let startPos = 0;
    let startSizeA = 0;
    let startSizeB = 0;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startPos = isHorizontal ? e.clientX : e.clientY;
      startSizeA = isHorizontal ? panels[i].offsetWidth : panels[i].offsetHeight;
      startSizeB = isHorizontal ? panels[i + 1].offsetWidth : panels[i + 1].offsetHeight;

      gutter.classList.add('tx-splitter-gutter-active');
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (e: MouseEvent) => {
        const delta = (isHorizontal ? e.clientX : e.clientY) - startPos;
        const newSizeA = Math.max(minSize, startSizeA + delta);
        const newSizeB = Math.max(minSize, startSizeB - delta);

        if (options.maxSize) {
          if (newSizeA > options.maxSize || newSizeB > options.maxSize) return;
        }

        panels[i].style[isHorizontal ? 'width' : 'height'] = `${newSizeA}px`;
        panels[i + 1].style[isHorizontal ? 'width' : 'height'] = `${newSizeB}px`;
        panels[i].style.flexBasis = `${newSizeA}px`;
        panels[i + 1].style.flexBasis = `${newSizeB}px`;
      };

      const onMouseUp = () => {
        gutter.classList.remove('tx-splitter-gutter-active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        const currentSizes = panels.map(p => isHorizontal ? p.offsetWidth : p.offsetHeight);
        const total = currentSizes.reduce((a, b) => a + b, 0);
        const pctSizes = currentSizes.map(s => (s / total) * 100);
        options.onResize?.(pctSizes);
        emit('splitter:resize', { id, sizes: pctSizes });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    gutter.addEventListener('mousedown', onMouseDown);
  });

  return {
    el: container,
    destroy() {
      gutters.forEach(g => g.remove());
      panels.forEach(p => {
        p.classList.remove('tx-splitter-panel');
        p.style.width = '';
        p.style.height = '';
        p.style.flexBasis = '';
        p.style.flexShrink = '';
      });
      container.classList.remove('tx-splitter', `tx-splitter-${orientation}`);
      container.style.display = '';
      container.style.flexDirection = '';
    },
  };
}

registerWidget('splitter', (el, opts) => splitter(el, opts as unknown as SplitterOptions));
export default splitter;
