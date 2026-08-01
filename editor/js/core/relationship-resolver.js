(function (root, factory) {
  const structures = root && root.OluntirStructureResolver
    ? root.OluntirStructureResolver
    : (typeof module === 'object' && module.exports ? require('./structure-resolver.js') : null);
  const identities = root && root.OluntirLayoutIdentities
    ? root.OluntirLayoutIdentities
    : (typeof module === 'object' && module.exports ? require('./layout-identities.js') : null);
  const api = factory(structures, identities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRelationshipResolver = api;
})(typeof window !== 'undefined' ? window : globalThis, function (structures, identities) {
  'use strict';

  const SCHEMA_VERSION = 1;

  function childrenOf(component) {
    if (!component || !component.components) return [];
    const collection = component.components();
    if (collection && Array.isArray(collection.models)) return collection.models;
    return Array.isArray(collection) ? collection : [];
  }

  function attrsOf(component) {
    return component && component.getAttributes ? (component.getAttributes() || {}) : {};
  }

  function classesOf(component) {
    const attrs = attrsOf(component);
    const direct = String(attrs.class || '');
    const models = component && component.getClasses ? component.getClasses() : [];
    return (direct + ' ' + (models || []).map(item => typeof item === 'string' ? item : (item && item.get ? item.get('name') : '')).join(' '))
      .trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  function tagOf(component) {
    return String(component && component.get ? (component.get('tagName') || '') : '').toLowerCase();
  }

  function roleOf(component) {
    return String(attrsOf(component).role || '').trim().toLowerCase();
  }

  function hasAny(values, candidates) {
    return candidates.some(candidate => values.includes(candidate));
  }

  function identityOf(component, page, isRoot) {
    if (!identities || typeof identities.describe !== 'function') return null;
    return identities.describe(component, { page: page, pageId: identities.pageId(page), isRoot: Boolean(isRoot) }).identity;
  }

  function freezeMember(member) {
    return Object.freeze(Object.assign({}, member));
  }

  function freezeRelationship(relationship) {
    return Object.freeze(Object.assign({}, relationship, {
      members: Object.freeze((relationship.members || []).map(freezeMember))
    }));
  }

  function freezeSummary(items) {
    return Object.freeze((items || []).map(item => Object.freeze(Object.assign({}, item, {
      relationshipIds: Object.freeze((item.relationshipIds || []).slice())
    }))));
  }

  function buildComponentIndex(page) {
    const root = page && page.getMainComponent ? page.getMainComponent() : null;
    const byIdentity = new Map();
    const parentByIdentity = new Map();

    function walk(component, parentIdentity, isRoot) {
      if (!component) return;
      const identity = identityOf(component, page, isRoot);
      if (identity) {
        byIdentity.set(identity, component);
        parentByIdentity.set(identity, parentIdentity || null);
      }
      childrenOf(component).forEach(child => walk(child, identity || parentIdentity, false));
    }

    walk(root, null, true);
    return { byIdentity, parentByIdentity };
  }

  function descendants(node) {
    const result = [];
    function visit(current) {
      (current.children || []).forEach(child => {
        result.push(child);
        visit(child);
      });
    }
    visit(node);
    return result;
  }

  function directMembers(node, predicate, role) {
    return (node.children || []).filter(predicate).map((child, index) => ({
      identity: child.identity,
      role: role(child),
      position: index,
      structuralKind: child.structuralKind,
      componentType: child.componentType
    }));
  }

  function descendantMembers(node, predicate, role) {
    return descendants(node).filter(predicate).map((child, index) => ({
      identity: child.identity,
      role: role(child),
      position: index,
      structuralKind: child.structuralKind,
      componentType: child.componentType
    }));
  }

  function relationshipId(pageId, type, ownerIdentity) {
    return ['olrel', pageId || 'page', type, ownerIdentity || 'anonymous'].join(':');
  }

  function createRelationship(pageId, type, ownerNode, members) {
    return freezeRelationship({
      id: relationshipId(pageId, type, ownerNode.identity),
      pageId: pageId,
      type: type,
      ownerIdentity: ownerNode.identity,
      ownerStructuralKind: ownerNode.structuralKind,
      ownerComponentType: ownerNode.componentType,
      members: members || []
    });
  }

  function detectType(component, node) {
    const tag = tagOf(component);
    const role = roleOf(component);
    const classes = classesOf(component);
    const attrs = attrsOf(component);

    if (node.structuralKind === 'page') return 'page-layout';
    if (node.componentType === 'navigation' || tag === 'nav' || role === 'navigation') return 'navigation';
    if (tag === 'figure') return 'figure';
    if (tag === 'form' || role === 'form') return 'form';
    if (tag === 'table' || role === 'table') return 'table';
    if (tag === 'ul' || tag === 'ol' || role === 'list') return 'list';
    if (tag === 'article' || classes.includes('card')) return 'card';
    if (classes.includes('accordion') || attrs['data-oluntir-relationship'] === 'accordion') return 'accordion';
    if (classes.includes('carousel') || attrs['data-oluntir-relationship'] === 'carousel') return 'carousel';
    if (classes.includes('tabs') || role === 'tablist' || attrs['data-oluntir-relationship'] === 'tabs') return 'tabs';
    if (classes.includes('modal') || role === 'dialog' || attrs['data-oluntir-relationship'] === 'modal') return 'modal';
    if (node.structuralKind === 'section') return 'section-layout';
    return null;
  }

  function membersFor(type, node, index) {
    if (type === 'page-layout') {
      return directMembers(node, child => Boolean(child.role), child => child.role);
    }
    if (type === 'section-layout') {
      return directMembers(node, child => ['row', 'slot', 'component'].includes(child.structuralKind), child => child.structuralKind);
    }
    if (type === 'navigation') {
      return descendantMembers(node, child => {
        const component = index.byIdentity.get(child.identity);
        const tag = tagOf(component);
        return tag === 'li' || tag === 'a' || roleOf(component) === 'menuitem';
      }, child => {
        const component = index.byIdentity.get(child.identity);
        return tagOf(component) === 'a' || roleOf(component) === 'menuitem' ? 'item-link' : 'item';
      });
    }
    if (type === 'card') {
      return descendantMembers(node, child => {
        const component = index.byIdentity.get(child.identity);
        const tag = tagOf(component);
        const classes = classesOf(component);
        return /^h[1-6]$/.test(tag) || hasAny(classes, ['card-header', 'card-body', 'card-footer']);
      }, child => {
        const component = index.byIdentity.get(child.identity);
        const classes = classesOf(component);
        const tag = tagOf(component);
        if (classes.includes('card-header')) return 'header';
        if (classes.includes('card-footer')) return 'footer';
        if (classes.includes('card-body')) return 'body';
        if (/^h[1-6]$/.test(tag)) return 'title';
        return 'content';
      });
    }
    if (type === 'figure') {
      return descendantMembers(node, child => tagOf(index.byIdentity.get(child.identity)) === 'figcaption', () => 'caption');
    }
    if (type === 'form') {
      return descendantMembers(node, child => ['label', 'input', 'select', 'textarea', 'button'].includes(tagOf(index.byIdentity.get(child.identity))), child => tagOf(index.byIdentity.get(child.identity)));
    }
    if (type === 'table') {
      return descendantMembers(node, child => ['caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'].includes(tagOf(index.byIdentity.get(child.identity))), child => tagOf(index.byIdentity.get(child.identity)));
    }
    if (type === 'list') {
      return descendantMembers(node, child => tagOf(index.byIdentity.get(child.identity)) === 'li', () => 'item');
    }
    if (type === 'accordion') {
      return descendantMembers(node, child => hasAny(classesOf(index.byIdentity.get(child.identity)), ['accordion-item', 'accordion-header', 'accordion-body']), child => {
        const classes = classesOf(index.byIdentity.get(child.identity));
        if (classes.includes('accordion-header')) return 'header';
        if (classes.includes('accordion-body')) return 'body';
        return 'item';
      });
    }
    if (type === 'carousel') {
      return descendantMembers(node, child => hasAny(classesOf(index.byIdentity.get(child.identity)), ['carousel-item', 'carousel-indicators', 'carousel-control-prev', 'carousel-control-next']), child => {
        const classes = classesOf(index.byIdentity.get(child.identity));
        if (classes.includes('carousel-item')) return 'slide';
        if (classes.includes('carousel-indicators')) return 'indicators';
        return 'control';
      });
    }
    if (type === 'tabs') {
      return descendantMembers(node, child => ['tab', 'tabpanel'].includes(roleOf(index.byIdentity.get(child.identity))), child => roleOf(index.byIdentity.get(child.identity)));
    }
    if (type === 'modal') {
      return descendantMembers(node, child => hasAny(classesOf(index.byIdentity.get(child.identity)), ['modal-header', 'modal-body', 'modal-footer']), child => {
        const classes = classesOf(index.byIdentity.get(child.identity));
        if (classes.includes('modal-header')) return 'header';
        if (classes.includes('modal-footer')) return 'footer';
        return 'body';
      });
    }
    return [];
  }

  function summarize(relationships) {
    const groups = new Map();
    relationships.forEach(relationship => {
      if (!groups.has(relationship.type)) groups.set(relationship.type, []);
      groups.get(relationship.type).push(relationship.id);
    });
    return freezeSummary(Array.from(groups.entries()).map(entry => ({
      type: entry[0],
      count: entry[1].length,
      relationshipIds: entry[1]
    })));
  }

  function resolvePage(page) {
    if (!structures || typeof structures.resolvePage !== 'function') {
      throw new Error('OluntirStructureResolver is required.');
    }
    const structure = structures.resolvePage(page);
    const index = buildComponentIndex(page);
    const relationships = [];

    structure.nodes.forEach(node => {
      const component = index.byIdentity.get(node.identity);
      if (!component) return;
      const type = detectType(component, node);
      if (!type) return;
      relationships.push(createRelationship(structure.pageId, type, node, membersFor(type, node, index)));
    });

    const frozenRelationships = Object.freeze(relationships.slice());
    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      scope: 'page',
      pageId: structure.pageId,
      relationshipCount: frozenRelationships.length,
      relationships: frozenRelationships,
      relationshipTypes: summarize(frozenRelationships)
    });
  }

  function resolveProject(editor) {
    const pages = editor && editor.Pages && editor.Pages.getAll ? editor.Pages.getAll() : [];
    const resolvedPages = Object.freeze((pages || []).map(resolvePage));
    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      scope: 'project',
      pageCount: resolvedPages.length,
      relationshipCount: resolvedPages.reduce((sum, page) => sum + page.relationshipCount, 0),
      pages: resolvedPages
    });
  }

  return Object.freeze({ SCHEMA_VERSION, resolvePage, resolveProject });
});
