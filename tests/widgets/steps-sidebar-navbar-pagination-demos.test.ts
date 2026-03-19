import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { steps } from '../../src/widgets/steps';
import { sidebar } from '../../src/widgets/sidebar';
import { navbar } from '../../src/widgets/navbar';
import { pagination } from '../../src/widgets/pagination';

// ── Steps demos — unit tests ──
describe('Steps demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Horizontal Steps ──
  describe('Horizontal Steps', () => {
    it('renders steps container with horizontal direction', () => {
      steps(container, {
        direction: 'horizontal',
        current: 1,
        items: [
          { title: 'Account', description: 'Create your account' },
          { title: 'Profile', description: 'Set up your profile' },
          { title: 'Review', description: 'Review and submit' },
        ],
      });

      const el = container.querySelector('.tx-steps');
      expect(el).not.toBeNull();
      expect(el!.classList.contains('tx-steps-horizontal')).toBe(true);
    });

    it('renders three step indicators', () => {
      steps(container, {
        direction: 'horizontal',
        current: 1,
        items: [
          { title: 'Account', description: 'Create your account' },
          { title: 'Profile', description: 'Set up your profile' },
          { title: 'Review', description: 'Review and submit' },
        ],
      });

      const stepEls = container.querySelectorAll('.tx-step');
      expect(stepEls.length).toBe(3);
    });

    it('marks step 0 as finish and step 1 as process', () => {
      steps(container, {
        direction: 'horizontal',
        current: 1,
        items: [
          { title: 'Account', description: 'Create your account' },
          { title: 'Profile', description: 'Set up your profile' },
          { title: 'Review', description: 'Review and submit' },
        ],
      });

      const stepEls = container.querySelectorAll('.tx-step');
      expect(stepEls[0].classList.contains('tx-step-finish')).toBe(true);
      expect(stepEls[1].classList.contains('tx-step-process')).toBe(true);
      expect(stepEls[2].classList.contains('tx-step-wait')).toBe(true);
    });

    it('renders descriptions for each step', () => {
      steps(container, {
        direction: 'horizontal',
        current: 1,
        items: [
          { title: 'Account', description: 'Create your account' },
          { title: 'Profile', description: 'Set up your profile' },
          { title: 'Review', description: 'Review and submit' },
        ],
      });

      const descriptions = container.querySelectorAll('.tx-step-description');
      expect(descriptions.length).toBe(3);
    });
  });

  // ── Vertical Steps ──
  describe('Vertical Steps', () => {
    it('renders steps container with vertical direction', () => {
      steps(container, {
        direction: 'vertical',
        current: 2,
        items: [
          { title: 'Sign Up', description: 'Create account' },
          { title: 'Verify Email', description: 'Confirm address' },
          { title: 'Complete Profile', description: 'Add details' },
          { title: 'Get Started', description: 'Begin using the app' },
        ],
      });

      const el = container.querySelector('.tx-steps');
      expect(el).not.toBeNull();
      expect(el!.classList.contains('tx-steps-vertical')).toBe(true);
    });

    it('renders four step indicators', () => {
      steps(container, {
        direction: 'vertical',
        current: 2,
        items: [
          { title: 'Sign Up', description: 'Create account' },
          { title: 'Verify Email', description: 'Confirm address' },
          { title: 'Complete Profile', description: 'Add details' },
          { title: 'Get Started', description: 'Begin using the app' },
        ],
      });

      const stepEls = container.querySelectorAll('.tx-step');
      expect(stepEls.length).toBe(4);
    });

    it('marks first two steps as finish and third as process', () => {
      steps(container, {
        direction: 'vertical',
        current: 2,
        items: [
          { title: 'Sign Up', description: 'Create account' },
          { title: 'Verify Email', description: 'Confirm address' },
          { title: 'Complete Profile', description: 'Add details' },
          { title: 'Get Started', description: 'Begin using the app' },
        ],
      });

      const stepEls = container.querySelectorAll('.tx-step');
      expect(stepEls[0].classList.contains('tx-step-finish')).toBe(true);
      expect(stepEls[1].classList.contains('tx-step-finish')).toBe(true);
      expect(stepEls[2].classList.contains('tx-step-process')).toBe(true);
      expect(stepEls[3].classList.contains('tx-step-wait')).toBe(true);
    });
  });

  // ── Clickable Steps ──
  describe('Clickable Steps', () => {
    it('renders steps with clickable class', () => {
      steps(container, {
        clickable: true,
        current: 0,
        items: [
          { title: 'Cart', description: 'Review items' },
          { title: 'Shipping', description: 'Enter address' },
          { title: 'Payment', description: 'Choose method' },
          { title: 'Confirm', description: 'Place order' },
        ],
      });

      const clickableEls = container.querySelectorAll('.tx-step-clickable');
      expect(clickableEls.length).toBe(4);
    });

    it('clicking a step changes current', () => {
      const inst = steps(container, {
        clickable: true,
        current: 0,
        items: [
          { title: 'Cart', description: 'Review items' },
          { title: 'Shipping', description: 'Enter address' },
          { title: 'Payment', description: 'Choose method' },
          { title: 'Confirm', description: 'Place order' },
        ],
      });

      expect(inst.current()).toBe(0);

      const thirdStep = container.querySelector('.tx-step[data-step="2"]') as HTMLElement;
      thirdStep.click();

      expect(inst.current()).toBe(2);
    });

    it('next() and prev() change the current step', () => {
      const inst = steps(container, {
        clickable: true,
        current: 1,
        items: [
          { title: 'Cart', description: 'Review items' },
          { title: 'Shipping', description: 'Enter address' },
          { title: 'Payment', description: 'Choose method' },
        ],
      });

      expect(inst.current()).toBe(1);
      inst.next();
      expect(inst.current()).toBe(2);
      inst.prev();
      expect(inst.current()).toBe(1);
    });
  });
});

// ── Sidebar demos — unit tests ──
describe('Sidebar demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Collapsible Sidebar ──
  describe('Collapsible Sidebar', () => {
    it('renders sidebar with dark variant', () => {
      sidebar(container, {
        brand: 'MyApp',
        collapsible: true,
        variant: 'dark',
        items: [
          { label: 'Dashboard', icon: 'home', href: '#', active: true },
          { label: 'Analytics', icon: 'chart', href: '#' },
          { label: 'Settings', icon: 'settings', href: '#' },
        ],
      });

      const el = container.querySelector('.tx-sidebar');
      expect(el).not.toBeNull();
      expect(el!.classList.contains('tx-sidebar-dark')).toBe(true);
    });

    it('renders brand text', () => {
      sidebar(container, {
        brand: 'MyApp',
        collapsible: true,
        variant: 'dark',
        items: [{ label: 'Dashboard', icon: 'home', href: '#', active: true }],
      });

      const brand = container.querySelector('.tx-sidebar-brand-text');
      expect(brand).not.toBeNull();
      expect(brand!.textContent).toBe('MyApp');
    });

    it('renders toggle button for collapsible sidebar', () => {
      sidebar(container, {
        brand: 'MyApp',
        collapsible: true,
        variant: 'dark',
        items: [{ label: 'Dashboard', icon: 'home', href: '#', active: true }],
      });

      const toggle = container.querySelector('.tx-sidebar-toggle');
      expect(toggle).not.toBeNull();
    });

    it('collapse and expand toggle the collapsed class', () => {
      const inst = sidebar(container, {
        brand: 'MyApp',
        collapsible: true,
        variant: 'dark',
        items: [{ label: 'Dashboard', icon: 'home', href: '#', active: true }],
      });

      expect(inst.isCollapsed()).toBe(false);
      inst.collapse();
      expect(inst.isCollapsed()).toBe(true);
      expect(inst.el.classList.contains('tx-sidebar-collapsed')).toBe(true);
      inst.expand();
      expect(inst.isCollapsed()).toBe(false);
    });

    it('renders three nav items', () => {
      sidebar(container, {
        brand: 'MyApp',
        collapsible: true,
        variant: 'dark',
        items: [
          { label: 'Dashboard', icon: 'home', href: '#', active: true },
          { label: 'Analytics', icon: 'chart', href: '#' },
          { label: 'Settings', icon: 'settings', href: '#' },
        ],
      });

      const navItems = container.querySelectorAll('.tx-sidebar-item');
      expect(navItems.length).toBe(3);
    });
  });

  // ── Nested Items Sidebar ──
  describe('Nested Items Sidebar', () => {
    it('renders sidebar with light variant', () => {
      sidebar(container, {
        brand: 'Admin',
        variant: 'light',
        items: [
          { label: 'Home', icon: 'home', href: '#' },
          {
            label: 'Users',
            icon: 'user',
            active: true,
            children: [
              { label: 'All Users', href: '#' },
              { label: 'Add User', href: '#' },
            ],
          },
        ],
      });

      const el = container.querySelector('.tx-sidebar');
      expect(el!.classList.contains('tx-sidebar-light')).toBe(true);
    });

    it('renders submenu groups for items with children', () => {
      sidebar(container, {
        brand: 'Admin',
        variant: 'light',
        items: [
          { label: 'Home', icon: 'home', href: '#' },
          {
            label: 'Users',
            icon: 'user',
            active: true,
            children: [
              { label: 'All Users', href: '#' },
              { label: 'Add User', href: '#' },
            ],
          },
          {
            label: 'Reports',
            icon: 'folder',
            children: [
              { label: 'Monthly', href: '#' },
              { label: 'Annual', href: '#' },
            ],
          },
        ],
      });

      const groups = container.querySelectorAll('.tx-sidebar-item-group');
      expect(groups.length).toBe(2);
    });

    it('active parent group is open by default', () => {
      sidebar(container, {
        brand: 'Admin',
        variant: 'light',
        items: [
          {
            label: 'Users',
            icon: 'user',
            active: true,
            children: [
              { label: 'All Users', href: '#' },
              { label: 'Add User', href: '#' },
            ],
          },
        ],
      });

      const group = container.querySelector('.tx-sidebar-item-group');
      expect(group!.classList.contains('tx-sidebar-item-open')).toBe(true);
    });

    it('renders submenu children', () => {
      sidebar(container, {
        brand: 'Admin',
        variant: 'light',
        items: [
          {
            label: 'Users',
            icon: 'user',
            active: true,
            children: [
              { label: 'All Users', href: '#' },
              { label: 'Add User', href: '#' },
            ],
          },
        ],
      });

      const subItems = container.querySelectorAll('.tx-sidebar-submenu .tx-sidebar-item');
      expect(subItems.length).toBe(2);
    });
  });
});

// ── Navbar demos — unit tests ──
describe('Navbar demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Responsive Navbar ──
  describe('Responsive Navbar', () => {
    it('renders navbar with light variant', () => {
      navbar(container, {
        brand: 'Teryx',
        collapsible: true,
        variant: 'light',
        items: [
          { label: 'Home', href: '#', active: true },
          { label: 'Products', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' },
        ],
        endItems: [{ label: 'Sign In', href: '#' }],
      });

      const el = container.querySelector('.tx-navbar');
      expect(el).not.toBeNull();
      expect(el!.classList.contains('tx-navbar-light')).toBe(true);
    });

    it('renders brand text', () => {
      navbar(container, {
        brand: 'Teryx',
        collapsible: true,
        variant: 'light',
        items: [{ label: 'Home', href: '#' }],
      });

      const brand = container.querySelector('.tx-navbar-brand-text');
      expect(brand).not.toBeNull();
      expect(brand!.textContent).toBe('Teryx');
    });

    it('renders toggler button for collapsible navbar', () => {
      navbar(container, {
        brand: 'Teryx',
        collapsible: true,
        variant: 'light',
        items: [{ label: 'Home', href: '#' }],
      });

      const toggler = container.querySelector('.tx-navbar-toggler');
      expect(toggler).not.toBeNull();
    });

    it('renders four nav items plus one end item', () => {
      navbar(container, {
        brand: 'Teryx',
        collapsible: true,
        variant: 'light',
        items: [
          { label: 'Home', href: '#', active: true },
          { label: 'Products', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' },
        ],
        endItems: [{ label: 'Sign In', href: '#' }],
      });

      const navItems = container.querySelectorAll('.tx-navbar-nav .tx-navbar-item');
      expect(navItems.length).toBe(4);

      const endItems = container.querySelectorAll('.tx-navbar-end .tx-navbar-item');
      expect(endItems.length).toBe(1);
    });

    it('marks active item correctly', () => {
      navbar(container, {
        brand: 'Teryx',
        variant: 'light',
        items: [
          { label: 'Home', href: '#', active: true },
          { label: 'Products', href: '#' },
        ],
      });

      const active = container.querySelector('.tx-navbar-item-active');
      expect(active).not.toBeNull();
      expect(active!.textContent).toBe('Home');
    });
  });

  // ── Dark Navbar with Dropdowns ──
  describe('Dark Navbar with Dropdowns', () => {
    it('renders navbar with dark variant', () => {
      navbar(container, {
        brand: 'Dashboard',
        variant: 'dark',
        items: [
          { label: 'Home', href: '#' },
          {
            label: 'Services',
            children: [
              { label: 'Web Development', href: '#' },
              { label: 'Design', href: '#' },
              { label: 'Consulting', href: '#' },
            ],
          },
          { label: 'Pricing', href: '#' },
        ],
      });

      const el = container.querySelector('.tx-navbar');
      expect(el!.classList.contains('tx-navbar-dark')).toBe(true);
    });

    it('renders dropdown menu for items with children', () => {
      navbar(container, {
        brand: 'Dashboard',
        variant: 'dark',
        items: [
          { label: 'Home', href: '#' },
          {
            label: 'Services',
            children: [
              { label: 'Web Development', href: '#' },
              { label: 'Design', href: '#' },
              { label: 'Consulting', href: '#' },
            ],
          },
        ],
      });

      const dropdown = container.querySelector('.tx-navbar-dropdown');
      expect(dropdown).not.toBeNull();

      const dropdownItems = container.querySelectorAll('.tx-navbar-dropdown-item');
      expect(dropdownItems.length).toBe(3);
    });

    it('dropdown toggle opens the dropdown menu', () => {
      navbar(container, {
        brand: 'Dashboard',
        variant: 'dark',
        items: [
          {
            label: 'Services',
            children: [
              { label: 'Web Dev', href: '#' },
              { label: 'Design', href: '#' },
            ],
          },
        ],
      });

      const toggle = container.querySelector('.tx-navbar-dropdown-toggle') as HTMLElement;
      toggle.click();

      const dropdown = container.querySelector('.tx-navbar-dropdown');
      expect(dropdown!.classList.contains('tx-navbar-dropdown-open')).toBe(true);
    });
  });
});

// ── Pagination demos — unit tests ──
describe('Pagination demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Default Pagination ──
  describe('Default Pagination', () => {
    it('renders pagination container', () => {
      pagination(container, {
        total: 200,
        current: 1,
        pageSize: 10,
      });

      const el = container.querySelector('.tx-pagination');
      expect(el).not.toBeNull();
    });

    it('renders page buttons', () => {
      pagination(container, {
        total: 200,
        current: 1,
        pageSize: 10,
      });

      const pageButtons = container.querySelectorAll('.tx-pagination-page');
      expect(pageButtons.length).toBeGreaterThan(0);
    });

    it('renders prev and next buttons', () => {
      pagination(container, {
        total: 200,
        current: 1,
        pageSize: 10,
      });

      expect(container.querySelector('.tx-pagination-prev')).not.toBeNull();
      expect(container.querySelector('.tx-pagination-next')).not.toBeNull();
    });

    it('first page button is active by default', () => {
      pagination(container, {
        total: 200,
        current: 1,
        pageSize: 10,
      });

      const active = container.querySelector('.tx-pagination-active');
      expect(active).not.toBeNull();
      expect(active!.textContent).toBe('1');
    });

    it('goTo changes active page', () => {
      const inst = pagination(container, {
        total: 200,
        current: 1,
        pageSize: 10,
      });

      inst.goTo(5);
      expect(inst.current()).toBe(5);

      const active = container.querySelector('.tx-pagination-active');
      expect(active!.textContent).toBe('5');
    });
  });

  // ── Simple Pagination with Page Info ──
  describe('Simple Pagination with Page Info', () => {
    it('renders simple mode with page info text', () => {
      pagination(container, {
        total: 100,
        current: 3,
        pageSize: 10,
        simple: true,
        showTotal: true,
      });

      const el = container.querySelector('.tx-pagination');
      expect(el!.classList.contains('tx-pagination-simple')).toBe(true);

      const info = container.querySelector('.tx-pagination-info');
      expect(info).not.toBeNull();
      expect(info!.textContent).toContain('3');
      expect(info!.textContent).toContain('10');
    });

    it('renders total range text', () => {
      pagination(container, {
        total: 100,
        current: 3,
        pageSize: 10,
        simple: true,
        showTotal: true,
      });

      const total = container.querySelector('.tx-pagination-total');
      expect(total).not.toBeNull();
      expect(total!.textContent).toContain('21-30');
      expect(total!.textContent).toContain('100');
    });

    it('does not render individual page buttons in simple mode', () => {
      pagination(container, {
        total: 100,
        current: 3,
        pageSize: 10,
        simple: true,
      });

      const pageButtons = container.querySelectorAll('.tx-pagination-page');
      expect(pageButtons.length).toBe(0);
    });
  });

  // ── Full-Featured Pagination ──
  describe('Full-Featured Pagination', () => {
    it('renders size changer', () => {
      pagination(container, {
        total: 500,
        current: 5,
        pageSize: 25,
        showTotal: true,
        showSizeChanger: true,
        showJumper: true,
      });

      const sizer = container.querySelector('.tx-pagination-size-select');
      expect(sizer).not.toBeNull();
    });

    it('renders page jumper', () => {
      pagination(container, {
        total: 500,
        current: 5,
        pageSize: 25,
        showTotal: true,
        showSizeChanger: true,
        showJumper: true,
      });

      const jumper = container.querySelector('.tx-pagination-jump-input');
      expect(jumper).not.toBeNull();
    });

    it('renders total count info', () => {
      pagination(container, {
        total: 500,
        current: 5,
        pageSize: 25,
        showTotal: true,
        showSizeChanger: true,
        showJumper: true,
      });

      const total = container.querySelector('.tx-pagination-total');
      expect(total).not.toBeNull();
      expect(total!.textContent).toContain('101-125');
      expect(total!.textContent).toContain('500');
    });

    it('setTotal updates the pagination', () => {
      const inst = pagination(container, {
        total: 500,
        current: 5,
        pageSize: 25,
        showTotal: true,
      });

      inst.setTotal(50);
      const total = container.querySelector('.tx-pagination-total');
      expect(total!.textContent).toContain('50');
    });
  });
});
