// ============================================================
// Teryx — Skeleton Loading Placeholder Widget
// ============================================================

import type { SkeletonOptions, WidgetInstance } from '../types';
import { uid, cls, resolveTarget } from '../utils';
import { registerWidget } from '../core';

const LINE_WIDTHS = ['100%', '90%', '75%'];

export function skeleton(target: string | HTMLElement, options: SkeletonOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-skeleton');
  const animated = options.animated !== false;
  const lines = options.lines ?? 3;

  function render(): void {
    const containerCls = cls('tx-skeleton', animated && 'tx-skeleton-animated', options.class);
    let html = `<div class="${containerCls}" id="${id}"`;
    if (options.width) html += ` style="width:${options.width}"`;
    html += '>';

    // Avatar
    if (options.avatar) {
      html += '<div class="tx-skeleton-avatar"></div>';
    }

    // Image placeholder
    if (options.image) {
      let imgStyle = '';
      if (options.height) imgStyle += `height:${options.height}`;
      html += `<div class="tx-skeleton-image"${imgStyle ? ` style="${imgStyle}"` : ''}></div>`;
    }

    // Lines
    if (lines > 0) {
      html += '<div class="tx-skeleton-lines">';
      for (let i = 0; i < lines; i++) {
        const w = LINE_WIDTHS[i % LINE_WIDTHS.length];
        html += `<div class="tx-skeleton-line" style="width:${w}"></div>`;
      }
      html += '</div>';
    }

    html += '</div>';

    el.innerHTML = html;
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('skeleton', (el, opts) => skeleton(el, opts as unknown as SkeletonOptions));
export default skeleton;
