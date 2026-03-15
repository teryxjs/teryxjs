// ============================================================
// Teryx — Color Picker Widget (Sencha-style)
// ============================================================

import type { WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export interface ColorPickerOptions {
  value?: string;
  format?: 'hex' | 'rgb' | 'hsl';
  presets?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  class?: string;
  id?: string;
  onChange?: (color: string) => void;
}

export interface ColorPickerInstance extends WidgetInstance {
  getValue(): string;
  setValue(color: string): void;
  open(): void;
  close(): void;
}

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
];

export function colorPicker(target: string | HTMLElement, options: ColorPickerOptions = {}): ColorPickerInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-colorpicker');
  const format = options.format || 'hex';
  const presets = options.presets || DEFAULT_PRESETS;
  const showInput = options.showInput !== false;
  const showPresets = options.showPresets !== false;
  let currentColor = options.value || '#3b82f6';
  let isOpen = false;
  let hue = 0, sat = 100, light = 50;

  // Parse initial color
  parseColor(currentColor);

  // Build HTML
  let html = `<div class="${cls('tx-colorpicker', options.class)}" id="${esc(id)}">`;

  // Trigger button
  html += `<button class="tx-colorpicker-trigger" type="button">`;
  html += `<span class="tx-colorpicker-swatch" style="background:${esc(currentColor)}"></span>`;
  html += `<span class="tx-colorpicker-value">${esc(currentColor)}</span>`;
  html += `${icon('chevronDown')}`;
  html += `</button>`;

  // Dropdown panel
  html += `<div class="tx-colorpicker-panel" style="display:none">`;

  // Saturation/Lightness picker
  html += `<div class="tx-colorpicker-saturation" style="background:hsl(${hue},100%,50%)">`;
  html += `<div class="tx-colorpicker-saturation-white"></div>`;
  html += `<div class="tx-colorpicker-saturation-black"></div>`;
  html += `<div class="tx-colorpicker-cursor" style="left:${sat}%;top:${100 - light}%"></div>`;
  html += `</div>`;

  // Hue slider
  html += `<div class="tx-colorpicker-hue-wrap">`;
  html += `<input type="range" class="tx-colorpicker-hue" min="0" max="360" value="${hue}">`;
  html += `</div>`;

  // Presets
  if (showPresets) {
    html += `<div class="tx-colorpicker-presets">`;
    for (const color of presets) {
      html += `<button class="tx-colorpicker-preset" data-color="${esc(color)}" style="background:${esc(color)}" title="${esc(color)}"></button>`;
    }
    html += `</div>`;
  }

  // Input
  if (showInput) {
    html += `<div class="tx-colorpicker-input-wrap">`;
    html += `<input type="text" class="tx-input tx-input-sm tx-colorpicker-input" value="${esc(currentColor)}">`;
    html += `</div>`;
  }

  html += `</div>`; // panel
  html += `</div>`; // colorpicker

  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;
  const trigger = container.querySelector('.tx-colorpicker-trigger') as HTMLElement;
  const panel = container.querySelector('.tx-colorpicker-panel') as HTMLElement;
  const swatch = container.querySelector('.tx-colorpicker-swatch') as HTMLElement;
  const valueLabel = container.querySelector('.tx-colorpicker-value') as HTMLElement;
  const satBox = container.querySelector('.tx-colorpicker-saturation') as HTMLElement;
  const cursor = container.querySelector('.tx-colorpicker-cursor') as HTMLElement;
  const hueSlider = container.querySelector('.tx-colorpicker-hue') as HTMLInputElement;
  const colorInput = container.querySelector('.tx-colorpicker-input') as HTMLInputElement;

  function parseColor(hex: string): void {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    light = ((max + min) / 2) * 100;
    if (max === min) { hue = 0; sat = 0; }
    else {
      const d = max - min;
      sat = light > 50 ? (d / (2 - max - min)) * 100 : (d / (max + min)) * 100;
      if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) hue = ((b - r) / d + 2) * 60;
      else hue = ((r - g) / d + 4) * 60;
    }
  }

  function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function updateColor(): void {
    currentColor = hslToHex(hue, sat, light);
    swatch.style.background = currentColor;
    valueLabel.textContent = currentColor;
    satBox.style.background = `hsl(${hue},100%,50%)`;
    cursor.style.left = `${sat}%`;
    cursor.style.top = `${100 - light}%`;
    if (colorInput) colorInput.value = currentColor;
    options.onChange?.(currentColor);
    emit('colorpicker:change', { id, color: currentColor });
  }

  // Toggle panel
  trigger.addEventListener('click', () => { isOpen ? instance.close() : instance.open(); });

  // Hue slider
  hueSlider?.addEventListener('input', () => {
    hue = parseInt(hueSlider.value, 10);
    updateColor();
  });

  // Saturation/lightness picker
  let dragging = false;
  function pickSatLight(e: MouseEvent | TouchEvent): void {
    const rect = satBox.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    sat = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    light = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
    updateColor();
  }

  satBox.addEventListener('mousedown', (e) => { dragging = true; pickSatLight(e); });
  satBox.addEventListener('touchstart', (e) => { dragging = true; pickSatLight(e); }, { passive: true });
  document.addEventListener('mousemove', (e) => { if (dragging) pickSatLight(e); });
  document.addEventListener('touchmove', (e) => { if (dragging) pickSatLight(e); }, { passive: true });
  document.addEventListener('mouseup', () => { dragging = false; });
  document.addEventListener('touchend', () => { dragging = false; });

  // Preset clicks
  container.querySelectorAll('.tx-colorpicker-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color')!;
      parseColor(color);
      hueSlider.value = String(Math.round(hue));
      updateColor();
    });
  });

  // Manual input
  colorInput?.addEventListener('change', () => {
    const val = colorInput.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      parseColor(val);
      hueSlider.value = String(Math.round(hue));
      updateColor();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !container.contains(e.target as Node)) instance.close();
  });

  const instance: ColorPickerInstance = {
    el: container,
    destroy() { el.innerHTML = ''; },
    getValue() { return currentColor; },
    setValue(color: string) {
      parseColor(color);
      hueSlider.value = String(Math.round(hue));
      updateColor();
    },
    open() {
      panel.style.display = '';
      isOpen = true;
    },
    close() {
      panel.style.display = 'none';
      isOpen = false;
    },
  };

  return instance;
}

registerWidget('colorpicker', (el, opts) => colorPicker(el, opts as unknown as ColorPickerOptions));
export default colorPicker;
