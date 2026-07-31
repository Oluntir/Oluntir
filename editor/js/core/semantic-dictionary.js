(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirSemanticDictionary = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;

  const CAPABILITIES = Object.freeze({
    navigation: 'navigation',
    sharedContent: 'shared-content',
    pageStructure: 'page-structure',
    contentContainer: 'content-container'
  });

  const ROLES = Object.freeze({
    primaryNavigation: 'primary-navigation',
    header: 'header',
    footer: 'footer',
    mainContent: 'main-content'
  });

  const COMPONENT_TYPES = Object.freeze({
    navigation: Object.freeze({
      id: 'navigation',
      role: ROLES.primaryNavigation,
      match: Object.freeze({ tags: Object.freeze(['nav']) }),
      cardinality: Object.freeze({ scope: 'page', min: 0, max: 1 }),
      capabilities: Object.freeze([CAPABILITIES.navigation, CAPABILITIES.sharedContent])
    }),
    header: Object.freeze({
      id: 'header',
      role: ROLES.header,
      match: Object.freeze({ tags: Object.freeze(['header']) }),
      cardinality: Object.freeze({ scope: 'page', min: 0, max: 1 }),
      capabilities: Object.freeze([CAPABILITIES.pageStructure, CAPABILITIES.sharedContent])
    }),
    footer: Object.freeze({
      id: 'footer',
      role: ROLES.footer,
      match: Object.freeze({ tags: Object.freeze(['footer']) }),
      cardinality: Object.freeze({ scope: 'page', min: 0, max: 1 }),
      capabilities: Object.freeze([CAPABILITIES.pageStructure, CAPABILITIES.sharedContent])
    }),
    mainContent: Object.freeze({
      id: 'main-content',
      role: ROLES.mainContent,
      match: Object.freeze({ tags: Object.freeze(['main']) }),
      cardinality: Object.freeze({ scope: 'page', min: 0, max: 1 }),
      capabilities: Object.freeze([CAPABILITIES.pageStructure, CAPABILITIES.contentContainer])
    })
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function resolve(context) {
    const tagName = normalize(context && context.tagName);
    if (!tagName) return null;
    const definitions = Object.values(COMPONENT_TYPES);
    for (let index = 0; index < definitions.length; index += 1) {
      const definition = definitions[index];
      if (definition.match.tags.includes(tagName)) return definition;
    }
    return null;
  }

  function getComponentType(componentType) {
    const requested = normalize(componentType);
    return Object.values(COMPONENT_TYPES).find(definition => definition.id === requested) || null;
  }

  return Object.freeze({
    SCHEMA_VERSION,
    CAPABILITIES,
    ROLES,
    COMPONENT_TYPES,
    resolve,
    getComponentType
  });
});
