(function (root, factory) {
  const dictionary = root && root.OluntirSemanticDictionary
    ? root.OluntirSemanticDictionary
    : (typeof module === 'object' && module.exports ? require('./semantic-dictionary.js') : null);
  const identityResolver = root && root.OluntirIdentityResolver
    ? root.OluntirIdentityResolver
    : (typeof module === 'object' && module.exports ? require('./identity-resolver.js') : null);
  const contextResolver = root && root.OluntirContextResolver
    ? root.OluntirContextResolver
    : (typeof module === 'object' && module.exports ? require('./context-resolver.js') : null);
  const api = factory(dictionary, identityResolver, contextResolver);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirLayoutIdentities = api;
})(typeof window !== 'undefined' ? window : globalThis, function (dictionary, identityResolver, contextResolver) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const SEMANTIC_SCHEMA_VERSION = dictionary ? dictionary.SCHEMA_VERSION : 0;
  const SEMANTIC_DICTIONARY = dictionary || null;
  const IDENTITY_RESOLVER = identityResolver || null;
  const CONTEXT_RESOLVER = contextResolver || null;
  const ATTR = Object.freeze({
    page: 'data-oluntir-page-id', section: 'data-oluntir-section-id',
    row: 'data-oluntir-row-id', slot: 'data-oluntir-slot-id',
    component: 'data-oluntir-component-id', repeat: 'data-oluntir-repeat-id'
  });
  const PREFIX = Object.freeze({ page: 'ol_page_', section: 'ol_section_', row: 'ol_row_', slot: 'ol_slot_', component: 'ol_component_', repeat: 'ol_repeat_' });
  let editor = null;
  let assigning = false;
  let migrated = false;

  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function createId(kind) { return (PREFIX[kind] || PREFIX.component) + uuid(); }
  function attrsOf(component) { return component && component.getAttributes ? (component.getAttributes() || {}) : {}; }
  function classesOf(component) {
    const attrs = attrsOf(component);
    const direct = String(attrs.class || '');
    const models = component && component.getClasses ? component.getClasses() : [];
    return (direct + ' ' + (models || []).map(item => typeof item === 'string' ? item : (item && item.get ? item.get('name') : '')).join(' ')).trim().split(/\s+/).filter(Boolean);
  }
  function tagOf(component) { return String(component && component.get ? (component.get('tagName') || '') : '').toLowerCase(); }
  function typeOf(component) { return String(component && component.get ? (component.get('type') || '') : '').toLowerCase(); }
  function hasColumnClass(classes) { return classes.some(name => /^col(?:$|-)/.test(name)); }
  function classify(component, isRoot) {
    if (isRoot) return 'page';
    const attrs = attrsOf(component);
    if (attrs[ATTR.section]) return 'section';
    if (attrs[ATTR.row]) return 'row';
    if (attrs[ATTR.slot]) return 'slot';
    if (attrs[ATTR.component]) return 'component';
    const classes = classesOf(component);
    const tag = tagOf(component);
    const type = typeOf(component);
    if (tag === 'section' || classes.includes('section') || classes.some(c => /^section-/.test(c))) return 'section';
    if (classes.includes('row')) return 'row';
    if (hasColumnClass(classes)) return 'slot';
    if (type === 'wrapper') return null;
    return 'component';
  }
  function resolvePageId(component, context) {
    if (context && context.pageId) return String(context.pageId);
    if (context && context.page) {
      const contextualPageId = pageId(context.page);
      if (contextualPageId) return contextualPageId;
    }
    let current = component;
    while (current) {
      const value = attrsOf(current)[ATTR.page];
      if (value) return value;
      current = current.parent ? current.parent() : null;
    }
    return null;
  }
  function resolveSemanticIdentity(component) {
    if (!identityResolver || typeof identityResolver.resolve !== 'function') return null;
    return identityResolver.resolve({
      tagName: tagOf(component),
      type: typeOf(component),
      classes: classesOf(component)
    });
  }
  function describe(component, context) {
    const structuralKind = classify(component, Boolean(context && context.isRoot));
    const semanticIdentity = resolveSemanticIdentity(component);
    const attrs = attrsOf(component);
    const identityAttr = structuralKind && ATTR[structuralKind];
    const resolvedPageId = resolvePageId(component, context);
    const resolvedContext = contextResolver && typeof contextResolver.resolve === 'function'
      ? contextResolver.resolve(component, {
          pageId: resolvedPageId,
          classify: classify
        })
      : null;
    return Object.freeze({
      identity: identityAttr ? (attrs[identityAttr] || null) : null,
      pageId: resolvedPageId,
      structuralKind: structuralKind,
      componentType: semanticIdentity ? semanticIdentity.componentType : null,
      role: semanticIdentity ? semanticIdentity.role : null,
      cardinality: semanticIdentity ? semanticIdentity.cardinality : null,
      capabilities: semanticIdentity ? semanticIdentity.capabilities : Object.freeze([]),
      context: resolvedContext,
      semanticSchemaVersion: SEMANTIC_SCHEMA_VERSION,
      identityResolverSchemaVersion: semanticIdentity ? semanticIdentity.schemaVersion : 0,
      contextResolverSchemaVersion: resolvedContext ? resolvedContext.schemaVersion : 0
    });
  }
  function childrenOf(component) {
    if (!component || !component.components) return [];
    const collection = component.components();
    return collection && collection.models ? collection.models : (Array.isArray(collection) ? collection : []);
  }
  function setAttr(component, name, value) {
    if (!component || !component.addAttributes) return;
    component.addAttributes({ [name]: value });
  }
  function walk(component, visitor, isRoot) {
    if (!component) return;
    visitor(component, Boolean(isRoot));
    childrenOf(component).forEach(child => walk(child, visitor, false));
  }
  function ensureComponent(component, seen, isRoot, forceFresh) {
    const kind = classify(component, isRoot);
    if (!kind) return false;
    const attr = ATTR[kind];
    const attrs = attrsOf(component);
    let value = attrs[attr];
    const duplicate = value && seen.has(value);
    if (!value || duplicate || forceFresh) {
      value = createId(kind);
      setAttr(component, attr, value);
      migrated = true;
    }
    seen.add(value);
    return true;
  }
  function ensurePage(page, seen) {
    const rootComponent = page && page.getMainComponent ? page.getMainComponent() : null;
    if (!rootComponent) return;
    let pageId = page.get ? page.get('oluntirPageId') : null;
    const rootAttrs = attrsOf(rootComponent);
    pageId = pageId || rootAttrs[ATTR.page];
    if (!pageId || seen.has(pageId)) { pageId = createId('page'); migrated = true; }
    if (page.set) page.set('oluntirPageId', pageId);
    setAttr(rootComponent, ATTR.page, pageId);
    seen.add(pageId);
    walk(rootComponent, (component, isRoot) => { if (!isRoot) ensureComponent(component, seen, false, false); }, true);
  }
  function ensureAll(targetEditor) {
    const current = targetEditor || editor;
    if (!current || !current.Pages || assigning) return { changed: false, migrated: false };
    assigning = true; migrated = false;
    try {
      const seen = new Set();
      current.Pages.getAll().forEach(page => ensurePage(page, seen));
      return { changed: migrated, migrated, schemaVersion: SCHEMA_VERSION };
    } finally { assigning = false; }
  }
  function ensureAdded(component) {
    if (!editor || assigning || !component) return;
    assigning = true;
    try {
      const seen = new Set();
      editor.Pages.getAll().forEach(page => {
        const rootComponent = page.getMainComponent && page.getMainComponent();
        walk(rootComponent, (item, isRoot) => {
          if (item === component || isRoot) return;
          const kind = classify(item, false); const attr = kind && ATTR[kind]; const value = attr && attrsOf(item)[attr];
          if (value && item !== component) seen.add(value);
        }, true);
      });
      walk(component, (item) => ensureComponent(item, seen, false, false), false);
    } finally { assigning = false; }
  }
  function getProjectMetadata() {
    return { projectSchemaVersion: '1.2.1', layoutIdentitySchemaVersion: SCHEMA_VERSION };
  }
  function decorateProjectData(projectData) {
    const data = projectData || {};
    data.oluntir = Object.assign({}, data.oluntir || {}, getProjectMetadata());
    return data;
  }
  function stripInternalAttributes(html) {
    const source = String(html || '');
    if (typeof document === 'undefined') {
      return source.replace(/\sdata-oluntir-(?:page|section|row|slot|component|repeat)-id=(?:"[^"]*"|'[^']*')/gi, '');
    }
    const template = document.createElement('template'); template.innerHTML = source;
    Object.values(ATTR).forEach(attr => template.content.querySelectorAll('[' + attr + ']').forEach(el => el.removeAttribute(attr)));
    return template.innerHTML;
  }
  function findById(page, identity) {
    let found = null; const rootComponent = page && page.getMainComponent ? page.getMainComponent() : null;
    walk(rootComponent, component => {
      if (found) return;
      const attrs = attrsOf(component);
      if (Object.values(ATTR).some(name => attrs[name] === identity)) found = component;
    }, true);
    return found;
  }
  function pageId(page) { return page && page.get ? (page.get('oluntirPageId') || attrsOf(page.getMainComponent && page.getMainComponent())[ATTR.page]) : null; }
  function bind(nextEditor) {
    if (!nextEditor || editor === nextEditor) return;
    editor = nextEditor;
    editor.on('load', () => ensureAll(editor));
    editor.on('page:add', () => ensureAll(editor));
    editor.on('component:add', ensureAdded);
  }
  return { SCHEMA_VERSION, SEMANTIC_SCHEMA_VERSION, SEMANTIC_DICTIONARY, IDENTITY_RESOLVER, CONTEXT_RESOLVER, ATTR, PREFIX, createId, classify, describe, walk, ensureAll, ensureAdded, bind, findById, pageId, decorateProjectData, stripInternalAttributes, getProjectMetadata };
});
