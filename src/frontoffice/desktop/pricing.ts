// ============================================================
// Teryx — Pricing Table Widget (Desktop Front Office)
// ============================================================

import { uid, esc, cls, icon, resolveTarget } from '../../utils';
import { registerWidget } from '../../core';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface PricingFeature {
  /** Feature description text. */
  text: string;
  /** Whether this feature is included in the tier. */
  included?: boolean;
  /** Optional tooltip / extra info. */
  tooltip?: string;
}

export interface PricingTier {
  /** Tier name (e.g. "Starter", "Pro", "Enterprise"). */
  name: string;
  /** Short description of the tier. */
  description?: string;
  /** Price string (e.g. "$29", "Free"). */
  price: string;
  /** Billing period label (e.g. "/month", "/year"). */
  period?: string;
  /** Features list for this tier. */
  features: PricingFeature[];
  /** CTA button label. */
  buttonLabel?: string;
  /** CTA button href. */
  buttonHref?: string;
  /** CTA button variant. */
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  /** Mark this tier as recommended / highlighted. */
  recommended?: boolean;
  /** Recommendation badge text (e.g. "Most Popular"). */
  badge?: string;
  /** Optional icon name shown in the tier header. */
  icon?: string;
  /** Click handler for the CTA button. */
  onSelect?: () => void;
}

export interface PricingOptions {
  /** Section heading displayed above the pricing table. */
  title?: string;
  /** Section subtitle / description. */
  subtitle?: string;
  /** Pricing tiers to display. */
  tiers: PricingTier[];
  /** Enable monthly/annual toggle. */
  toggle?: {
    /** Label for the first option. */
    labelA: string;
    /** Label for the second option. */
    labelB: string;
    /** Callback when toggled. Receives true when labelB is active. */
    onChange?: (isB: boolean) => void;
  };
  /** Extra CSS class on the root element. */
  class?: string;
  /** Widget id. */
  id?: string;
}

// ----------------------------------------------------------
//  Widget
// ----------------------------------------------------------

export function pricing(target: string | HTMLElement, options: PricingOptions): { el: HTMLElement; destroy(): void } {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-pricing');

  let html = `<section class="${cls('tx-pricing', options.class)}" id="${esc(id)}">`;

  // Section header
  if (options.title || options.subtitle) {
    html += '<div class="tx-pricing-header">';
    if (options.title) {
      html += `<h2 class="tx-pricing-title">${esc(options.title)}</h2>`;
    }
    if (options.subtitle) {
      html += `<p class="tx-pricing-subtitle">${esc(options.subtitle)}</p>`;
    }
    html += '</div>';
  }

  // Billing toggle
  if (options.toggle) {
    html += '<div class="tx-pricing-toggle">';
    html += `<span class="tx-pricing-toggle-label tx-pricing-toggle-label-a tx-pricing-toggle-active">${esc(options.toggle.labelA)}</span>`;
    html += '<button class="tx-pricing-toggle-switch" role="switch" aria-checked="false">';
    html += '<span class="tx-pricing-toggle-knob"></span>';
    html += '</button>';
    html += `<span class="tx-pricing-toggle-label tx-pricing-toggle-label-b">${esc(options.toggle.labelB)}</span>`;
    html += '</div>';
  }

  // Tier cards
  html += '<div class="tx-pricing-grid">';
  options.tiers.forEach((tier, tIdx) => {
    const isRecommended = tier.recommended === true;
    html += `<div class="${cls(
      'tx-pricing-tier',
      isRecommended && 'tx-pricing-tier-recommended',
    )}" data-tier="${tIdx}">`;

    // Recommendation badge
    if (isRecommended && tier.badge) {
      html += `<div class="tx-pricing-badge">${esc(tier.badge)}</div>`;
    }

    // Tier header
    html += '<div class="tx-pricing-tier-header">';
    if (tier.icon) {
      html += `<div class="tx-pricing-tier-icon">${icon(tier.icon, 28)}</div>`;
    }
    html += `<h3 class="tx-pricing-tier-name">${esc(tier.name)}</h3>`;
    if (tier.description) {
      html += `<p class="tx-pricing-tier-desc">${esc(tier.description)}</p>`;
    }
    html += '</div>';

    // Price
    html += '<div class="tx-pricing-tier-price">';
    html += `<span class="tx-pricing-amount">${esc(tier.price)}</span>`;
    if (tier.period) {
      html += `<span class="tx-pricing-period">${esc(tier.period)}</span>`;
    }
    html += '</div>';

    // Features list
    html += '<ul class="tx-pricing-features">';
    for (const feature of tier.features) {
      const included = feature.included !== false;
      html += `<li class="${cls('tx-pricing-feature', !included && 'tx-pricing-feature-excluded')}">`;
      html += `<span class="tx-pricing-feature-icon">${included ? icon('check') : icon('x')}</span>`;
      html += `<span class="tx-pricing-feature-text">${esc(feature.text)}</span>`;
      if (feature.tooltip) {
        html += `<span class="tx-pricing-feature-info" title="${esc(feature.tooltip)}">${icon('info')}</span>`;
      }
      html += '</li>';
    }
    html += '</ul>';

    // CTA button
    const btnLabel = tier.buttonLabel || 'Get Started';
    const btnVariant = tier.buttonVariant || (isRecommended ? 'primary' : 'outline');
    const btnTag = tier.buttonHref ? 'a' : 'button';
    const hrefAttr = tier.buttonHref ? ` href="${esc(tier.buttonHref)}"` : '';
    html += `<div class="tx-pricing-tier-action">`;
    html += `<${btnTag} class="${cls(
      'tx-pricing-btn',
      `tx-pricing-btn-${btnVariant}`,
    )}"${hrefAttr}>${esc(btnLabel)}</${btnTag}>`;
    html += '</div>';

    html += '</div>'; // tier
  });
  html += '</div>'; // grid

  html += '</section>';

  el.innerHTML = html;

  const pricingEl = el.querySelector(`#${id}`) as HTMLElement;

  // Toggle switch behaviour
  if (options.toggle) {
    const switchBtn = pricingEl.querySelector('.tx-pricing-toggle-switch');
    const labelA = pricingEl.querySelector('.tx-pricing-toggle-label-a');
    const labelB = pricingEl.querySelector('.tx-pricing-toggle-label-b');
    let isB = false;

    switchBtn?.addEventListener('click', () => {
      isB = !isB;
      switchBtn.setAttribute('aria-checked', String(isB));
      switchBtn.classList.toggle('tx-pricing-toggle-switch-active', isB);
      labelA?.classList.toggle('tx-pricing-toggle-active', !isB);
      labelB?.classList.toggle('tx-pricing-toggle-active', isB);
      options.toggle?.onChange?.(isB);
    });
  }

  // Bind CTA click handlers
  options.tiers.forEach((tier, tIdx) => {
    if (tier.onSelect) {
      const tierEl = pricingEl.querySelector(`[data-tier="${tIdx}"]`);
      const btn = tierEl?.querySelector('.tx-pricing-btn');
      btn?.addEventListener('click', (e) => {
        if (!tier.buttonHref) e.preventDefault();
        tier.onSelect!();
      });
    }
  });

  return {
    el: pricingEl,
    destroy() {
      el.innerHTML = '';
    },
  };
}

registerWidget('pricing', (el, opts) => pricing(el, opts as unknown as PricingOptions));
export default pricing;
