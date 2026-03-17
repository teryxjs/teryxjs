# Contributing to Teryx

Thank you for your interest in contributing to Teryx! This guide covers everything you need to get started.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/teryxjs/teryxjs.git
   cd teryxjs
   ```

2. **Install dependencies**

   Teryx uses [pnpm](https://pnpm.io/) as its package manager.

   ```bash
   pnpm install
   ```

3. **Build the project**

   ```bash
   pnpm build
   ```

4. **Run tests**

   ```bash
   pnpm test
   ```

5. **Start the dev server** (optional, for the demo page)

   ```bash
   pnpm demo
   ```

## Branch Naming

Use the following prefixes for branch names:

| Prefix      | Purpose                          | Example                          |
|-------------|----------------------------------|----------------------------------|
| `feature/`  | New features or enhancements     | `feature/grid-infinite-scroll`   |
| `fix/`      | Bug fixes                        | `fix/modal-backdrop-click`       |
| `infra/`    | Tooling, CI, build configuration | `infra/bundle-analyzer`          |
| `docs/`     | Documentation changes            | `docs/contributing`              |

Always branch from `main`. Never commit directly to `main`.

## PR Process

1. **One issue per PR.** Each pull request should address a single issue. Reference the issue in the PR body with `Closes #N`.

2. **CI must be green.** All tests, linting, and type checks must pass before a PR can be merged. Run the full check locally:

   ```bash
   pnpm lint
   pnpm format:check
   pnpm test
   ```

3. **No force push to main.** The `main` branch is protected. Never force-push to it.

4. **Request review.** All PRs require at least one review before merging.

5. **Keep commits clean.** Write clear, descriptive commit messages. Squash fixup commits before requesting review.

## Code Style

Teryx uses **ESLint** for linting and **Prettier** for formatting. Both are configured in the repository.

Before committing, always run:

```bash
pnpm lint && pnpm format
```

Key conventions:

- TypeScript strict mode is enabled.
- Use `const` by default; use `let` only when reassignment is needed.
- Prefer named exports over default exports.
- Use single quotes for strings.
- Keep lines under 120 characters.
- All public APIs must have JSDoc comments.

## Widget Implementation Guide

To add a new widget to Teryx, follow this structure:

### 1. Create the widget file

Create `src/widgets/my-widget.ts`:

```typescript
import type { MyWidgetOptions, MyWidgetInstance } from '../types';
import { resolveTarget, cls, uid } from '../utils';
import { registerWidget } from '../core';

export function myWidget(
  target: string | HTMLElement,
  options: MyWidgetOptions,
): MyWidgetInstance {
  const el = resolveTarget(target);
  // ... widget implementation ...

  return {
    el,
    destroy() {
      el.innerHTML = '';
    },
    // ... instance methods ...
  };
}

// Register for declarative usage
registerWidget('myWidget', (el, opts) =>
  myWidget(el, opts as unknown as MyWidgetOptions),
);
```

### 2. Add type definitions

Add your widget's option and instance types to `src/types.ts`:

```typescript
export interface MyWidgetOptions {
  // ... options ...
}

export interface MyWidgetInstance extends WidgetInstance {
  // ... instance methods ...
}
```

### 3. Export from the widget index

Add your widget to `src/widgets/index.ts`:

```typescript
export { myWidget } from './my-widget';
```

And to `src/index.ts`:

```typescript
export { myWidget } from './widgets';
```

### 4. Add CSS styles

Add widget-specific styles to `styles/teryx.css` using the `tx-` prefix:

```css
.tx-my-widget { /* ... */ }
.tx-my-widget-item { /* ... */ }
```

### 5. Write tests

See the "Test Requirements" section below.

## Test Requirements

Every widget must have:

### Unit tests

Create `tests/widgets/my-widget.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { myWidget } from '../../src/widgets/my-widget';

describe('myWidget', () => {
  let container: HTMLElement;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should render correctly', () => {
    const instance = myWidget(container, { /* options */ });
    expect(container.querySelector('.tx-my-widget')).not.toBeNull();
  });

  it('should clean up on destroy', () => {
    const instance = myWidget(container, { /* options */ });
    instance.destroy();
    expect(container.innerHTML).toBe('');
  });

  // ... more tests ...
});
```

Run unit tests with:

```bash
pnpm test
```

### Browser tests

Create `tests/browser/my-widget.spec.ts` for Playwright-based browser tests that verify real DOM rendering and user interactions:

```bash
pnpm test:browser
```

## Release Process

Teryx uses [changesets](https://github.com/changesets/changesets) for version management.

1. **Add a changeset** when your PR includes user-facing changes:

   ```bash
   pnpm changeset
   ```

   Follow the prompts to select the change type (patch, minor, major) and write a summary.

2. **Version bump** is handled by maintainers:

   ```bash
   pnpm version
   ```

3. **Publish** is triggered automatically when a GitHub Release is created, or manually by maintainers:

   ```bash
   pnpm release
   ```

4. **Semantic versioning** rules:
   - **patch** (0.x.Y): Bug fixes, documentation updates
   - **minor** (0.X.0): New widgets, new features, non-breaking API additions
   - **major** (X.0.0): Breaking API changes

## Questions?

Open a [GitHub Issue](https://github.com/teryxjs/teryxjs/issues) or start a [Discussion](https://github.com/teryxjs/teryxjs/discussions) if you have questions about contributing.
