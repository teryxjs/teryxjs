// ============================================================
// Teryx — Slider / Range Widget
// ============================================================

import type { SliderOptions, WidgetInstance } from '../types';
import { uid, esc, cls, resolveTarget, clamp } from '../utils';
import { registerWidget, emit } from '../core';

export interface SliderInstance extends WidgetInstance {
  getValue(): number | [number, number];
  setValue(value: number | [number, number]): void;
}

export function slider(target: string | HTMLElement, options: SliderOptions = {}): SliderInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-slider');
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const isRange = options.range ?? false;
  const isVertical = options.vertical ?? false;
  const showTooltip = options.showTooltip ?? true;
  const showInput = options.showInput ?? false;
  const marks = options.marks || {};

  let value = options.value ?? min;
  let values: [number, number] = options.values ?? [min, max];

  function pct(v: number): number {
    return ((v - min) / (max - min)) * 100;
  }

  function snap(v: number): number {
    const snapped = Math.round((v - min) / step) * step + min;
    return clamp(snapped, min, max);
  }

  // Update DOM in-place without replacing innerHTML (avoids stale references during drag)
  function updateVisuals(): void {
    const container = el.querySelector(`#${id}`) as HTMLElement;
    if (!container) return;

    const fill = container.querySelector('.tx-slider-fill') as HTMLElement;
    if (fill) {
      if (isRange) {
        const startPct = pct(values[0]);
        const endPct = pct(values[1]);
        if (isVertical) {
          fill.style.cssText = `bottom:${startPct}%;height:${endPct - startPct}%`;
        } else {
          fill.style.cssText = `left:${startPct}%;width:${endPct - startPct}%`;
        }
      } else {
        const valPct = pct(value);
        if (isVertical) {
          fill.style.cssText = `bottom:0;height:${valPct}%`;
        } else {
          fill.style.cssText = `left:0;width:${valPct}%`;
        }
      }
    }

    const thumbs = container.querySelectorAll('.tx-slider-thumb') as NodeListOf<HTMLElement>;
    const prop = isVertical ? 'bottom' : 'left';
    if (isRange) {
      if (thumbs[0]) {
        thumbs[0].style.setProperty(prop, `${pct(values[0])}%`);
        const tt0 = thumbs[0].querySelector('.tx-slider-tooltip');
        if (tt0) tt0.textContent = String(values[0]);
      }
      if (thumbs[1]) {
        thumbs[1].style.setProperty(prop, `${pct(values[1])}%`);
        const tt1 = thumbs[1].querySelector('.tx-slider-tooltip');
        if (tt1) tt1.textContent = String(values[1]);
      }
    } else {
      if (thumbs[0]) {
        thumbs[0].style.setProperty(prop, `${pct(value)}%`);
        const tt = thumbs[0].querySelector('.tx-slider-tooltip');
        if (tt) tt.textContent = String(value);
      }
    }

    // Update number inputs
    if (showInput) {
      container.querySelectorAll('.tx-slider-input').forEach((inp) => {
        const inputEl = inp as HTMLInputElement;
        const inputType = inputEl.getAttribute('data-input');
        if (isRange) {
          if (inputType === 'start') inputEl.value = String(values[0]);
          else inputEl.value = String(values[1]);
        } else {
          inputEl.value = String(value);
        }
      });
    }
  }

  function render(): void {
    const hasMarks = Object.keys(marks).length > 0;
    let html = `<div class="${cls(
      'tx-slider',
      isVertical && 'tx-slider-vertical',
      isRange && 'tx-slider-range',
      hasMarks && 'tx-slider-has-marks',
      options.class,
    )}" id="${esc(id)}">`;

    // Track
    html += '<div class="tx-slider-track">';

    // Fill
    if (isRange) {
      const startPct = pct(values[0]);
      const endPct = pct(values[1]);
      if (isVertical) {
        html += `<div class="tx-slider-fill" style="bottom:${startPct}%;height:${endPct - startPct}%"></div>`;
      } else {
        html += `<div class="tx-slider-fill" style="left:${startPct}%;width:${endPct - startPct}%"></div>`;
      }
    } else {
      const valPct = pct(value);
      if (isVertical) {
        html += `<div class="tx-slider-fill" style="bottom:0;height:${valPct}%"></div>`;
      } else {
        html += `<div class="tx-slider-fill" style="left:0;width:${valPct}%"></div>`;
      }
    }

    // Marks
    const markKeys = Object.keys(marks).map(Number);
    if (markKeys.length > 0) {
      html += '<div class="tx-slider-marks">';
      for (const mk of markKeys) {
        const mkPct = pct(mk);
        const prop = isVertical ? 'bottom' : 'left';
        html += `<div class="tx-slider-mark" style="${prop}:${mkPct}%">`;
        html += '<div class="tx-slider-mark-tick"></div>';
        html += `<div class="tx-slider-mark-label">${esc(marks[mk])}</div>`;
        html += '</div>';
      }
      html += '</div>';
    }

    // Thumbs
    if (isRange) {
      const startPct = pct(values[0]);
      const endPct = pct(values[1]);
      const prop = isVertical ? 'bottom' : 'left';
      html += `<div class="tx-slider-thumb tx-slider-thumb-start" data-thumb="start" style="${prop}:${startPct}%">`;
      if (showTooltip) html += `<div class="tx-slider-tooltip">${values[0]}</div>`;
      html += '</div>';
      html += `<div class="tx-slider-thumb tx-slider-thumb-end" data-thumb="end" style="${prop}:${endPct}%">`;
      if (showTooltip) html += `<div class="tx-slider-tooltip">${values[1]}</div>`;
      html += '</div>';
    } else {
      const valPct = pct(value);
      const prop = isVertical ? 'bottom' : 'left';
      html += `<div class="tx-slider-thumb" data-thumb="single" style="${prop}:${valPct}%">`;
      if (showTooltip) html += `<div class="tx-slider-tooltip">${value}</div>`;
      html += '</div>';
    }

    html += '</div>'; // track

    // Optional number input
    if (showInput) {
      html += '<div class="tx-slider-input-wrap">';
      if (isRange) {
        html += `<input type="number" class="tx-input tx-input-sm tx-slider-input" data-input="start" min="${min}" max="${max}" step="${step}" value="${values[0]}">`;
        html += '<span class="tx-slider-input-sep">-</span>';
        html += `<input type="number" class="tx-input tx-input-sm tx-slider-input" data-input="end" min="${min}" max="${max}" step="${step}" value="${values[1]}">`;
      } else {
        html += `<input type="number" class="tx-input tx-input-sm tx-slider-input" data-input="single" min="${min}" max="${max}" step="${step}" value="${value}">`;
      }
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
    bindEvents();
  }

  function fireChange(): void {
    const val = isRange ? ([...values] as [number, number]) : value;
    options.onChange?.(val);
    emit('slider:change', { id, value: val });
  }

  function bindEvents(): void {
    const container = el.querySelector(`#${id}`) as HTMLElement;
    if (!container) return;
    const track = container.querySelector('.tx-slider-track') as HTMLElement;
    const thumbs = container.querySelectorAll('.tx-slider-thumb');

    let dragging: string | null = null;

    function getValueFromEvent(e: MouseEvent | TouchEvent): number {
      // Always query the current (live) track element for accurate coordinates
      const liveTrack = el.querySelector(`#${id} .tx-slider-track`) as HTMLElement;
      const rect = (liveTrack || track).getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      let ratio: number;
      if (isVertical) {
        ratio = 1 - (clientY - rect.top) / rect.height;
      } else {
        ratio = (clientX - rect.left) / rect.width;
      }
      ratio = clamp(ratio, 0, 1);
      return snap(min + ratio * (max - min));
    }

    function onMove(e: MouseEvent | TouchEvent): void {
      if (!dragging) return;
      const newVal = getValueFromEvent(e);
      if (isRange) {
        if (dragging === 'start') {
          values[0] = Math.min(newVal, values[1]);
        } else {
          values[1] = Math.max(newVal, values[0]);
        }
      } else {
        value = newVal;
      }
      updateVisuals();
      fireChange();
    }

    function onUp(): void {
      dragging = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    thumbs.forEach((thumb) => {
      const thumbType = (thumb as HTMLElement).getAttribute('data-thumb') || 'single';
      thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        dragging = thumbType;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
      thumb.addEventListener(
        'touchstart',
        (e) => {
          dragging = thumbType;
          document.addEventListener('touchmove', onMove, { passive: true });
          document.addEventListener('touchend', onUp);
        },
        { passive: true },
      );
    });

    // Click on track
    track.addEventListener('mousedown', (e) => {
      if (dragging) return;
      const newVal = getValueFromEvent(e);
      if (isRange) {
        const distStart = Math.abs(newVal - values[0]);
        const distEnd = Math.abs(newVal - values[1]);
        if (distStart <= distEnd) {
          values[0] = Math.min(newVal, values[1]);
          dragging = 'start';
        } else {
          values[1] = Math.max(newVal, values[0]);
          dragging = 'end';
        }
      } else {
        value = newVal;
        dragging = 'single';
      }
      updateVisuals();
      fireChange();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Number input sync
    if (showInput) {
      container.querySelectorAll('.tx-slider-input').forEach((inp) => {
        inp.addEventListener('change', () => {
          const inputEl = inp as HTMLInputElement;
          const inputType = inputEl.getAttribute('data-input');
          const newVal = snap(parseFloat(inputEl.value) || min);
          if (isRange) {
            if (inputType === 'start') values[0] = Math.min(newVal, values[1]);
            else values[1] = Math.max(newVal, values[0]);
          } else {
            value = newVal;
          }
          updateVisuals();
          fireChange();
        });
      });
    }
  }

  render();

  const instance: SliderInstance = {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    getValue() {
      return isRange ? ([...values] as [number, number]) : value;
    },
    setValue(val: number | [number, number]) {
      if (isRange && Array.isArray(val)) {
        values = [snap(val[0]), snap(val[1])];
      } else if (!isRange && typeof val === 'number') {
        value = snap(val);
      }
      render();
    },
  };

  return instance;
}

registerWidget('slider', (el, opts) => slider(el, opts as unknown as SliderOptions));
export default slider;
