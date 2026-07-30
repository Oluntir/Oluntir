// Speichert vom Nutzer hinzugefügte Bilder (Galerie, Asset-Manager) als ECHTE Dateien
// statt als Base64 – für ein klassisches, sauber getrenntes Export-Paket
// (html / css / js / images als eigenständige Dateien, keine eingebetteten Daten-URIs).
//
// Funktionsweise:
// - Jedes hochgeladene Bild bekommt einen stabilen, sprechenden Pfad wie
//   "assets/user_upload/foto-a1b2c3.jpg". GENAU dieser Pfad wird in der GrapesJS-Seite als
//   <img src="..."> gespeichert (und landet später 1:1 so im Export) – niemals eine
//   Blob- oder Data-URL.
// - Da unter diesem Pfad im Editor selbst keine echte Datei liegt, wird das eigentliche
//   Bild (Blob) zusätzlich in IndexedDB abgelegt und pro Sitzung als "blob:"-URL
//   aufgelöst, die dann NUR live im DOM der Vorschau (Canvas-iframe / Asset-Manager)
//   eingesetzt wird – das GrapesJS-Datenmodell "sieht" davon nichts.
// - Beim Export (export.js) werden alle registrierten Blobs unter ihrem stabilen Pfad
//   direkt als echte Datei ins ZIP gepackt.

const USER_UPLOAD_ROOT = 'assets/user_upload/';
const UPLOAD_PATH_PREFIX = USER_UPLOAD_ROOT;
const UPLOAD_DESKTOP_PATH_PREFIX = `${USER_UPLOAD_ROOT}desktop/`;
const UPLOAD_TABLET_PATH_PREFIX = `${USER_UPLOAD_ROOT}tablet/`;
const UPLOAD_MOBILE_PATH_PREFIX = `${USER_UPLOAD_ROOT}mobile/`;
const DOWNLOAD_PATH_PREFIX = `${USER_UPLOAD_ROOT}original/`;

// Kompatibilität mit Projekten, die vor Oluntir 1.0.1 erstellt wurden.
const LEGACY_UPLOAD_PATH_PREFIX = 'images/uploads/';
const LEGACY_DOWNLOAD_PATH_PREFIX = 'images/downloads/';
// Oluntir 1.1.0 beginnt bewusst mit einer frischen, versionierten Bilderdatenbank.
// Die bisherige Datenbank bleibt unangetastet, damit keine alten Testdaten automatisch
// in den neuen Release übernommen werden und bei Bedarf noch manuell gesichert werden können.
const ASSET_DB_NAME = 'oluntir-assets-1.1.0';
const ASSET_DB_VERSION = 2;
const ASSET_STORE_NAME = 'files';
const ASSET_SETTINGS_STORE_NAME = 'settings';

const assetBlobs = new Map(); // stabiler Pfad -> Blob
const assetUrls = new Map(); // stabiler Pfad -> aktuelle "blob:"-URL dieser Sitzung

function openAssetDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(ASSET_DB_NAME, ASSET_DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(ASSET_STORE_NAME)) {
        req.result.createObjectStore(ASSET_STORE_NAME);
      }
      if (!req.result.objectStoreNames.contains(ASSET_SETTINGS_STORE_NAME)) {
        req.result.createObjectStore(ASSET_SETTINGS_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putAssetSetting(key, value) {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_SETTINGS_STORE_NAME, 'readwrite');
    tx.objectStore(ASSET_SETTINGS_STORE_NAME).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function getAssetSetting(key) {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_SETTINGS_STORE_NAME, 'readonly');
    const req = tx.objectStore(ASSET_SETTINGS_STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function putAssetBlobInDb(path, blob) {
  try {
    const db = await openAssetDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
      tx.objectStore(ASSET_STORE_NAME).put(blob, path);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Bild konnte nicht dauerhaft gespeichert werden (IndexedDB):', e);
  }
}

async function deleteAssetBlobFromDb(path) {
  try {
    const db = await openAssetDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
      tx.objectStore(ASSET_STORE_NAME).delete(path);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    /* nicht kritisch */
  }
}

async function getAllAssetBlobsFromDb() {
  try {
    const db = await openAssetDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readonly');
      const store = tx.objectStore(ASSET_STORE_NAME);
      const items = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          items.push({ path: cursor.key, blob: cursor.value });
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
  } catch (e) {
    console.warn('Gespeicherte Bilder konnten nicht geladen werden (IndexedDB):', e);
    return [];
  }
}

// Beim Start einmal aufrufen: lädt zuvor hochgeladene Bilder aus IndexedDB und macht sie
// über frische blob:-URLs wieder anzeigbar (die alten blob:-URLs sind nach einem Neuladen
// der Seite immer ungültig, die eigentlichen Bilddaten in IndexedDB aber nicht).
async function hydrateAssetStore() {
  const items = await getAllAssetBlobsFromDb();
  for (const { path, blob } of items) {
    assetBlobs.set(path, blob);
    assetUrls.set(path, URL.createObjectURL(blob));
  }
  return items.length;
}

function uniqueId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

function makeAssetPath(originalName, prefix) {
  const extMatch = /\.([a-z0-9]+)$/i.exec(originalName || '');
  const ext = (extMatch ? extMatch[1] : 'jpg').toLowerCase();
  const base = (originalName || 'bild')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'bild';
  return `${prefix}${base}-${uniqueId()}.${ext}`;
}

function makeUploadPath(originalName) {
  return makeAssetPath(originalName, UPLOAD_PATH_PREFIX);
}

function makeDownloadPath(originalName) {
  return makeAssetPath(originalName, DOWNLOAD_PATH_PREFIX);
}

function makeResponsiveAssetPaths(originalName) {
  const extMatch = /\.([a-z0-9]+)$/i.exec(originalName || '');
  const originalExt = (extMatch ? extMatch[1] : 'jpg').toLowerCase();
  const outputExt = originalExt === 'png' ? 'png' : 'jpg';
  const base = (originalName || 'bild')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'bild';
  const id = uniqueId();
  const fileName = `${base}-${id}.${outputExt}`;
  return {
    desktopPath: `${UPLOAD_DESKTOP_PATH_PREFIX}${fileName}`,
    tabletPath: `${UPLOAD_TABLET_PATH_PREFIX}${fileName}`,
    mobilePath: `${UPLOAD_MOBILE_PATH_PREFIX}${fileName}`,
    downloadPath: `${DOWNLOAD_PATH_PREFIX}${base}-${id}.${originalExt}`
  };
}

// Verkleinert ein Bild client-seitig und liefert es als Blob (kein Base64) zurück.
function resizeImageToBlob(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden: ' + file.name));
    reader.onload = () => {
      img.onerror = () => reject(new Error('Bild konnte nicht dekodiert werden: ' + file.name));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const isPng = /image\/png/.test(file.type) && /\.png$/i.test(file.name);
        const mime = isPng ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            canvas.width = 0;
            canvas.height = 0;
            if (!blob) { reject(new Error('Bild konnte nicht verarbeitet werden: ' + file.name)); return; }
            resolve(blob);
          },
          mime,
          isPng ? undefined : quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Erzeugt für ein Bild drei responsive Webvarianten und behält zusätzlich das Original.
// Desktop: 1920 px / 90 %, Tablet: 1600 px / 88 %, Mobil: 1200 px / 85 %.
async function createResponsiveImageAssets(file) {
  const paths = makeResponsiveAssetPaths(file.name);
  const desktopBlob = await resizeImageToBlob(file, 1920, 0.90);
  const tabletBlob = await resizeImageToBlob(file, 1600, 0.88);
  const mobileBlob = await resizeImageToBlob(file, 1200, 0.85);

  registerUploadedAssetAtPath(desktopBlob, paths.desktopPath);
  registerUploadedAssetAtPath(tabletBlob, paths.tabletPath);
  registerUploadedAssetAtPath(mobileBlob, paths.mobilePath);
  registerUploadedAssetAtPath(file, paths.downloadPath);

  return {
    ...paths,
    desktopUrl: resolveAssetUrl(paths.desktopPath),
    tabletUrl: resolveAssetUrl(paths.tabletPath),
    mobileUrl: resolveAssetUrl(paths.mobilePath),
    downloadUrl: resolveAssetUrl(paths.downloadPath),
    originalName: file.name
  };
}

function registerUploadedAssetAtPath(blob, path) {
  assetBlobs.set(path, blob);
  assetUrls.set(path, URL.createObjectURL(blob));
  putAssetBlobInDb(path, blob);
  return path;
}

async function registerUploadedAssetAtPathAsync(blob, path) {
  const oldUrl = assetUrls.get(path);
  if (oldUrl) {
    try { URL.revokeObjectURL(oldUrl); } catch (_) { /* ignorieren */ }
  }
  assetBlobs.set(path, blob);
  assetUrls.set(path, URL.createObjectURL(blob));
  await putAssetBlobInDb(path, blob);
  return path;
}

// Entfernt sitzungsgebundene blob:-URLs aus dem GrapesJS-Datenmodell. Die Anzeige
// wird danach über patchUploadedImageRefs() wieder mit frischen Browser-URLs versorgt.
function normalizeStableAssetReferences(editor) {
  if (!editor || !editor.getWrapper) return 0;
  let changed = 0;
  const visit = (component) => {
    const attrs = component.getAttributes ? component.getAttributes() : {};
    const patch = {};
    if (attrs['data-stable-path']) {
      if (attrs.src !== undefined) patch.src = attrs['data-stable-path'];
      if (attrs.href !== undefined) patch.href = attrs['data-stable-path'];
    }
    if (attrs['data-stable-download-path'] && attrs.href !== undefined) {
      patch.href = attrs['data-stable-download-path'];
    }
    if (attrs['data-stable-srcset-path'] && attrs.srcset !== undefined) {
      patch.srcset = attrs['data-stable-srcset-path'];
    }
    if (Object.keys(patch).length) {
      component.addAttributes(patch);
      changed++;
    }
    const children = component.components && component.components();
    if (children && children.forEach) children.forEach(visit);
  };
  visit(editor.getWrapper());
  return changed;
}

// Registriert ein neues hochgeladenes Bild: legt es dauerhaft ab (IndexedDB) und macht es
// in der laufenden Sitzung sofort über eine blob:-URL anzeigbar. Gibt den STABILEN Pfad
// zurück, der in Komponenten/HTML verwendet werden soll (niemals die blob:-URL selbst).
function registerUploadedAsset(blob, originalName, targetPrefix) {
  const path = targetPrefix === DOWNLOAD_PATH_PREFIX ? makeDownloadPath(originalName) : makeUploadPath(originalName);
  return registerUploadedAssetAtPath(blob, path);
}

function resolveAssetUrl(path) {
  return assetUrls.get(path) || null;
}

// Ersetzt in einem beliebigen Document (Canvas-iframe ODER Editor-Hauptfenster, z. B. für
// Asset-Manager-Vorschaubilder) alle Referenzen auf hochgeladene Bilder durch die aktuell
// gültige blob:-URL – rein kosmetisch für die Anzeige, das GrapesJS-Datenmodell bleibt
// unangetastet (dort steht weiterhin der stabile "assets/user_upload/…"-Pfad).
const UPLOAD_BG_RE = new RegExp(`url\\((['"]?)(${UPLOAD_PATH_PREFIX}[^'")]+)\\1\\)`);

function patchUploadedImageRefs(doc) {
  if (!doc || !doc.querySelectorAll) return;

  // Zuverlässigster Weg, ohne Race Condition: über das stabile "data-stable-path"-
  // Attribut, das unangetastet bleibt, auch wenn der Browser einen (zwangsläufig
  // scheiternden) Ladeversuch auf den rohen Pfad schon unternommen und src/href dabei
  // durch GrapesJS' Fehler-Platzhalter ersetzt hat.
  doc.querySelectorAll('[data-stable-path], [data-stable-download-path], [data-stable-srcset-path]').forEach((el) => {
    const srcPath = el.getAttribute('data-stable-path');
    const downloadPath = el.getAttribute('data-stable-download-path');
    const srcsetPath = el.getAttribute('data-stable-srcset-path');
    if (srcPath) {
      const url = resolveAssetUrl(srcPath);
      if (url && el.hasAttribute('src') && el.getAttribute('src') !== url) el.src = url;
      if (url && el.hasAttribute('href') && el.getAttribute('href') !== url) el.href = url;
    }
    if (downloadPath) {
      const url = resolveAssetUrl(downloadPath);
      if (url && el.hasAttribute('href') && el.getAttribute('href') !== url) el.href = url;
    }
    if (srcsetPath) {
      const url = resolveAssetUrl(srcsetPath);
      if (url && el.getAttribute('srcset') !== url) el.setAttribute('srcset', url);
    }

    // Galerie-Trigger speichern die drei Responsive-Pfade getrennt. Diese Attribute
    // müssen in der Editor-Vorschau ebenfalls auf die Blob-URLs des aktuellen Browsers
    // zeigen; sonst öffnet Bootstrap/Magnific Popup zwar das Modal, lädt darin aber
    // einen nicht auflösbaren stabilen Exportpfad.
    [
      ['data-pb-gallery-mobile-path', 'data-pb-gallery-mobile'],
      ['data-pb-gallery-tablet-path', 'data-pb-gallery-tablet'],
      ['data-pb-gallery-desktop-path', 'data-pb-gallery-desktop']
    ].forEach(([pathAttr, urlAttr]) => {
      const stable = el.getAttribute(pathAttr);
      if (!stable) return;
      const url = resolveAssetUrl(stable);
      if (url && el.getAttribute(urlAttr) !== url) el.setAttribute(urlAttr, url);
    });
  });

  // Die Pfadattribute liegen bei Galerie-Triggern nicht zwingend zusammen mit
  // data-stable-path. Deshalb separat erfassen.
  doc.querySelectorAll('[data-pb-gallery-mobile-path], [data-pb-gallery-tablet-path], [data-pb-gallery-desktop-path]').forEach((el) => {
    [
      ['data-pb-gallery-mobile-path', 'data-pb-gallery-mobile'],
      ['data-pb-gallery-tablet-path', 'data-pb-gallery-tablet'],
      ['data-pb-gallery-desktop-path', 'data-pb-gallery-desktop']
    ].forEach(([pathAttr, urlAttr]) => {
      const stable = el.getAttribute(pathAttr);
      const url = stable ? resolveAssetUrl(stable) : null;
      if (url) el.setAttribute(urlAttr, url);
    });
  });

  // Sicherheitsnetz für Elemente ohne data-stable-path (z. B. falls der rohe Pfad noch
  // unverändert im src/href steht).
  [UPLOAD_PATH_PREFIX, LEGACY_UPLOAD_PATH_PREFIX].forEach((prefix) => {
    doc.querySelectorAll(`img[src^="${prefix}"]`).forEach((img) => {
      const url = resolveAssetUrl(img.getAttribute('src'));
      if (url) img.src = url;
    });
  });
  [UPLOAD_PATH_PREFIX, DOWNLOAD_PATH_PREFIX, LEGACY_UPLOAD_PATH_PREFIX, LEGACY_DOWNLOAD_PATH_PREFIX].forEach((prefix) => {
    doc.querySelectorAll(`a[href^="${prefix}"]`).forEach((a) => {
      const url = resolveAssetUrl(a.getAttribute('href'));
      if (url) a.href = url;
    });
  });
  // Asset-Manager-Vorschaubilder verwenden CSS background-image statt <img src>.
  doc.querySelectorAll(`[style*="${UPLOAD_PATH_PREFIX}"], [style*="${LEGACY_UPLOAD_PATH_PREFIX}"]`).forEach((el) => {
    const m = UPLOAD_BG_RE.exec(el.getAttribute('style') || '');
    if (!m) return;
    const url = resolveAssetUrl(m[2]);
    if (url) el.style.backgroundImage = `url('${url}')`;
  });
}


function getRelatedResponsiveAssetPaths(path) {
  const value = String(path || '');
  const roots = [
    {
      desktop: UPLOAD_DESKTOP_PATH_PREFIX,
      tablet: UPLOAD_TABLET_PATH_PREFIX,
      mobile: UPLOAD_MOBILE_PATH_PREFIX,
      original: DOWNLOAD_PATH_PREFIX
    },
    {
      desktop: 'images/uploads/desktop/',
      tablet: 'images/uploads/tablet/',
      mobile: 'images/uploads/mobile/',
      original: 'images/downloads/'
    }
  ];

  for (const group of roots) {
    for (const prefix of [group.desktop, group.tablet, group.mobile]) {
      if (!value.startsWith(prefix)) continue;
      const filename = value.slice(prefix.length);
      const stem = filename.replace(/\.[^.]+$/, '');
      const related = [
        group.desktop + filename,
        group.tablet + filename,
        group.mobile + filename
      ];
      assetBlobs.forEach((blob, candidate) => {
        if (candidate.startsWith(group.original + stem + '.')) related.push(candidate);
      });
      return Array.from(new Set(related));
    }
  }
  return [value];
}

async function removeUploadedAsset(path) {
  const paths = getRelatedResponsiveAssetPaths(path);
  for (const itemPath of paths) {
    const objectUrl = assetUrls.get(itemPath);
    if (objectUrl) {
      try { URL.revokeObjectURL(objectUrl); } catch (_) { /* ignorieren */ }
    }
    assetUrls.delete(itemPath);
    assetBlobs.delete(itemPath);
    await deleteAssetBlobFromDb(itemPath);
  }
  return paths;
}


function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Blob konnte nicht gelesen werden.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl) {
  const value = String(dataUrl || '');
  const comma = value.indexOf(',');
  if (comma < 0) throw new Error('Ungültige Bilddaten im Backup.');
  const meta = value.slice(0, comma);
  const base64 = value.slice(comma + 1);
  const mimeMatch = /data:([^;]+)/i.exec(meta);
  const byteParts = [];
  const chunkSize = 4 * 1024 * 1024; // Muss durch 4 teilbar sein.

  // Base64 abschnittsweise dekodieren. Dadurch wird für große Originalbilder
  // kein einzelner riesiger Binärstring und kein riesiges Uint8Array angelegt.
  for (let offset = 0; offset < base64.length; offset += chunkSize) {
    const binary = atob(base64.slice(offset, offset + chunkSize));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    byteParts.push(bytes);
  }
  return new Blob(byteParts, { type: mimeMatch ? mimeMatch[1] : 'application/octet-stream' });
}

async function getPortableBackupAssetItems() {
  await hydrateAssetStore();
  return getAllAssetBlobsFromDb();
}

async function exportPortableAssetBackup() {
  await hydrateAssetStore();
  const items = await getAllAssetBlobsFromDb();
  const assets = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    assets.push({
      path: item.path,
      type: item.blob.type || 'application/octet-stream',
      size: item.blob.size || 0,
      dataUrl: await blobToDataUrl(item.blob)
    });
    if (i % 3 === 0 && typeof nextFrame === 'function') await nextFrame();
  }
  return assets;
}

async function importPortableAssetBackup(assets) {
  const list = Array.isArray(assets) ? assets : [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || !item.path || !item.dataUrl) continue;
    const blob = dataUrlToBlob(item.dataUrl);
    registerUploadedAssetAtPath(blob, item.path);
    if (i % 3 === 0 && typeof nextFrame === 'function') await nextFrame();
  }
  return list.length;
}
