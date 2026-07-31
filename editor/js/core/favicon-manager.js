(function (root) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const OUTPUTS = Object.freeze([
    { path: 'images/favicon-16x16.png', size: 16, type: 'png' },
    { path: 'images/favicon-32x32.png', size: 32, type: 'png' },
    { path: 'images/favicon-48x48.png', size: 48, type: 'png' },
    { path: 'images/apple-touch-icon.png', size: 180, type: 'png' },
    { path: 'images/android-chrome-192x192.png', size: 192, type: 'png' },
    { path: 'images/android-chrome-512x512.png', size: 512, type: 'png' },
    { path: 'images/favicon.ico', size: 32, type: 'ico' },
    { path: 'site.webmanifest', size: 0, type: 'manifest' }
  ]);

  let editor = null;
  let state = { schemaVersion: SCHEMA_VERSION, configured: false, sourceName: '', sourceType: '', updatedAt: '', outputs: [] };
  let previewUrl = '';

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function importState(value) {
    const next = value && typeof value === 'object' ? value : {};
    state = {
      schemaVersion: SCHEMA_VERSION,
      configured: Boolean(next.configured),
      sourceName: String(next.sourceName || ''),
      sourceType: String(next.sourceType || ''),
      updatedAt: String(next.updatedAt || ''),
      outputs: Array.isArray(next.outputs) ? next.outputs.filter(path => OUTPUTS.some(item => item.path === path)) : []
    };
    refreshUi();
    return clone(state);
  }

  function decorateProjectData(projectData) {
    const data = projectData || {};
    data.oluntir = Object.assign({}, data.oluntir || {}, { favicon: clone(state) });
    return data;
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => resolve({ image, url });
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Die ausgewählte Bilddatei konnte nicht gelesen werden.')); };
      image.src = url;
    });
  }

  function canvasBlob(canvas, type) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Das Favicon konnte nicht erzeugt werden.')), type || 'image/png'));
  }

  async function renderSquare(image, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const scale = Math.min(size / sourceWidth, size / sourceHeight);
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const x = Math.round((size - width) / 2);
    const y = Math.round((size - height) / 2);
    ctx.drawImage(image, x, y, width, height);
    const blob = await canvasBlob(canvas, 'image/png');
    canvas.width = 0;
    canvas.height = 0;
    return blob;
  }

  async function pngToIcoBlob(pngBlob, size) {
    const png = new Uint8Array(await pngBlob.arrayBuffer());
    const headerSize = 6 + 16;
    const buffer = new ArrayBuffer(headerSize + png.length);
    const view = new DataView(buffer);
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, 1, true);
    view.setUint8(6, size >= 256 ? 0 : size);
    view.setUint8(7, size >= 256 ? 0 : size);
    view.setUint8(8, 0);
    view.setUint8(9, 0);
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, png.length, true);
    view.setUint32(18, headerSize, true);
    new Uint8Array(buffer, headerSize).set(png);
    return new Blob([buffer], { type: 'image/x-icon' });
  }

  async function generate(file) {
    if (!file || !/^image\/(png|jpeg|webp|gif|svg\+xml)$/i.test(file.type || '')) {
      throw new Error('Bitte eine PNG-, JPG-, WebP-, GIF- oder SVG-Datei auswählen.');
    }
    // Beim Ersetzen dürfen keine veralteten Varianten im Projekt-Asset-Speicher verbleiben.
    for (const output of OUTPUTS) {
      if (typeof removeUploadedAsset === 'function') await removeUploadedAsset(output.path);
    }
    const loaded = await loadImage(file);
    try {
      const generated = new Map();
      for (const output of OUTPUTS.filter(item => item.type === 'png')) {
        generated.set(output.path, await renderSquare(loaded.image, output.size));
      }
      const icoPng = generated.get('images/favicon-32x32.png') || await renderSquare(loaded.image, 32);
      generated.set('images/favicon.ico', await pngToIcoBlob(icoPng, 32));
      generated.set('site.webmanifest', new Blob([JSON.stringify({
        name: 'Oluntir Website',
        short_name: 'Website',
        icons: [
          { src: 'images/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'images/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      }, null, 2) + '\n'], { type: 'application/manifest+json' }));
      for (const [path, blob] of generated.entries()) {
        if (typeof registerUploadedAssetAtPathAsync === 'function') await registerUploadedAssetAtPathAsync(blob, path);
        else if (typeof registerUploadedAssetAtPath === 'function') registerUploadedAssetAtPath(blob, path);
        else throw new Error('Der lokale Asset-Speicher ist nicht verfügbar.');
      }
      state = {
        schemaVersion: SCHEMA_VERSION,
        configured: true,
        sourceName: file.name || 'favicon',
        sourceType: file.type || '',
        updatedAt: new Date().toISOString(),
        outputs: OUTPUTS.map(item => item.path)
      };
      setPreviewFromBlob(generated.get('images/android-chrome-192x192.png'));
      refreshUi();
      if (typeof root.OluntirPersistProjectNow === 'function') await root.OluntirPersistProjectNow();
      return clone(state);
    } finally {
      URL.revokeObjectURL(loaded.url);
    }
  }

  async function clear() {
    for (const output of OUTPUTS) {
      if (typeof removeUploadedAsset === 'function') await removeUploadedAsset(output.path);
    }
    state = { schemaVersion: SCHEMA_VERSION, configured: false, sourceName: '', sourceType: '', updatedAt: '', outputs: [] };
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    refreshUi();
    if (typeof root.OluntirPersistProjectNow === 'function') await root.OluntirPersistProjectNow();
  }

  function setPreviewFromBlob(blob) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = blob ? URL.createObjectURL(blob) : '';
  }

  async function restorePreview() {
    const candidates = [
      'images/android-chrome-192x192.png',
      'images/apple-touch-icon.png',
      'images/favicon-48x48.png',
      'images/favicon-32x32.png'
    ];
    let blob = null;
    for (let attempt = 0; attempt < 8 && !blob; attempt += 1) {
      if (typeof assetBlobs !== 'undefined' && assetBlobs) {
        const path = candidates.find(candidate => assetBlobs.get(candidate));
        blob = path ? assetBlobs.get(path) : null;
      }
      if (!blob && attempt < 7) await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (blob) setPreviewFromBlob(blob);
    reconcileStateWithAssets();
    refreshUi();
  }

  function getHeadHtml() {
    if (!state.configured) return '    <link rel="shortcut icon" href="images/favicon.ico">';
    return [
      '    <link rel="icon" href="images/favicon.ico" sizes="any">',
      '    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">',
      '    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">',
      '    <link rel="icon" type="image/png" sizes="48x48" href="images/favicon-48x48.png">',
      '    <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">',
      '    <link rel="icon" type="image/png" sizes="192x192" href="images/android-chrome-192x192.png">',
      '    <link rel="icon" type="image/png" sizes="512x512" href="images/android-chrome-512x512.png">',
      '    <link rel="manifest" href="site.webmanifest">'
    ].join('\n');
  }

  function getExportEntries() {
    if (!state.configured || typeof assetBlobs === 'undefined') return [];
    return state.outputs.map(path => ({ path, blob: assetBlobs.get(path) })).filter(entry => entry.blob);
  }


  function formatUpdatedAt(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang === 'de' ? 'de-DE' : undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (_) {
      return date.toLocaleString();
    }
  }

  function humanSourceType(value) {
    const type = String(value || '').toLowerCase();
    const labels = {
      'image/png': 'PNG',
      'image/jpeg': 'JPG',
      'image/webp': 'WebP',
      'image/gif': 'GIF',
      'image/svg+xml': 'SVG'
    };
    return labels[type] || (type ? type.replace(/^image\//, '').toUpperCase() : 'Bilddatei');
  }

  function hasGeneratedAssets() {
    if (typeof assetBlobs === 'undefined' || !assetBlobs) return false;
    return OUTPUTS.filter(item => item.type !== 'manifest').some(item => assetBlobs.has(item.path));
  }

  function reconcileStateWithAssets() {
    const hasAssets = hasGeneratedAssets();
    if (hasAssets && !state.configured) {
      state.configured = true;
      state.sourceName = state.sourceName || 'Zuletzt gesetztes Projekt-Favicon';
      state.sourceType = state.sourceType || '';
      state.outputs = OUTPUTS.filter(item => item.type === 'manifest' || (typeof assetBlobs !== 'undefined' && assetBlobs.has(item.path))).map(item => item.path);
    }
    return hasAssets;
  }

  function refreshUi() {
    const configured = Boolean(state.configured || reconcileStateWithAssets());
    const image = document.getElementById('oluntir-favicon-preview');
    const empty = document.getElementById('oluntir-favicon-empty');
    const name = document.getElementById('oluntir-favicon-source-name');
    const status = document.getElementById('oluntir-favicon-status');
    const type = document.getElementById('oluntir-favicon-source-type');
    const updated = document.getElementById('oluntir-favicon-updated-at');
    const instruction = document.getElementById('oluntir-favicon-instruction');
    const remove = document.getElementById('oluntir-favicon-remove');
    const choose = document.getElementById('oluntir-favicon-choose');
    if (image) { image.hidden = !previewUrl; if (previewUrl) image.src = previewUrl; }
    if (empty) empty.hidden = Boolean(previewUrl);
    if (status) status.textContent = configured ? 'Aktuell gesetztes Projekt-Favicon' : 'Noch kein eigenes Favicon gesetzt';
    if (name) name.textContent = configured ? (state.sourceName || 'Projekt-Favicon') : 'Keine Bilddatei ausgewählt';
    if (type) {
      type.textContent = configured ? humanSourceType(state.sourceType) : '–';
      type.closest('div')?.toggleAttribute('hidden', !configured);
    }
    if (updated) {
      updated.textContent = configured ? (formatUpdatedAt(state.updatedAt) || 'aus dem Projekt wiederhergestellt') : '–';
      updated.closest('div')?.toggleAttribute('hidden', !configured);
    }
    if (instruction) instruction.textContent = configured
      ? 'Zum Ändern bitte ein neues Bild auswählen. Die bisher erzeugten Favicon-Dateien werden vollständig entfernt und durch die neuen Varianten ersetzt.'
      : 'Wählen Sie ein Bild aus. Oluntir erzeugt daraus automatisch alle benötigten Browser- und Gerätevarianten.';
    if (remove) remove.disabled = !configured;
    if (choose && !choose.disabled) choose.textContent = configured ? 'Favicon durch neues Bild ersetzen' : 'Bild auswählen und Favicons erzeugen';
  }

  function openDialog() {
    const modal = document.getElementById('oluntir-favicon-modal');
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    restorePreview();
  }

  function closeDialog() {
    const modal = document.getElementById('oluntir-favicon-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }

  function bindUi() {
    const modal = document.getElementById('oluntir-favicon-modal');
    const input = document.getElementById('oluntir-favicon-input');
    const choose = document.getElementById('oluntir-favicon-choose');
    const close = document.getElementById('oluntir-favicon-close');
    const done = document.getElementById('oluntir-favicon-done');
    const remove = document.getElementById('oluntir-favicon-remove');
    if (!modal || modal.dataset.bound === 'true') return;
    modal.dataset.bound = 'true';
    choose && choose.addEventListener('click', () => input && input.click());
    input && input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      try {
        choose.disabled = true;
        choose.textContent = 'Favicons werden erzeugt …';
        await generate(file);
        if (root.toast) root.toast('Favicon-Varianten wurden erzeugt und gespeichert.');
      } catch (error) {
        console.error(error);
        alert('Favicon konnte nicht erstellt werden:\n\n' + (error.message || error));
      } finally {
        choose.disabled = false;
        refreshUi();
      }
    });
    close && close.addEventListener('click', closeDialog);
    done && done.addEventListener('click', closeDialog);
    remove && remove.addEventListener('click', async () => {
      if (!confirm('Das projektweite Favicon wirklich entfernen?')) return;
      await clear();
      if (root.toast) root.toast('Projekt-Favicon wurde entfernt.');
    });
    modal.addEventListener('click', event => { if (event.target === modal) closeDialog(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeDialog(); });
    refreshUi();
  }

  function bind(nextEditor) {
    editor = nextEditor;
    bindUi();
    const restore = () => {
      const data = editor && editor.getProjectData ? editor.getProjectData() : null;
      importState(data && data.oluntir ? data.oluntir.favicon : null);
      restorePreview();
    };
    if (editor && editor.on) {
      editor.on('load', restore);
      editor.on('project:load', restore);
      editor.on('project:get', event => {
        if (event && event.project) decorateProjectData(event.project);
      });
    }
  }

  root.OluntirFavicon = {
    SCHEMA_VERSION,
    OUTPUTS,
    bind,
    bindUi,
    openDialog,
    closeDialog,
    generate,
    clear,
    importState,
    exportState: () => clone(state),
    decorateProjectData,
    getHeadHtml,
    getExportEntries
  };
})(typeof window !== 'undefined' ? window : globalThis);
