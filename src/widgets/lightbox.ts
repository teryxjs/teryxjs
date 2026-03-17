// ============================================================
// Teryx — Lightbox / Image Viewer Widget
// ============================================================

import type { LightboxOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon } from '../utils';
import { registerWidget, emit } from '../core';

export interface LightboxInstance extends WidgetInstance {
  open(index?: number): void;
  close(): void;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  isOpen(): boolean;
}

export function lightbox(target: string | HTMLElement, options: LightboxOptions): LightboxInstance {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error(`Teryx lightbox: target "${target}" not found`);

  const id = uid('tx-lightbox');
  const enableZoom = options.zoom !== false;
  const enableRotate = options.rotate ?? false;
  const images = options.images;
  let current = options.startIndex || 0;
  let zoomLevel = 1;
  let rotation = 0;
  let overlay: HTMLElement | null = null;

  // Render thumbnail grid
  renderThumbnails();

  function renderThumbnails(): void {
    let html = `<div class="${cls('tx-lightbox-grid', options.class)}" id="${esc(id)}">`;
    images.forEach((img, i) => {
      html += `<div class="tx-lightbox-thumb" data-index="${i}">`;
      html += `<img src="${esc(img.src)}" alt="${esc(img.alt || '')}" loading="lazy">`;
      html += '</div>';
    });
    html += '</div>';
    (el as HTMLElement).innerHTML = html;

    const grid = (el as HTMLElement).querySelector(`#${id}`) as HTMLElement;
    grid.addEventListener('click', (e) => {
      const thumb = (e.target as HTMLElement).closest('.tx-lightbox-thumb') as HTMLElement;
      if (!thumb) return;
      const idx = parseInt(thumb.getAttribute('data-index') || '0', 10);
      openViewer(idx);
    });
  }

  function buildOverlay(index: number): string {
    const img = images[index];
    let html = `<div class="tx-lightbox-overlay" id="${esc(id)}-overlay" role="dialog" aria-modal="true">`;

    // Toolbar
    html += '<div class="tx-lightbox-toolbar">';
    html += `<span class="tx-lightbox-counter">${index + 1} / ${images.length}</span>`;
    html += '<div class="tx-lightbox-tools">';
    if (enableZoom) {
      html += `<button class="tx-lightbox-tool" data-action="zoom-in" title="Zoom in">${icon('plus')}</button>`;
      html += `<button class="tx-lightbox-tool" data-action="zoom-out" title="Zoom out">${icon('minus')}</button>`;
    }
    if (enableRotate) {
      html += `<button class="tx-lightbox-tool" data-action="rotate" title="Rotate">${icon('refresh')}</button>`;
    }
    html += `<button class="tx-lightbox-tool" data-action="download" title="Download">${icon('download')}</button>`;
    html += `<button class="tx-lightbox-tool tx-lightbox-close" data-action="close" title="Close">${icon('x')}</button>`;
    html += '</div></div>';

    // Image container
    html += '<div class="tx-lightbox-stage">';
    if (images.length > 1) {
      html += `<button class="tx-lightbox-nav tx-lightbox-prev" title="Previous">${icon('chevronLeft')}</button>`;
    }
    html += `<div class="tx-lightbox-img-wrap">`;
    html += `<img class="tx-lightbox-img" src="${esc(img.src)}" alt="${esc(img.alt || '')}" style="transform: scale(1) rotate(0deg)">`;
    html += '</div>';
    if (images.length > 1) {
      html += `<button class="tx-lightbox-nav tx-lightbox-next" title="Next">${icon('chevronRight')}</button>`;
    }
    html += '</div>';

    // Caption
    if (img.caption) {
      html += `<div class="tx-lightbox-caption">${esc(img.caption)}</div>`;
    }

    html += '</div>';
    return html;
  }

  function updateImage(): void {
    if (!overlay) return;
    const img = images[current];
    const imgEl = overlay.querySelector('.tx-lightbox-img') as HTMLImageElement;
    if (imgEl) {
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      imgEl.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
    }
    const counter = overlay.querySelector('.tx-lightbox-counter');
    if (counter) counter.textContent = `${current + 1} / ${images.length}`;
    const caption = overlay.querySelector('.tx-lightbox-caption');
    if (caption) {
      if (img.caption) {
        caption.textContent = img.caption;
        (caption as HTMLElement).style.display = '';
      } else {
        (caption as HTMLElement).style.display = 'none';
      }
    }
  }

  function applyTransform(): void {
    if (!overlay) return;
    const imgEl = overlay.querySelector('.tx-lightbox-img') as HTMLImageElement;
    if (imgEl) {
      imgEl.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
    }
  }

  function openViewer(index: number): void {
    current = index;
    zoomLevel = 1;
    rotation = 0;

    const container = document.createElement('div');
    container.innerHTML = buildOverlay(index);
    overlay = container.firstElementChild as HTMLElement;
    document.body.appendChild(overlay);
    document.body.classList.add('tx-lightbox-open');

    requestAnimationFrame(() => {
      overlay?.classList.add('tx-lightbox-active');
    });

    bindOverlayEvents();
    document.addEventListener('keydown', keyHandler);

    emit('lightbox:open', { id, index: current });
  }

  function closeViewer(): void {
    if (!overlay) return;
    overlay.classList.remove('tx-lightbox-active');
    document.removeEventListener('keydown', keyHandler);
    setTimeout(() => {
      overlay?.remove();
      overlay = null;
      document.body.classList.remove('tx-lightbox-open');
    }, 200);
    emit('lightbox:close', { id });
  }

  function goTo(index: number): void {
    if (images.length <= 1) return;
    current = ((index % images.length) + images.length) % images.length;
    zoomLevel = 1;
    rotation = 0;
    updateImage();
    emit('lightbox:change', { id, index: current });
  }

  function keyHandler(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Escape':
        closeViewer();
        break;
      case 'ArrowLeft':
        goTo(current - 1);
        break;
      case 'ArrowRight':
        goTo(current + 1);
        break;
      case '+':
      case '=':
        if (enableZoom) {
          zoomLevel = Math.min(zoomLevel + 0.25, 5);
          applyTransform();
        }
        break;
      case '-':
        if (enableZoom) {
          zoomLevel = Math.max(zoomLevel - 0.25, 0.25);
          applyTransform();
        }
        break;
      case 'r':
        if (enableRotate) {
          rotation = (rotation + 90) % 360;
          applyTransform();
        }
        break;
    }
  }

  function bindOverlayEvents(): void {
    if (!overlay) return;

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('tx-lightbox-overlay')) {
        closeViewer();
      }
    });

    // Toolbar actions
    overlay.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      switch (action) {
        case 'close':
          closeViewer();
          break;
        case 'zoom-in':
          zoomLevel = Math.min(zoomLevel + 0.25, 5);
          applyTransform();
          break;
        case 'zoom-out':
          zoomLevel = Math.max(zoomLevel - 0.25, 0.25);
          applyTransform();
          break;
        case 'rotate':
          rotation = (rotation + 90) % 360;
          applyTransform();
          break;
        case 'download': {
          const img = images[current];
          const a = document.createElement('a');
          a.href = img.src;
          a.download = img.alt || 'image';
          a.click();
          break;
        }
      }
    });

    // Navigation
    overlay.querySelector('.tx-lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(current - 1);
    });
    overlay.querySelector('.tx-lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(current + 1);
    });

    // Touch/swipe
    let touchStartX = 0;
    overlay.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    overlay.addEventListener(
      'touchend',
      (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? goTo(current + 1) : goTo(current - 1);
        }
      },
      { passive: true },
    );
  }

  const instance: LightboxInstance = {
    el: (el as HTMLElement).querySelector(`#${id}`) || (el as HTMLElement),
    open(index?: number) {
      openViewer(index ?? current);
    },
    close() {
      closeViewer();
    },
    next() {
      goTo(current + 1);
    },
    prev() {
      goTo(current - 1);
    },
    goTo,
    isOpen() {
      return overlay !== null;
    },
    destroy() {
      if (overlay) closeViewer();
      document.removeEventListener('keydown', keyHandler);
      (el as HTMLElement).innerHTML = '';
    },
  };

  return instance;
}

registerWidget('lightbox', (el, opts) => lightbox(el, opts as unknown as LightboxOptions));
export default lightbox;
