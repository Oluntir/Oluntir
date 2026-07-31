(function (root, factory) {
  const dictionary = root && root.OluntirSemanticDictionary
    ? root.OluntirSemanticDictionary
    : (typeof module === 'object' && module.exports ? require('./semantic-dictionary.js') : null);
  const api = factory(dictionary);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirIdentityResolver = api;
})(typeof window !== 'undefined' ? window : globalThis, function (dictionary) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const EMPTY_CAPABILITIES = Object.freeze([]);

  function normalizeToken(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizeClasses(value) {
    const source = Array.isArray(value) ? value : String(value || '').split(/\s+/);
    return Object.freeze(source.map(normalizeToken).filter(Boolean));
  }

  function normalizeContext(context) {
    const source = context || {};
    return Object.freeze({
      tagName: normalizeToken(source.tagName),
      type: normalizeToken(source.type),
      classes: normalizeClasses(source.classes)
    });
  }

  function unresolved(context) {
    return Object.freeze({
      resolved: false,
      source: null,
      componentType: null,
      role: null,
      cardinality: null,
      capabilities: EMPTY_CAPABILITIES,
      context,
      schemaVersion: SCHEMA_VERSION
    });
  }

  function resolve(context) {
    const normalized = normalizeContext(context);
    if (!dictionary || typeof dictionary.resolve !== 'function') return unresolved(normalized);

    const definition = dictionary.resolve(normalized);
    if (!definition) return unresolved(normalized);

    return Object.freeze({
      resolved: true,
      source: 'semantic-dictionary',
      componentType: definition.id,
      role: definition.role,
      cardinality: definition.cardinality,
      capabilities: definition.capabilities,
      context: normalized,
      schemaVersion: SCHEMA_VERSION
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    normalizeContext,
    resolve
  });
});
