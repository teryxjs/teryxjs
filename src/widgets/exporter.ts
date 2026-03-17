// ============================================================
// Teryx — Data Exporter (CSV, Excel, JSON)
// ============================================================

import type { GridColumn } from '../types';

export interface ExportOptions {
  filename?: string;
  columns?: { field: string; label: string }[];
  includeHeader?: boolean;
  delimiter?: string;
}

/** Export rows to CSV and trigger download. */
export function exportCSV(rows: Record<string, unknown>[], options: ExportOptions = {}): void {
  const filename = options.filename || 'export.csv';
  const delimiter = options.delimiter || ',';
  const includeHeader = options.includeHeader !== false;
  const columns = options.columns || inferColumns(rows);

  const lines: string[] = [];

  if (includeHeader) {
    lines.push(columns.map((c) => csvEscape(c.label, delimiter)).join(delimiter));
  }

  for (const row of rows) {
    const cells = columns.map((c) => csvEscape(String(row[c.field] ?? ''), delimiter));
    lines.push(cells.join(delimiter));
  }

  const csv = lines.join('\r\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8');
}

/** Export rows to Excel XML (basic .xls format). */
export function exportExcel(rows: Record<string, unknown>[], options: ExportOptions = {}): void {
  const filename = options.filename || 'export.xls';
  const includeHeader = options.includeHeader !== false;
  const columns = options.columns || inferColumns(rows);

  let xml = '<?xml version="1.0"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '<Styles>\n';
  xml += '<Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>\n';
  xml += '</Styles>\n';
  xml += '<Worksheet ss:Name="Sheet1">\n';
  xml += '<Table>\n';

  // Column widths
  for (const _col of columns) {
    xml += '<Column ss:AutoFitWidth="1" ss:Width="120"/>\n';
  }

  // Header row
  if (includeHeader) {
    xml += '<Row ss:StyleID="header">\n';
    for (const col of columns) {
      xml += `<Cell><Data ss:Type="String">${xmlEscape(col.label)}</Data></Cell>\n`;
    }
    xml += '</Row>\n';
  }

  // Data rows
  for (const row of rows) {
    xml += '<Row>\n';
    for (const col of columns) {
      const val = row[col.field];
      const isNum = typeof val === 'number';
      xml += `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${xmlEscape(String(val ?? ''))}</Data></Cell>\n`;
    }
    xml += '</Row>\n';
  }

  xml += '</Table>\n</Worksheet>\n</Workbook>';
  downloadBlob(xml, filename, 'application/vnd.ms-excel');
}

/** Export rows to JSON and trigger download. */
export function exportJSON(rows: Record<string, unknown>[], options: { filename?: string } = {}): void {
  const filename = options.filename || 'export.json';
  const json = JSON.stringify(rows, null, 2);
  downloadBlob(json, filename, 'application/json');
}

/** Export rows to HTML table and trigger download. */
export function exportHTML(rows: Record<string, unknown>[], options: ExportOptions = {}): void {
  const filename = options.filename || 'export.html';
  const columns = options.columns || inferColumns(rows);

  let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
  html += 'table{border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px}';
  html += 'th,td{border:1px solid #ddd;padding:8px;text-align:left}';
  html += 'th{background:#f3f4f6;font-weight:600}';
  html += 'tr:nth-child(even){background:#f9fafb}';
  html += '</style></head><body><table>';

  html += '<thead><tr>';
  for (const col of columns) {
    html += `<th>${htmlEscape(col.label)}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (const row of rows) {
    html += '<tr>';
    for (const col of columns) {
      html += `<td>${htmlEscape(String(row[col.field] ?? ''))}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table></body></html>';
  downloadBlob(html, filename, 'text/html');
}

/** Convert GridColumn[] to export column format. */
export function gridColumnsToExport(columns: GridColumn[]): { field: string; label: string }[] {
  return columns.filter((c) => !c.hidden).map((c) => ({ field: c.field, label: c.label }));
}

// ── Helpers ─────────────────────────────────────────────────

function inferColumns(rows: Record<string, unknown>[]): { field: string; label: string }[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]).map((k) => ({ field: k, label: k }));
}

function csvEscape(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function htmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
