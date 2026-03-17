import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, compilePath, matchRoute } from '../src/router';

// ----------------------------------------------------------
//  compilePath / matchRoute (pure logic, no DOM)
// ----------------------------------------------------------
describe('compilePath', () => {
  it('should compile a static path', () => {
    const { regex, paramNames } = compilePath('/about');
    expect(paramNames).toEqual([]);
    expect(regex.test('/about')).toBe(true);
    expect(regex.test('/other')).toBe(false);
  });

  it('should compile a path with one param', () => {
    const { regex, paramNames } = compilePath('/users/:id');
    expect(paramNames).toEqual(['id']);
    expect(regex.test('/users/42')).toBe(true);
    expect(regex.test('/users/')).toBe(false);
    expect(regex.test('/users')).toBe(false);
  });

  it('should compile a path with multiple params', () => {
    const { regex, paramNames } = compilePath('/users/:userId/posts/:postId');
    expect(paramNames).toEqual(['userId', 'postId']);
    expect(regex.test('/users/1/posts/99')).toBe(true);
    expect(regex.test('/users/1/posts')).toBe(false);
  });
});

describe('matchRoute', () => {
  it('should extract params from a matching path', () => {
    const { regex, paramNames } = compilePath('/users/:id');
    const compiled = { route: { path: '/users/:id', handler: () => {} }, regex, paramNames };
    const params = matchRoute(compiled, '/users/42');
    expect(params).toEqual({ id: '42' });
  });

  it('should return null for a non-matching path', () => {
    const { regex, paramNames } = compilePath('/users/:id');
    const compiled = { route: { path: '/users/:id', handler: () => {} }, regex, paramNames };
    expect(matchRoute(compiled, '/posts/1')).toBeNull();
  });

  it('should decode URI-encoded param values', () => {
    const { regex, paramNames } = compilePath('/search/:query');
    const compiled = { route: { path: '/search/:query', handler: () => {} }, regex, paramNames };
    const params = matchRoute(compiled, '/search/hello%20world');
    expect(params).toEqual({ query: 'hello world' });
  });
});

// ----------------------------------------------------------
//  createRouter (uses jsdom)
// ----------------------------------------------------------
describe('createRouter', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('should create a router in hash mode by default', () => {
    const router = createRouter();
    expect(router).toBeDefined();
    expect(typeof router.route).toBe('function');
    expect(typeof router.navigate).toBe('function');
  });

  it('should call handler when start() resolves the current hash', () => {
    window.location.hash = '#/dashboard';
    const handler = vi.fn();
    const router = createRouter();
    router.route('/dashboard', handler);
    router.start();
    expect(handler).toHaveBeenCalledWith({});
    router.stop();
  });

  it('should call notFound when no route matches', () => {
    window.location.hash = '#/unknown';
    const notFound = vi.fn();
    const router = createRouter({ notFound });
    router.route('/home', () => {});
    router.start();
    expect(notFound).toHaveBeenCalledWith('/unknown');
    router.stop();
  });

  it('should block navigation when guard returns false', () => {
    window.location.hash = '#/admin';
    const handler = vi.fn();
    const guard = vi.fn(() => false);
    const router = createRouter();
    router.route('/admin', handler, guard);
    router.start();
    expect(guard).toHaveBeenCalledWith({});
    expect(handler).not.toHaveBeenCalled();
    router.stop();
  });

  it('should allow navigation when guard returns true', () => {
    window.location.hash = '#/admin';
    const handler = vi.fn();
    const guard = vi.fn(() => true);
    const router = createRouter();
    router.route('/admin', handler, guard);
    router.start();
    expect(guard).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
    router.stop();
  });

  it('should support chaining via route()', () => {
    const router = createRouter();
    const result = router.route('/a', () => {}).route('/b', () => {});
    expect(result).toBe(router);
  });

  it('should return current path via current()', () => {
    window.location.hash = '#/settings';
    const router = createRouter();
    expect(router.current()).toBe('/settings');
  });

  it('should resolve root path when hash is empty', () => {
    window.location.hash = '';
    const handler = vi.fn();
    const router = createRouter();
    router.route('/', handler);
    router.start();
    expect(handler).toHaveBeenCalledWith({});
    router.stop();
  });
});
