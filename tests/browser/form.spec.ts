import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget, assertExists, assertNotExists } from './helpers';

test.describe('Form', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders a text input field', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-form');
    await assertExists(page, 'input[name="username"]');
    const input = page.locator('input[name="username"]');
    await expect(input).toHaveAttribute('type', 'text');
  });

  test('renders an email input field', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'email', label: 'Email', type: 'email' },
        ],
      });
    `,
    );
    const input = page.locator('input[name="email"]');
    await expect(input).toHaveAttribute('type', 'email');
  });

  test('renders a textarea field', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'bio', label: 'Bio', type: 'textarea', rows: 4 },
        ],
      });
    `,
    );
    await assertExists(page, 'textarea[name="bio"]');
    const textarea = page.locator('textarea[name="bio"]');
    await expect(textarea).toHaveAttribute('rows', '4');
  });

  test('renders a select field with options', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
              { value: 'editor', label: 'Editor' },
            ],
          },
        ],
      });
    `,
    );
    await assertExists(page, 'select[name="role"]');
    const options = page.locator('select[name="role"] option');
    await expect(options).toHaveCount(3);
  });

  test('renders a checkbox field', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'agree', label: 'I agree', type: 'checkbox' },
        ],
      });
    `,
    );
    await assertExists(page, 'input[name="agree"][type="checkbox"]');
    const label = page.locator('.tx-checkbox-text');
    await expect(label).toHaveText('I agree');
  });

  test('renders radio button group', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          {
            name: 'color',
            label: 'Color',
            type: 'radio',
            options: [
              { value: 'red', label: 'Red' },
              { value: 'blue', label: 'Blue' },
              { value: 'green', label: 'Green' },
            ],
          },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-radio-group');
    const radios = page.locator('input[name="color"][type="radio"]');
    await expect(radios).toHaveCount(3);
  });

  test('renders a switch field', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'notifications', label: 'Enable Notifications', type: 'switch' },
        ],
      });
    `,
    );
    await expect(page.locator('.tx-switch-input')).toHaveCount(1);
    const text = page.locator('.tx-switch-text');
    await expect(text).toHaveText('Enable Notifications');
  });

  test('shows required asterisk on required fields', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'optional', label: 'Optional', type: 'text' },
        ],
      });
    `,
    );
    const requiredMarkers = page.locator('.tx-form-required');
    await expect(requiredMarkers).toHaveCount(1);
    await expect(requiredMarkers.first()).toHaveText('*');
  });

  test('getData returns current form values', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      window.__form = Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
        ],
      });
    `,
    );

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');

    const data = await page.evaluate(() => (window as any).__form.getData());
    expect(data.username).toBe('testuser');
    expect(data.email).toBe('test@example.com');
  });

  test('setData populates form fields', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      window.__form = Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
        ],
      });
    `,
    );

    await page.evaluate(() => {
      (window as any).__form.setData({ username: 'alice', email: 'alice@example.com' });
    });

    await expect(page.locator('input[name="username"]')).toHaveValue('alice');
    await expect(page.locator('input[name="email"]')).toHaveValue('alice@example.com');
  });

  test('setErrors shows error messages and clearErrors removes them', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      window.__form = Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
        ],
      });
    `,
    );

    // Set errors
    await page.evaluate(() => {
      (window as any).__form.setErrors({
        username: 'Username is required',
        email: 'Invalid email',
      });
    });

    const errorGroups = page.locator('.tx-form-error');
    await expect(errorGroups).toHaveCount(2);

    const feedbacks = page.locator('.tx-form-feedback');
    const feedbackTexts = await feedbacks.allTextContents();
    expect(feedbackTexts).toContain('Username is required');
    expect(feedbackTexts).toContain('Invalid email');

    // Clear errors
    await page.evaluate(() => (window as any).__form.clearErrors());
    await expect(page.locator('.tx-form-error')).toHaveCount(0);
  });

  test('reset clears form values', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      window.__form = Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
        ],
      });
    `,
    );

    await page.fill('input[name="username"]', 'testuser');
    await expect(page.locator('input[name="username"]')).toHaveValue('testuser');

    await page.evaluate(() => (window as any).__form.reset());
    await expect(page.locator('input[name="username"]')).toHaveValue('');
  });

  test('renders submit button with custom label', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        submitLabel: 'Save Changes',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
        ],
      });
    `,
    );
    const submitBtn = page.locator('.tx-form-actions button[type="submit"]');
    await expect(submitBtn).toHaveText('Save Changes');
  });

  test('renders default submit label when not specified', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
        ],
      });
    `,
    );
    const submitBtn = page.locator('.tx-form-actions button[type="submit"]');
    await expect(submitBtn).toHaveText('Submit');
  });

  test('renders disabled fields', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'locked', label: 'Locked Field', type: 'text', disabled: true },
        ],
      });
    `,
    );
    const input = page.locator('input[name="locked"]');
    await expect(input).toBeDisabled();
  });

  test('renders placeholder text on input fields', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'search', label: 'Search', type: 'text', placeholder: 'Type to search...' },
        ],
      });
    `,
    );
    const input = page.locator('input[name="search"]');
    await expect(input).toHaveAttribute('placeholder', 'Type to search...');
  });

  test('form uses vertical layout class by default', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-form-vertical');
  });

  test('form uses horizontal layout class when specified', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        layout: 'horizontal',
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-form-horizontal');
  });

  test('renders cancel button when cancelLabel is set', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        cancelLabel: 'Cancel',
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
        ],
      });
    `,
    );
    const cancelBtn = page.locator('.tx-form-cancel');
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toHaveText('Cancel');
  });

  test('destroy clears form content', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      window.__form = Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-form');
    await page.evaluate(() => (window as any).__form.destroy());
    await page.waitForTimeout(100);
    await assertNotExists(page, '.tx-form');
  });

  test('renders help text for a field', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        fields: [
          { name: 'password', label: 'Password', type: 'password', helpText: 'Must be at least 8 characters' },
        ],
      });
    `,
    );
    const helpText = page.locator('.tx-form-help');
    await expect(helpText).toHaveText('Must be at least 8 characters');
  });

  test('renders multi-column grid layout', async ({ page }) => {
    await mockAPI(page, '/api/submit', { ok: true });
    await createWidget(
      page,
      `
      Teryx.form('#target', {
        action: '/api/submit',
        columns: 2,
        fields: [
          { name: 'first', label: 'First', type: 'text' },
          { name: 'last', label: 'Last', type: 'text' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-form-grid.tx-form-cols-2');
  });
});
