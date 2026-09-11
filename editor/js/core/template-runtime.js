(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateRuntime = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const definitions = new Map();
  const missingEntries = [];
  let ready = Promise.resolve({ loaded: [], missing: [] });


  const EMBED_SELECTOR = '[data-oluntir-embed-isolated="1"]';

  function decodeEmbedPayload(value) {
    try { return decodeURIComponent(String(value || '')); } catch (_) { return String(value || ''); }
  }

  function editorEmbedStyle(value) {
    const base = String(value || '').trim().replace(/;\s*$/, '');
    return `${base}${base ? '; ' : ''}pointer-events: none !important;`;
  }

  function setEmbedElementActive(element, active) {
    if (!element || typeof element.getAttribute !== 'function' || element.getAttribute('data-oluntir-embed-isolated') !== '1') return false;
    const tagName = String(element.getAttribute('data-oluntir-embed-tag') || element.tagName || '').toLowerCase();
    const activeAttr = String(element.getAttribute('data-oluntir-embed-active-attr') || (tagName === 'object' ? 'data' : 'src'));
    const hadActive = element.getAttribute('data-oluntir-embed-had-active') === '1';
    const originalSource = decodeEmbedPayload(element.getAttribute('data-oluntir-embed-original-source'));
    const originalSrcdoc = element.getAttribute('data-oluntir-embed-original-srcdoc');
    const hadStyle = element.getAttribute('data-oluntir-embed-had-style') === '1';
    const originalStyle = decodeEmbedPayload(element.getAttribute('data-oluntir-embed-original-style'));
    const hadTabindex = element.getAttribute('data-oluntir-embed-had-tabindex') === '1';
    const originalTabindex = decodeEmbedPayload(element.getAttribute('data-oluntir-embed-original-tabindex'));
    const placeholder = decodeEmbedPayload(element.getAttribute('data-oluntir-embed-placeholder'));

    if (active) {
      if (hadActive) element.setAttribute(activeAttr, originalSource);
      else element.removeAttribute(activeAttr);
      if (tagName === 'iframe' && originalSrcdoc != null) element.setAttribute('srcdoc', decodeEmbedPayload(originalSrcdoc));
      if (hadStyle) element.setAttribute('style', originalStyle);
      else element.removeAttribute('style');
      if (hadTabindex) element.setAttribute('tabindex', originalTabindex);
      else element.removeAttribute('tabindex');
    } else {
      if (tagName === 'iframe') element.removeAttribute('srcdoc');
      if (placeholder) element.setAttribute(activeAttr, placeholder);
      element.setAttribute('style', editorEmbedStyle(originalStyle));
      element.setAttribute('tabindex', '-1');
    }
    return true;
  }

  function setEmbeddedContentActive(target, active) {
    const rootNode = target && typeof target.querySelectorAll === 'function'
      ? target
      : target && target.Canvas && typeof target.Canvas.getDocument === 'function'
        ? target.Canvas.getDocument()
        : null;
    if (!rootNode || typeof rootNode.querySelectorAll !== 'function') return 0;
    let changed = 0;
    rootNode.querySelectorAll(EMBED_SELECTOR).forEach(element => {
      if (setEmbedElementActive(element, active)) changed += 1;
    });
    return changed;
  }

  function bindEmbedPreview(editor) {
    if (!editor || typeof editor.on !== 'function' || !editor.Canvas || typeof editor.Canvas.getDocument !== 'function') return false;
    const apply = active => {
      try { setEmbeddedContentActive(editor, active); } catch (_) { /* Preview darf Editor nicht blockieren. */ }
    };
    editor.on('run:preview', () => setTimeout(() => apply(true), 0));
    editor.on('stop:preview', () => setTimeout(() => apply(false), 0));
    editor.on('load', () => setTimeout(() => apply(false), 0));
    return true;
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function cleanId(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function normalizeBasePath(value) {
    const path = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
    return path && !path.endsWith('/') ? `${path}/` : path;
  }

  function normalizeDefinition(input) {
    const definition = clone(input || {});
    const id = cleanId(definition.id);
    if (!id) throw new Error('Template-ID fehlt oder ist ungültig.');
    const baseFramework = String(definition.baseFramework || '').trim();
    if (!['bs4', 'bs5'].includes(baseFramework)) throw new Error(`Template „${id}“ besitzt keine unterstützte Bootstrap-Basis.`);
    const components = Array.isArray(definition.components) ? definition.components : [];
    return Object.freeze({
      schemaVersion: Number(definition.schemaVersion || SCHEMA_VERSION),
      id,
      label: String(definition.label || id),
      version: String(definition.version || 'unversioned'),
      baseFramework,
      basePath: normalizeBasePath(definition.basePath || `templates/${id}/`),
      styles: Array.isArray(definition.styles) ? definition.styles.slice() : [],
      scripts: Array.isArray(definition.scripts) ? definition.scripts.slice() : [],
      components: components.map(component => Object.freeze({
        id: cleanId(component.id || component.label),
        label: String(component.label || component.id || 'Template-Baustein'),
        category: String(component.category || 'Template'),
        content: String(component.content || '')
      })).filter(component => component.id && component.content)
    });
  }

  function define(input) {
    const definition = normalizeDefinition(input);
    definitions.set(definition.id, definition);
    return definition;
  }

  function resolveAsset(definition, relativePath) {
    const value = String(relativePath || '');
    if (!value) return value;
    if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('/')) return value;
    return `${definition.basePath}${value}`;
  }

  function toProfile(definition, baseProfiles) {
    const base = baseProfiles && baseProfiles[definition.baseFramework];
    if (!base) throw new Error(`Bootstrap-Basis „${definition.baseFramework}“ für Template „${definition.id}“ ist nicht verfügbar.`);
    const templateStyles = definition.styles.map(file => resolveAsset(definition, file));
    const templateScripts = definition.scripts.map(file => resolveAsset(definition, file));
    return {
      id: `template-${definition.id}`,
      label: `${definition.label} – Template`,
      version: definition.version,
      channel: 'installed-template',
      storageKey: `pagebuilder-project-template-${definition.id}`,
      distribution: 'installed-template',
      template: definition.id,
      baseFramework: definition.baseFramework,
      canvasStyles: (base.canvasStyles || []).concat(templateStyles),
      // Imported template JavaScript must never execute in the editable GrapesJS
      // canvas. Third-party runtimes commonly add wrappers, clone nodes, toggle
      // classes and animate inline styles. Those view-only mutations can feed back
      // into editor observers, pollute Undo/Redo and trigger autosave/shared-content
      // storms. Keep edit mode deterministic: only the trusted Bootstrap base runs
      // there. The controlled template scripts remain available for isolated preview
      // and for export, where runtime behavior is expected.
      canvasScripts: (base.canvasScripts || []).slice(),
      exportAssets: {
        css: ((base.exportAssets && base.exportAssets.css) || []).concat(templateStyles),
        js: ((base.exportAssets && base.exportAssets.js) || []).concat(templateScripts)
      },
      templateRuntime: {
        schemaVersion: SCHEMA_VERSION,
        id: definition.id,
        basePath: definition.basePath,
        executionMode: 'preview-export-only',
        previewScripts: templateScripts.slice()
      }
    };
  }

  function extendProfiles(profiles) {
    const result = profiles || {};
    definitions.forEach(definition => {
      const profile = toProfile(definition, result);
      result[profile.id] = profile;
    });
    return result;
  }

  function defaultLoadScript(url) {
    return new Promise((resolve, reject) => {
      if (!root || !root.document || !root.document.createElement) {
        reject(new Error(`Template-Skript kann ohne Browser-Dokument nicht geladen werden: ${url}`));
        return;
      }
      const script = root.document.createElement('script');
      const separator = url.includes('?') ? '&' : '?';
      script.src = `${url}${separator}oluntir=${Date.now()}`;
      script.async = false;
      script.onload = () => resolve(url);
      script.onerror = () => reject(new Error(`Template-Datei nicht gefunden: ${url}`));
      (root.document.head || root.document.documentElement).appendChild(script);
    });
  }

  function registryEntries(registry) {
    if (!registry || Number(registry.schemaVersion || 0) !== SCHEMA_VERSION) return [];
    return (Array.isArray(registry.templates) ? registry.templates : []).filter(entry => entry && entry.enabled !== false);
  }

  function entryUrl(entry) {
    const folder = cleanId(entry.folder || entry.id);
    const file = String(entry.entry || 'template.js').replace(/^\/+/, '');
    return `templates/${folder}/${file}`;
  }

  async function loadRegistry(registry, options) {
    const settings = options || {};
    const loader = settings.loadScript || defaultLoadScript;
    const loaded = [];
    missingEntries.length = 0;
    for (const entry of registryEntries(registry)) {
      const expectedId = cleanId(entry.id || entry.folder);
      const url = entryUrl(entry);
      try {
        await loader(url, entry);
        if (!definitions.has(expectedId)) throw new Error(`Template-Datei „${url}“ hat die erwartete Definition „${expectedId}“ nicht registriert.`);
        loaded.push(expectedId);
      } catch (error) {
        missingEntries.push(Object.freeze({ id: expectedId, label: String(entry.name || entry.label || expectedId), url, error: error.message || String(error) }));
      }
    }
    return Object.freeze({ loaded: loaded.slice(), missing: missingEntries.map(clone) });
  }

  function initialize(registry, options) {
    ready = loadRegistry(registry, options).then(result => {
      if (root) root.OluntirTemplateRuntimeReady = Promise.resolve(result);
      if (result.missing.length && root && root.console) {
        root.console.warn('Oluntir: registrierte Templates fehlen auf dem Datenträger:', result.missing);
      }
      return result;
    });
    if (root) root.OluntirTemplateRuntimeReady = ready;
    return ready;
  }

  function getDefinition(id) {
    return definitions.get(cleanId(id)) || null;
  }

  function getMissing() {
    return missingEntries.map(clone);
  }

  function connect(editor, profile) {
    const runtime = profile && profile.templateRuntime;
    const definition = runtime && getDefinition(runtime.id);
    if (!definition) return Object.freeze({ connected: false, added: 0, issues: ['TEMPLATE_DEFINITION_MISSING'] });
    if (!editor || !editor.BlockManager || typeof editor.BlockManager.add !== 'function') {
      return Object.freeze({ connected: false, added: 0, issues: ['GRAPESJS_BLOCK_MANAGER_MISSING'] });
    }
    let added = 0;
    definition.components.forEach(component => {
      editor.BlockManager.add(`template-${definition.id}-${component.id}`, {
        label: component.label,
        category: component.category,
        content: component.content
      });
      added += 1;
    });
    bindEmbedPreview(editor);
    return Object.freeze({ connected: true, added, issues: [] });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    define,
    initialize,
    loadRegistry,
    extendProfiles,
    connect,
    setEmbedElementActive,
    setEmbeddedContentActive,
    bindEmbedPreview,
    getDefinition,
    getMissing,
    get ready() { return ready; }
  });
});
