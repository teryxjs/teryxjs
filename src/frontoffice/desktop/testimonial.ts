// ============================================================
// Teryx — Testimonial Section Widget (Desktop Front Office)
// ============================================================

import { uid, esc, cls, icon, resolveTarget } from '../../utils';
import { registerWidget, emit } from '../../core';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface TestimonialQuote {
  /** The testimonial text. */
  text: string;
  /** Author / reviewer name. */
  author: string;
  /** Author role or company. */
  role?: string;
  /** Author avatar image URL. */
  avatar?: string;
  /** Star rating (1-5). */
  rating?: number;
  /** Company logo image URL. */
  companyLogo?: string;
}

export interface TestimonialOptions {
  /** Section heading. */
  title?: string;
  /** Section subtitle. */
  subtitle?: string;
  /** Array of testimonials to display. */
  quotes: TestimonialQuote[];
  /** Layout style: carousel (one at a time) or grid (all visible). */
  layout?: 'carousel' | 'grid';
  /** Number of columns in grid layout (default 3). */
  columns?: number;
  /** Enable autoplay for carousel layout. */
  autoplay?: boolean;
  /** Autoplay interval in ms (default 6000). */
  interval?: number;
  /** Extra CSS class on the root element. */
  class?: string;
  /** Widget id. */
  id?: string;
}

// ----------------------------------------------------------
//  Helpers
// ----------------------------------------------------------

function renderStars(rating: number): string {
  let html = '<div class="tx-testimonial-stars">';
  for (let i = 1; i <= 5; i++) {
    html += i <= rating
      ? `<span class="tx-testimonial-star tx-testimonial-star-filled">${icon('starFilled')}</span>`
      : `<span class="tx-testimonial-star">${icon('star')}</span>`;
  }
  html += '</div>';
  return html;
}

function renderQuoteCard(quote: TestimonialQuote, index: number, isActive: boolean, isCarousel: boolean): string {
  let html = `<div class="${cls(
    'tx-testimonial-card',
    isCarousel && 'tx-testimonial-slide',
    isCarousel && isActive && 'tx-testimonial-slide-active',
  )}" data-index="${index}">`;

  // Quote icon
  html += '<div class="tx-testimonial-quote-icon">';
  html += '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>';
  html += '</div>';

  // Rating
  if (quote.rating != null) {
    html += renderStars(quote.rating);
  }

  // Testimonial text
  html += `<blockquote class="tx-testimonial-text">${esc(quote.text)}</blockquote>`;

  // Author section
  html += '<div class="tx-testimonial-author">';
  if (quote.avatar) {
    html += `<img class="tx-testimonial-avatar" src="${esc(quote.avatar)}" alt="${esc(quote.author)}" loading="lazy">`;
  } else {
    // Generate initials avatar
    const initials = quote.author
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    html += `<div class="tx-testimonial-avatar tx-testimonial-avatar-initials">${esc(initials)}</div>`;
  }
  html += '<div class="tx-testimonial-author-info">';
  html += `<div class="tx-testimonial-author-name">${esc(quote.author)}</div>`;
  if (quote.role) {
    html += `<div class="tx-testimonial-author-role">${esc(quote.role)}</div>`;
  }
  html += '</div>'; // author-info

  if (quote.companyLogo) {
    html += `<img class="tx-testimonial-company-logo" src="${esc(quote.companyLogo)}" alt="" loading="lazy">`;
  }

  html += '</div>'; // author
  html += '</div>'; // card

  return html;
}

// ----------------------------------------------------------
//  Widget
// ----------------------------------------------------------

export function testimonial(
  target: string | HTMLElement,
  options: TestimonialOptions,
): { el: HTMLElement; destroy(): void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-testimonial');
  const layout = options.layout || 'grid';
  const columns = options.columns || 3;

  let html = `<section class="${cls(
    'tx-testimonial',
    `tx-testimonial-${layout}`,
    options.class,
  )}" id="${esc(id)}">`;

  // Section header
  if (options.title || options.subtitle) {
    html += '<div class="tx-testimonial-header">';
    if (options.title) {
      html += `<h2 class="tx-testimonial-title">${esc(options.title)}</h2>`;
    }
    if (options.subtitle) {
      html += `<p class="tx-testimonial-subtitle">${esc(options.subtitle)}</p>`;
    }
    html += '</div>';
  }

  if (layout === 'carousel') {
    // --- Carousel layout ---
    html += '<div class="tx-testimonial-carousel">';
    html += '<div class="tx-testimonial-track">';
    options.quotes.forEach((quote, i) => {
      html += renderQuoteCard(quote, i, i === 0, true);
    });
    html += '</div>'; // track

    // Navigation arrows
    if (options.quotes.length > 1) {
      html += `<button class="tx-testimonial-arrow tx-testimonial-prev" aria-label="Previous">${icon('chevronLeft')}</button>`;
      html += `<button class="tx-testimonial-arrow tx-testimonial-next" aria-label="Next">${icon('chevronRight')}</button>`;

      // Dot indicators
      html += '<div class="tx-testimonial-indicators">';
      options.quotes.forEach((_, i) => {
        html += `<button class="${cls(
          'tx-testimonial-dot',
          i === 0 && 'tx-testimonial-dot-active',
        )}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`;
      });
      html += '</div>';
    }

    html += '</div>'; // carousel
  } else {
    // --- Grid layout ---
    html += `<div class="tx-testimonial-grid" style="grid-template-columns:repeat(${columns},1fr)">`;
    options.quotes.forEach((quote, i) => {
      html += renderQuoteCard(quote, i, false, false);
    });
    html += '</div>';
  }

  html += '</section>';

  el.innerHTML = html;

  const sectionEl = el.querySelector(`#${id}`) as HTMLElement;

  // Carousel interactivity
  if (layout === 'carousel' && options.quotes.length > 1) {
    let current = 0;
    let autoplayTimer: ReturnType<typeof setInterval> | null = null;
    const total = options.quotes.length;

    function goTo(index: number): void {
      index = ((index % total) + total) % total;
      if (index === current) return;

      sectionEl
        .querySelectorAll('.tx-testimonial-slide-active')
        .forEach(s => s.classList.remove('tx-testimonial-slide-active'));
      sectionEl
        .querySelectorAll('.tx-testimonial-dot-active')
        .forEach(d => d.classList.remove('tx-testimonial-dot-active'));

      const slide = sectionEl.querySelector(`.tx-testimonial-slide[data-index="${index}"]`);
      slide?.classList.add('tx-testimonial-slide-active');

      const dot = sectionEl.querySelector(`.tx-testimonial-dot[data-index="${index}"]`);
      dot?.classList.add('tx-testimonial-dot-active');

      const track = sectionEl.querySelector('.tx-testimonial-track') as HTMLElement;
      if (track) track.style.transform = `translateX(-${index * 100}%)`;

      current = index;
      emit('testimonial:change', { id, index: current });
    }

    // Arrow clicks
    sectionEl.querySelector('.tx-testimonial-prev')?.addEventListener('click', () => goTo(current - 1));
    sectionEl.querySelector('.tx-testimonial-next')?.addEventListener('click', () => goTo(current + 1));

    // Dot clicks
    sectionEl.querySelectorAll('.tx-testimonial-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
        goTo(idx);
      });
    });

    // Autoplay
    function startAutoplay(): void {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goTo(current + 1), options.interval || 6000);
    }

    function stopAutoplay(): void {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    if (options.autoplay) {
      startAutoplay();
      const carouselEl = sectionEl.querySelector('.tx-testimonial-carousel');
      carouselEl?.addEventListener('mouseenter', stopAutoplay);
      carouselEl?.addEventListener('mouseleave', startAutoplay);
    }

    // Store cleanup reference
    const origDestroy = () => {
      stopAutoplay();
      el.innerHTML = '';
    };

    return {
      el: sectionEl,
      destroy: origDestroy,
    };
  }

  return {
    el: sectionEl,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('testimonial', (el, opts) => testimonial(el, opts as unknown as TestimonialOptions));
export default testimonial;
