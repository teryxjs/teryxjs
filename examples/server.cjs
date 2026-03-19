const express = require('express');
const path = require('path');
const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;

// Serve framework files
app.use('/teryx.css', express.static(path.join(__dirname, '..', 'styles', 'teryx.css')));
app.use('/xhtmlx.js', express.static(path.join(__dirname, '..', 'node_modules', 'xhtmlx', 'xhtmlx.js')));
app.use('/teryx.js', express.static(path.join(__dirname, '..', 'dist', 'index.global.js')));

// Serve the showcase directory
app.use('/showcase', express.static(path.join(__dirname, 'showcase')));

// Serve site layout files (shared nav/footer/dark mode)
app.use('/site-layout.css', express.static(path.join(__dirname, '..', 'pages', 'site-layout.css')));
app.use('/site-layout.js', express.static(path.join(__dirname, '..', 'pages', 'site-layout.js')));

// Serve pages directory (homepage, explorer, docs, pricing, blog, widgets)
app.use('/explorer', express.static(path.join(__dirname, '..', 'pages', 'explorer')));
app.use('/docs', express.static(path.join(__dirname, '..', 'pages', 'docs')));
app.use('/pricing', express.static(path.join(__dirname, '..', 'pages', 'pricing')));
app.use('/blog', express.static(path.join(__dirname, '..', 'pages', 'blog')));
app.use('/widgets', express.static(path.join(__dirname, '..', 'pages', 'widgets')));
app.use('/pages-home', express.static(path.join(__dirname, '..', 'pages'), { index: 'index.html' }));

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ── Mock Data ──────────────────────────────────────────────
const users = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  name: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eva Martinez',
    'Frank Garcia', 'Grace Lee', 'Hank Wilson', 'Ivy Chen', 'Jack Taylor'][i % 10],
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Editor', 'Viewer', 'Admin', 'Viewer'][i % 5],
  status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
  joined: new Date(2024, i % 12, (i % 28) + 1).toISOString().split('T')[0],
  revenue: Math.round(Math.random() * 10000),
  department: ['Engineering', 'Marketing', 'Sales', 'Support', 'Design'][i % 5],
}));

const products = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: ['Widget Pro', 'DataSync', 'CloudHost', 'FormBuilder', 'ChartMaster',
    'GridView Plus', 'API Gateway', 'Auth Shield', 'Mail Jet', 'Log Analyzer'][i % 10],
  category: ['Software', 'Hardware', 'Services', 'Subscriptions', 'Add-ons'][i % 5],
  price: (19.99 + i * 7.5).toFixed(2),
  stock: Math.round(Math.random() * 500),
  rating: (3 + Math.random() * 2).toFixed(1),
  status: i % 4 === 0 ? 'In Stock' : i % 4 === 1 ? 'Low Stock' : i % 4 === 2 ? 'Out of Stock' : 'Pre-Order',
}));

const stats = {
  users: { label: 'Total Users', value: '1,234', change: '+12.5%', changeType: 'up', icon: 'user' },
  revenue: { label: 'Revenue', value: '$56,789', change: '+8.2%', changeType: 'up', icon: 'dollar' },
  orders: { label: 'Orders', value: '423', change: '-3.1%', changeType: 'down', icon: 'file' },
  active: { label: 'Active Now', value: '42', change: '0%', changeType: 'neutral', icon: 'eye' },
};

// ── API Endpoints ──────────────────────────────────────────
app.get('/api/users', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const sort = req.query.sort;
  const order = req.query.order || 'asc';

  let filtered = users;
  if (q) {
    filtered = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const va = a[sort] || '';
      const vb = b[sort] || '';
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return order === 'desc' ? -cmp : cmp;
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize;
  const rows = filtered.slice(from, from + pageSize);

  res.json({
    rows,
    total,
    page,
    pageSize,
    totalPages,
    from: from + 1,
    to: Math.min(from + pageSize, total),
    prevPage: Math.max(1, page - 1),
    nextPage: Math.min(totalPages, page + 1),
  });
});

app.get('/api/products', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const sort = req.query.sort;
  const order = req.query.order || 'asc';

  let filtered = products;
  if (q) {
    filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const va = a[sort] || '';
      const vb = b[sort] || '';
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return order === 'desc' ? -cmp : cmp;
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize;
  const rows = filtered.slice(from, from + pageSize);

  res.json({ rows, total, page, pageSize, totalPages });
});

app.get('/api/stats/:type', (req, res) => {
  const stat = stats[req.params.type];
  if (!stat) return res.status(404).json({ error: 'Not found' });
  res.json(stat);
});

app.get('/api/stats', (_req, res) => {
  res.json(stats);
});

app.post('/api/users', (req, res) => {
  const user = { id: users.length + 1, ...req.body, joined: new Date().toISOString().split('T')[0] };
  users.push(user);
  res.status(201).json(user);
});

app.post('/api/form-demo', (req, res) => {
  // Simulate a form submission
  setTimeout(() => {
    res.json({ success: true, message: 'Form submitted successfully', data: req.body });
  }, 500);
});

app.delete('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users.splice(idx, 1);
  res.json({ success: true });
});

app.get('/api/tree', (_req, res) => {
  res.json({
    nodes: [
      { id: '1', text: 'Documents', icon: 'folder', children: [
        { id: '1-1', text: 'Reports', icon: 'folder', children: [
          { id: '1-1-1', text: 'Q1 Report.pdf', leaf: true },
          { id: '1-1-2', text: 'Q2 Report.pdf', leaf: true },
        ]},
        { id: '1-2', text: 'Contracts', icon: 'folder', children: [
          { id: '1-2-1', text: 'NDA.docx', leaf: true },
        ]},
      ]},
      { id: '2', text: 'Images', icon: 'folder', children: [
        { id: '2-1', text: 'logo.png', leaf: true },
        { id: '2-2', text: 'banner.jpg', leaf: true },
      ]},
      { id: '3', text: 'README.md', leaf: true },
    ],
  });
});

app.get('/api/notifications', (_req, res) => {
  res.json({
    items: [
      { title: 'New user registered', time: '2 minutes ago', type: 'info' },
      { title: 'Payment received', time: '15 minutes ago', type: 'success' },
      { title: 'Server CPU at 90%', time: '1 hour ago', type: 'warning' },
      { title: 'Build failed', time: '2 hours ago', type: 'danger' },
    ],
  });
});

// ── Chart data endpoints ──────────────────────────────────
app.get('/api/chart/revenue', (_req, res) => {
  res.json({
    series: [
      { name: 'Revenue', data: [
        { x: 'Jan', y: 4200 }, { x: 'Feb', y: 5100 }, { x: 'Mar', y: 4800 },
        { x: 'Apr', y: 6200 }, { x: 'May', y: 5900 }, { x: 'Jun', y: 7400 },
        { x: 'Jul', y: 6800 }, { x: 'Aug', y: 7200 }, { x: 'Sep', y: 8100 },
        { x: 'Oct', y: 7500 }, { x: 'Nov', y: 8800 }, { x: 'Dec', y: 9200 },
      ]},
      { name: 'Expenses', data: [
        { x: 'Jan', y: 3200 }, { x: 'Feb', y: 3800 }, { x: 'Mar', y: 3500 },
        { x: 'Apr', y: 4100 }, { x: 'May', y: 3900 }, { x: 'Jun', y: 4600 },
        { x: 'Jul', y: 4200 }, { x: 'Aug', y: 4500 }, { x: 'Sep', y: 5000 },
        { x: 'Oct', y: 4800 }, { x: 'Nov', y: 5300 }, { x: 'Dec', y: 5700 },
      ]},
    ],
  });
});

app.get('/api/chart/categories', (_req, res) => {
  res.json({
    data: [
      { x: 'Electronics', y: 42, label: 'Electronics' },
      { x: 'Clothing', y: 28, label: 'Clothing' },
      { x: 'Food & Bev', y: 18, label: 'Food & Beverage' },
      { x: 'Home', y: 8, label: 'Home & Garden' },
      { x: 'Sports', y: 4, label: 'Sports' },
    ],
  });
});

// ── Calendar events endpoint ──────────────────────────────
app.get('/api/calendar/events', (_req, res) => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  res.json({
    events: [
      { id: 'e1', title: 'Team Standup', start: `${y}-${String(m+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}T09:00`, end: `${y}-${String(m+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}T09:30`, color: '#3b82f6' },
      { id: 'e2', title: 'Sprint Planning', start: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+1, 28)).padStart(2,'0')}T10:00`, end: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+1, 28)).padStart(2,'0')}T12:00`, color: '#22c55e' },
      { id: 'e3', title: 'Design Review', start: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+2, 28)).padStart(2,'0')}T14:00`, end: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+2, 28)).padStart(2,'0')}T15:30`, color: '#f59e0b' },
      { id: 'e4', title: 'Product Launch', start: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+5, 28)).padStart(2,'0')}`, allDay: true, color: '#ef4444' },
      { id: 'e5', title: 'Quarterly Review', start: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+3, 28)).padStart(2,'0')}T13:00`, end: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+3, 28)).padStart(2,'0')}T16:00`, color: '#8b5cf6' },
      { id: 'e6', title: 'Company All-Hands', start: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+7, 28)).padStart(2,'0')}T11:00`, end: `${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(today.getDate()+7, 28)).padStart(2,'0')}T12:00`, color: '#06b6d4' },
    ],
  });
});

// ── Mobile pull-list messages endpoint ────────────────────
app.get('/api/messages', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const allMessages = Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    sender: ['Sarah Connor', 'John Doe', 'Jane Smith', 'Alex Kim', 'Morgan Lee'][i % 5],
    initials: ['SC', 'JD', 'JS', 'AK', 'ML'][i % 5],
    subject: ['Project update', 'Meeting notes', 'Q3 budget review', 'New feature request', 'Bug report #' + (1000 + i)][i % 5],
    preview: ['Please review the attached documents...', 'Here are the notes from today...', 'Budget numbers look promising...', 'Users are requesting...', 'Steps to reproduce...'][i % 5],
    time: i < 5 ? `${i + 1}m ago` : i < 15 ? `${i}h ago` : `${Math.floor(i/5)}d ago`,
    read: i > 3,
    category: ['Work', 'Personal', 'Work', 'Work', 'Urgent'][i % 5],
  }));

  const from = (page - 1) * pageSize;
  const items = allMessages.slice(from, from + pageSize);
  res.json({ items, total: allMessages.length });
});

// ── Property grid data endpoint ───────────────────────────
app.get('/api/component-props', (_req, res) => {
  res.json({
    properties: [
      { name: 'width', value: '100%', type: 'string', label: 'Width', group: 'Layout' },
      { name: 'height', value: '400px', type: 'string', label: 'Height', group: 'Layout' },
      { name: 'visible', value: true, type: 'boolean', label: 'Visible', group: 'Display' },
      { name: 'opacity', value: 1.0, type: 'number', label: 'Opacity', group: 'Display' },
      { name: 'bgColor', value: '#ffffff', type: 'color', label: 'Background', group: 'Appearance' },
    ],
  });
});

app.listen(port, () => {
  console.log(`Teryx demo server running at http://localhost:${port}`);
  console.log(`  Dashboard:  http://localhost:${port}/dashboard.html`);
  console.log(`  Showcase:   http://localhost:${port}/showcase/`);
});
