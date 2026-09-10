(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateManager = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const RESERVED_FOLDERS = new Set(['editions']);
  const ROOT_MARKER_FILE = 'template-root.json';
  const ROOT_MARKER_ROLE = 'oluntir-template-root';

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function cleanId(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function cleanFileName(value, fallback) {
    const name = String(value || fallback || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!name || name.includes('..') || name.includes('/')) throw new Error('Ungültiger Dateiname in der Template-Definition.');
    return name;
  }

  function normalizeEntry(input) {
    const source = input || {};
    const id = cleanId(source.id || source.folder);
    const folder = cleanId(source.folder || source.id);
    if (!id || !folder) throw new Error('Template-ID oder Template-Ordner fehlt.');
    return {
      id,
      name: String(source.name || source.label || id),
      folder,
      entry: cleanFileName(source.entry, 'template.js'),
      enabled: source.enabled !== false
    };
  }

  function normalizeRegistry(input) {
    const source = input || {};
    const seen = new Set();
    const templates = [];
    (Array.isArray(source.templates) ? source.templates : []).forEach(item => {
      const entry = normalizeEntry(item);
      if (seen.has(entry.id)) return;
      seen.add(entry.id);
      templates.push(entry);
    });
    return { schemaVersion: SCHEMA_VERSION, templates };
  }

  function validateManifest(input, folderName) {
    const manifest = clone(input || {});
    if (Number(manifest.schemaVersion || 0) !== SCHEMA_VERSION) throw new Error('Nicht unterstützte template.json-Version.');
    const folder = cleanId(folderName);
    const id = cleanId(manifest.id);
    if (!folder || !id) throw new Error('Template-ID fehlt.');
    if (id !== folder) throw new Error(`Template-ID „${id}“ stimmt nicht mit dem Ordner „${folder}“ überein.`);
    const baseFramework = String(manifest.baseFramework || '').trim();
    if (!['bs4', 'bs5'].includes(baseFramework)) throw new Error('template.json besitzt keine unterstützte Bootstrap-Basis.');
    return {
      id,
      name: String(manifest.name || manifest.label || id),
      folder,
      entry: cleanFileName(manifest.entry, 'template.js'),
      enabled: manifest.enabled !== false,
      baseFramework,
      version: String(manifest.version || 'unversioned')
    };
  }

  function serializeRegistryJson(registry) {
    return `${JSON.stringify(normalizeRegistry(registry), null, 2)}\n`;
  }

  function serializeRegistryJs(registry) {
    const normalized = normalizeRegistry(registry);
    return `window.OLUNTIR_TEMPLATE_REGISTRY = ${JSON.stringify(normalized, null, 2)};\n`;
  }

  async function readTextFile(directoryHandle, fileName) {
    const handle = await directoryHandle.getFileHandle(fileName);
    const file = await handle.getFile();
    return file.text();
  }

  async function readJsonFile(directoryHandle, fileName) {
    return JSON.parse(await readTextFile(directoryHandle, fileName));
  }

  async function readRegistry(rootHandle, fallback) {
    try {
      return normalizeRegistry(await readJsonFile(rootHandle, 'registry.json'));
    } catch (error) {
      if (error && (error.name === 'NotFoundError' || error.code === 'ENOENT')) return normalizeRegistry(fallback || { schemaVersion: SCHEMA_VERSION, templates: [] });
      throw error;
    }
  }

  async function validateTemplatesRoot(rootHandle) {
    if (!rootHandle) throw new Error('Der templates-Ordner wurde nicht ausgewählt.');
    if (String(rootHandle.name || '').toLowerCase() !== 'templates') throw new Error('Bitte den Ordner „templates“ dieser Oluntir-Installation auswählen.');
    let marker;
    try {
      marker = await readJsonFile(rootHandle, ROOT_MARKER_FILE);
    } catch (error) {
      if (error && (error.name === 'NotFoundError' || error.code === 'ENOENT')) {
        throw new Error('Der gewählte Ordner ist kein Template-Ordner dieses Oluntir-2.3.0-Teststands (template-root.json fehlt). Bitte den empfohlenen templates-Ordner auswählen.');
      }
      throw error;
    }
    if (!marker || marker.role !== ROOT_MARKER_ROLE || Number(marker.schemaVersion || 0) !== SCHEMA_VERSION) {
      throw new Error('Der gewählte templates-Ordner besitzt keine gültige Oluntir-Template-Kennung.');
    }
    return marker;
  }

  async function ensureReadWritePermission(rootHandle) {
    if (!rootHandle) throw new Error('Der templates-Ordner wurde nicht ausgewählt.');
    if (typeof rootHandle.queryPermission === 'function') {
      let state = await rootHandle.queryPermission({ mode: 'readwrite' });
      if (state === 'prompt' && typeof rootHandle.requestPermission === 'function') state = await rootHandle.requestPermission({ mode: 'readwrite' });
      if (state && state !== 'granted') throw new Error('Schreibzugriff auf den ausgewählten templates-Ordner wurde nicht freigegeben.');
    }
    return rootHandle;
  }

  async function verifyWritableRoot(rootHandle) {
    await ensureReadWritePermission(rootHandle);
    const probeName = `.oluntir-write-test-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
    try {
      await writeTextFile(rootHandle, probeName, 'oluntir-write-test');
      if (typeof rootHandle.removeEntry === 'function') await rootHandle.removeEntry(probeName);
      return true;
    } catch (error) {
      try { if (typeof rootHandle.removeEntry === 'function') await rootHandle.removeEntry(probeName); } catch (_) {}
      throw new Error(`Der ausgewählte templates-Ordner ist nicht beschreibbar: ${error && error.message ? error.message : String(error)}`);
    }
  }

  async function fileExists(directoryHandle, fileName) {
    try {
      await directoryHandle.getFileHandle(fileName);
      return true;
    } catch (error) {
      if (error && (error.name === 'NotFoundError' || error.code === 'ENOENT')) return false;
      throw error;
    }
  }

  async function getDirectoryIfExists(rootHandle, folder) {
    try {
      return await rootHandle.getDirectoryHandle(folder);
    } catch (error) {
      if (error && (error.name === 'NotFoundError' || error.code === 'ENOENT')) return null;
      throw error;
    }
  }

  async function inspectRegistered(rootHandle, registry) {
    const normalized = normalizeRegistry(registry);
    const result = [];
    for (const entry of normalized.templates) {
      const directory = await getDirectoryIfExists(rootHandle, entry.folder);
      if (!directory) {
        result.push({ entry, status: 'missing-folder', present: false, valid: false, message: 'Template-Ordner fehlt.' });
        continue;
      }
      const entryPresent = await fileExists(directory, entry.entry);
      if (!entryPresent) {
        result.push({ entry, status: 'missing-entry', present: true, valid: false, message: `Einstiegsdatei ${entry.entry} fehlt.` });
        continue;
      }
      let manifest = null;
      try {
        manifest = validateManifest(await readJsonFile(directory, 'template.json'), entry.folder);
      } catch (error) {
        result.push({ entry, status: 'invalid-manifest', present: true, valid: false, message: error.message || String(error) });
        continue;
      }
      result.push({ entry, manifest, status: 'ready', present: true, valid: true, message: 'Template ist vorhanden.' });
    }
    return result;
  }

  async function discoverUnregistered(rootHandle, registry) {
    if (!rootHandle || typeof rootHandle.entries !== 'function') return [];
    const normalized = normalizeRegistry(registry);
    const knownFolders = new Set(normalized.templates.map(item => item.folder));
    const result = [];
    for await (const pair of rootHandle.entries()) {
      const name = pair[0];
      const handle = pair[1];
      if (!handle || handle.kind !== 'directory' || RESERVED_FOLDERS.has(name) || knownFolders.has(cleanId(name))) continue;
      try {
        const manifest = validateManifest(await readJsonFile(handle, 'template.json'), name);
        if (!(await fileExists(handle, manifest.entry))) throw new Error(`Einstiegsdatei ${manifest.entry} fehlt.`);
        result.push({ status: 'unregistered', valid: true, manifest, entry: normalizeEntry(manifest), folder: name });
      } catch (error) {
        result.push({ status: 'invalid-unregistered', valid: false, folder: name, message: error.message || String(error) });
      }
    }
    return result;
  }

  async function inspect(rootHandle, registry) {
    return {
      registered: await inspectRegistered(rootHandle, registry),
      unregistered: await discoverUnregistered(rootHandle, registry)
    };
  }

  async function writeTextFile(rootHandle, fileName, text) {
    const handle = await rootHandle.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    try {
      await writable.write(text);
    } finally {
      await writable.close();
    }
  }

  async function writeRegistry(rootHandle, registry) {
    const normalized = normalizeRegistry(registry);
    await writeTextFile(rootHandle, 'registry.json', serializeRegistryJson(normalized));
    await writeTextFile(rootHandle, 'registry.js', serializeRegistryJs(normalized));
    return normalized;
  }

  async function verifyRegisteredTemplate(rootHandle, entryInput) {
    const entry = normalizeEntry(entryInput);
    const directory = await getDirectoryIfExists(rootHandle, entry.folder);
    if (!directory) throw new Error(`Selbstkontrolle fehlgeschlagen: Template-Ordner templates/${entry.folder}/ fehlt.`);
    if (!(await fileExists(directory, entry.entry))) throw new Error(`Selbstkontrolle fehlgeschlagen: Einstiegsdatei templates/${entry.folder}/${entry.entry} fehlt.`);
    const manifest = validateManifest(await readJsonFile(directory, 'template.json'), entry.folder);
    if (manifest.id !== entry.id) throw new Error(`Selbstkontrolle fehlgeschlagen: template.json gehört nicht zum Registry-Eintrag „${entry.id}“.`);
    return { entry, manifest, directory };
  }

  async function removeTemplate(rootHandle, registry, id, options) {
    const settings = options || {};
    const normalized = normalizeRegistry(registry);
    const targetId = cleanId(id);
    const target = normalized.templates.find(item => item.id === targetId);
    if (!target) throw new Error(`Template „${targetId}“ ist nicht registriert.`);
    if (settings.deleteFolder !== false) {
      const directory = await getDirectoryIfExists(rootHandle, target.folder);
      if (directory) await rootHandle.removeEntry(target.folder, { recursive: true });
    }
    normalized.templates = normalized.templates.filter(item => item.id !== targetId);
    return writeRegistry(rootHandle, normalized);
  }

  async function registerTemplate(rootHandle, registry, manifestOrEntry) {
    const normalized = normalizeRegistry(registry);
    const entry = normalizeEntry(manifestOrEntry);
    if (normalized.templates.some(item => item.id === entry.id)) return normalized;
    normalized.templates.push(entry);
    return writeRegistry(rootHandle, normalized);
  }

  return Object.freeze({
    SCHEMA_VERSION,
    cleanId,
    normalizeEntry,
    normalizeRegistry,
    validateManifest,
    serializeRegistryJson,
    serializeRegistryJs,
    readRegistry,
    validateTemplatesRoot,
    ensureReadWritePermission,
    verifyWritableRoot,
    inspect,
    inspectRegistered,
    discoverUnregistered,
    writeRegistry,
    verifyRegisteredTemplate,
    removeTemplate,
    registerTemplate
  });
});
