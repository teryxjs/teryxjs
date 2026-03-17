// ============================================================
// Teryx — Feature Grid Widget (Desktop Front Office)
// ============================================================

import { uid, esc, cls, icon, resolveTarget } from '../../utils';
import { registerWidget } from '../../core';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface FeatureItem {
  /** Icon name from the Teryx icon set, or raw SVG/HTML string. */
  icon?: string;
  /** Custom icon HTML (used when `icon` is not a built-in icon name). */
  iconHtml?: string;
  /** Icon background colour for the icon badge. */
  iconColor?: string;
  /** Feature title. */
  title: string;
  /** Feature description text. */
  description: string;
  /** Optional link URL for "Learn more". */
  href?: string;
  /** Link label (default "Learn more"). */
  linkLabel?: string;
}

export interface FeatureOptions {
  /** Section heading. */
  title?: string;
  /** Section subtitle / description. */
  subtitle?: string;
  /** Feature items to display. */
  items: FeatureItem[];
  /** Number of grid columns (default 3). */
  columns?: number;
  /** Card style variant. */
  variant?: 'card' | 'flat' | 'bordered';
  /** Text alignment within each card. */
  align?: 'left' | 'center';
  /** Icon size in pixels (default 24). */
  iconSize?: number;
  /** Extra CSS class on the root element. */
  class?: string;
  /** Widget id. */
  id?: string;
}

// ----------------------------------------------------------
//  Widget
// ----------------------------------------------------------

export function feature(target: string | HTMLElement, options: FeatureOptions): { el: HTMLElement; destroy(): void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-feature');
  const columns = options.columns || 3;
  const variant = options.variant || 'card';
  const align = options.align || 'center';
  const iconSize = options.iconSize || 24;

  let html = `<section class="${cls(
    'tx-feature',
    `tx-feature-${variant}`,
    `tx-feature-align-${align}`,
    options.class,
  )}" id="${esc(id)}">`;

  // Section header
  if (options.title || options.subtitle) {
    html += '<div class="tx-feature-header">';
    if (options.title) {
      html += `<h2 class="tx-feature-title">${esc(options.title)}</h2>`;
    }
    if (options.subtitle) {
      html += `<p class="tx-feature-subtitle">${esc(options.subtitle)}</p>`;
    }
    html += '</div>';
  }

  // Feature grid
  html += `<div class="tx-feature-grid" style="grid-template-columns:repeat(${columns},1fr)">`;

  for (const item of options.items) {
    html += `<div class="tx-feature-card">`;

    // Icon
    if (item.icon || item.iconHtml) {
      const colorStyle = item.iconColor ? ` style="color:${item.iconColor}"` : '';
      html += `<div class="tx-feature-icon"${colorStyle}>`;
      html += '<div class="tx-feature-icon-inner">';
      if (item.iconHtml) {
        html += item.iconHtml;
      } else if (item.icon) {
        // Try built-in icon; fall back to rendering the name as text
        const svg = icon(item.icon, iconSize);
        html += svg || `<span class="tx-feature-icon-text">${esc(item.icon)}</span>`;
      }
      html += '</div>';
      html += '</div>';
    }

    // Title
    html += `<h3 class="tx-feature-card-title">${esc(item.title)}</h3>`;

    // Description
    html += `<p class="tx-feature-card-desc">${esc(item.description)}</p>`;

    // Optional link
    if (item.href) {
      const label = item.linkLabel || 'Learn more';
      html += `<a class="tx-feature-card-link" href="${esc(item.href)}">`;
      html += `${esc(label)} <span class="tx-feature-card-link-arrow">${icon('chevronRight')}</span>`;
      html += '</a>';
    }

    html += '</div>'; // card
  }

  html += '</div>'; // grid
  html += '</section>';

  el.innerHTML = html;

  const sectionEl = el.querySelector(`#${id}`) as HTMLElement;

  return {
    el: sectionEl,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('feature', (el, opts) => feature(el, opts as unknown as FeatureOptions));
export default feature;
