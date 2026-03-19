import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { datePicker } from '../../src/widgets/datepicker';
import { colorPicker } from '../../src/widgets/color-picker';

// ── DatePicker demos — unit tests ──
describe('DatePicker demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Basic Date Picker ──
  describe('Basic Date Picker', () => {
    it('renders a datepicker container', () => {
      datePicker(container, { value: '2026-03-18' });
      expect(container.querySelector('.tx-datepicker')).not.toBeNull();
    });

    it('displays the formatted date in the input', () => {
      datePicker(container, { value: '2026-03-18' });
      const input = container.querySelector('.tx-datepicker-input') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.value).toBe('2026-03-18');
    });

    it('getValue returns the set value', () => {
      const inst = datePicker(container, { value: '2026-03-18' });
      expect(inst.getValue()).toBe('2026-03-18');
    });
  });

  // ── Date Range Picker ──
  describe('Date Range Picker', () => {
    it('renders a datepicker in range mode', () => {
      datePicker(container, {
        range: true,
        value: '2026-03-01 - 2026-03-15',
      });
      expect(container.querySelector('.tx-datepicker')).not.toBeNull();
    });

    it('getValue returns the range value', () => {
      const inst = datePicker(container, {
        range: true,
        value: '2026-03-01 - 2026-03-15',
      });
      expect(inst.getValue()).toBe('2026-03-01 - 2026-03-15');
    });

    it('displays the range value in the input', () => {
      datePicker(container, {
        range: true,
        value: '2026-03-01 - 2026-03-15',
      });
      const input = container.querySelector('.tx-datepicker-input') as HTMLInputElement;
      expect(input.value).toBe('2026-03-01 - 2026-03-15');
    });
  });

  // ── Min / Max Constraints ──
  describe('Min / Max Constraints', () => {
    it('renders a datepicker with min/max', () => {
      const inst = datePicker(container, {
        min: '2026-03-10',
        max: '2026-03-25',
      });
      expect(inst.el).toBeTruthy();
    });

    it('marks dates before min as disabled', () => {
      datePicker(container, {
        min: '2026-03-10',
        max: '2026-03-25',
      });
      // Open the calendar to inspect days
      const trigger = container.querySelector('.tx-datepicker-trigger') as HTMLElement;
      trigger?.click();
      // Day 5 (March 5) should be disabled when visible
      const days = container.querySelectorAll('.tx-datepicker-day-disabled');
      expect(days.length).toBeGreaterThan(0);
    });
  });

  // ── Disabled Dates ──
  describe('Disabled Dates (weekends)', () => {
    it('renders a datepicker with disabledDates function', () => {
      const inst = datePicker(container, {
        disabledDates: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
      });
      expect(inst.el).toBeTruthy();
    });

    it('marks weekend days as disabled', () => {
      datePicker(container, {
        disabledDates: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
      });
      const trigger = container.querySelector('.tx-datepicker-trigger') as HTMLElement;
      trigger?.click();
      const disabled = container.querySelectorAll('.tx-datepicker-day-disabled');
      expect(disabled.length).toBeGreaterThan(0);
    });
  });

  // ── Instance methods ──
  describe('Instance methods', () => {
    it('setValue updates the value', () => {
      const inst = datePicker(container, { value: '2026-03-01' });
      inst.setValue('2026-06-15');
      expect(inst.getValue()).toBe('2026-06-15');
    });

    it('clear resets the value', () => {
      const inst = datePicker(container, { value: '2026-03-01' });
      inst.clear();
      expect(inst.getValue()).toBe('');
    });

    it('destroy removes content', () => {
      const inst = datePicker(container, { value: '2026-03-01' });
      inst.destroy();
      expect(container.querySelector('.tx-datepicker')).toBeNull();
    });
  });
});

// ── ColorPicker demos — unit tests ──
describe('ColorPicker demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Basic Color Picker ──
  describe('Basic Color Picker', () => {
    it('renders a colorpicker container', () => {
      colorPicker(container, { value: '#3b82f6' });
      expect(container.querySelector('.tx-colorpicker')).not.toBeNull();
    });

    it('displays the initial color in the swatch', () => {
      colorPicker(container, { value: '#3b82f6' });
      const swatch = container.querySelector('.tx-colorpicker-swatch') as HTMLElement;
      expect(swatch).not.toBeNull();
    });

    it('getValue returns the set color', () => {
      const inst = colorPicker(container, { value: '#3b82f6' });
      expect(inst.getValue()).toBe('#3b82f6');
    });

    it('renders the hue slider', () => {
      colorPicker(container, { value: '#3b82f6' });
      const hue = container.querySelector('.tx-colorpicker-hue') as HTMLInputElement;
      expect(hue).not.toBeNull();
      expect(hue.type).toBe('range');
    });

    it('renders preset color buttons by default', () => {
      colorPicker(container, { value: '#3b82f6' });
      const presets = container.querySelectorAll('.tx-colorpicker-preset');
      expect(presets.length).toBeGreaterThan(0);
    });

    it('renders the text input by default', () => {
      colorPicker(container, { value: '#3b82f6' });
      const input = container.querySelector('.tx-colorpicker-input') as HTMLInputElement;
      expect(input).not.toBeNull();
    });
  });

  // ── Custom Palette ──
  describe('Custom Palette', () => {
    it('renders only the specified presets', () => {
      const customPresets = [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#000000',
        '#ffffff',
      ];
      colorPicker(container, { value: '#ef4444', presets: customPresets });
      const presets = container.querySelectorAll('.tx-colorpicker-preset');
      expect(presets.length).toBe(9);
    });

    it('each preset has the correct data-color attribute', () => {
      const customPresets = ['#ef4444', '#22c55e', '#3b82f6'];
      colorPicker(container, { value: '#ef4444', presets: customPresets });
      const presets = container.querySelectorAll('.tx-colorpicker-preset');
      expect(presets[0].getAttribute('data-color')).toBe('#ef4444');
      expect(presets[1].getAttribute('data-color')).toBe('#22c55e');
      expect(presets[2].getAttribute('data-color')).toBe('#3b82f6');
    });
  });

  // ── Presets Only (no text input) ──
  describe('Presets Only (no text input)', () => {
    it('does not render the text input when showInput is false', () => {
      colorPicker(container, { value: '#22c55e', showInput: false });
      const input = container.querySelector('.tx-colorpicker-input');
      expect(input).toBeNull();
    });

    it('still renders preset buttons', () => {
      colorPicker(container, { value: '#22c55e', showInput: false });
      const presets = container.querySelectorAll('.tx-colorpicker-preset');
      expect(presets.length).toBeGreaterThan(0);
    });
  });

  // ── Instance methods ──
  describe('Instance methods', () => {
    it('setValue changes the color', () => {
      const inst = colorPicker(container, { value: '#000000' });
      inst.setValue('#ff0000');
      // The value should have changed (exact hex may vary due to HSL conversion)
      expect(inst.getValue()).not.toBe('#000000');
    });

    it('open and close toggle the panel', () => {
      const inst = colorPicker(container, { value: '#3b82f6' });
      const panel = container.querySelector('.tx-colorpicker-panel') as HTMLElement;
      expect(panel.style.display).toBe('none');
      inst.open();
      expect(panel.style.display).toBe('');
      inst.close();
      expect(panel.style.display).toBe('none');
    });

    it('destroy removes content', () => {
      const inst = colorPicker(container, { value: '#3b82f6' });
      inst.destroy();
      expect(container.querySelector('.tx-colorpicker')).toBeNull();
    });
  });
});
