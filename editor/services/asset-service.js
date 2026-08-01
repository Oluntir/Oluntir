(() => {
  'use strict';
  const dimensions = new Map();
  const previewUrls = new Map();
  let connectedProjectRoot = null;
  const PROJECT_HANDLE_KEY = 'connected-project-root';

  async function writeRelativeFile(rootHandle, relativePath, blob) {
    const parts = String(relativePath || '').replace(/\\/g, '/').split('/').filter(Boolean);
    const filename = parts.pop();
    if (!filename) throw new Error(`Ungültiger Assetpfad: ${relativePath}`);
    let directory = rootHandle;
    for (const part of parts) directory = await directory.getDirectoryHandle(part, { create: true });
    const fileHandle = await directory.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      try { await writable.abort(); } catch (_) {}
      throw error;
    }
  }
  async function removeRelativeFile(rootHandle, relativePath) {
    const parts = String(relativePath || '').replace(/\\/g, '/').split('/').filter(Boolean);
    const filename = parts.pop();
    if (!filename) return false;
    let directory = rootHandle;
    try {
      for (const part of parts) directory = await directory.getDirectoryHandle(part, { create: false });
      await directory.removeEntry(filename);
      return true;
    } catch (_) {
      return false;
    }
  }
  async function hasHandlePermission(handle, request) {
    if (!handle) return false;
    const options = { mode: 'readwrite' };
    if (typeof handle.queryPermission === 'function' && await handle.queryPermission(options) === 'granted') return true;
    if (request && typeof handle.requestPermission === 'function') return (await handle.requestPermission(options)) === 'granted';
    return false;
  }
  async function persistProjectRoot(handle) {
    if (window.OluntirIndexedDbAssetStore && window.OluntirIndexedDbAssetStore.putSetting) {
      await window.OluntirIndexedDbAssetStore.putSetting(PROJECT_HANDLE_KEY, handle);
    }
  }
  async function restoreConnectedProjectFolder() {
    try {
      const store = window.OluntirIndexedDbAssetStore;
      const handle = store && store.getSetting ? await store.getSetting(PROJECT_HANDLE_KEY) : null;
      if (!handle || !(await verifyProjectRoot(handle)) || !(await hasHandlePermission(handle, false))) return { connected: false, count: 0, bytes: 0 };
      connectedProjectRoot = handle;
      return syncEntriesToConnectedFolder(store.entries());
    } catch (error) {
      console.warn('Projektordner konnte nicht automatisch wieder verbunden werden:', error);
      return { connected: false, count: 0, bytes: 0 };
    }
  }
  async function verifyProjectRoot(handle) {
    try {
      await handle.getDirectoryHandle('editor', { create: false });
      await handle.getDirectoryHandle('assets', { create: false });
      return true;
    } catch (_) {
      return false;
    }
  }
  async function syncEntriesToConnectedFolder(entries) {
    if (!connectedProjectRoot) return { count: 0, bytes: 0, connected: false };
    let count = 0; let bytes = 0;
    for (const [path, blob] of entries) {
      if (!String(path).startsWith('assets/user_upload/') || !(blob instanceof Blob)) continue;
      await writeRelativeFile(connectedProjectRoot, path, blob);
      count++; bytes += blob.size || 0;
    }
    return { count, bytes, connected: true };
  }
  async function connectAndSyncProjectFolder() {
    if (typeof window.showDirectoryPicker !== 'function') {
      throw new Error('Der Browser unterstützt das direkte Schreiben in einen Projektordner nicht. Verwende Chromium/Edge über HTTPS, localhost oder die lokale Anwendung.');
    }
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    if (!(await verifyProjectRoot(handle))) {
      throw new Error('Bitte den Stammordner „Oluntir-main“ auswählen. Er muss die Ordner „editor“ und „assets“ enthalten.');
    }
    connectedProjectRoot = handle;
    await persistProjectRoot(handle);
    return syncEntriesToConnectedFolder(window.OluntirIndexedDbAssetStore.entries());
  }

  function pathOf(asset) { return asset && asset.get ? String(asset.get('src') || '') : ''; }
  function nameOf(asset) { return asset && asset.get ? String(asset.get('name') || pathOf(asset).split('/').pop() || 'Bild') : 'Bild'; }
  function array(editor) {
    const all = editor.AssetManager.getAll();
    return all && all.toArray ? all.toArray() : all && all.models ? all.models.slice() : [];
  }
  function metadata(editor) {
    const variants = window.OluntirImageVariantService;
    const list = array(editor).map((asset, index) => {
      const path = pathOf(asset); const variant = variants.describe(path);
      const blob = window.OluntirIndexedDbAssetStore.get(path);
      return { asset, path, name: nameOf(asset), index, variant, user: variant.user, bytes: blob ? blob.size : 0, used: 0 };
    });
    const groups = new Map();
    list.forEach((item) => {
      if (!item.user) return;
      if (!groups.has(item.variant.group)) groups.set(item.variant.group, new Set());
      variants.related(item.path).forEach((path) => groups.get(item.variant.group).add(path));
    });
    const usage = window.OluntirAssetUsageService.build(editor, groups);
    const newestByGroup = new Map();
    list.forEach((item) => {
      item.used = usage.get(item.variant.group) || 0;
      const key = item.user ? item.variant.group : `external:${item.path}`;
      const current = newestByGroup.get(key);
      if (current === undefined || item.index < current) newestByGroup.set(key, item.index);
    });
    list.forEach((item) => {
      const key = item.user ? item.variant.group : `external:${item.path}`;
      item.recentIndex = newestByGroup.get(key);
    });
    return list;
  }
  function primary(meta) {
    const chosen = new Map();
    meta.forEach((item) => {
      const key = item.user ? item.variant.group : `external:${item.path}`;
      const previous = chosen.get(key);
      if (!previous || window.OluntirImageVariantService.priority(item.variant.type) > window.OluntirImageVariantService.priority(previous.variant.type)) chosen.set(key, item);
    });
    return Array.from(chosen.values());
  }
  function previewUrl(path) {
    if (typeof resolveAssetUrl === 'function') {
      const existing = resolveAssetUrl(path);
      if (existing) return existing;
    }
    if (previewUrls.has(path)) return previewUrls.get(path);
    const blob = window.OluntirIndexedDbAssetStore.get(path);
    if (!blob) return path;
    const url = URL.createObjectURL(blob);
    previewUrls.set(path, url);
    return url;
  }
  function imageSize(path) {
    if (dimensions.has(path)) return Promise.resolve(dimensions.get(path));
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => { const size = { width: image.naturalWidth, height: image.naturalHeight }; dimensions.set(path, size); resolve(size); };
      image.onerror = () => resolve({ width: 0, height: 0 });
      image.src = previewUrl(path);
    });
  }
  async function upload(editor, files) {
    const added = [];
    for (const file of Array.from(files || [])) {
      if (!file.type || !file.type.startsWith('image/')) continue;
      const responsive = await createResponsiveImageAssets(file);
      const newPaths = [responsive.desktopPath, responsive.tabletPath, responsive.mobilePath, responsive.downloadPath];
      newPaths.forEach((path) => {
        let asset = editor.AssetManager.get(path);
        if (!asset) asset = editor.AssetManager.add({ type: 'image', src: path, name: file.name });
        added.push(asset);
      });
      if (connectedProjectRoot) {
        const entries = newPaths.map((path) => [path, window.OluntirIndexedDbAssetStore.get(path)]);
        await syncEntriesToConnectedFolder(entries);
      }
    }
    return added;
  }
  async function removeGroup(editor, item) {
    if (!item || !item.user) return 0;
    const paths = window.OluntirImageVariantService.related(item.path);
    for (const path of paths) {
      const asset = editor.AssetManager.get(path);
      if (asset) editor.AssetManager.remove(asset);
    }
    await window.OluntirIndexedDbAssetStore.remove(item.path);
    if (connectedProjectRoot) {
      for (const path of paths) await removeRelativeFile(connectedProjectRoot, path);
    }
    return paths.length;
  }
  function getConnectedProjectRoot() { return connectedProjectRoot; }
  window.OluntirAssetService = { metadata, primary, imageSize, previewUrl, upload, removeGroup, pathOf, connectAndSyncProjectFolder, restoreConnectedProjectFolder, getConnectedProjectRoot };
})();
