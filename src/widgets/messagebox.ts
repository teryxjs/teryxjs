// ============================================================
// Teryx — MessageBox / Confirm / Prompt
// ============================================================

import type { MessageBoxOptions } from '../types';
import { uid, esc, cls, icon } from '../utils';
import modal from './modal';

const typeIcons: Record<string, string> = {
  info: 'info',
  warning: 'warning',
  error: 'danger',
  success: 'success',
  question: 'info',
};

const typeColors: Record<string, string> = {
  info: 'primary',
  warning: 'warning',
  error: 'danger',
  success: 'success',
  question: 'primary',
};

export function messageBox(options: MessageBoxOptions): Promise<string> {
  return new Promise((resolve) => {
    const type = options.type || 'info';
    const buttons = options.buttons || [
      { text: 'OK', value: 'ok', variant: 'primary' as const },
    ];

    const id = uid('tx-msgbox');

    let content = `<div class="tx-msgbox">`;
    if (options.icon !== false) {
      content += `<div class="tx-msgbox-icon tx-msgbox-icon-${type}">${icon(typeIcons[type] || 'info', 48)}</div>`;
    }
    content += `<div class="tx-msgbox-message">${esc(options.message)}</div>`;
    content += '</div>';

    const m = modal({
      id,
      title: options.title,
      content,
      size: options.width ? undefined : 'sm',
      width: options.width,
      closable: options.closable !== false,
      backdrop: 'static',
      keyboard: false,
      buttons: buttons.map(btn => ({
        label: btn.text,
        variant: btn.variant || 'secondary',
        action: btn.value,
        handler() {
          m.close();
          resolve(btn.value);
          options.onResult?.(btn.value);
        },
      })),
      onClose() {
        resolve('close');
        options.onResult?.('close');
      },
    });

    m.open();
  });
}

/** Show an alert dialog. */
messageBox.alert = (message: string, title?: string): Promise<string> =>
  messageBox({ message, title, type: 'info', buttons: [{ text: 'OK', value: 'ok', variant: 'primary' }] });

/** Show a confirm dialog. */
messageBox.confirm = (message: string, title?: string): Promise<boolean> =>
  messageBox({
    message,
    title,
    type: 'question',
    buttons: [
      { text: 'Cancel', value: 'cancel', variant: 'secondary' },
      { text: 'OK', value: 'ok', variant: 'primary' },
    ],
  }).then(v => v === 'ok');

/** Show a success dialog. */
messageBox.success = (message: string, title?: string): Promise<string> =>
  messageBox({ message, title: title || 'Success', type: 'success' });

/** Show a warning dialog. */
messageBox.warning = (message: string, title?: string): Promise<string> =>
  messageBox({ message, title: title || 'Warning', type: 'warning' });

/** Show an error dialog. */
messageBox.error = (message: string, title?: string): Promise<string> =>
  messageBox({ message, title: title || 'Error', type: 'error' });

export default messageBox;
