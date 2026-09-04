(function (root) {
  'use strict';

  const REGISTRY_KEY = 'oluntir-source-package-registry';
  const BINDING_KEY = 'oluntir-framework-binding';
  const API_DEFAULT = 'http://127.0.0.1:4177';
  const SUPPORTED_FRAMEWORKS = new Set(['bootstrap4', 'bootstrap5']);

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function isEditorSupported(manifest) {
    const support = manifest && manifest.support;
    return Boolean(support ? support.editorActivationAllowed === true : SUPPORTED_FRAMEWORKS.has(String(manifest && manifest.frameworkId || '').toLowerCase()));
  }

  function read(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value == null ? fallback : value; }
    catch (_) { return fallback; }
  }

  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function registry() { return read(REGISTRY_KEY, []); }

  function profileId(manifest) {
    return `source-${String(manifest.packageId || '').replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase()}`;
  }

  function apiUrl(baseUrl, relative) { return String(baseUrl || API_DEFAULT).replace(/\/$/, '') + relative; }

  function defaultApiBase() {
    if (typeof location !== 'undefined' && /^https?:$/.test(String(location.protocol || ''))) return location.origin;
    return API_DEFAULT;
  }

  function apiConnection(options) {
    const settings = options || {};
    const query = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
    return {
      baseUrl: settings.apiBaseUrl || localStorage.getItem('oluntir-api-base-url') || query.get('apiBase') || defaultApiBase(),
      session: settings.session || localStorage.getItem('oluntir-api-session') || query.get('session') || ''
    };
  }

  function sessionHeaders(session) {
    return session ? { 'X-Oluntir-Session': session } : {};
  }

  function withSession(url, session) {
    return session ? `${url}${url.indexOf('?') >= 0 ? '&' : '?'}session=${encodeURIComponent(session)}` : url;
  }

  function fileUrl(manifest, file, options) {
    const settings = options || {};
    if (settings.apiBaseUrl || settings.useApi !== false) {
      const connection = apiConnection(settings);
      const url = apiUrl(settings.apiBaseUrl || connection.baseUrl, `/api/source-packages/${encodeURIComponent(manifest.packageId)}/files/${file.split('/').map(encodeURIComponent).join('/')}`);
      return withSession(url, connection.session);
    }
    return `frameworks/${encodeURIComponent(manifest.frameworkId)}/sources/${encodeURIComponent(manifest.packageId)}/source/${file.split('/').map(encodeURIComponent).join('/')}`;
  }

  function availableScripts(manifest) { return manifest && manifest.entrypoints && Array.isArray(manifest.entrypoints.scripts) ? manifest.entrypoints.scripts.slice() : []; }

  function availableStyles(manifest) { return manifest && manifest.entrypoints && Array.isArray(manifest.entrypoints.styles) ? manifest.entrypoints.styles.slice() : []; }

  function selectRuntimeStyles(manifest, options) {
    const settings = options || {};
    const requested = Array.isArray(settings.enabledStyles)
      ? settings.enabledStyles
      : manifest && manifest.runtime && Array.isArray(manifest.runtime.enabledStyles)
        ? manifest.runtime.enabledStyles
        : availableStyles(manifest);
    const allowed = new Set(availableStyles(manifest));
    return requested.filter(file => allowed.has(file));
  }

  function selectRuntimeScripts(manifest, options) {
    const settings = options || {};
    const requested = Array.isArray(settings.enabledScripts)
      ? settings.enabledScripts
      : manifest && manifest.runtime && Array.isArray(manifest.runtime.enabledScripts)
        ? manifest.runtime.enabledScripts
        : manifest && manifest.activation && Array.isArray(manifest.activation.enabledScripts)
          ? manifest.activation.enabledScripts
          : [];
    const allowed = new Set(availableScripts(manifest));
    return requested.filter(file => allowed.has(file));
  }

  function toFrameworkProfile(manifest, options) {
    const settings = options || {};
    const id = profileId(manifest);
    const enabledStyles = selectRuntimeStyles(manifest, settings);
    const styles = enabledStyles.map(file => fileUrl(manifest, file, settings));
    const enabledScripts = selectRuntimeScripts(manifest, settings);
    const scripts = enabledScripts.map(file => fileUrl(manifest, file, settings));
    const supported = isEditorSupported(manifest);
    return {
      id, sourcePackageId: manifest.packageId, frameworkId: manifest.frameworkId,
      label: `${manifest.displayName || manifest.frameworkId} ${manifest.version || ''} – importiert`.trim(),
      version: manifest.version || 'unversioned', channel: 'imported', storageKey: `pagebuilder-project-${id}`,
      distribution: 'imported', template: 'source-package', canvasStyles: supported ? styles : [], canvasScripts: supported ? scripts : [],
      support: clone(manifest.support || { status: supported ? 'supported' : 'analysis-only', editorActivationAllowed: supported }),
      runtime: { availableStyles: availableStyles(manifest), enabledStyles, availableScripts: availableScripts(manifest), enabledScripts, activation: 'explicit-selection-only' },
      exportAssets: { css: styles.slice(), js: scripts.slice() }, sourcePackage: clone(manifest)
    };
  }

  function catalogUrl(manifest, options) { return fileUrl(manifest, 'component-catalog.json', options); }
  function behaviorManifestUrl(manifest, options) { return fileUrl(manifest, 'behavior-manifest.json', options); }
  function sourceProfileUrl(manifest, options) { return fileUrl(manifest, 'source-framework-profile.json', options); }

  async function loadCatalog(manifest, options) {
    if (manifest && Array.isArray(manifest.components)) return clone(manifest);
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(catalogUrl(manifest, settings), { headers: sessionHeaders(settings.session) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Source-Komponentenkatalog konnte nicht geladen werden.');
    return data;
  }

  async function loadBehaviorManifest(manifest, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(behaviorManifestUrl(manifest, settings), { headers: sessionHeaders(settings.session) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'JavaScript-Verhaltensmanifest konnte nicht geladen werden.');
    return data;
  }

  async function loadBehaviorPlan(manifest, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(fileUrl(manifest, 'javascript-behavior-plan.json', settings), { headers: sessionHeaders(settings.session) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'JavaScript-Verhaltensplan konnte nicht geladen werden.');
    return data;
  }

  async function loadBehaviorResolution(manifest, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(fileUrl(manifest, 'javascript-behavior-resolution.json', settings), { headers: sessionHeaders(settings.session) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'JavaScript-Verhaltensauflösung konnte nicht geladen werden.');
    return data;
  }

  async function loadSourceProfile(manifest, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(sourceProfileUrl(manifest, settings), { headers: sessionHeaders(settings.session) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Quellengebundenes Frameworkprofil konnte nicht geladen werden.');
    return data;
  }

  function blockId(packageId, componentId) { return `source-${String(packageId)}-${String(componentId)}`.replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase(); }

  function rewriteSourceAssetReferences(html, component, manifest, options) {
    let result = String(html || '');
    (component && component.assetReferences || []).forEach(reference => {
      if (!reference || !reference.original || !reference.sourcePath) return;
      result = result.split(reference.original).join(fileUrl(manifest, reference.sourcePath, options));
    });
    return result;
  }

  async function registerSourceBlocks(editor, manifest, options) {
    if (!editor || !manifest || !editor.BlockManager) return { added: 0, skipped: 0, catalog: null };
    if (!isEditorSupported(manifest)) return { added: 0, skipped: 0, catalog: null, blocked: true, reason: 'framework-detected-but-not-supported' };
    const catalog = await loadCatalog(manifest, options);
    const components = Array.isArray(catalog.components) ? catalog.components : [];
    let added = 0; let skipped = 0;
    components.forEach(component => {
      if (!component || !component.componentId || !component.html) { skipped += 1; return; }
      const id = blockId(manifest.packageId, component.componentId);
      if (typeof editor.BlockManager.get === 'function' && editor.BlockManager.get(id)) { skipped += 1; return; }
      editor.BlockManager.add(id, {
        label: component.label || 'Source-Element',
        category: `Source · ${manifest.displayName || manifest.frameworkId}`,
        content: rewriteSourceAssetReferences(component.html, component, manifest, options),
        attributes: { title: `Quellenelement: ${component.source && component.source.document || ''}` }
      });
      added += 1;
    });
    return { added, skipped, catalog };
  }

  function register(manifest) {
    if (!manifest || manifest.kind !== 'oluntir-source-package' || !manifest.packageId) throw new Error('Ungültiges Source-Package-Manifest.');
    const entries = registry().filter(item => item.packageId !== manifest.packageId);
    entries.push(clone(manifest)); write(REGISTRY_KEY, entries); return toFrameworkProfile(manifest);
  }

  function extendProfiles(profiles) {
    const result = profiles || {};
    registry().filter(isEditorSupported).forEach(manifest => { result[profileId(manifest)] = toFrameworkProfile(manifest); });
    return result;
  }

  function getBinding() { return read(BINDING_KEY, null); }

  function bind(manifest, options) {
    const profile = toFrameworkProfile(manifest, options);
    const binding = { schemaVersion: 1, profileId: profile.id, packageId: manifest.packageId, frameworkId: manifest.frameworkId, boundAt: new Date().toISOString() };
    write(BINDING_KEY, binding); return clone(binding);
  }

  async function discover(options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(apiUrl(settings.baseUrl, '/api/source-packages'), { headers: sessionHeaders(settings.session) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Source Packages konnten nicht geladen werden.');
    (data.packages || []).forEach(register); return data.packages || [];
  }

  async function importUrl(url, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const response = await fetch(apiUrl(settings.baseUrl, '/api/source-packages/import-url'), { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, sessionHeaders(settings.session)), body: JSON.stringify(Object.assign({}, settings, { url })) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Source-URL konnte nicht importiert werden.');
    register(data.package); return data.package;
  }

  async function importBrowserFiles(files, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const list = Array.from(files || []);
    if (!list.length) throw new Error('Keine Source-Dateien ausgewählt.');
    const payload = [];
    for (const file of list) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      payload.push({ path: file.webkitRelativePath || file.name, contentBase64: btoa(binary) });
    }
    const response = await fetch(apiUrl(settings.baseUrl, '/api/source-packages/import-files'), { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, sessionHeaders(settings.session)), body: JSON.stringify({ files: payload, frameworkId: settings.frameworkId, frameworkFamily: settings.frameworkFamily, packageType: settings.packageType, displayName: settings.displayName, version: settings.version, license: settings.license }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Lokale Source-Dateien konnten nicht importiert werden.');
    register(data.package); return data.package;
  }

  async function importBrowserArchive(file, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const response = await fetch(apiUrl(settings.baseUrl, '/api/source-packages/import-archive'), { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, sessionHeaders(settings.session)), body: JSON.stringify({ archiveBase64: btoa(binary), fileName: file.name, frameworkId: settings.frameworkId, frameworkFamily: settings.frameworkFamily, packageType: settings.packageType, displayName: settings.displayName, version: settings.version, license: settings.license }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Source-Archiv konnte nicht importiert werden.');
    register(data.package); return data.package;
  }

  async function restoreBrowserRecovery(file, options) {
    const settings = Object.assign({}, apiConnection(options), options || {});
    const recovery = JSON.parse(await file.text());
    const response = await fetch(apiUrl(settings.baseUrl, '/api/source-packages/restore-json'), { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, sessionHeaders(settings.session)), body: JSON.stringify({ recovery }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Source-Recovery konnte nicht eingespielt werden.');
    register(data.package); return data.package;
  }

  root.OluntirSourcePackageBridge = Object.freeze({ REGISTRY_KEY, BINDING_KEY, SUPPORTED_FRAMEWORKS, isEditorSupported, registry, register, extendProfiles, toFrameworkProfile, availableStyles, selectRuntimeStyles, availableScripts, selectRuntimeScripts, catalogUrl, loadCatalog, behaviorManifestUrl, sourceProfileUrl, loadBehaviorManifest, loadBehaviorPlan, loadBehaviorResolution, loadSourceProfile, registerSourceBlocks, rewriteSourceAssetReferences, getBinding, bind, discover, importUrl, importBrowserFiles, importBrowserArchive, restoreBrowserRecovery, fileUrl, apiConnection });
})(typeof window !== 'undefined' ? window : globalThis);
