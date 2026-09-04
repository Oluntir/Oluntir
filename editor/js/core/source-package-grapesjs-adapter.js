(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirSourcePackageGrapesJsAdapter = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const SUPPORTED_FRAMEWORKS = new Set(['bootstrap4', 'bootstrap5']);

  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function issue(code, message, details) { return { code, message, details: clone(details || null) }; }

  function validateManifest(manifest) {
    const issues = [];
    if (!manifest || manifest.kind !== 'oluntir-source-package') {
      issues.push(issue('GRAPESJS_SOURCE_MANIFEST_INVALID', 'Das Source-Package-Manifest ist ungültig.'));
      return issues;
    }
    ['packageId', 'sourceHash'].forEach(field => {
      if (!text(manifest[field])) issues.push(issue('GRAPESJS_SOURCE_MANIFEST_FIELD_MISSING', `Das Feld ${field} fehlt.`, { field }));
    });
    return issues;
  }

  function validateProfile(profile, manifest) {
    const issues = [];
    if (!profile || profile.kind !== 'oluntir-source-framework-profile') {
      issues.push(issue('GRAPESJS_SOURCE_PROFILE_INVALID', 'Das quellengebundene Frameworkprofil ist ungültig.'));
      return issues;
    }
    if (profile.sourcePackageId !== manifest.packageId) issues.push(issue('GRAPESJS_SOURCE_PROFILE_PACKAGE_MISMATCH', 'Profil und Source Package gehören nicht zusammen.'));
    if (profile.sourceHash !== manifest.sourceHash) issues.push(issue('GRAPESJS_SOURCE_PROFILE_HASH_MISMATCH', 'Profil und Source Package haben unterschiedliche Source-Hashes.'));
    if (!profile.metadata || profile.metadata.sourceBound !== true || profile.metadata.reusable !== false) {
      issues.push(issue('GRAPESJS_SOURCE_PROFILE_REUSE_POLICY_INVALID', 'Das Profil ist nicht ausdrücklich source-gebunden und nicht wiederverwendbar.'));
    }
    return issues;
  }

  async function connect(editor, manifest, options) {
    const settings = options || {};
    const bridge = settings.bridge || (typeof window !== 'undefined' && window.OluntirSourcePackageBridge);
    const issues = validateManifest(manifest);
    const editorActivationAllowed = manifest && manifest.support
      ? manifest.support.editorActivationAllowed === true
      : SUPPORTED_FRAMEWORKS.has(String(manifest && manifest.frameworkId || '').toLowerCase());
    if (manifest && !editorActivationAllowed) {
      issues.push(issue('GRAPESJS_SOURCE_FRAMEWORK_ANALYSIS_ONLY', 'Das erkannte Framework ist nur für Analyse freigegeben; GrapesJS-Aktivierung wurde blockiert.', { support: clone(manifest.support) }));
    }
    if (!bridge) issues.push(issue('GRAPESJS_SOURCE_BRIDGE_MISSING', 'Die lokale Source-Package-Bridge ist nicht verfügbar.'));
    if (!editor || !editor.BlockManager) issues.push(issue('GRAPESJS_EDITOR_BLOCK_MANAGER_MISSING', 'Der GrapesJS-BlockManager ist nicht verfügbar.'));
    if (issues.length) return Object.freeze({ schemaVersion: SCHEMA_VERSION, status: 'blocked', connected: false, mutationPerformed: false, issues });

    let profile;
    let catalogResult;
    try {
      profile = settings.sourceProfile || await bridge.loadSourceProfile(manifest, settings);
      issues.push(...validateProfile(profile, manifest));
      if (issues.length) return Object.freeze({ schemaVersion: SCHEMA_VERSION, status: 'blocked', connected: false, mutationPerformed: false, issues });
      catalogResult = await bridge.registerSourceBlocks(editor, manifest, settings);
    } catch (error) {
      issues.push(issue('GRAPESJS_SOURCE_CONNECT_FAILED', error.message || String(error)));
      return Object.freeze({ schemaVersion: SCHEMA_VERSION, status: 'blocked', connected: false, mutationPerformed: false, issues });
    }

    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      status: 'connected',
      connected: true,
      mutationPerformed: false,
      executionEnabled: false,
      packageId: manifest.packageId,
      sourceHash: manifest.sourceHash,
      sourceProfileId: profile.profileId,
      sourceProfile: clone(profile),
      blocks: { added: catalogResult.added, skipped: catalogResult.skipped },
      policy: {
        sourceOfTruth: 'source-package',
        insertion: 'user-insert-only',
        documentMutation: false,
        repeatSynchronization: false,
        sourceScriptExecution: false
      },
      issues: []
    });
  }

  return Object.freeze({ SCHEMA_VERSION, connect, validateManifest, validateProfile });
});
