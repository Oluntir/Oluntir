(function (root, factory) {
  const identities = root && root.OluntirLayoutIdentities
    ? root.OluntirLayoutIdentities
    : (typeof module === 'object' && module.exports ? require('./layout-identities.js') : null);
  const api = factory(identities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirSemanticValidator = api;
})(typeof window !== 'undefined' ? window : globalThis, function (identities) {
  'use strict';

  const SCHEMA_VERSION = 1;

  function freezeList(items) {
    return Object.freeze((items || []).map(item => Object.freeze(item)));
  }

  function pageRoot(page) {
    return page && page.getMainComponent ? page.getMainComponent() : null;
  }

  function collectDescriptions(page) {
    if (!identities || !identities.walk || !identities.describe) return [];
    const descriptions = [];
    const rootComponent = pageRoot(page);
    identities.walk(rootComponent, (component, isRoot) => {
      const description = identities.describe(component, {
        page: page,
        pageId: identities.pageId ? identities.pageId(page) : null,
        isRoot: isRoot
      });
      if (description && description.componentType) descriptions.push(description);
    }, true);
    return descriptions;
  }

  function cardinalityKey(description) {
    return [
      description.cardinality && description.cardinality.scope,
      description.role || '',
      description.componentType || ''
    ].join(':');
  }

  function validatePage(page) {
    const currentPageId = identities && identities.pageId ? identities.pageId(page) : null;
    const descriptions = collectDescriptions(page);
    const groups = new Map();

    descriptions.forEach(description => {
      if (!description.cardinality || description.cardinality.scope !== 'page') return;
      const key = cardinalityKey(description);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(description);
    });

    const errors = [];
    groups.forEach(group => {
      const definition = group[0];
      const cardinality = definition.cardinality;
      const count = group.length;
      if (Number.isFinite(cardinality.max) && count > cardinality.max) {
        errors.push({
          code: 'SEMANTIC_CARDINALITY_MAX_EXCEEDED',
          severity: 'error',
          scope: cardinality.scope,
          pageId: currentPageId,
          role: definition.role,
          componentType: definition.componentType,
          count: count,
          min: cardinality.min,
          max: cardinality.max,
          identities: Object.freeze(group.map(item => item.identity).filter(Boolean))
        });
      }
      if (Number.isFinite(cardinality.min) && count < cardinality.min) {
        errors.push({
          code: 'SEMANTIC_CARDINALITY_MIN_NOT_REACHED',
          severity: 'error',
          scope: cardinality.scope,
          pageId: currentPageId,
          role: definition.role,
          componentType: definition.componentType,
          count: count,
          min: cardinality.min,
          max: cardinality.max,
          identities: Object.freeze(group.map(item => item.identity).filter(Boolean))
        });
      }
    });

    const frozenErrors = freezeList(errors);
    return Object.freeze({
      ok: frozenErrors.length === 0,
      schemaVersion: SCHEMA_VERSION,
      scope: 'page',
      pageId: currentPageId,
      checkedComponents: descriptions.length,
      errors: frozenErrors,
      warnings: Object.freeze([])
    });
  }

  function validateProject(editor) {
    const pages = editor && editor.Pages && editor.Pages.getAll ? editor.Pages.getAll() : [];
    const pageResults = (pages || []).map(validatePage);
    const errors = [];
    const warnings = [];
    pageResults.forEach(result => {
      result.errors.forEach(error => errors.push(error));
      result.warnings.forEach(warning => warnings.push(warning));
    });
    const frozenPageResults = Object.freeze(pageResults);
    const frozenErrors = Object.freeze(errors);
    const frozenWarnings = Object.freeze(warnings);
    return Object.freeze({
      ok: frozenErrors.length === 0,
      schemaVersion: SCHEMA_VERSION,
      scope: 'project',
      checkedPages: frozenPageResults.length,
      checkedComponents: frozenPageResults.reduce((sum, result) => sum + result.checkedComponents, 0),
      pages: frozenPageResults,
      errors: frozenErrors,
      warnings: frozenWarnings
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    validatePage,
    validateProject
  });
});
