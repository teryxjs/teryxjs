# Teryx

Enterprise widget framework built on [xhtmlx](https://github.com/dkropachev/xhtmlx) — Sencha-grade UI components in TypeScript, zero dependencies.

**[Live Demo](https://teryxjs.github.io/teryxjs/)** · [GitHub](https://github.com/teryxjs/teryxjs)

## Features

- **30+ widgets** — grids, forms, charts, calendar, modals, trees, tabs, navigation, and more
- **Dual API** — declarative HTML (`<tx-column>`, `data-tx-widget`) or imperative JS (`Teryx.grid()`)
- **Pure SVG charts** — bar, line, area, pie, donut, scatter, gauge — no canvas, no deps
- **TypeScript** — full type definitions for every widget, option, and callback
- **Zero dependencies** — 265KB ESM bundle includes everything
- **CSS design system** — 1100+ lines, dark mode, 12-column grid, responsive breakpoints
- **xhtmlx integration** — widgets generate `xh-*` attributes for JSON data fetching
- **Organized** — `backoffice/frontoffice` × `desktop/mobile` widget categories
- **352 tests** — Vitest + jsdom, all passing

## Install

```bash
pnpm add teryx
```

Or via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/teryx/dist/teryx.css">
<script src="https://unpkg.com/xhtmlx"></script>
<script src="https://unpkg.com/teryx/dist/index.global.js"></script>
```

## Quick Start

### Declarative HTML (no JavaScript needed)

```html
<div data-tx-widget="grid"
     data-tx-source="/api/users"
     data-tx-searchable
     data-tx-paginated>
  <tx-column field="name" label="Name" sortable></tx-column>
  <tx-column field="email" label="Email" sortable></tx-column>
  <tx-column field="role" label="Role" renderer="badge"></tx-column>
</div>
```

### Imperative JavaScript

```typescript
import { grid, modal, toast, chart } from 'teryx';

grid('#my-grid', {
  source: '/api/users',
  searchable: true,
  paginated: true,
  columns: [
    { field: 'name', label: 'Name', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'role', label: 'Role', renderer: 'badge' },
  ],
});

chart('#revenue', {
  type: 'bar',
  series: [{ name: 'Revenue', data: [
    { x: 'Jan', y: 4200 }, { x: 'Feb', y: 5100 }, { x: 'Mar', y: 6800 },
  ]}],
});

toast.success('Data loaded!');
```

## Widget Catalog

| Category | Widgets |
|---|---|
| **Data** | Grid, Tree, DataList, Pagination, PropertyGrid, Descriptions, Exporter (CSV/Excel/JSON/HTML) |
| **Forms** | Form (20+ field types), ColorPicker, Segmented, Rating, FileUpload |
| **Charts** | Bar, Line, Area, Pie, Donut, Scatter, Gauge |
| **Calendar** | Month, Week, Day views with events |
| **Layout** | Tabs, Accordion, Sidebar, Navbar, Steps, Splitter, Drawer |
| **Overlay** | Modal, Toast, MessageBox, Dropdown, ContextMenu |
| **Content** | Card, Stat/KPI, Timeline, Badge, Carousel, Progress |
| **Frontoffice** | Hero, Pricing, Testimonial, Feature grid, Footer |
| **Mobile** | NavigationView, Sheet, Pull-to-refresh List, Bottom TabBar |

## Project Structure

```
src/
├── core.ts, types.ts, utils.ts     # Framework core
├── widgets/                         # 31 core widget implementations
├── backoffice/
│   ├── desktop/                     # Enterprise admin widgets
│   └── mobile/                      # Touch-friendly admin subset
└── frontoffice/
    ├── desktop/                     # Public-facing sections
    └── mobile/                      # Mobile UX patterns
```

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build ESM + CJS + IIFE + types + CSS
pnpm test             # Run 352 tests
pnpm demo             # Start showcase server at localhost:3000
```

## Browser Support

All modern browsers (Chrome, Firefox, Safari, Edge). Uses standard DOM APIs, CSS Grid, CSS Custom Properties.

## License

MIT
