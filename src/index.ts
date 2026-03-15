// ============================================================
// Teryx — Enterprise Widget Framework for xhtmlx
// ============================================================
//
// Usage:
//   import { grid, modal, toast, form } from 'teryx';
//   import 'teryx/css';
//
// Or via CDN / script tag:
//   <script src="xhtmlx.js"></script>
//   <script src="teryx.js"></script>
//   Teryx.grid('#my-grid', { source: '/api/data', columns: [...] });
//

// Core
export { configure, config, initWidgets, registerWidget, on, off, emit } from './core';

// Types
export type * from './types';

// Utilities
export { uid, esc, cls, icon, icons, resolveTarget, createElement, debounce, throttle, clamp } from './utils';

// Widgets
export {
  grid,
  modal,
  form,
  tabs,
  toast,
  accordion,
  dropdown,
  contextMenu,
  tree,
  drawer,
  sidebar,
  navbar,
  steps,
  card,
  alert,
  stat,
  pagination,
  progress,
  datalist,
  messageBox,
  carousel,
  fileupload,
  splitter,
  rating,
  timeline,
  calendar,
  colorPicker,
  segmented,
  propertyGrid,
  descriptions,
  exportCSV,
  exportExcel,
  exportJSON,
  exportHTML,
  gridColumnsToExport,
  chart,
} from './widgets';

// Category imports
export * as backoffice from './backoffice';
export * as frontoffice from './frontoffice';
