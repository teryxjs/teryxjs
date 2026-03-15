// ============================================================
// Teryx — Chart Widget (Pure SVG)
// ============================================================

import type { WidgetInstance } from '../types';
import { uid, esc, cls, resolveTarget } from '../utils';
import { registerWidget } from '../core';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

interface ChartDataPoint { x: string | number; y: number; label?: string; color?: string; }
interface ChartSeries { name: string; data: ChartDataPoint[]; color?: string; type?: ChartType; }
type ChartType = 'bar' | 'horizontalBar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' | 'gauge';

interface ChartAxis {
  title?: string;
  min?: number;
  max?: number;
  tickCount?: number;
  format?: (v: number) => string;
}

interface ChartLegend {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface ChartTooltip {
  show?: boolean;
  format?: (point: ChartDataPoint, series: ChartSeries) => string;
}

interface ChartOptions {
  type: ChartType;
  series?: ChartSeries[];
  data?: ChartDataPoint[];
  source?: string;
  width?: number;
  height?: number;
  title?: string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
  colors?: string[];
  stacked?: boolean;
  gaugeMin?: number;
  gaugeMax?: number;
  gaugeValue?: number;
  gaugeLabel?: string;
  donutWidth?: number;
  barGap?: number;
  class?: string;
  id?: string;
  animated?: boolean;
}

interface ChartInstance extends WidgetInstance {
  update(options: Partial<ChartOptions>): void;
}

// ----------------------------------------------------------
//  Default palette — CSS variable references
// ----------------------------------------------------------

const DEFAULT_COLORS = [
  'var(--tx-primary, #3b82f6)',
  'var(--tx-success, #22c55e)',
  'var(--tx-warning, #f59e0b)',
  'var(--tx-danger, #ef4444)',
  'var(--tx-info, #06b6d4)',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
];

// ----------------------------------------------------------
//  Geometry helpers
// ----------------------------------------------------------

const PAD = { top: 40, right: 20, bottom: 50, left: 60 };
const LEGEND_H = 30;

function niceScale(min: number, max: number, ticks: number): { min: number; max: number; step: number } {
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  const rawStep = range / Math.max(ticks - 1, 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / mag;
  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * mag;
  else if (residual <= 3) niceStep = 2 * mag;
  else if (residual <= 7) niceStep = 5 * mag;
  else niceStep = 10 * mag;

  const nMin = Math.floor(min / niceStep) * niceStep;
  const nMax = Math.ceil(max / niceStep) * niceStep;
  return { min: nMin, max: nMax, step: niceStep };
}

function polarToXY(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToXY(cx, cy, r, endAngle);
  const end = polarToXY(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

function fmtNum(n: number): string {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function escSvg(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ----------------------------------------------------------
//  Tooltip helpers
// ----------------------------------------------------------

function tooltipGroup(): string {
  return `<g class="tx-chart-tooltip" visibility="hidden">` +
    `<rect class="tx-chart-tooltip-bg" rx="4" ry="4" fill="rgba(0,0,0,.8)" />` +
    `<text class="tx-chart-tooltip-text" fill="#fff" font-size="12" dominant-baseline="middle" />` +
    `</g>`;
}

// ----------------------------------------------------------
//  Chart renderer
// ----------------------------------------------------------

function buildSeries(opts: ChartOptions): ChartSeries[] {
  if (opts.series?.length) return opts.series;
  if (opts.data?.length) return [{ name: 'Data', data: opts.data }];
  return [];
}

function getColor(idx: number, colors: string[]): string {
  return colors[idx % colors.length];
}

// ----------------------------------------------------------
//  Axes renderer (shared by cartesian charts)
// ----------------------------------------------------------

function renderAxes(
  w: number, h: number,
  categories: string[],
  scale: { min: number; max: number; step: number },
  xTitle: string | undefined,
  yTitle: string | undefined,
  yFmt: (v: number) => string,
  horizontal: boolean,
): string {
  const plotW = w - PAD.left - PAD.right;
  const plotH = h - PAD.top - PAD.bottom;
  let svg = '';

  // Grid lines and Y-axis ticks
  const yTicks: number[] = [];
  for (let v = scale.min; v <= scale.max + scale.step * 0.001; v += scale.step) {
    yTicks.push(v);
  }

  if (!horizontal) {
    // Standard cartesian: Y axis is value axis, X axis is category
    for (const v of yTicks) {
      const ratio = (v - scale.min) / (scale.max - scale.min || 1);
      const y = PAD.top + plotH - ratio * plotH;
      svg += `<line x1="${PAD.left}" y1="${y}" x2="${w - PAD.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
      svg += `<text x="${PAD.left - 8}" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">${escSvg(yFmt(v))}</text>`;
    }
    // X-axis line
    svg += `<line x1="${PAD.left}" y1="${PAD.top + plotH}" x2="${w - PAD.right}" y2="${PAD.top + plotH}" stroke="#d1d5db" stroke-width="1" />`;
    // Y-axis line
    svg += `<line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + plotH}" stroke="#d1d5db" stroke-width="1" />`;

    // X category labels
    const step = categories.length > 0 ? plotW / categories.length : plotW;
    for (let i = 0; i < categories.length; i++) {
      const x = PAD.left + step * i + step / 2;
      const label = categories[i].length > 12 ? categories[i].slice(0, 11) + '\u2026' : categories[i];
      svg += `<text x="${x}" y="${PAD.top + plotH + 18}" text-anchor="middle" font-size="11" fill="#6b7280">${escSvg(label)}</text>`;
    }
  } else {
    // Horizontal bar: X axis is value axis, Y axis is category
    for (const v of yTicks) {
      const ratio = (v - scale.min) / (scale.max - scale.min || 1);
      const x = PAD.left + ratio * plotW;
      svg += `<line x1="${x}" y1="${PAD.top}" x2="${x}" y2="${PAD.top + plotH}" stroke="#e5e7eb" stroke-width="1" />`;
      svg += `<text x="${x}" y="${PAD.top + plotH + 18}" text-anchor="middle" font-size="11" fill="#6b7280">${escSvg(yFmt(v))}</text>`;
    }
    // Axes lines
    svg += `<line x1="${PAD.left}" y1="${PAD.top + plotH}" x2="${w - PAD.right}" y2="${PAD.top + plotH}" stroke="#d1d5db" stroke-width="1" />`;
    svg += `<line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + plotH}" stroke="#d1d5db" stroke-width="1" />`;

    // Y category labels
    const step = categories.length > 0 ? plotH / categories.length : plotH;
    for (let i = 0; i < categories.length; i++) {
      const y = PAD.top + step * i + step / 2;
      const label = categories[i].length > 10 ? categories[i].slice(0, 9) + '\u2026' : categories[i];
      svg += `<text x="${PAD.left - 8}" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">${escSvg(label)}</text>`;
    }
  }

  // Axis titles
  if (xTitle) {
    svg += `<text x="${PAD.left + plotW / 2}" y="${h - 6}" text-anchor="middle" font-size="12" fill="#374151">${escSvg(xTitle)}</text>`;
  }
  if (yTitle) {
    svg += `<text x="14" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="12" fill="#374151" transform="rotate(-90,14,${PAD.top + plotH / 2})">${escSvg(yTitle)}</text>`;
  }

  return svg;
}

// ----------------------------------------------------------
//  Legend renderer
// ----------------------------------------------------------

function renderLegend(
  series: ChartSeries[], colors: string[], w: number, h: number, pos: string,
): string {
  let svg = '';
  const count = series.length;
  if (count < 2 && series[0]?.data.every(d => !d.label)) return '';

  // Use data point labels for pie/donut, series names otherwise
  const entries: { name: string; color: string }[] = [];
  if (series.length === 1 && series[0].data.some(d => d.label)) {
    series[0].data.forEach((d, i) => entries.push({ name: d.label || String(d.x), color: d.color || getColor(i, colors) }));
  } else {
    series.forEach((s, i) => entries.push({ name: s.name, color: s.color || getColor(i, colors) }));
  }

  const itemW = 100;
  const totalW = entries.length * itemW;
  const startX = (w - Math.min(totalW, w - 20)) / 2;
  const y = pos === 'top' ? 16 : h - 8;

  entries.forEach((entry, i) => {
    const x = startX + (i % Math.floor((w - 20) / itemW)) * itemW;
    const row = Math.floor(i / Math.floor((w - 20) / itemW));
    const yOff = y + row * 18;
    svg += `<rect x="${x}" y="${yOff - 5}" width="12" height="12" rx="2" fill="${entry.color}" />`;
    const label = entry.name.length > 12 ? entry.name.slice(0, 11) + '\u2026' : entry.name;
    svg += `<text x="${x + 16}" y="${yOff + 4}" font-size="11" fill="#374151" dominant-baseline="middle">${escSvg(label)}</text>`;
  });

  return svg;
}

// ----------------------------------------------------------
//  Bar chart
// ----------------------------------------------------------

function renderBarChart(series: ChartSeries[], opts: ChartOptions, w: number, h: number, colors: string[]): string {
  const categories = series[0]?.data.map(d => String(d.x)) || [];
  const allValues = series.flatMap(s => s.data.map(d => d.y));
  const yMin = opts.yAxis?.min ?? Math.min(0, ...allValues);
  const yMax = opts.yAxis?.max ?? Math.max(...allValues);
  const scale = niceScale(yMin, yMax, opts.yAxis?.tickCount || 6);
  const yFmt = opts.yAxis?.format || fmtNum;

  let svg = renderAxes(w, h, categories, scale, opts.xAxis?.title, opts.yAxis?.title, yFmt, false);

  const plotW = w - PAD.left - PAD.right;
  const plotH = h - PAD.top - PAD.bottom;
  const catW = plotW / (categories.length || 1);
  const gap = opts.barGap ?? 0.2;
  const groupW = catW * (1 - gap);
  const barW = groupW / series.length;
  const zeroY = PAD.top + plotH - ((0 - scale.min) / (scale.max - scale.min || 1)) * plotH;

  for (let si = 0; si < series.length; si++) {
    const s = series[si];
    const color = s.color || getColor(si, colors);
    for (let di = 0; di < s.data.length; di++) {
      const d = s.data[di];
      const barColor = d.color || color;
      const ratio = (d.y - scale.min) / (scale.max - scale.min || 1);
      const barH = ratio * plotH;
      const x = PAD.left + catW * di + (catW - groupW) / 2 + barW * si;
      const barTop = PAD.top + plotH - barH;
      const rectY = d.y >= 0 ? barTop : zeroY;
      const rectH = d.y >= 0 ? zeroY - barTop : barTop - zeroY;

      const tip = `${s.name}: ${d.x} = ${yFmt(d.y)}`;
      svg += `<rect x="${x}" y="${rectY}" width="${Math.max(barW - 1, 1)}" height="${Math.max(Math.abs(rectH), 0)}" fill="${barColor}" rx="2" class="tx-chart-bar">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</rect>`;
    }
  }

  svg += tooltipGroup();
  return svg;
}

// ----------------------------------------------------------
//  Horizontal bar chart
// ----------------------------------------------------------

function renderHorizontalBarChart(series: ChartSeries[], opts: ChartOptions, w: number, h: number, colors: string[]): string {
  const categories = series[0]?.data.map(d => String(d.x)) || [];
  const allValues = series.flatMap(s => s.data.map(d => d.y));
  const xMin = opts.yAxis?.min ?? Math.min(0, ...allValues);
  const xMax = opts.yAxis?.max ?? Math.max(...allValues);
  const scale = niceScale(xMin, xMax, opts.yAxis?.tickCount || 6);
  const yFmt = opts.yAxis?.format || fmtNum;

  let svg = renderAxes(w, h, categories, scale, opts.xAxis?.title, opts.yAxis?.title, yFmt, true);

  const plotW = w - PAD.left - PAD.right;
  const plotH = h - PAD.top - PAD.bottom;
  const catH = plotH / (categories.length || 1);
  const gap = opts.barGap ?? 0.2;
  const groupH = catH * (1 - gap);
  const barH = groupH / series.length;

  for (let si = 0; si < series.length; si++) {
    const s = series[si];
    const color = s.color || getColor(si, colors);
    for (let di = 0; di < s.data.length; di++) {
      const d = s.data[di];
      const barColor = d.color || color;
      const ratio = (d.y - scale.min) / (scale.max - scale.min || 1);
      const barW = ratio * plotW;
      const y = PAD.top + catH * di + (catH - groupH) / 2 + barH * si;
      const x = PAD.left;

      const tip = `${s.name}: ${d.x} = ${yFmt(d.y)}`;
      svg += `<rect x="${x}" y="${y}" width="${Math.max(barW, 0)}" height="${Math.max(barH - 1, 1)}" fill="${barColor}" rx="2" class="tx-chart-bar">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</rect>`;
    }
  }

  svg += tooltipGroup();
  return svg;
}

// ----------------------------------------------------------
//  Line chart
// ----------------------------------------------------------

function renderLineChart(series: ChartSeries[], opts: ChartOptions, w: number, h: number, colors: string[]): string {
  const categories = series[0]?.data.map(d => String(d.x)) || [];
  const allValues = series.flatMap(s => s.data.map(d => d.y));
  const yMin = opts.yAxis?.min ?? Math.min(...allValues);
  const yMax = opts.yAxis?.max ?? Math.max(...allValues);
  const scale = niceScale(yMin, yMax, opts.yAxis?.tickCount || 6);
  const yFmt = opts.yAxis?.format || fmtNum;

  let svg = renderAxes(w, h, categories, scale, opts.xAxis?.title, opts.yAxis?.title, yFmt, false);

  const plotW = w - PAD.left - PAD.right;
  const plotH = h - PAD.top - PAD.bottom;
  const catW = categories.length > 1 ? plotW / (categories.length - 1) : plotW;

  for (let si = 0; si < series.length; si++) {
    const s = series[si];
    const color = s.color || getColor(si, colors);
    const points: { px: number; py: number; d: ChartDataPoint }[] = [];

    for (let di = 0; di < s.data.length; di++) {
      const d = s.data[di];
      const px = categories.length > 1
        ? PAD.left + catW * di
        : PAD.left + plotW / 2;
      const ratio = (d.y - scale.min) / (scale.max - scale.min || 1);
      const py = PAD.top + plotH - ratio * plotH;
      points.push({ px, py, d });
    }

    // Path
    if (points.length > 0) {
      let path = `M ${points[0].px} ${points[0].py}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].px} ${points[i].py}`;
      }
      svg += `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="tx-chart-line" />`;
    }

    // Dots with tooltips
    for (const p of points) {
      const tip = `${s.name}: ${p.d.x} = ${yFmt(p.d.y)}`;
      svg += `<circle cx="${p.px}" cy="${p.py}" r="4" fill="${color}" stroke="#fff" stroke-width="2" class="tx-chart-dot">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</circle>`;
    }
  }

  svg += tooltipGroup();
  return svg;
}

// ----------------------------------------------------------
//  Area chart
// ----------------------------------------------------------

function renderAreaChart(series: ChartSeries[], opts: ChartOptions, w: number, h: number, colors: string[]): string {
  const categories = series[0]?.data.map(d => String(d.x)) || [];
  const allValues = series.flatMap(s => s.data.map(d => d.y));
  const yMin = opts.yAxis?.min ?? Math.min(0, ...allValues);
  const yMax = opts.yAxis?.max ?? Math.max(...allValues);
  const scale = niceScale(yMin, yMax, opts.yAxis?.tickCount || 6);
  const yFmt = opts.yAxis?.format || fmtNum;

  let svg = renderAxes(w, h, categories, scale, opts.xAxis?.title, opts.yAxis?.title, yFmt, false);

  const plotW = w - PAD.left - PAD.right;
  const plotH = h - PAD.top - PAD.bottom;
  const catW = categories.length > 1 ? plotW / (categories.length - 1) : plotW;
  const baseY = PAD.top + plotH;

  for (let si = 0; si < series.length; si++) {
    const s = series[si];
    const color = s.color || getColor(si, colors);
    const points: { px: number; py: number; d: ChartDataPoint }[] = [];

    for (let di = 0; di < s.data.length; di++) {
      const d = s.data[di];
      const px = categories.length > 1
        ? PAD.left + catW * di
        : PAD.left + plotW / 2;
      const ratio = (d.y - scale.min) / (scale.max - scale.min || 1);
      const py = PAD.top + plotH - ratio * plotH;
      points.push({ px, py, d });
    }

    // Filled area
    if (points.length > 0) {
      let areaPath = `M ${points[0].px} ${baseY}`;
      areaPath += ` L ${points[0].px} ${points[0].py}`;
      for (let i = 1; i < points.length; i++) {
        areaPath += ` L ${points[i].px} ${points[i].py}`;
      }
      areaPath += ` L ${points[points.length - 1].px} ${baseY} Z`;

      svg += `<path d="${areaPath}" fill="${color}" fill-opacity="0.15" class="tx-chart-area" />`;

      // Line on top
      let linePath = `M ${points[0].px} ${points[0].py}`;
      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].px} ${points[i].py}`;
      }
      svg += `<path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tx-chart-line" />`;
    }

    // Dots
    for (const p of points) {
      const tip = `${s.name}: ${p.d.x} = ${yFmt(p.d.y)}`;
      svg += `<circle cx="${p.px}" cy="${p.py}" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.5" class="tx-chart-dot">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</circle>`;
    }
  }

  svg += tooltipGroup();
  return svg;
}

// ----------------------------------------------------------
//  Scatter chart
// ----------------------------------------------------------

function renderScatterChart(series: ChartSeries[], opts: ChartOptions, w: number, h: number, colors: string[]): string {
  const allXNumeric = series.every(s => s.data.every(d => typeof d.x === 'number'));
  const allX = series.flatMap(s => s.data.map(d => Number(d.x)));
  const allY = series.flatMap(s => s.data.map(d => d.y));

  const xMin = opts.xAxis?.min ?? Math.min(...allX);
  const xMax = opts.xAxis?.max ?? Math.max(...allX);
  const yMin = opts.yAxis?.min ?? Math.min(...allY);
  const yMax = opts.yAxis?.max ?? Math.max(...allY);
  const xScale = niceScale(xMin, xMax, opts.xAxis?.tickCount || 6);
  const yScale = niceScale(yMin, yMax, opts.yAxis?.tickCount || 6);
  const yFmt = opts.yAxis?.format || fmtNum;
  const xFmt = opts.xAxis?.format || fmtNum;

  const plotW = w - PAD.left - PAD.right;
  const plotH = h - PAD.top - PAD.bottom;

  let svg = '';

  // Grid — Y axis ticks
  for (let v = yScale.min; v <= yScale.max + yScale.step * 0.001; v += yScale.step) {
    const ratio = (v - yScale.min) / (yScale.max - yScale.min || 1);
    const y = PAD.top + plotH - ratio * plotH;
    svg += `<line x1="${PAD.left}" y1="${y}" x2="${w - PAD.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    svg += `<text x="${PAD.left - 8}" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">${escSvg(yFmt(v))}</text>`;
  }

  // Grid — X axis ticks
  for (let v = xScale.min; v <= xScale.max + xScale.step * 0.001; v += xScale.step) {
    const ratio = (v - xScale.min) / (xScale.max - xScale.min || 1);
    const x = PAD.left + ratio * plotW;
    svg += `<line x1="${x}" y1="${PAD.top}" x2="${x}" y2="${PAD.top + plotH}" stroke="#e5e7eb" stroke-width="1" />`;
    svg += `<text x="${x}" y="${PAD.top + plotH + 18}" text-anchor="middle" font-size="11" fill="#6b7280">${escSvg(xFmt(v))}</text>`;
  }

  // Axes
  svg += `<line x1="${PAD.left}" y1="${PAD.top + plotH}" x2="${w - PAD.right}" y2="${PAD.top + plotH}" stroke="#d1d5db" stroke-width="1" />`;
  svg += `<line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + plotH}" stroke="#d1d5db" stroke-width="1" />`;

  // Axis titles
  if (opts.xAxis?.title) {
    svg += `<text x="${PAD.left + plotW / 2}" y="${h - 6}" text-anchor="middle" font-size="12" fill="#374151">${escSvg(opts.xAxis.title)}</text>`;
  }
  if (opts.yAxis?.title) {
    svg += `<text x="14" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="12" fill="#374151" transform="rotate(-90,14,${PAD.top + plotH / 2})">${escSvg(opts.yAxis.title)}</text>`;
  }

  // Points
  for (let si = 0; si < series.length; si++) {
    const s = series[si];
    const color = s.color || getColor(si, colors);
    for (const d of s.data) {
      const xVal = Number(d.x);
      const xRatio = (xVal - xScale.min) / (xScale.max - xScale.min || 1);
      const yRatio = (d.y - yScale.min) / (yScale.max - yScale.min || 1);
      const px = PAD.left + xRatio * plotW;
      const py = PAD.top + plotH - yRatio * plotH;

      const tip = `${s.name}: (${allXNumeric ? xFmt(xVal) : d.x}, ${yFmt(d.y)})`;
      svg += `<circle cx="${px}" cy="${py}" r="5" fill="${d.color || color}" fill-opacity="0.7" stroke="${d.color || color}" stroke-width="1.5" class="tx-chart-dot">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</circle>`;
    }
  }

  svg += tooltipGroup();
  return svg;
}

// ----------------------------------------------------------
//  Pie / Donut chart
// ----------------------------------------------------------

function renderPieChart(series: ChartSeries[], opts: ChartOptions, w: number, h: number, colors: string[], isDonut: boolean): string {
  const data = series[0]?.data || [];
  if (data.length === 0) return '';

  const total = data.reduce((sum, d) => sum + Math.abs(d.y), 0);
  if (total === 0) return '';

  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) / 2 - 40;
  const innerR = isDonut ? outerR * (1 - (opts.donutWidth ?? 0.4)) : 0;

  let svg = '';
  let startAngle = 0;

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const pct = Math.abs(d.y) / total;
    const sweep = pct * 360;
    const endAngle = startAngle + sweep;
    const color = d.color || getColor(i, colors);
    const label = d.label || String(d.x);
    const tip = `${label}: ${fmtNum(d.y)} (${(pct * 100).toFixed(1)}%)`;

    if (sweep >= 359.99) {
      // Full circle
      svg += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="${color}" class="tx-chart-slice">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</circle>`;
      if (innerR > 0) {
        svg += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#fff" />`;
      }
    } else {
      // Arc path for outer ring
      const outerStart = polarToXY(cx, cy, outerR, startAngle);
      const outerEnd = polarToXY(cx, cy, outerR, endAngle);
      const large = sweep > 180 ? 1 : 0;

      let path: string;
      if (innerR > 0) {
        const innerStart = polarToXY(cx, cy, innerR, startAngle);
        const innerEnd = polarToXY(cx, cy, innerR, endAngle);
        path = `M ${outerStart.x} ${outerStart.y}`;
        path += ` A ${outerR} ${outerR} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`;
        path += ` L ${innerEnd.x} ${innerEnd.y}`;
        path += ` A ${innerR} ${innerR} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`;
        path += ' Z';
      } else {
        path = `M ${cx} ${cy}`;
        path += ` L ${outerStart.x} ${outerStart.y}`;
        path += ` A ${outerR} ${outerR} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`;
        path += ' Z';
      }

      svg += `<path d="${path}" fill="${color}" stroke="#fff" stroke-width="2" class="tx-chart-slice">`;
      svg += `<title>${escSvg(tip)}</title>`;
      svg += `</path>`;
    }

    // Label
    const midAngle = startAngle + sweep / 2;
    const labelR = innerR > 0 ? (outerR + innerR) / 2 : outerR * 0.65;
    const labelPos = polarToXY(cx, cy, labelR, midAngle);
    if (pct > 0.04) {
      svg += `<text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#fff" font-weight="600" pointer-events="none">${(pct * 100).toFixed(0)}%</text>`;
    }

    startAngle = endAngle;
  }

  svg += tooltipGroup();
  return svg;
}

// ----------------------------------------------------------
//  Gauge chart
// ----------------------------------------------------------

function renderGaugeChart(opts: ChartOptions, w: number, h: number, colors: string[]): string {
  const gMin = opts.gaugeMin ?? 0;
  const gMax = opts.gaugeMax ?? 100;
  const value = opts.gaugeValue ?? (opts.data?.[0]?.y ?? opts.series?.[0]?.data[0]?.y ?? 0);
  const label = opts.gaugeLabel ?? opts.data?.[0]?.label ?? '';

  const cx = w / 2;
  const cy = h * 0.62;
  const outerR = Math.min(w, h) * 0.38;
  const innerR = outerR * 0.72;

  // Gauge spans 240 degrees (from -210 to 30 relative to "12 o'clock")
  const startAngle = -120;  // from left
  const totalSweep = 240;

  const ratio = Math.max(0, Math.min(1, (value - gMin) / (gMax - gMin || 1)));
  const valueAngle = startAngle + ratio * totalSweep;

  let svg = '';

  // Background arc
  const bgStart = polarToXY(cx, cy, outerR, startAngle);
  const bgEnd = polarToXY(cx, cy, outerR, startAngle + totalSweep);
  const bgInStart = polarToXY(cx, cy, innerR, startAngle);
  const bgInEnd = polarToXY(cx, cy, innerR, startAngle + totalSweep);

  let bgPath = `M ${bgStart.x} ${bgStart.y}`;
  bgPath += ` A ${outerR} ${outerR} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;
  bgPath += ` L ${bgInEnd.x} ${bgInEnd.y}`;
  bgPath += ` A ${innerR} ${innerR} 0 1 0 ${bgInStart.x} ${bgInStart.y}`;
  bgPath += ' Z';
  svg += `<path d="${bgPath}" fill="#e5e7eb" />`;

  // Value arc
  if (ratio > 0.001) {
    const valEnd = polarToXY(cx, cy, outerR, valueAngle);
    const valInStart = polarToXY(cx, cy, innerR, startAngle);
    const valInEnd = polarToXY(cx, cy, innerR, valueAngle);
    const large = (valueAngle - startAngle) > 180 ? 1 : 0;

    let valPath = `M ${bgStart.x} ${bgStart.y}`;
    valPath += ` A ${outerR} ${outerR} 0 ${large} 1 ${valEnd.x} ${valEnd.y}`;
    valPath += ` L ${valInEnd.x} ${valInEnd.y}`;
    valPath += ` A ${innerR} ${innerR} 0 ${large} 0 ${valInStart.x} ${valInStart.y}`;
    valPath += ' Z';

    // Determine color based on ratio
    let gaugeColor = colors[0];
    if (ratio <= 0.33) gaugeColor = 'var(--tx-danger, #ef4444)';
    else if (ratio <= 0.66) gaugeColor = 'var(--tx-warning, #f59e0b)';
    else gaugeColor = 'var(--tx-success, #22c55e)';

    svg += `<path d="${valPath}" fill="${gaugeColor}">`;
    svg += `<title>${escSvg(`${fmtNum(value)} / ${fmtNum(gMax)}`)}</title>`;
    svg += `</path>`;
  }

  // Tick marks
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const tickRatio = i / tickCount;
    const tickAngle = startAngle + tickRatio * totalSweep;
    const tickOuter = polarToXY(cx, cy, outerR + 6, tickAngle);
    const tickInner = polarToXY(cx, cy, outerR + 1, tickAngle);
    svg += `<line x1="${tickInner.x}" y1="${tickInner.y}" x2="${tickOuter.x}" y2="${tickOuter.y}" stroke="#9ca3af" stroke-width="1.5" />`;

    const tickLabel = polarToXY(cx, cy, outerR + 18, tickAngle);
    const tickVal = gMin + tickRatio * (gMax - gMin);
    svg += `<text x="${tickLabel.x}" y="${tickLabel.y}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#6b7280">${fmtNum(tickVal)}</text>`;
  }

  // Center value
  svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.max(18, outerR * 0.4)}" font-weight="700" fill="#111827">${fmtNum(value)}</text>`;
  if (label) {
    svg += `<text x="${cx}" y="${cy + outerR * 0.3}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="#6b7280">${escSvg(label)}</text>`;
  }

  return svg;
}

// ----------------------------------------------------------
//  Main render dispatcher
// ----------------------------------------------------------

function renderChart(opts: ChartOptions, w: number, h: number): string {
  const colors = opts.colors || DEFAULT_COLORS;
  const series = buildSeries(opts);
  const showLegend = opts.legend?.show !== false && opts.type !== 'gauge';
  const legendPos = opts.legend?.position || 'bottom';

  let svgContent = '';

  // Title
  if (opts.title) {
    svgContent += `<text x="${w / 2}" y="20" text-anchor="middle" font-size="14" font-weight="600" fill="#111827">${escSvg(opts.title)}</text>`;
  }

  // Dispatch to chart type renderer
  switch (opts.type) {
    case 'bar':
      svgContent += renderBarChart(series, opts, w, h, colors);
      break;
    case 'horizontalBar':
      svgContent += renderHorizontalBarChart(series, opts, w, h, colors);
      break;
    case 'line':
      svgContent += renderLineChart(series, opts, w, h, colors);
      break;
    case 'area':
      svgContent += renderAreaChart(series, opts, w, h, colors);
      break;
    case 'scatter':
      svgContent += renderScatterChart(series, opts, w, h, colors);
      break;
    case 'pie':
      svgContent += renderPieChart(series, opts, w, h, colors, false);
      break;
    case 'donut':
      svgContent += renderPieChart(series, opts, w, h, colors, true);
      break;
    case 'gauge':
      svgContent += renderGaugeChart(opts, w, h, colors);
      break;
  }

  // Legend
  if (showLegend && series.length > 0) {
    svgContent += renderLegend(series, colors, w, h, legendPos);
  }

  return svgContent;
}

// ----------------------------------------------------------
//  CSS for hover / transitions
// ----------------------------------------------------------

const CHART_STYLES = `
.tx-chart { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tx-chart svg { display: block; }
.tx-chart-bar { transition: opacity 0.15s; cursor: pointer; }
.tx-chart-bar:hover { opacity: 0.8; }
.tx-chart-dot { transition: r 0.15s; cursor: pointer; }
.tx-chart-dot:hover { r: 6; }
.tx-chart-slice { transition: opacity 0.15s; cursor: pointer; }
.tx-chart-slice:hover { opacity: 0.85; }
.tx-chart-line { pointer-events: none; }
.tx-chart-area { pointer-events: none; }
`;

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = CHART_STYLES;
  document.head.appendChild(style);
}

// ----------------------------------------------------------
//  Widget entry point
// ----------------------------------------------------------

export function chart(target: string | HTMLElement, options: ChartOptions): ChartInstance {
  injectStyles();

  const el = resolveTarget(target);
  const id = options.id || uid('tx-chart');

  let currentOpts = { ...options };

  function render(): void {
    const w = currentOpts.width || el.clientWidth || 500;
    const h = currentOpts.height || el.clientHeight || 350;

    if (currentOpts.source) {
      // Dynamic data via xhtmlx / fetch
      renderWithSource(el, currentOpts, id, w, h);
    } else {
      renderStatic(el, currentOpts, id, w, h);
    }
  }

  function renderStatic(container: HTMLElement, opts: ChartOptions, chartId: string, w: number, h: number): void {
    const svgContent = renderChart(opts, w, h);
    container.innerHTML = `<div class="${cls('tx-chart', opts.class)}" id="${esc(chartId)}">` +
      `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">` +
      svgContent +
      `</svg></div>`;
  }

  function renderWithSource(container: HTMLElement, opts: ChartOptions, chartId: string, w: number, h: number): void {
    // Show loading state, then fetch
    container.innerHTML = `<div class="${cls('tx-chart', opts.class)}" id="${esc(chartId)}">` +
      `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">` +
      `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="#9ca3af">Loading\u2026</text>` +
      `</svg></div>`;

    fetch(opts.source!)
      .then(r => r.json())
      .then((json: unknown) => {
        // Support { series: [...] } or { data: [...] } or raw array
        const resolved = { ...opts };
        if (Array.isArray(json)) {
          resolved.data = json as ChartDataPoint[];
        } else if (json && typeof json === 'object') {
          const obj = json as Record<string, unknown>;
          if (obj.series) resolved.series = obj.series as ChartSeries[];
          else if (obj.data) resolved.data = obj.data as ChartDataPoint[];
        }
        renderStatic(container, resolved, chartId, w, h);
      })
      .catch(() => {
        container.innerHTML = `<div class="${cls('tx-chart', opts.class)}" id="${esc(chartId)}">` +
          `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">` +
          `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="#ef4444">Failed to load chart data</text>` +
          `</svg></div>`;
      });
  }

  render();

  // Responsive: re-render on resize when no fixed dimensions
  let resizeObserver: ResizeObserver | null = null;
  if (!options.width || !options.height) {
    if (typeof ResizeObserver !== 'undefined') {
      let debounceTimer: ReturnType<typeof setTimeout>;
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => render(), 100);
      });
      resizeObserver.observe(el);
    }
  }

  return {
    el: el.querySelector(`#${id}`) as HTMLElement || el,
    destroy() {
      resizeObserver?.disconnect();
      el.innerHTML = '';
    },
    update(newOpts: Partial<ChartOptions>) {
      currentOpts = { ...currentOpts, ...newOpts };
      render();
    },
  };
}

registerWidget('chart', (el, opts) => chart(el, opts as unknown as ChartOptions));
export default chart;
