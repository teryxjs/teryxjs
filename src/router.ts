// ============================================================
// Teryx — Client-side Router
// ============================================================

/** A single route definition. */
export interface Route {
  /** URL path pattern, supports `:param` segments (e.g. `/users/:id`). */
  path: string;
  /** Handler invoked when the route matches. */
  handler: (params: Record<string, string>) => void;
  /** Optional guard — return `false` to block navigation. */
  guard?: (params: Record<string, string>) => boolean;
}

/** Options for creating a router. */
export interface RouterOptions {
  /** Routing mode: `'hash'` (default) uses `#/path`, `'history'` uses pushState. */
  mode?: 'hash' | 'history';
  /** Base path prepended in history mode (default `''`). */
  base?: string;
  /** Handler invoked when no route matches. */
  notFound?: (path: string) => void;
}

/** The router instance returned by `createRouter()`. */
export interface Router {
  /** Register a route. */
  route(
    path: string,
    handler: (params: Record<string, string>) => void,
    guard?: (params: Record<string, string>) => boolean,
  ): Router;
  /** Navigate to a path programmatically. */
  navigate(path: string): void;
  /** Return the current path. */
  current(): string;
  /** Start listening for URL changes. */
  start(): void;
  /** Stop listening for URL changes. */
  stop(): void;
  /** Navigate back in browser history. */
  back(): void;
}

// ----------------------------------------------------------
//  Internal helpers
// ----------------------------------------------------------

interface CompiledRoute {
  route: Route;
  regex: RegExp;
  paramNames: string[];
}

/**
 * Compile a path pattern like `/users/:id/posts/:postId` into a regex
 * and extract param names.
 */
export function compilePath(path: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];

  // Split on param placeholders, escape regex-special chars in static segments
  const regexStr = path
    .replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, '\0PARAM\0')
    .replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
    .replace(/\0PARAM\0/g, () => '([^/]+)');

  // Collect param names separately
  const paramPattern = /:[a-zA-Z_][a-zA-Z0-9_]*/g;
  let m: RegExpExecArray | null;
  while ((m = paramPattern.exec(path)) !== null) {
    paramNames.push(m[0].slice(1));
  }

  return { regex: new RegExp(`^${regexStr}$`), paramNames };
}

/**
 * Try to match a path against a compiled route.
 * Returns the extracted params or `null` if no match.
 */
export function matchRoute(compiledRoute: CompiledRoute, path: string): Record<string, string> | null {
  const match = path.match(compiledRoute.regex);
  if (!match) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < compiledRoute.paramNames.length; i++) {
    params[compiledRoute.paramNames[i]] = decodeURIComponent(match[i + 1]);
  }
  return params;
}

// ----------------------------------------------------------
//  Public API
// ----------------------------------------------------------

/** Create a new router instance. */
export function createRouter(opts?: RouterOptions): Router {
  const mode = opts?.mode ?? 'hash';
  const base = (opts?.base ?? '').replace(/\/$/, '');
  const notFound = opts?.notFound;

  const routes: CompiledRoute[] = [];
  let listening = false;
  let listener: (() => void) | null = null;

  function currentPath(): string {
    if (mode === 'hash') {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      return hash.replace(/^#\/?/, '/').replace(/^$/, '/');
    }
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    return base ? pathname.replace(new RegExp(`^${base}`), '') || '/' : pathname;
  }

  function resolve(path: string): void {
    const normalised = path.startsWith('/') ? path : `/${path}`;
    for (const compiled of routes) {
      const params = matchRoute(compiled, normalised);
      if (params !== null) {
        // Check guard
        if (compiled.route.guard && !compiled.route.guard(params)) {
          return;
        }
        compiled.route.handler(params);
        return;
      }
    }
    // No match
    notFound?.(normalised);
  }

  const router: Router = {
    route(path, handler, guard?) {
      const { regex, paramNames } = compilePath(path);
      routes.push({ route: { path, handler, guard }, regex, paramNames });
      return router;
    },

    navigate(path: string) {
      const normalised = path.startsWith('/') ? path : `/${path}`;
      if (typeof window !== 'undefined') {
        if (mode === 'hash') {
          window.location.hash = `#${normalised}`;
          // hashchange event will call resolve
        } else {
          window.history.pushState(null, '', `${base}${normalised}`);
          resolve(normalised);
        }
      }
    },

    current() {
      return currentPath();
    },

    start() {
      if (listening) return;
      listening = true;

      if (mode === 'hash') {
        listener = () => resolve(currentPath());
        if (typeof window !== 'undefined') {
          window.addEventListener('hashchange', listener);
        }
      } else {
        listener = () => resolve(currentPath());
        if (typeof window !== 'undefined') {
          window.addEventListener('popstate', listener);
        }
      }

      // Resolve the current path immediately
      resolve(currentPath());
    },

    stop() {
      if (!listening || !listener) return;
      listening = false;
      if (typeof window !== 'undefined') {
        if (mode === 'hash') {
          window.removeEventListener('hashchange', listener);
        } else {
          window.removeEventListener('popstate', listener);
        }
      }
      listener = null;
    },

    back() {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    },
  };

  return router;
}
