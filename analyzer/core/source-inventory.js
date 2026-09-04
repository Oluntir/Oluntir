(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerSourceInventory = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const COLLECTIONS = Object.freeze([
    'documents', 'nodes', 'attributes', 'references', 'assets', 'stylesheets', 'cssRules', 'declarations', 'diagnostics'
  ]);

  function create(metadata) {
    const value = metadata || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      kind: 'oluntir-source-inventory',
      inventoryId: String(value.inventoryId || 'inventory:default'),
      createdAt: value.createdAt || null,
      policies: {
        readOnly: true,
        semanticInterpretation: false,
        frameworkDetection: false,
        sourceMutation: false,
        htmlGeneration: false,
        grapesJsAccess: false
      },
      documents: [],
      nodes: [],
      attributes: [],
      references: [],
      assets: [],
      stylesheets: [],
      cssRules: [],
      declarations: [],
      diagnostics: []
    };
  }

  function nextId(inventory, collection, prefix) {
    if (!COLLECTIONS.includes(collection)) throw new Error(`Unsupported inventory collection: ${collection}`);
    return `${prefix}:${String(inventory[collection].length + 1).padStart(6, '0')}`;
  }

  function add(inventory, collection, prefix, value) {
    if (!inventory || inventory.kind !== 'oluntir-source-inventory') throw new Error('Valid source inventory is required.');
    const item = Object.assign({ id: nextId(inventory, collection, prefix) }, value || {});
    inventory[collection].push(item);
    return item;
  }

  return Object.freeze({ SCHEMA_VERSION, COLLECTIONS, create, add });
});
