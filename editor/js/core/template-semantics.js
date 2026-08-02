(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateSemantics = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const SCHEMA_VERSION = 1;

  function normalizeClasses(value) {
    const source = Array.isArray(value) ? value : String(value || '').split(/\s+/);
    return source.map(item => String(item || '').trim()).filter(Boolean);
  }

  function frameworkContext(explicit) {
    const profile = explicit || (root && root.PAGEBUILDER_FRAMEWORK) || {};
    const id = String(profile.id || '').toLowerCase();
    const version = String(profile.version || '');
    return Object.freeze({
      family: id === 'bs4' || id === 'bs5' || /^bootstrap/i.test(id) ? 'bootstrap' : (id || 'unknown'),
      id: id || 'unknown',
      version
    });
  }

  function hasBootstrapColumnClass(classes) {
    return classes.some(name => /^col(?:$|-)/.test(name));
  }

  function resolveRole(input, explicitFramework) {
    const source = input || {};
    const tagName = String(source.tagName || '').toLowerCase();
    const classes = normalizeClasses(source.classes);
    const attrs = source.attributes || {};
    const framework = frameworkContext(explicitFramework);
    let role = 'element';
    let frameworkRole = null;

    // Template and framework markup are authoritative. Oluntir identities are
    // deliberately not considered when resolving the role.
    if (tagName === 'body') role = 'page';
    else if (tagName === 'header') role = 'header';
    else if (tagName === 'main') role = 'main';
    else if (tagName === 'footer') role = 'footer';
    else if (tagName === 'nav') role = 'navigation';
    else if (tagName === 'section') role = 'section';
    else if (classes.includes('container-fluid')) {
      role = 'container-fluid';
      frameworkRole = framework.family === 'bootstrap' ? 'bootstrap-container-fluid' : null;
    } else if (classes.includes('container')) {
      role = 'container';
      frameworkRole = framework.family === 'bootstrap' ? 'bootstrap-container' : null;
    } else if (classes.includes('row')) {
      role = 'row';
      frameworkRole = framework.family === 'bootstrap' ? 'bootstrap-row' : null;
    } else if (hasBootstrapColumnClass(classes)) {
      role = 'column';
      frameworkRole = framework.family === 'bootstrap' ? 'bootstrap-column' : null;
    } else if (classes.includes('card')) role = 'card';
    else if (classes.includes('card-header')) role = 'card-header';
    else if (classes.includes('card-body')) role = 'card-body';
    else if (classes.includes('card-footer')) role = 'card-footer';
    else if (tagName === 'div') role = 'div';
    else role = tagName || 'element';

    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      role,
      frameworkRole,
      framework,
      tagName,
      classes: Object.freeze(classes.slice()),
      attributes: Object.freeze(Object.assign({}, attrs))
    });
  }

  function structuralKind(resolved, isRoot) {
    if (isRoot || (resolved && resolved.role === 'page')) return 'page';
    if (!resolved) return 'component';
    if (resolved.role === 'section') return 'section';
    if (resolved.role === 'row') return 'row';
    if (resolved.role === 'column') return 'slot';
    return 'component';
  }

  function cleanCollisionSuffix(value) {
    const token = String(value || '');
    // GrapesJS collision chains are appended numeric segments. Strip only
    // chains with at least two segments, never a single intentional suffix.
    return token.replace(/(?:-\d+){2,}$/g, '');
  }

  function normalizeReferencedIds(html) {
    if (typeof document === 'undefined') return String(html || '');
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const referenced = new Set();
    const referenceAttrs = ['href', 'data-target', 'data-bs-target', 'aria-controls'];

    template.content.querySelectorAll('*').forEach(element => {
      referenceAttrs.forEach(name => {
        const value = element.getAttribute(name);
        if (value && value.charAt(0) === '#') referenced.add(cleanCollisionSuffix(value.slice(1)));
      });
    });

    template.content.querySelectorAll('[id]').forEach(element => {
      const current = element.getAttribute('id') || '';
      const clean = cleanCollisionSuffix(current);
      if (clean === current) return;
      // Keep stable template IDs that are referenced. Remove generated GrapesJS
      // IDs instead of persisting their collision chains.
      if (referenced.has(clean) || !/^i[a-z0-9]{5,}$/i.test(clean)) element.setAttribute('id', clean);
      else element.removeAttribute('id');
    });

    template.content.querySelectorAll('*').forEach(element => {
      referenceAttrs.forEach(name => {
        const value = element.getAttribute(name);
        if (!value || value.charAt(0) !== '#') return;
        element.setAttribute(name, '#' + cleanCollisionSuffix(value.slice(1)));
      });
    });
    return template.innerHTML;
  }

  return Object.freeze({
    SCHEMA_VERSION,
    frameworkContext,
    normalizeClasses,
    resolveRole,
    structuralKind,
    cleanCollisionSuffix,
    normalizeReferencedIds
  });
});
