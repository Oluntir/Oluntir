(function (root, factory) {
  const matrix = root && root.OluntirTranslationMatrix
    ? root.OluntirTranslationMatrix
    : (typeof module === 'object' && module.exports ? require('./translation-matrix.js') : null);
  const api = factory(matrix);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTranslationProfiles = api;
})(typeof window !== 'undefined' ? window : globalThis, function (matrix) {
  'use strict';

  if (!matrix) throw new Error('OluntirTranslationMatrix is required.');

  const SOURCE = 'bootstrap-community-profile';

  function descriptor(kind, value, metadata) {
    return { kind, value, metadata: metadata || {} };
  }

  function classRule(profileId, semanticId, category, className, options) {
    const settings = options || {};
    return matrix.createRule({
      ruleId: profileId + '.' + semanticId + '.' + className.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''),
      semanticId,
      category,
      frameworkFamily: 'bootstrap',
      frameworkId: profileId,
      versionRange: settings.versionRange || '*',
      direction: settings.direction || 'bidirectional',
      detect: [descriptor('class', className, settings.detectMetadata)],
      emit: [descriptor('output-class', className, settings.emitMetadata)],
      capabilities: settings.capabilities || [],
      constraints: settings.constraints || [],
      dependencies: settings.dependencies || [],
      priority: settings.priority == null ? 0 : settings.priority,
      confidence: settings.confidence == null ? 1 : settings.confidence,
      reversible: settings.reversible !== false,
      lossy: settings.lossy === true,
      variant: settings.variant || null,
      provenance: { source: SOURCE, profileId, versionRange: settings.versionRange || '*' }
    });
  }

  function attributeRule(profileId, semanticId, category, attributeName, options) {
    const settings = options || {};
    return matrix.createRule({
      ruleId: profileId + '.' + semanticId + '.attribute.' + attributeName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''),
      semanticId,
      category,
      frameworkFamily: 'bootstrap',
      frameworkId: profileId,
      versionRange: settings.versionRange || '*',
      direction: settings.direction || 'bidirectional',
      detect: [descriptor('attribute', attributeName)],
      emit: [descriptor('output-attribute', attributeName)],
      capabilities: settings.capabilities || [],
      constraints: settings.constraints || [],
      dependencies: settings.dependencies || [],
      priority: settings.priority == null ? 0 : settings.priority,
      confidence: settings.confidence == null ? 1 : settings.confidence,
      reversible: settings.reversible !== false,
      lossy: settings.lossy === true,
      variant: settings.variant || null,
      provenance: { source: SOURCE, profileId, versionRange: settings.versionRange || '*' }
    });
  }

  function htmlTagRule(profileId, semanticId, category, tagName, options) {
    const settings = options || {};
    return matrix.createRule({
      ruleId: profileId + '.' + semanticId + '.tag.' + tagName,
      semanticId,
      category,
      frameworkFamily: 'bootstrap',
      frameworkId: profileId,
      versionRange: settings.versionRange || '*',
      direction: 'detect',
      detect: [descriptor('html-tag', tagName)],
      emit: [],
      capabilities: settings.capabilities || [],
      constraints: settings.constraints || [],
      dependencies: settings.dependencies || [],
      priority: settings.priority == null ? 10 : settings.priority,
      confidence: settings.confidence == null ? 1 : settings.confidence,
      reversible: true,
      lossy: false,
      provenance: { source: SOURCE, profileId, versionRange: settings.versionRange || '*' }
    });
  }

  function commonStructure(profileId, versionRange) {
    return [
      htmlTagRule(profileId, 'header', 'structure', 'header'),
      htmlTagRule(profileId, 'navigation', 'structure', 'nav'),
      htmlTagRule(profileId, 'main-content', 'structure', 'main'),
      htmlTagRule(profileId, 'footer', 'structure', 'footer'),
      htmlTagRule(profileId, 'section', 'structure', 'section'),
      classRule(profileId, 'container', 'layout', 'container', { versionRange, priority: 30 }),
      classRule(profileId, 'container-fluid', 'layout', 'container-fluid', { versionRange, priority: 30 }),
      classRule(profileId, 'row', 'layout', 'row', { versionRange, priority: 30, capabilities: ['responsive-layout'] }),
      classRule(profileId, 'column', 'layout', 'col-', { versionRange, priority: 20, capabilities: ['responsive-layout'], detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'card', 'component', 'card', { versionRange, priority: 30 }),
      classRule(profileId, 'card-header', 'component', 'card-header', { versionRange, priority: 30 }),
      classRule(profileId, 'card-body', 'component', 'card-body', { versionRange, priority: 30 }),
      classRule(profileId, 'card-footer', 'component', 'card-footer', { versionRange, priority: 30 }),
      classRule(profileId, 'navigation', 'structure', 'navbar', { versionRange, priority: 25, capabilities: ['navigation'] }),
      classRule(profileId, 'navigation', 'structure', 'navbar-nav', { versionRange, priority: 20, capabilities: ['navigation'] }),
      classRule(profileId, 'navigation', 'structure', 'nav-link', { versionRange, priority: 15, capabilities: ['navigation'] }),
      classRule(profileId, 'responsive-layout', 'capability', 'd-', { versionRange, priority: 10, capabilities: ['responsive-layout'], detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'visibility', 'capability', 'd-none', { versionRange, priority: 20 }),
      classRule(profileId, 'spacing', 'presentation', 'm-', { versionRange, priority: 10, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'spacing', 'presentation', 'p-', { versionRange, priority: 10, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'alignment', 'presentation', 'justify-content-', { versionRange, priority: 10, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'alignment', 'presentation', 'align-items-', { versionRange, priority: 10, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } })
    ];
  }

  function bootstrap5Rules() {
    const profileId = 'bs5';
    const versionRange = '5.x';
    return commonStructure(profileId, versionRange).concat([
      classRule(profileId, 'spacing', 'presentation', 'ms-', { versionRange, variant: 'logical-start', priority: 25, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'spacing', 'presentation', 'me-', { versionRange, variant: 'logical-end', priority: 25, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'typography', 'presentation', 'fw-', { versionRange, priority: 20, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'alignment', 'presentation', 'text-start', { versionRange, variant: 'start', priority: 20 }),
      classRule(profileId, 'alignment', 'presentation', 'text-end', { versionRange, variant: 'end', priority: 20 }),
      classRule(profileId, 'visibility', 'capability', 'visually-hidden', { versionRange, priority: 25 }),
      attributeRule(profileId, 'interactive-behavior', 'behavior', 'data-bs-toggle', { versionRange, capabilities: ['bootstrap-js-behavior'], priority: 30 }),
      attributeRule(profileId, 'interactive-behavior', 'behavior', 'data-bs-target', { versionRange, capabilities: ['bootstrap-js-behavior'], priority: 30 }),
      attributeRule(profileId, 'interactive-behavior', 'behavior', 'data-bs-dismiss', { versionRange, capabilities: ['bootstrap-js-behavior'], priority: 25 })
    ]);
  }

  function bootstrap4Rules() {
    const profileId = 'bs4';
    const versionRange = '4.x';
    return commonStructure(profileId, versionRange).concat([
      classRule(profileId, 'spacing', 'presentation', 'ml-', { versionRange, variant: 'logical-start', priority: 25, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'spacing', 'presentation', 'mr-', { versionRange, variant: 'logical-end', priority: 25, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'typography', 'presentation', 'font-weight-', { versionRange, priority: 20, detectMetadata: { match: 'prefix' }, emitMetadata: { pattern: true } }),
      classRule(profileId, 'alignment', 'presentation', 'text-left', { versionRange, variant: 'start', priority: 20 }),
      classRule(profileId, 'alignment', 'presentation', 'text-right', { versionRange, variant: 'end', priority: 20 }),
      classRule(profileId, 'visibility', 'capability', 'sr-only', { versionRange, priority: 25 }),
      attributeRule(profileId, 'interactive-behavior', 'behavior', 'data-toggle', { versionRange, capabilities: ['bootstrap-js-behavior'], priority: 30 }),
      attributeRule(profileId, 'interactive-behavior', 'behavior', 'data-target', { versionRange, capabilities: ['bootstrap-js-behavior'], priority: 30 }),
      attributeRule(profileId, 'interactive-behavior', 'behavior', 'data-dismiss', { versionRange, capabilities: ['bootstrap-js-behavior'], priority: 25 })
    ]);
  }

  const profiles = Object.freeze([
    matrix.createProfile({
      id: 'bs5',
      family: 'bootstrap',
      version: '5.3.8',
      label: 'Bootstrap 5.3.8',
      capabilities: ['responsive-layout', 'cards', 'navigation', 'bootstrap-js-behavior'],
      rules: bootstrap5Rules()
    }),
    matrix.createProfile({
      id: 'bs4',
      family: 'bootstrap',
      version: '4.6.2',
      label: 'Bootstrap 4.6.2',
      capabilities: ['responsive-layout', 'cards', 'navigation', 'bootstrap-js-behavior'],
      rules: bootstrap4Rules()
    })
  ]);

  const registry = matrix.createRegistry(profiles);

  return Object.freeze({
    schemaVersion: matrix.SCHEMA_VERSION,
    readOnly: true,
    mutationEnabled: false,
    profiles,
    registry,
    getProfile: registry.getProfile,
    findRules: registry.findRules,
    snapshot: registry.snapshot
  });
});
