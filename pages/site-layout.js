/**
 * Teryx — Shared Site Layout
 * Injects navigation, footer, and dark mode toggle across all pages.
 *
 * Usage:
 *   <link rel="stylesheet" href="site-layout.css">
 *   <script src="site-layout.js" data-page="home"></script>
 *
 * data-page values: home, widgets, explorer, docs, blog
 */
(function () {
  'use strict';

  var GITHUB_URL = 'https://github.com/teryxjs/teryxjs';
  var THEME_KEY = 'teryx-theme';

  // Detect current page from script tag or URL
  function detectPage() {
    var scripts = document.querySelectorAll('script[src*="site-layout"]');
    for (var i = 0; i < scripts.length; i++) {
      var page = scripts[i].getAttribute('data-page');
      if (page) return page;
    }
    var path = window.location.pathname;
    if (path.indexOf('/explorer') !== -1) return 'explorer';
    if (path.indexOf('/docs') !== -1) return 'docs';
    if (path.indexOf('/widgets') !== -1) return 'widgets';
    if (path.indexOf('/blog') !== -1) return 'blog';
    return 'home';
  }

  // Resolve relative path from current page to pages root
  function basePath() {
    var path = window.location.pathname;
    if (path.indexOf('/explorer') !== -1) return '../';
    if (path.indexOf('/docs') !== -1) return '../';
    if (path.indexOf('/widgets') !== -1) return '../';
    if (path.indexOf('/blog') !== -1) return '../';
    return '';
  }

  // ── Dark Mode ───────────────────────────────────────────────
  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Listen for system preference changes
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    } catch (_) {
      // Older browsers without addEventListener on MediaQueryList
    }
  }

  // ── SVG Icons ───────────────────────────────────────────────
  var ICON_GITHUB =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
  var ICON_SUN =
    '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var ICON_MOON =
    '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var ICON_MENU =
    '<svg class="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  var ICON_CLOSE =
    '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // ── Navigation ──────────────────────────────────────────────
  function createNav(currentPage) {
    var base = basePath();
    var links = [
      { href: base || './', label: 'Home', page: 'home' },
      { href: base + 'widgets/', label: 'Widgets', page: 'widgets' },
      { href: base + 'explorer/', label: 'Explorer', page: 'explorer' },
      { href: base + 'docs/', label: 'Docs', page: 'docs' },
    ];

    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    var inner = document.createElement('div');
    inner.className = 'site-nav-inner';

    // Brand
    var brand = document.createElement('a');
    brand.className = 'site-nav-brand';
    brand.href = base || './';
    brand.innerHTML =
      '<img src="' +
      base +
      'favicon.svg" alt="" width="24" height="24" style="vertical-align:-5px;margin-right:6px">Teryx';
    inner.appendChild(brand);

    // Desktop links
    var linksContainer = document.createElement('div');
    linksContainer.className = 'site-nav-links';

    for (var i = 0; i < links.length; i++) {
      var a = document.createElement('a');
      a.className = 'site-nav-link' + (links[i].page === currentPage ? ' active' : '');
      a.href = links[i].href;
      a.textContent = links[i].label;
      linksContainer.appendChild(a);
    }

    // GitHub link
    var gh = document.createElement('a');
    gh.className = 'site-nav-gh';
    gh.href = GITHUB_URL;
    gh.target = '_blank';
    gh.rel = 'noopener';
    gh.innerHTML = ICON_GITHUB + ' GitHub';
    linksContainer.appendChild(gh);

    inner.appendChild(linksContainer);

    // Theme toggle
    var themeBtn = document.createElement('button');
    themeBtn.className = 'site-nav-theme-toggle';
    themeBtn.type = 'button';
    themeBtn.setAttribute('aria-label', 'Toggle dark mode');
    themeBtn.setAttribute('title', 'Toggle dark mode');
    themeBtn.innerHTML = ICON_SUN + ICON_MOON;
    themeBtn.addEventListener('click', toggleTheme);
    inner.appendChild(themeBtn);

    // Mobile hamburger
    var mobileBtn = document.createElement('button');
    mobileBtn.className = 'site-nav-mobile-btn';
    mobileBtn.type = 'button';
    mobileBtn.setAttribute('aria-label', 'Toggle menu');
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.innerHTML = ICON_MENU + ICON_CLOSE;
    inner.appendChild(mobileBtn);

    nav.appendChild(inner);

    // Mobile menu
    var mobileMenu = document.createElement('div');
    mobileMenu.className = 'site-nav-mobile-menu';
    mobileMenu.setAttribute('role', 'menu');

    for (var j = 0; j < links.length; j++) {
      var ma = document.createElement('a');
      ma.className = links[j].page === currentPage ? 'active' : '';
      ma.href = links[j].href;
      ma.textContent = links[j].label;
      ma.setAttribute('role', 'menuitem');
      mobileMenu.appendChild(ma);
    }

    var mgh = document.createElement('a');
    mgh.href = GITHUB_URL;
    mgh.target = '_blank';
    mgh.rel = 'noopener';
    mgh.textContent = 'GitHub';
    mgh.setAttribute('role', 'menuitem');
    mobileMenu.appendChild(mgh);

    // Mobile toggle handler
    mobileBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      mobileBtn.classList.toggle('open', isOpen);
      mobileBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        mobileBtn.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });

    return { nav: nav, mobileMenu: mobileMenu };
  }

  // ── Footer ──────────────────────────────────────────────────
  function createFooter() {
    var base = basePath();
    var footer = document.createElement('footer');
    footer.className = 'site-footer';

    footer.innerHTML =
      '<div class="site-footer-inner">' +
      '<div class="site-footer-brand">' +
      '<h3>Teryx</h3>' +
      '<p>Enterprise-grade widget framework built on xhtmlx. 45+ TypeScript components, declarative HTML API, zero dependencies.</p>' +
      '<span class="site-footer-badge">MIT License</span>' +
      '</div>' +
      '<div class="site-footer-col">' +
      '<h4>Product</h4>' +
      '<a href="' +
      (base || './') +
      '">Home</a>' +
      '<a href="' +
      base +
      'widgets/">Widgets</a>' +
      '<a href="' +
      base +
      'explorer/">Explorer</a>' +
      '<a href="' +
      base +
      'docs/">Documentation</a>' +
      '</div>' +
      '<div class="site-footer-col">' +
      '<h4>Resources</h4>' +
      '<a href="' +
      GITHUB_URL +
      '" target="_blank" rel="noopener">GitHub</a>' +
      '<a href="' +
      GITHUB_URL +
      '/releases" target="_blank" rel="noopener">Releases</a>' +
      '<a href="' +
      GITHUB_URL +
      '/issues" target="_blank" rel="noopener">Issues</a>' +
      '<a href="' +
      base +
      'blog/">Blog</a>' +
      '</div>' +
      '<div class="site-footer-col">' +
      '<h4>Built With</h4>' +
      '<a href="https://www.npmjs.com/package/xhtmlx" target="_blank" rel="noopener">xhtmlx</a>' +
      '<a href="https://typescriptlang.org" target="_blank" rel="noopener">TypeScript</a>' +
      '<a href="https://tsup.egoist.dev" target="_blank" rel="noopener">tsup</a>' +
      '</div>' +
      '</div>' +
      '<div class="site-footer-bottom">' +
      '<span>&copy; ' +
      new Date().getFullYear() +
      ' Teryx. MIT Licensed.</span>' +
      '<div class="site-footer-social">' +
      '<a href="' +
      GITHUB_URL +
      '" target="_blank" rel="noopener" aria-label="GitHub">' +
      ICON_GITHUB +
      '</a>' +
      '</div>' +
      '</div>';

    return footer;
  }

  // ── Init ────────────────────────────────────────────────────
  function init() {
    var page = detectPage();

    // Apply theme before rendering to avoid flash
    applyTheme(getPreferredTheme());

    // Inject nav
    var result = createNav(page);
    document.body.insertBefore(result.mobileMenu, document.body.firstChild);
    document.body.insertBefore(result.nav, document.body.firstChild);
    document.body.classList.add('has-site-nav');

    // Inject footer (skip for explorer — it's a full-height app layout)
    if (page !== 'explorer') {
      var footerTarget = document.getElementById('site-footer');
      if (footerTarget) {
        footerTarget.parentNode.replaceChild(createFooter(), footerTarget);
      } else {
        document.body.appendChild(createFooter());
      }
    }
  }

  // Apply theme immediately (before DOMContentLoaded) to prevent flash
  applyTheme(getPreferredTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for testing
  window.TeryxSiteLayout = {
    toggleTheme: toggleTheme,
    applyTheme: applyTheme,
    getPreferredTheme: getPreferredTheme,
    detectPage: detectPage,
  };
})();
