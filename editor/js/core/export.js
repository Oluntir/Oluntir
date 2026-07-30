// Erstellt aus dem aktuellen GrapesJS-Projekt ein vollständiges Website-Paket.
// Die mitgelieferten Basis-Assets (css/js/images/fonts) sind in
// editor/js/core/site-assets-bundle.js eingebettet. Daher ist beim Export keine erneute
// Ordnerauswahl nötig und der Builder funktioniert auch direkt per file://.

const REQUIRED_EXPORT_FILES_BS4 = [
  'css/local-fonts.css',
  'css/bootstrap4/bootstrap.min.css',
  'css/font-awesome/all.min.css',
  'css/owl-carousel/owl.carousel.min.css',
  'css/magnific-popup/magnific-popup.css',
  'css/swiper/swiper.min.css',
  'css/animate/animate.min.css',
  'css/style.css',
  'css/pagebuilder-bs4.css',
  'js/jquery-3.4.1.min.js',
  'js/bootstrap4/bootstrap.bundle.min.js',
  'js/jquery.appear.js',
  'js/counter/jquery.countTo.js',
  'js/owl-carousel/owl.carousel.min.js',
  'js/swiper/swiper.min.js',
  'js/swiperanimation/SwiperAnimation.min.js',
  'js/magnific-popup/jquery.magnific-popup.min.js',
  'js/shuffle/shuffle.min.js',
  'js/custom.js',
  'js/pagebuilder-bs5-gallery.js',
];

const REQUIRED_EXPORT_FILES_BS5 = [
  'css/local-fonts.css',
  'css/font-awesome/all.min.css',
  'css/bootstrap5/bootstrap.min.css',
  'css/pagebuilder-bs5.css',
  'js/bootstrap5/bootstrap.bundle.min.js',
  'js/pagebuilder-bs5-gallery.js',
];

function getRequiredExportFiles() {
  const framework = window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' };
  return framework.id === 'bs5' ? REQUIRED_EXPORT_FILES_BS5 : REQUIRED_EXPORT_FILES_BS4;
}

function slugify(name) {
  const slug = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'seite';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveUploadPathsInHtml(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('[data-stable-path], [data-stable-download-path], [data-stable-srcset-path]').forEach((el) => {
    const path = el.getAttribute('data-stable-path');
    const downloadPath = el.getAttribute('data-stable-download-path');
    const srcsetPath = el.getAttribute('data-stable-srcset-path');
    if (path) { if (el.hasAttribute('src')) el.setAttribute('src', path); if (el.hasAttribute('href')) el.setAttribute('href', path); }
    if (downloadPath && el.hasAttribute('href')) el.setAttribute('href', downloadPath);
    if (srcsetPath) el.setAttribute('srcset', srcsetPath);
    el.removeAttribute('data-stable-path');
    el.removeAttribute('data-stable-download-path');
    el.removeAttribute('data-stable-srcset-path');
  });
  return container.innerHTML;
}

function normalizeExportHtml(html) {
  return resolveUploadPathsInHtml(html)
    .replace(/(?:\.\/)?site-assets\//g, '')
    .replace(/(?:\.\/)?assets\/images\//g, 'images/')
    .replace(/blob:[^"')\s]+/g, '');
}

function collectUploadPaths(html, css, targetSet) {
  const combined = `${html}\n${css || ''}`;
  const matches = combined.match(/(?:assets\/user_upload|images\/(?:uploads|downloads))\/[^"')\s;]+/g) || [];
  matches.forEach((path) => targetSet.add(path));
}


function commitInlineTextImagesToModel(editor) {
  try {
    const doc = editor.Canvas.getDocument();
    if (!doc || !doc.querySelectorAll) return;
    const dc = editor.getModel().get('DomComponents');
    const updated = new Set();

    doc.querySelectorAll('img[data-pb-inline-image="true"], img[data-stable-path]').forEach((image) => {
      // Galerie-, Lightbox- und klassische Bildkomponenten sind bereits eigenständige
      // GrapesJS-Komponenten. Hier werden nur Bilder innerhalb echter Textkomponenten
      // nachträglich in deren content-Eigenschaft übernommen.
      if (image.closest('a.portfolio-img, picture')) return;

      let element = image.parentElement;
      while (element && element !== doc.body) {
        let component = null;
        try { component = dc && dc.getComponent ? dc.getComponent(element) : null; } catch (e) { component = null; }
        if (component && component.get) {
          const type = String(component.get('type') || '').toLowerCase();
          const tag = String(component.get('tagName') || '').toLowerCase();
          if (type === 'text' || /^(p|h[1-6]|li|blockquote|figcaption|td|th)$/.test(tag)) {
            if (!updated.has(component)) {
              // Nur die Kinder der bestehenden Textkomponente aktualisieren. Ein Setzen
              // von `content` kann den gesamten Textblock ersetzen und dadurch dessen
              // Bootstrap-Klassen bzw. seine Position im Layout verlieren.
              if (typeof component.components === 'function') {
                component.components(element.innerHTML);
              }
              updated.add(component);
            }
            break;
          }
        }
        element = element.parentElement;
      }
    });
  } catch (error) {
    console.warn('Inline-Textbilder konnten vor dem Export nicht synchronisiert werden:', error);
  }
}


function getRenderedCanvasHtmlForExport(editor) {
  try {
    const doc = editor.Canvas.getDocument();
    if (!doc || !doc.body) return editor.getHtml();

    // Das gerenderte Canvas ist für Rich-Text-Inhalte die verlässlichste Quelle.
    // Insbesondere dynamisch in einen Textbereich eingefügte Bilder können bereits
    // sichtbar sein, obwohl GrapesJS sie noch nicht vollständig in getHtml() abbildet.
    const clone = doc.body.cloneNode(true);

    // Ausschließlich editorinterne Zustände entfernen. Klassen und normale
    // Datenattribute des eigentlichen Templates bleiben unangetastet.
    clone.querySelectorAll('[data-pb-image-insert-marker]').forEach((el) => el.remove());
    clone.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes || []).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.indexOf('data-gjs-') === 0 ||
            name === 'contenteditable' ||
            name === 'spellcheck' ||
            name === 'draggable' ||
            name === 'aria-grabbed') {
          el.removeAttribute(attr.name);
        }
      });
      el.classList.remove('gjs-selected', 'gjs-hovered', 'gjs-freezed');
      if (!el.className) el.removeAttribute('class');
    });

    return clone.innerHTML;
  } catch (error) {
    console.warn('Gerendertes Canvas konnte nicht für den Export gelesen werden:', error);
    return editor.getHtml();
  }
}

function collectUploadPathsFromHtml(html, targetSet) {
  const container = document.createElement('div');
  container.innerHTML = html || '';

  container.querySelectorAll('[src], [href], [srcset], [data-stable-path], [data-stable-download-path], [data-stable-srcset-path]').forEach((el) => {
    ['src', 'href', 'data-stable-path', 'data-stable-download-path'].forEach((name) => {
      const value = el.getAttribute(name) || '';
      const match = value.match(/(?:assets\/user_upload|images\/(?:uploads|downloads))\/[^?#"'\s;]+/);
      if (match) targetSet.add(match[0]);
    });

    ['srcset', 'data-stable-srcset-path'].forEach((name) => {
      const value = el.getAttribute(name) || '';
      value.split(',').forEach((candidate) => {
        const url = candidate.trim().split(/\s+/)[0] || '';
        const match = url.match(/(?:assets\/user_upload|images\/(?:uploads|downloads))\/[^?#"'\s;]+/);
        if (match) targetSet.add(match[0]);
      });
    });
  });
}

async function loadBaseAssetsZip() {
  if (typeof SITE_ASSETS_ZIP_BASE64 !== 'string' || !SITE_ASSETS_ZIP_BASE64.length) {
    throw new Error('Das eingebettete Asset-Paket fehlt oder konnte nicht geladen werden.');
  }

  const zip = await JSZip.loadAsync(SITE_ASSETS_ZIP_BASE64, { base64: true });
  const missing = getRequiredExportFiles().filter((path) => !zip.file(path));
  if (missing.length) {
    throw new Error(`Das Asset-Paket ist unvollständig. Fehlende Dateien:\n- ${missing.join('\n- ')}`);
  }
  return zip;
}

async function refreshUploadedAssetsFromDb() {
  if (typeof getAllAssetBlobsFromDb !== 'function') return;
  const items = await getAllAssetBlobsFromDb();
  for (const { path, blob } of items) {
    if (!assetBlobs.has(path)) assetBlobs.set(path, blob);
  }
}

function buildPageHtml(title, bodyHtml) {
  const framework = window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' };

  if (framework.id === 'bs5') {
    return `<!doctype html>
<html lang="de" data-bs-theme="light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>

    <link rel="shortcut icon" href="images/favicon.ico">
    <link href="css/local-fonts.css" rel="stylesheet">
    <link rel="stylesheet" href="css/font-awesome/all.min.css">
    <link rel="stylesheet" href="css/bootstrap5/bootstrap.min.css">
    <link rel="stylesheet" href="css/pagebuilder-bs5.css">
    <link rel="stylesheet" href="css/custom.css">
  </head>
  <body>
${bodyHtml}

    <script src="js/bootstrap5/bootstrap.bundle.min.js"></script>
    <script src="js/pagebuilder-bs5-gallery.js"></script>
  </body>
</html>
`;
  }

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${escapeHtml(title)}</title>

    <link rel="shortcut icon" href="images/favicon.ico">
    <link href="css/local-fonts.css" rel="stylesheet">

    <link rel="stylesheet" href="css/font-awesome/all.min.css">
    <link rel="stylesheet" href="css/bootstrap4/bootstrap.min.css">
    <link rel="stylesheet" href="css/owl-carousel/owl.carousel.min.css">
    <link rel="stylesheet" href="css/magnific-popup/magnific-popup.css">
    <link rel="stylesheet" href="css/swiper/swiper.min.css">
    <link rel="stylesheet" href="css/animate/animate.min.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/custom.css">
    <link rel="stylesheet" href="css/pagebuilder-bs4.css">
  </head>
  <body>
${bodyHtml}

    <script src="js/jquery-3.4.1.min.js"></script>
    <script src="js/bootstrap4/bootstrap.bundle.min.js"></script>
    <script src="js/jquery.appear.js"></script>
    <script src="js/counter/jquery.countTo.js"></script>
    <script src="js/owl-carousel/owl.carousel.min.js"></script>
    <script src="js/swiper/swiper.min.js"></script>
    <script src="js/swiperanimation/SwiperAnimation.min.js"></script>
    <script src="js/magnific-popup/jquery.magnific-popup.min.js"></script>
    <script src="js/shuffle/shuffle.min.js"></script>
    <script src="js/custom.js"></script>
    <script src="js/pagebuilder-bs5-gallery.js"></script>
  </body>
</html>
`;
}



const EXPORT_PART_LIMIT_BYTES = 300 * 1024 * 1024;

function supportsDirectZipStreaming() {
  return typeof window.showSaveFilePicker === 'function' &&
    typeof WritableStream !== 'undefined';
}

async function requestStreamingTarget(projectName) {
  if (!supportsDirectZipStreaming()) return null;
  return window.showSaveFilePicker({
    suggestedName: `${projectName}.zip`,
    types: [{
      description: 'ZIP-Archiv',
      accept: { 'application/zip': ['.zip'] },
    }],
  });
}

async function streamJsZipToFile(zip, fileHandle) {
  const writable = await fileHandle.createWritable();
  const stream = zip.generateInternalStream({
    type: 'uint8array',
    streamFiles: true,
    compression: 'DEFLATE',
    compressionOptions: { level: 4 },
  });

  let writtenBytes = 0;
  let writeChain = Promise.resolve();

  try {
    await new Promise((resolve, reject) => {
      stream.on('data', (chunk, metadata) => {
        stream.pause();
        writeChain = writeChain
          .then(() => writable.write(chunk))
          .then(() => {
            writtenBytes += chunk.byteLength || chunk.length || 0;
            const percent = metadata && Number.isFinite(metadata.percent)
              ? Math.round(metadata.percent)
              : null;
            updateProgress(
              percent == null ? null : 55 + Math.round(percent * 0.44),
              `ZIP wird direkt auf Datenträger geschrieben … ${percent == null ? '' : percent + '%'} (${formatBytes(writtenBytes)})`
            );
            stream.resume();
          })
          .catch(reject);
      });
      stream.on('error', reject);
      stream.on('end', () => writeChain.then(resolve, reject));
      stream.resume();
    });
    await writable.close();
  } catch (error) {
    try { await writable.abort(); } catch (abortError) { /* nicht kritisch */ }
    throw error;
  }
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let current = value / 1024;
  let unit = units[0];
  for (let i = 1; i < units.length && current >= 1024; i++) {
    current /= 1024;
    unit = units[i];
  }
  return `${current.toFixed(current >= 100 ? 0 : current >= 10 ? 1 : 2)} ${unit}`;
}

async function cloneBaseZip(baseZip) {
  const target = new JSZip();
  const names = Object.keys(baseZip.files);
  for (const name of names) {
    const entry = baseZip.files[name];
    if (entry.dir) {
      target.folder(name);
    } else {
      target.file(name, await entry.async('uint8array'));
    }
  }
  return target;
}

async function saveZipPart(zip, filename, partIndex, partCount) {
  updateProgress(
    55 + Math.round(((partIndex - 1) / Math.max(1, partCount)) * 43),
    `Erzeuge Teilarchiv ${partIndex} von ${partCount}: ${filename} …`
  );
  await nextFrame();
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: { level: 4 },
    },
    (metadata) => {
      const base = 55 + Math.round(((partIndex - 1) / Math.max(1, partCount)) * 43);
      const span = Math.max(1, Math.round(43 / Math.max(1, partCount)));
      updateProgress(base + Math.round((metadata.percent / 100) * span),
        `Teilarchiv ${partIndex}/${partCount} wird erstellt … ${Math.round(metadata.percent)}%`);
    }
  );
  saveAs(blob, filename);
  await nextFrame();
}

async function exportMultipartFallback(baseZip, pageFiles, customCss, uploadEntries) {
  const groups = [];
  let current = [];
  let currentBytes = 0;

  for (const entry of uploadEntries) {
    const size = entry.blob && Number(entry.blob.size) || 0;
    if (current.length && currentBytes + size > EXPORT_PART_LIMIT_BYTES) {
      groups.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(entry);
    currentBytes += size;
  }
  if (current.length) groups.push(current);

  const partCount = 1 + groups.length;
  const coreZip = await cloneBaseZip(baseZip);
  pageFiles.forEach(({ path, content }) => coreZip.file(path, content));
  coreZip.file('css/custom.css', customCss || '/* Keine individuellen Stil-Anpassungen */\n');
  coreZip.file('EXPORT-HINWEIS.txt',
    'Dieser Export wurde wegen fehlender Browser-Unterstützung für direktes ZIP-Streaming in mehrere Archive aufgeteilt.\r\n' +
    'Bitte alle ZIP-Dateien in dasselbe Zielverzeichnis entpacken. Vorhandene Ordner zusammenführen.\r\n');

  await saveZipPart(coreZip, `website-paket-01-von-${String(partCount).padStart(2, '0')}.zip`, 1, partCount);

  for (let i = 0; i < groups.length; i++) {
    const zip = new JSZip();
    for (const entry of groups[i]) zip.file(entry.path, entry.blob, { compression: 'STORE' });
    zip.file('EXPORT-HINWEIS.txt',
      'Bildteil eines mehrteiligen Exports. Bitte gemeinsam mit allen anderen Teilen in dasselbe Verzeichnis entpacken.\r\n');
    await saveZipPart(
      zip,
      `website-paket-${String(i + 2).padStart(2, '0')}-von-${String(partCount).padStart(2, '0')}.zip`,
      i + 2,
      partCount
    );
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return partCount;
}

async function getOrCreateDirectory(rootHandle, relativePath) {
  const parts = String(relativePath || '').replace(/\\/g, '/').split('/').filter(Boolean);
  let current = rootHandle;
  for (const part of parts) current = await current.getDirectoryHandle(part, { create: true });
  return current;
}

async function writeFileToDirectory(rootHandle, relativePath, data) {
  const normalized = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = normalized.split('/').filter(Boolean);
  const filename = parts.pop();
  if (!filename) throw new Error(`Ungültiger Exportpfad: ${relativePath}`);
  const dir = await getOrCreateDirectory(rootHandle, parts.join('/'));
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(data);
    await writable.close();
  } catch (error) {
    try { await writable.abort(); } catch (e) { /* nicht kritisch */ }
    throw error;
  }
}

async function exportBaseAssetsToDirectory(baseZip, rootHandle, progressState) {
  const entries = Object.keys(baseZip.files)
    .map((name) => ({ name, entry: baseZip.files[name] }))
    .filter(({ entry }) => !entry.dir);

  for (let i = 0; i < entries.length; i++) {
    const { name, entry } = entries[i];
    const data = await entry.async('uint8array');
    await writeFileToDirectory(rootHandle, name, data);
    progressState.done++;
    updateProgress(
      50 + Math.round((progressState.done / Math.max(1, progressState.total)) * 48),
      `Schreibe Basisdatei ${i + 1}/${entries.length}: ${name}`
    );
    if (i % 8 === 0) await nextFrame();
  }
}

function isSecureExportContext() {
  return window.isSecureContext || location.protocol === 'file:' || location.hostname === 'localhost';
}

function supportsSafeDirectoryExport() {
  return isSecureExportContext() && typeof window.showDirectoryPicker === 'function';
}

function supportsSafeZipExport() {
  return typeof JSZip !== 'undefined' && typeof saveAs === 'function';
}

function configureExportControls() {
  const folderButton = document.getElementById('btn-export-folder');
  const zipButton = document.getElementById('btn-export-zip');
  const tarButton = document.getElementById('btn-export-tar');
  const folderSupported = supportsSafeDirectoryExport();
  const zipSupported = supportsSafeZipExport();

  if (folderButton) folderButton.hidden = !folderSupported;
  if (zipButton) zipButton.hidden = !zipSupported;
  if (tarButton) tarButton.hidden = false;

  return { folderSupported, zipSupported, tarSupported: true };
}

function sanitizeExportName(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/[<>:"/\|?*\u0000-\u001F]/g, '-')
    .replace(/[. ]+$/g, '')
    .replace(/\s+/g, '-');
  return cleaned || 'meine-website';
}

function requestExportName() {
  const value = window.prompt('Name für Exportordner oder Archiv:', 'meine-website');
  if (value === null) return null;
  return sanitizeExportName(value);
}

function writeTarString(target, offset, value, length) {
  const bytes = new TextEncoder().encode(String(value));
  target.set(bytes.slice(0, length), offset);
}

function writeTarOctal(target, offset, length, value) {
  const text = Math.max(0, Number(value) || 0).toString(8).padStart(length - 1, '0') + '\0';
  writeTarString(target, offset, text, length);
}

function createTarHeader(path, size, mtime) {
  const header = new Uint8Array(512);
  writeTarString(header, 0, path, 100);
  writeTarOctal(header, 100, 8, 0o644);
  writeTarOctal(header, 108, 8, 0);
  writeTarOctal(header, 116, 8, 0);
  writeTarOctal(header, 124, 12, size);
  writeTarOctal(header, 136, 12, Math.floor((mtime || Date.now()) / 1000));
  header.fill(32, 148, 156);
  header[156] = '0'.charCodeAt(0);
  writeTarString(header, 257, 'ustar', 6);
  writeTarString(header, 263, '00', 2);
  let checksum = 0;
  for (const byte of header) checksum += byte;
  const checksumText = checksum.toString(8).padStart(6, '0') + '\0 ';
  writeTarString(header, 148, checksumText, 8);
  return header;
}

async function buildTarBlob(entries, rootName) {
  const parts = [];
  const prefix = rootName ? `${rootName}/` : '';
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const blob = entry.data instanceof Blob ? entry.data : new Blob([entry.data]);
    const path = `${prefix}${String(entry.path).replace(/^\/+/, '')}`;
    parts.push(createTarHeader(path, blob.size, Date.now()));
    parts.push(blob);
    const padding = (512 - (blob.size % 512)) % 512;
    if (padding) parts.push(new Uint8Array(padding));
    updateProgress(55 + Math.round(((i + 1) / Math.max(1, entries.length)) * 43), `TAR wird aufgebaut: ${i + 1}/${entries.length}`);
    if (i % 8 === 0) await nextFrame();
  }
  parts.push(new Uint8Array(1024));
  return new Blob(parts, { type: 'application/x-tar' });
}

function requestExportFormat() {
  const includesState = window.OluntirIncludes && typeof window.OluntirIncludes.getState === 'function'
    ? window.OluntirIncludes.getState()
    : { enabled: false };
  const reusableEnabled = Boolean(includesState && includesState.enabled);
  const modal = document.getElementById('oluntir-export-format-modal');
  if (!modal) return Promise.resolve(reusableEnabled && window.OluntirIncludes ? window.OluntirIncludes.getExportTarget() : 'html');

  const confirmButton = document.getElementById('oluntir-export-format-confirm');
  const cancelButton = document.getElementById('oluntir-export-format-cancel');
  const closeButton = document.getElementById('oluntir-export-format-close');
  const note = document.getElementById('oluntir-export-format-note');
  const radios = Array.from(modal.querySelectorAll('input[name="oluntir-export-format"]'));
  const reusableOptions = Array.from(modal.querySelectorAll('[data-oluntir-reusable-export]'));

  reusableOptions.forEach(label => { label.hidden = !reusableEnabled; });
  if (note) note.hidden = reusableEnabled;
  radios.forEach(radio => {
    radio.checked = false;
    radio.disabled = !reusableEnabled && radio.value !== 'html';
  });
  if (confirmButton) confirmButton.disabled = true;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');

  return new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      radios.forEach(radio => radio.removeEventListener('change', onChange));
      confirmButton && confirmButton.removeEventListener('click', onConfirm);
      cancelButton && cancelButton.removeEventListener('click', onCancel);
      closeButton && closeButton.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeydown);
      resolve(value);
    };
    const selected = () => {
      const radio = radios.find(item => item.checked && !item.disabled);
      return radio ? radio.value : null;
    };
    const onChange = () => { if (confirmButton) confirmButton.disabled = !selected(); };
    const onConfirm = () => finish(selected());
    const onCancel = () => finish(null);
    const onBackdrop = event => { if (event.target === modal) finish(null); };
    const onKeydown = event => { if (event.key === 'Escape') finish(null); };

    radios.forEach(radio => radio.addEventListener('change', onChange));
    confirmButton && confirmButton.addEventListener('click', onConfirm);
    cancelButton && cancelButton.addEventListener('click', onCancel);
    closeButton && closeButton.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeydown);
  });
}

async function exportSitePackage(editor, mode) {
  let selectedBefore = null;
  let rootHandle = null;
  let zipFileHandle = null;
  const exportMode = ['folder', 'zip', 'tar'].includes(mode) ? mode : 'folder';
  const includeTarget = await requestExportFormat();
  if (!includeTarget) return;
  const projectName = requestExportName();
  if (!projectName) return;
  if (window.OluntirIncludes && typeof window.OluntirIncludes.validateExport === 'function') {
    const exportValidation = window.OluntirIncludes.validateExport(includeTarget);
    if (!exportValidation.ok) {
      throw new Error(
        'Der Export wurde wegen fehlerhafter sich inhaltlich wiederholender Elemente und Bereiche abgebrochen:\n\n' +
        exportValidation.errors.map(message => `- ${message}`).join('\n')
      );
    }
    if (exportValidation.warnings.length) {
      console.warn('Exporthinweise:', exportValidation.warnings);
    }
  }

  if (exportMode === 'folder') {
    if (!supportsSafeDirectoryExport()) {
      throw new Error('Der direkte Ordnerexport wird von diesem Browser nicht sicher unterstützt.');
    }
    try {
      const parentHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      rootHandle = await parentHandle.getDirectoryHandle(projectName, { create: true });
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      throw error;
    }
  } else if (exportMode === 'zip') {
    if (!supportsSafeZipExport()) {
      throw new Error('Der ZIP-Export wird von diesem Browser nicht unterstützt.');
    }
    if (supportsDirectZipStreaming()) {
      try {
        zipFileHandle = await requestStreamingTarget(projectName);
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        throw error;
      }
      if (!zipFileHandle) return;
    }
  }

  showProgress(exportMode === 'zip' ? 'ZIP wird exportiert' : exportMode === 'tar' ? 'TAR wird exportiert' : 'Ordner wird exportiert');

  try {
    updateProgress(2, 'Lade eingebettete CSS-, JS-, Bild- und Schriftdateien …');
    await nextFrame();
    const baseZip = await loadBaseAssetsZip();

    updateProgress(7, 'Prüfe gespeicherte Upload-Bilder …');
    await refreshUploadedAssetsFromDb();
    await nextFrame();

    const pages = editor.Pages.getAll();
    if (!pages.length) throw new Error('Das Projekt enthält keine exportierbare Seite.');

    selectedBefore = editor.Pages.getSelected();
    const usedNames = new Set();
    const usedUploadPaths = new Set();
    const pageFiles = [];
    let includeFiles = [];
    let customCss = '';

    for (let idx = 0; idx < pages.length; idx++) {
      const page = pages[idx];
      const pageName = page.getName() || page.id || `Seite ${idx + 1}`;
      updateProgress(10 + Math.round((idx / pages.length) * 25), `Baue Seite „${pageName}“ …`);
      await nextFrame();

      editor.Pages.select(page);
      await nextFrame();
      commitInlineTextImagesToModel(editor);
      await nextFrame();

      const html = normalizeExportHtml(getRenderedCanvasHtmlForExport(editor));
      const css = editor.getCss() || '';

      if (css.trim()) customCss += `/* ${pageName} */\n${css}\n\n`;
      collectUploadPathsFromHtml(html, usedUploadPaths);
      collectUploadPaths('', css, usedUploadPaths);

      const prepared = window.OluntirIncludes
        ? window.OluntirIncludes.preparePage(html, includeTarget, page.id)
        : { html, extension: 'html', includeFiles: [] };
      if (prepared.includeFiles && prepared.includeFiles.length) includeFiles = prepared.includeFiles;

      let filename = idx === 0 ? 'index' : slugify(pageName);
      const baseFilename = filename;
      let suffix = 2;
      while (usedNames.has(filename)) filename = `${baseFilename}-${suffix++}`;
      usedNames.add(filename);
      pageFiles.push({ path: `${filename}.${prepared.extension || 'html'}`, content: buildPageHtml(pageName, prepared.html) });
    }

    const missingUploads = [];
    const uploadEntries = [];
    let uploadBytes = 0;
    for (const path of usedUploadPaths) {
      const blob = assetBlobs.get(path);
      if (!blob) missingUploads.push(path);
      else {
        uploadEntries.push({ path, blob });
        uploadBytes += Number(blob.size) || 0;
      }
    }

    if (missingUploads.length) {
      throw new Error(
        `Der Export wurde abgebrochen, weil ${missingUploads.length} verwendete Upload-Datei(en) fehlen:\n\n` +
        missingUploads.map((path) => `- ${path}`).join('\n') +
        '\n\nBitte die betreffenden Bilder im Builder erneut hochladen.'
      );
    }

    const baseCount = Object.values(baseZip.files).filter((entry) => !entry.dir).length;
    const totalFiles = baseCount + pageFiles.length + includeFiles.length + uploadEntries.length + 2;
    const progressState = { done: 0, total: totalFiles };

    updateProgress(38,
      `${pages.length} Seite(n), ${uploadEntries.length} Bilddatei(en), ${formatBytes(uploadBytes)} werden direkt geschrieben …`);

    if (exportMode === 'tar') {
      updateProgress(45, 'Bereite TAR-Archiv vor …');
      const entries = [];
      for (const name of Object.keys(baseZip.files)) {
        const entry = baseZip.files[name];
        if (!entry.dir) entries.push({ path: name, data: await entry.async('uint8array') });
      }
      pageFiles.forEach(({ path, content }) => entries.push({ path, data: content }));
      includeFiles.forEach(({ path, content }) => entries.push({ path, data: content }));
      entries.push({ path: 'css/custom.css', data: customCss || '/* Keine individuellen Stil-Anpassungen */\n' });
      uploadEntries.forEach((entry) => entries.push({ path: entry.path, data: entry.blob }));
      entries.push({ path: 'export-manifest.json', data: JSON.stringify({
        exportedAt: new Date().toISOString(),
        pages: pageFiles.map((item) => item.path),
        includeMode: includeTarget,
        includes: includeFiles.map((item) => item.path),
        uploadedAssets: uploadEntries.length,
        uploadedBytes: uploadBytes,
        bootstrap: (window.PAGEBUILDER_FRAMEWORK || { version: '4.4.1' }).version,
        frameworkProfile: (window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' }).id,
        structure: 'website-tar'
      }, null, 2) });
      const tarBlob = await buildTarBlob(entries, projectName);
      saveAs(tarBlob, `${projectName}.tar`);
      updateProgress(100, `TAR-Archiv ${projectName}.tar wurde erstellt.`);
      toast(`Export abgeschlossen: ${projectName}.tar`);
      return;
    }

    if (exportMode === 'zip') {
      updateProgress(45, 'Bereite direkt gestreamtes ZIP vor …');
      const zip = await cloneBaseZip(baseZip);
      pageFiles.forEach(({ path, content }) => zip.file(path, content));
      includeFiles.forEach(({ path, content }) => zip.file(path, content));
      zip.file('css/custom.css', customCss || '/* Keine individuellen Stil-Anpassungen */\n');
      uploadEntries.forEach((entry) => zip.file(entry.path, entry.blob, { compression: 'STORE' }));
      zip.file('export-manifest.json', JSON.stringify({
        exportedAt: new Date().toISOString(),
        pages: pageFiles.map((item) => item.path),
        includeMode: includeTarget,
        includes: includeFiles.map((item) => item.path),
        uploadedAssets: uploadEntries.length,
        uploadedBytes: uploadBytes,
        bootstrap: (window.PAGEBUILDER_FRAMEWORK || { version: '4.4.1' }).version,
        frameworkProfile: (window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' }).id,
        structure: 'website-zip'
      }, null, 2));
      if (zipFileHandle) {
        await streamJsZipToFile(zip, zipFileHandle);
      } else {
        updateProgress(55, 'ZIP wird im Browser erstellt …');
        const blob = await zip.generateAsync({
          type: 'blob',
          streamFiles: true,
          compression: 'DEFLATE',
          compressionOptions: { level: 4 }
        }, (metadata) => {
          updateProgress(55 + Math.round((metadata.percent || 0) * 0.44),
            `ZIP wird erstellt … ${Math.round(metadata.percent || 0)}%`);
        });
        saveAs(blob, `${projectName}.zip`);
      }
      updateProgress(100, `ZIP ${projectName}.zip wurde erstellt.`);
      toast(`Export abgeschlossen: ${projectName}.zip`);
      return;
    }

    await exportBaseAssetsToDirectory(baseZip, rootHandle, progressState);

    for (const pageFile of pageFiles) {
      await writeFileToDirectory(rootHandle, pageFile.path, pageFile.content);
      progressState.done++;
      updateProgress(50 + Math.round((progressState.done / totalFiles) * 48), `Schreibe ${pageFile.path} …`);
    }

    for (const includeFile of includeFiles) {
      await writeFileToDirectory(rootHandle, includeFile.path, includeFile.content);
      progressState.done++;
      updateProgress(50 + Math.round((progressState.done / totalFiles) * 48), `Schreibe ${includeFile.path} …`);
    }

    await writeFileToDirectory(
      rootHandle,
      'css/custom.css',
      customCss || '/* Keine individuellen Stil-Anpassungen */\n'
    );
    progressState.done++;

    for (let i = 0; i < uploadEntries.length; i++) {
      const entry = uploadEntries[i];
      await writeFileToDirectory(rootHandle, entry.path, entry.blob);
      progressState.done++;
      updateProgress(
        50 + Math.round((progressState.done / totalFiles) * 48),
        `Schreibe Bild ${i + 1}/${uploadEntries.length}: ${entry.path}`
      );
      if (i % 4 === 0) await nextFrame();
    }

    const manifest = {
      exportedAt: new Date().toISOString(),
      pages: pageFiles.map((item) => item.path),
      includeMode: includeTarget,
      includes: includeFiles.map((item) => item.path),
      uploadedAssets: uploadEntries.length,
      uploadedBytes: uploadBytes,
      bootstrap: (window.PAGEBUILDER_FRAMEWORK || { version: '4.4.1' }).version,
      frameworkProfile: (window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' }).id,
      structure: 'website-folder',
    };
    await writeFileToDirectory(rootHandle, 'export-manifest.json', JSON.stringify(manifest, null, 2));
    progressState.done++;

    updateProgress(100, `Ordner ${projectName} wurde vollständig geschrieben.`);
    toast(`Export abgeschlossen: ${projectName}`);
  } catch (error) {
    console.error('Export fehlgeschlagen:', error);
    alert(`Export fehlgeschlagen:\n\n${error && error.message ? error.message : error}`);
  } finally {
    if (selectedBefore) {
      try { editor.Pages.select(selectedBefore); } catch (e) { /* nicht kritisch */ }
    }
    setTimeout(hideProgress, 900);
  }
}
