// ============================================================
// Teryx — FileUpload Widget
// ============================================================

import type { FileUploadOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function fileupload(target: string | HTMLElement, options: FileUploadOptions): WidgetInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-upload');
  const multiple = options.multiple ?? false;
  const maxSize = options.maxSize || Infinity;
  const maxFiles = options.maxFiles || Infinity;
  const dragDrop = options.dragDrop !== false;
  const fieldName = options.fieldName || 'file';

  let html = `<div class="${cls('tx-upload', dragDrop && 'tx-upload-dragdrop', options.class)}" id="${esc(id)}">`;

  // Drop zone
  html += '<div class="tx-upload-dropzone">';
  html += `<div class="tx-upload-icon">${icon('upload', 32)}</div>`;
  html += '<div class="tx-upload-text">';
  if (dragDrop) {
    html += '<span>Drop files here or </span>';
  }
  html += `<label class="tx-upload-browse">`;
  html += 'Browse';
  html += `<input type="file" class="tx-upload-input"`;
  if (multiple) html += ' multiple';
  if (options.accept) html += ` accept="${esc(options.accept)}"`;
  html += ' hidden>';
  html += '</label>';
  html += '</div>';
  if (options.maxSize) {
    html += `<div class="tx-upload-hint">Max file size: ${formatSize(options.maxSize)}</div>`;
  }
  html += '</div>';

  // File list
  html += '<div class="tx-upload-list" id="' + esc(id) + '-list"></div>';

  html += '</div>';
  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;
  const input = container.querySelector('.tx-upload-input') as HTMLInputElement;
  const dropzone = container.querySelector('.tx-upload-dropzone') as HTMLElement;
  const fileList = container.querySelector(`#${id}-list`) as HTMLElement;
  const uploadedFiles: { file: File; status: string }[] = [];

  function handleFiles(files: FileList | File[]): void {
    const arr = Array.from(files);
    for (const file of arr) {
      if (uploadedFiles.length >= maxFiles) {
        addError(`Maximum ${maxFiles} files allowed`);
        break;
      }
      if (file.size > maxSize) {
        addError(`${file.name} exceeds max size of ${formatSize(maxSize)}`);
        continue;
      }
      uploadFile(file);
    }
  }

  function uploadFile(file: File): void {
    const entry = { file, status: 'uploading' };
    uploadedFiles.push(entry);
    const entryId = uid('tx-upload-file');

    // Add to list
    let itemHtml = `<div class="tx-upload-item" id="${entryId}">`;
    itemHtml += `<div class="tx-upload-item-icon">${icon('file')}</div>`;
    itemHtml += '<div class="tx-upload-item-info">';
    itemHtml += `<div class="tx-upload-item-name">${esc(file.name)}</div>`;
    itemHtml += `<div class="tx-upload-item-size">${formatSize(file.size)}</div>`;
    itemHtml += '</div>';
    itemHtml += '<div class="tx-upload-item-status">';
    itemHtml +=
      '<div class="tx-progress tx-progress-xs"><div class="tx-progress-bar tx-upload-progress" style="width:0%"></div></div>';
    itemHtml += '</div>';
    itemHtml += `<button class="tx-upload-item-remove">${icon('x')}</button>`;
    itemHtml += '</div>';

    const temp = document.createElement('div');
    temp.innerHTML = itemHtml;
    const itemEl = temp.firstElementChild as HTMLElement;
    fileList.appendChild(itemEl);

    // Upload via XHR (for progress)
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append(fieldName, file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = (e.loaded / e.total) * 100;
        const bar = itemEl.querySelector('.tx-upload-progress') as HTMLElement;
        if (bar) bar.style.width = `${pct}%`;
      }
    });

    xhr.addEventListener('load', () => {
      entry.status = xhr.status >= 200 && xhr.status < 300 ? 'done' : 'error';
      itemEl.classList.add(entry.status === 'done' ? 'tx-upload-item-done' : 'tx-upload-item-error');
      const statusEl = itemEl.querySelector('.tx-upload-item-status');
      if (statusEl) {
        statusEl.innerHTML =
          entry.status === 'done'
            ? `<span class="tx-text-success">${icon('check')} Uploaded</span>`
            : `<span class="tx-text-danger">${icon('x')} Failed</span>`;
      }

      try {
        const response = JSON.parse(xhr.responseText);
        if (entry.status === 'done') {
          options.onComplete?.(response);
          emit('upload:complete', { id, file: file.name, response });
        } else {
          options.onError?.(response);
          emit('upload:error', { id, file: file.name, error: response });
        }
      } catch {
        if (entry.status !== 'done') {
          options.onError?.(xhr.statusText);
        }
      }
    });

    xhr.addEventListener('error', () => {
      entry.status = 'error';
      itemEl.classList.add('tx-upload-item-error');
      options.onError?.('Network error');
    });

    // Remove button
    itemEl.querySelector('.tx-upload-item-remove')?.addEventListener('click', () => {
      if (entry.status === 'uploading') xhr.abort();
      itemEl.remove();
      const idx = uploadedFiles.indexOf(entry);
      if (idx >= 0) uploadedFiles.splice(idx, 1);
    });

    xhr.open(options.method || 'POST', options.action);
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        xhr.setRequestHeader(k, v);
      }
    }
    xhr.send(formData);

    options.onUpload?.(file);
    emit('upload:start', { id, file: file.name });
  }

  function addError(message: string): void {
    const errEl = document.createElement('div');
    errEl.className = 'tx-upload-error';
    errEl.textContent = message;
    fileList.appendChild(errEl);
    setTimeout(() => errEl.remove(), 5000);
  }

  // Input change
  input.addEventListener('change', () => {
    if (input.files) handleFiles(input.files);
    input.value = '';
  });

  // Drag and drop
  if (dragDrop) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('tx-upload-dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('tx-upload-dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('tx-upload-dragover');
      if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
    });
  }

  return {
    el: container,
    destroy() {
      el.innerHTML = '';
    },
  };
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

registerWidget('fileupload', (el, opts) => fileupload(el, opts as unknown as FileUploadOptions));
export default fileupload;
