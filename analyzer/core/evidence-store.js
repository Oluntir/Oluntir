(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerEvidenceStore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const ALLOWED_KINDS = Object.freeze([
    'source-location', 'dom-snapshot', 'css-rule', 'computed-style',
    'dom-mutation', 'event-trace', 'network-observation', 'asset-metadata',
    'runtime-state', 'rule-match', 'user-confirmation'
  ]);

  function stableId(kind, sequence) {
    return `evidence:${kind}:${String(sequence).padStart(6, '0')}`;
  }

  function create() {
    const entries = [];

    function add(input) {
      const value = input || {};
      const kind = String(value.kind || '').trim();
      if (!ALLOWED_KINDS.includes(kind)) throw new Error(`Unsupported evidence kind: ${kind || '<empty>'}`);
      if (!value.source || typeof value.source !== 'object') throw new Error('Evidence source is required.');
      const entry = Object.freeze({
        id: stableId(kind, entries.length + 1),
        schemaVersion: SCHEMA_VERSION,
        kind,
        source: Object.freeze(Object.assign({}, value.source)),
        observedAt: value.observedAt || null,
        payload: Object.freeze(Object.assign({}, value.payload || {}))
      });
      entries.push(entry);
      return entry;
    }

    function list() {
      return entries.slice();
    }

    function get(id) {
      return entries.find(entry => entry.id === id) || null;
    }

    return Object.freeze({ add, list, get });
  }

  return Object.freeze({ SCHEMA_VERSION, ALLOWED_KINDS, create });
});
