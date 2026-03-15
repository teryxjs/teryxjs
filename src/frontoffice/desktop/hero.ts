// ============================================================
// Teryx — Hero Section Widget (Desktop Front Office)
// ============================================================

import { uid, esc, cls, icon, resolveTarget } from '../../utils';
import { registerWidget } from '../../core';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface HeroCtaButton {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
}

export interface HeroOptions {
  /** Main headline text. */
  title: string;
  /** Subtitle or tagline text below the title. */
  subtitle?: string;
  /** CTA buttons displayed beneath the subtitle. */
  buttons?: HeroCtaButton[];
  /** Background image URL. */
  backgroundImage?: string;
  /** CSS gradient string (e.g. "linear-gradient(135deg, #667eea, #764ba2)"). */
  backgroundGradient?: string;
  /** Background colour fallback. */
  backgroundColor?: string;
  /** Overlay opacity (0-1) for darkening the background behind text. */
  overlayOpacity?: number;
  /** Text alignment. */
  align?: 'left' | 'center' | 'right';
  /** Minimum section height (CSS value). */
  minHeight?: string;
  /** Additional content HTML rendered below the buttons (e.g. trust badges). */
  extraContent?: string;
  /** Extra CSS class on the root element. */
  class?: string;
  /** Widget id. */
  id?: string;
}

// ----------------------------------------------------------
//  Widget
// ----------------------------------------------------------

export function hero(
  target: string | HTMLElement,
  options: HeroOptions,
): { el: HTMLElement; destroy(): void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-hero');
  const align = options.align || 'center';

  // Build inline styles for background
  const bgParts: string[] = [];
  if (options.backgroundImage) {
    bgParts.push(`background-image:url(${esc(options.backgroundImage)})`);
    bgParts.push('background-size:cover');
    bgParts.push('background-position:center');
  }
  if (options.backgroundGradient) {
    bgParts.push(`background:${options.backgroundGradient}`);
  }
  if (options.backgroundColor) {
    bgParts.push(`background-color:${options.backgroundColor}`);
  }
  if (options.minHeight) {
    bgParts.push(`min-height:${options.minHeight}`);
  }
  const bgStyle = bgParts.length ? ` style="${bgParts.join(';')}"` : '';

  let html = `<section class="${cls(
    'tx-hero',
    `tx-hero-align-${align}`,
    options.backgroundImage && 'tx-hero-has-bg',
    options.class,
  )}" id="${esc(id)}"${bgStyle}>`;

  // Optional dark overlay for background images
  if (options.backgroundImage) {
    const opacity = options.overlayOpacity ?? 0.45;
    html += `<div class="tx-hero-overlay" style="opacity:${opacity}"></div>`;
  }

  html += '<div class="tx-hero-inner">';

  // Title
  html += `<h1 class="tx-hero-title">${esc(options.title)}</h1>`;

  // Subtitle
  if (options.subtitle) {
    html += `<p class="tx-hero-subtitle">${esc(options.subtitle)}</p>`;
  }

  // CTA buttons
  if (options.buttons?.length) {
    html += '<div class="tx-hero-actions">';
    options.buttons.forEach((btn, i) => {
      const variant = btn.variant || (i === 0 ? 'primary' : 'outline');
      const tag = btn.href ? 'a' : 'button';
      const hrefAttr = btn.href ? ` href="${esc(btn.href)}"` : '';
      html += `<${tag} class="${cls(
        'tx-hero-btn',
        `tx-hero-btn-${variant}`,
      )}"${hrefAttr}>`;
      if (btn.icon && btn.iconPosition !== 'right') {
        html += `<span class="tx-hero-btn-icon">${icon(btn.icon)}</span>`;
      }
      html += `<span>${esc(btn.label)}</span>`;
      if (btn.icon && btn.iconPosition === 'right') {
        html += `<span class="tx-hero-btn-icon">${icon(btn.icon)}</span>`;
      }
      html += `</${tag}>`;
    });
    html += '</div>';
  }

  // Extra content (trust badges, etc.)
  if (options.extraContent) {
    html += `<div class="tx-hero-extra">${options.extraContent}</div>`;
  }

  html += '</div>'; // inner
  html += '</section>';

  el.innerHTML = html;

  const heroEl = el.querySelector(`#${id}`) as HTMLElement;

  // Bind click handlers to CTA buttons
  if (options.buttons?.length) {
    const btnEls = heroEl.querySelectorAll('.tx-hero-btn');
    options.buttons.forEach((btn, i) => {
      if (btn.onClick && btnEls[i]) {
        btnEls[i].addEventListener('click', (e) => {
          if (!btn.href) e.preventDefault();
          btn.onClick!();
        });
      }
    });
  }

  return {
    el: heroEl,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('hero', (el, opts) => hero(el, opts as unknown as HeroOptions));
export default hero;
