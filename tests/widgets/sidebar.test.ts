import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sidebar } from '../../src/widgets/sidebar';

describe('Sidebar widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'home', active: true },
    { label: 'Users', href: '/users', icon: 'user' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ];

  it('should render brand', () => {
    sidebar(container, { items: basicItems, brand: 'MyApp' });

    const brand = container.querySelector('.tx-sidebar-brand-text');
    expect(brand).not.toBeNull();
    expect(brand!.textContent).toBe('MyApp');
  });

  it('should render brand image', () => {
    sidebar(container, { items: basicItems, brandImage: '/logo.png' });

    const brandImg = container.querySelector('.tx-sidebar-brand-img') as HTMLImageElement;
    expect(brandImg).not.toBeNull();
    expect(brandImg.src).toContain('/logo.png');
  });

  it('should render items', () => {
    sidebar(container, { items: basicItems });

    const items = container.querySelectorAll('.tx-sidebar-item');
    expect(items.length).toBe(3);

    const labels = Array.from(container.querySelectorAll('.tx-sidebar-text')).map((el) => el.textContent);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Users');
    expect(labels).toContain('Settings');
  });

  it('collapse/expand toggle', () => {
    const s = sidebar(container, { items: basicItems, collapsible: true, brand: 'App' });

    expect(s.isCollapsed()).toBe(false);

    s.collapse();
    const sidebarEl = container.querySelector('.tx-sidebar') as HTMLElement;
    expect(sidebarEl.classList.contains('tx-sidebar-collapsed')).toBe(true);
    expect(s.isCollapsed()).toBe(true);

    s.expand();
    expect(sidebarEl.classList.contains('tx-sidebar-collapsed')).toBe(false);
    expect(s.isCollapsed()).toBe(false);
  });

  it('toggle() switches between collapsed and expanded', () => {
    const s = sidebar(container, { items: basicItems, collapsible: true, brand: 'App' });

    s.toggle();
    expect(s.isCollapsed()).toBe(true);

    s.toggle();
    expect(s.isCollapsed()).toBe(false);
  });

  it('should start collapsed when collapsed=true', () => {
    const s = sidebar(container, { items: basicItems, collapsible: true, collapsed: true, brand: 'App' });

    expect(s.isCollapsed()).toBe(true);
    const sidebarEl = container.querySelector('.tx-sidebar') as HTMLElement;
    expect(sidebarEl.classList.contains('tx-sidebar-collapsed')).toBe(true);
  });

  it('active item highlighted', () => {
    sidebar(container, { items: basicItems });

    const activeItem = container.querySelector('.tx-sidebar-item-active');
    expect(activeItem).not.toBeNull();
    expect(activeItem!.textContent).toContain('Dashboard');
  });

  it('submenu toggle', () => {
    const items = [
      { label: 'Dashboard', href: '/dashboard' },
      {
        label: 'Reports',
        href: '#',
        active: false,
        children: [
          { label: 'Sales', href: '/reports/sales' },
          { label: 'Users', href: '/reports/users' },
        ],
      },
    ];
    sidebar(container, { items });

    const submenuToggle = container.querySelector('.tx-sidebar-submenu-toggle') as HTMLElement;
    expect(submenuToggle).not.toBeNull();

    const group = submenuToggle.closest('.tx-sidebar-item-group') as HTMLElement;
    const submenu = group.querySelector('.tx-sidebar-submenu') as HTMLElement;

    // Initially closed (not active)
    expect(submenu.style.display).toBe('none');

    // Click to open
    submenuToggle.click();
    expect(group.classList.contains('tx-sidebar-item-open')).toBe(true);
    expect(submenu.style.display).toBe('');

    // Click to close
    submenuToggle.click();
    expect(group.classList.contains('tx-sidebar-item-open')).toBe(false);
    expect(submenu.style.display).toBe('none');
  });

  it('section headers render', () => {
    const items = [
      { label: 'Navigation', section: true },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Admin', section: true },
      { label: 'Settings', href: '/settings' },
    ];
    sidebar(container, { items });

    const sections = container.querySelectorAll('.tx-sidebar-section');
    expect(sections.length).toBe(2);
    expect(sections[0].textContent).toBe('Navigation');
    expect(sections[1].textContent).toBe('Admin');
  });

  it('dark variant applies correct class', () => {
    sidebar(container, { items: basicItems, variant: 'dark' });

    const sidebarEl = container.querySelector('.tx-sidebar');
    expect(sidebarEl!.classList.contains('tx-sidebar-dark')).toBe(true);
  });

  it('light variant applies correct class', () => {
    sidebar(container, { items: basicItems, variant: 'light' });

    const sidebarEl = container.querySelector('.tx-sidebar');
    expect(sidebarEl!.classList.contains('tx-sidebar-light')).toBe(true);
  });

  it('should render footer', () => {
    sidebar(container, { items: basicItems, footer: '<span>v1.0</span>' });

    const footer = container.querySelector('.tx-sidebar-footer');
    expect(footer).not.toBeNull();
    expect(footer!.innerHTML).toContain('v1.0');
  });

  it('should render icons in items', () => {
    sidebar(container, { items: basicItems });

    const icons = container.querySelectorAll('.tx-sidebar-icon');
    expect(icons.length).toBe(3);
    expect(icons[0].innerHTML).toContain('<svg');
  });

  it('should render badges', () => {
    const items = [{ label: 'Inbox', href: '/inbox', badge: '5' }];
    sidebar(container, { items });

    const badge = container.querySelector('.tx-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('5');
  });

  it('destroy() clears content', () => {
    const s = sidebar(container, { items: basicItems });
    s.destroy();
    expect(container.innerHTML).toBe('');
  });
});
