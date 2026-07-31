(function (root, factory) {
  const identityResolver = root && root.OluntirIdentityResolver
    ? root.OluntirIdentityResolver
    : (typeof module === 'object' && module.exports ? require('./identity-resolver.js') : null);
  const api = factory(identityResolver);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirContextResolver = api;
})(typeof window !== 'undefined' ? window : globalThis, function (identityResolver) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const ID_ATTRIBUTES = Object.freeze([
    'data-oluntir-page-id',
    'data-oluntir-section-id',
    'data-oluntir-row-id',
    'data-oluntir-slot-id',
    'data-oluntir-component-id'
  ]);
  const REPEAT_ATTRIBUTE = 'data-oluntir-repeat-id';

  function attrsOf(component) {
    return component && component.getAttributes ? (component.getAttributes() || {}) : {};
  }

  function classesOf(component) {
    const attrs = attrsOf(component);
    const direct = String(attrs.class || '');
    const models = component && component.getClasses ? component.getClasses() : [];
    return (direct + ' ' + (models || []).map(item => typeof item === 'string' ? item : (item && item.get ? item.get('name') : '')).join(' '))
      .trim().split(/\s+/).filter(Boolean);
  }

  function tagOf(component) {
    return String(component && component.get ? (component.get('tagName') || '') : '').toLowerCase();
  }

  function typeOf(component) {
    return String(component && component.get ? (component.get('type') || '') : '').toLowerCase();
  }

  function identityOf(component) {
    const attrs = attrsOf(component);
    for (let index = 0; index < ID_ATTRIBUTES.length; index += 1) {
      if (attrs[ID_ATTRIBUTES[index]]) return attrs[ID_ATTRIBUTES[index]];
    }
    return null;
  }

  function semanticOf(component) {
    if (!identityResolver || typeof identityResolver.resolve !== 'function') return null;
    const result = identityResolver.resolve({
      tagName: tagOf(component),
      type: typeOf(component),
      classes: classesOf(component)
    });
    return result && result.resolved ? result : null;
  }

  function structuralKindOf(component, context) {
    if (context && typeof context.classify === 'function') {
      const isRoot = Boolean(attrsOf(component)['data-oluntir-page-id']);
      return context.classify(component, isRoot);
    }
    return null;
  }

  function describeAncestor(component, context, depth) {
    const semantic = semanticOf(component);
    return Object.freeze({
      depth,
      identity: identityOf(component),
      structuralKind: structuralKindOf(component, context),
      componentType: semantic ? semantic.componentType : null,
      role: semantic ? semantic.role : null
    });
  }

  function resolvePageId(component, context) {
    if (context && context.pageId) return String(context.pageId);
    let current = component;
    while (current) {
      const value = attrsOf(current)['data-oluntir-page-id'];
      if (value) return value;
      current = current.parent ? current.parent() : null;
    }
    return null;
  }

  function resolveRepeatId(component) {
    let current = component;
    while (current) {
      const value = attrsOf(current)[REPEAT_ATTRIBUTE];
      if (value) return value;
      current = current.parent ? current.parent() : null;
    }
    return null;
  }

  function resolve(component, context) {
    const ancestors = [];
    let current = component && component.parent ? component.parent() : null;
    let depth = 1;
    while (current) {
      ancestors.push(describeAncestor(current, context, depth));
      current = current.parent ? current.parent() : null;
      depth += 1;
    }

    const frozenAncestors = Object.freeze(ancestors);
    const semanticAncestors = Object.freeze(frozenAncestors.filter(item => Boolean(item.componentType)));
    const roles = new Set(semanticAncestors.map(item => item.role).filter(Boolean));
    const repeatId = resolveRepeatId(component);

    return Object.freeze({
      pageId: resolvePageId(component, context),
      parent: frozenAncestors.length ? frozenAncestors[0] : null,
      nearestSemanticAncestor: semanticAncestors.length ? semanticAncestors[0] : null,
      ancestors: frozenAncestors,
      semanticAncestors,
      inside: Object.freeze({
        header: roles.has('header'),
        footer: roles.has('footer'),
        mainContent: roles.has('main-content'),
        navigation: roles.has('primary-navigation'),
        repeat: Boolean(repeatId)
      }),
      repeatId,
      schemaVersion: SCHEMA_VERSION
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    resolve
  });
});
