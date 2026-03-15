// ============================================================
// Teryx — Carousel / Slider Widget
// ============================================================

import type { CarouselOptions, CarouselInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function carousel(target: string | HTMLElement, options: CarouselOptions): CarouselInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-carousel');
  const loop = options.loop !== false;
  const showArrows = options.arrows !== false;
  const showIndicators = options.indicators !== false;
  let current = 0;
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;

  let html = `<div class="${cls('tx-carousel', options.class)}" id="${esc(id)}">`;

  // Slides
  html += '<div class="tx-carousel-track">';
  options.slides.forEach((slide, i) => {
    html += `<div class="${cls('tx-carousel-slide', i === 0 && 'tx-carousel-slide-active')}" data-index="${i}">`;
    if (slide.image) html += `<img src="${esc(slide.image)}" class="tx-carousel-img" alt="${esc(slide.title || '')}">`;
    if (slide.content) html += `<div class="tx-carousel-content">${slide.content}</div>`;
    if (slide.title || slide.description) {
      html += '<div class="tx-carousel-caption">';
      if (slide.title) html += `<h3>${esc(slide.title)}</h3>`;
      if (slide.description) html += `<p>${esc(slide.description)}</p>`;
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  // Arrows
  if (showArrows) {
    html += `<button class="tx-carousel-arrow tx-carousel-prev">${icon('chevronLeft')}</button>`;
    html += `<button class="tx-carousel-arrow tx-carousel-next">${icon('chevronRight')}</button>`;
  }

  // Indicators
  if (showIndicators) {
    html += '<div class="tx-carousel-indicators">';
    options.slides.forEach((_, i) => {
      html += `<button class="${cls('tx-carousel-indicator', i === 0 && 'tx-carousel-indicator-active')}" data-index="${i}"></button>`;
    });
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;
  const track = container.querySelector('.tx-carousel-track') as HTMLElement;

  function goTo(index: number): void {
    const total = options.slides.length;
    if (loop) {
      index = ((index % total) + total) % total;
    } else {
      index = Math.max(0, Math.min(total - 1, index));
    }
    if (index === current) return;

    container.querySelectorAll('.tx-carousel-slide-active').forEach(s => s.classList.remove('tx-carousel-slide-active'));
    container.querySelectorAll('.tx-carousel-indicator-active').forEach(i => i.classList.remove('tx-carousel-indicator-active'));

    const slide = container.querySelector(`[data-index="${index}"].tx-carousel-slide`);
    slide?.classList.add('tx-carousel-slide-active');

    const indicator = container.querySelector(`.tx-carousel-indicator[data-index="${index}"]`);
    indicator?.classList.add('tx-carousel-indicator-active');

    // Translate track
    track.style.transform = `translateX(-${index * 100}%)`;

    current = index;
    emit('carousel:change', { id, index: current });
  }

  // Arrow clicks
  container.querySelector('.tx-carousel-prev')?.addEventListener('click', () => goTo(current - 1));
  container.querySelector('.tx-carousel-next')?.addEventListener('click', () => goTo(current + 1));

  // Indicator clicks
  container.querySelectorAll('.tx-carousel-indicator').forEach(ind => {
    ind.addEventListener('click', () => {
      const idx = parseInt(ind.getAttribute('data-index') || '0', 10);
      goTo(idx);
    });
  });

  // Autoplay
  function startAutoplay(): void {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo(current + 1), options.interval || 5000);
  }

  function stopAutoplay(): void {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }

  if (options.autoplay) {
    startAutoplay();
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
  }

  // Touch/swipe support
  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  container.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  const instance: CarouselInstance = {
    el: container,
    destroy() { stopAutoplay(); el.innerHTML = ''; },
    next() { goTo(current + 1); },
    prev() { goTo(current - 1); },
    goTo,
    pause() { stopAutoplay(); },
    play() { startAutoplay(); },
  };

  return instance;
}

registerWidget('carousel', (el, opts) => carousel(el, opts as unknown as CarouselOptions));
export default carousel;
