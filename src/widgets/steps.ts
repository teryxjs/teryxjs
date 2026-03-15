// ============================================================
// Teryx — Steps / Wizard Widget
// ============================================================

import type { StepsOptions, StepItem, StepsInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function steps(target: string | HTMLElement, options: StepsOptions): StepsInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-steps');
  const direction = options.direction || 'horizontal';
  let currentStep = options.current ?? 0;

  function render(): void {
    let html = `<div class="${cls('tx-steps', `tx-steps-${direction}`, options.size && `tx-steps-${options.size}`, options.class)}" id="${esc(id)}">`;

    // Step indicators
    html += '<div class="tx-steps-nav">';
    options.items.forEach((item, i) => {
      const status = item.status || (i < currentStep ? 'finish' : i === currentStep ? 'process' : 'wait');
      html += `<div class="${cls('tx-step', `tx-step-${status}`, options.clickable && 'tx-step-clickable')}" data-step="${i}">`;
      html += '<div class="tx-step-indicator">';

      if (status === 'finish') {
        html += `<span class="tx-step-icon">${icon('check')}</span>`;
      } else if (status === 'error') {
        html += `<span class="tx-step-icon">${icon('x')}</span>`;
      } else if (item.icon) {
        html += `<span class="tx-step-icon">${icon(item.icon)}</span>`;
      } else {
        html += `<span class="tx-step-number">${i + 1}</span>`;
      }

      html += '</div>';
      html += '<div class="tx-step-info">';
      html += `<div class="tx-step-title">${esc(item.title)}</div>`;
      if (item.description) html += `<div class="tx-step-description">${esc(item.description)}</div>`;
      html += '</div>';

      if (i < options.items.length - 1) {
        html += '<div class="tx-step-connector"></div>';
      }

      html += '</div>';
    });
    html += '</div>';

    // Step content
    const currentItem = options.items[currentStep];
    if (currentItem) {
      html += `<div class="tx-steps-content" id="${esc(id)}-content">`;
      if (currentItem.source) {
        html += `<div xh-get="${esc(currentItem.source)}" xh-trigger="load" xh-indicator="#${esc(id)}-loading">`;
        html += `<div id="${esc(id)}-loading" class="xh-indicator tx-loading-pad"><div class="tx-spinner"></div></div>`;
        html += '</div>';
      } else if (currentItem.content) {
        html += currentItem.content;
      }
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;

    // Click handlers
    if (options.clickable) {
      el.querySelectorAll('.tx-step-clickable').forEach(stepEl => {
        stepEl.addEventListener('click', () => {
          const step = parseInt(stepEl.getAttribute('data-step') || '0', 10);
          instance.goTo(step);
        });
      });
    }

    // Process xhtmlx content
    if (currentItem?.source && typeof (window as any).xhtmlx !== 'undefined') {
      (window as any).xhtmlx.process(el);
    }
  }

  render();

  const instance: StepsInstance = {
    el: el.querySelector(`#${id}`) || el,
    destroy() { el.innerHTML = ''; },
    next() {
      if (currentStep < options.items.length - 1) {
        currentStep++;
        render();
        options.onChange?.(currentStep);
        emit('steps:change', { id, step: currentStep });
      }
    },
    prev() {
      if (currentStep > 0) {
        currentStep--;
        render();
        options.onChange?.(currentStep);
        emit('steps:change', { id, step: currentStep });
      }
    },
    goTo(step: number) {
      if (step >= 0 && step < options.items.length && step !== currentStep) {
        currentStep = step;
        render();
        options.onChange?.(currentStep);
        emit('steps:change', { id, step: currentStep });
      }
    },
    current() {
      return currentStep;
    },
  };

  return instance;
}

registerWidget('steps', (el, opts) => steps(el, opts as unknown as StepsOptions));
export default steps;
