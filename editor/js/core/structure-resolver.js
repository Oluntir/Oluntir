(function (root, factory) {
  const identities = root && root.OluntirLayoutIdentities
    ? root.OluntirLayoutIdentities
    : (typeof module === 'object' && module.exports ? require('./layout-identities.js') : null);
  const api = factory(identities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirStructureResolver = api;
})(typeof window !== 'undefined' ? window : globalThis, function (identities) {
  'use strict';

  const SCHEMA_VERSION = 1;

  function childrenOf(component) {
    if (!component || !component.components) return [];
    const collection = component.components();
    if (collection && Array.isArray(collection.models)) return collection.models;
    return Array.isArray(collection) ? collection : [];
  }

  function pageRoot(page) {
    return page && page.getMainComponent ? page.getMainComponent() : null;
  }

  function freezeNode(node) {
    return Object.freeze(Object.assign({}, node, {
      capabilities: Object.freeze((node.capabilities || []).slice()),
      classes: Object.freeze((node.classes || []).slice()),
      framework: node.framework ? Object.freeze(Object.assign({}, node.framework)) : null,
      children: Object.freeze((node.children || []).map(freezeNode))
    }));
  }

  function freezeSummary(items) {
    return Object.freeze((items || []).map(item => Object.freeze(Object.assign({}, item, {
      identities: Object.freeze((item.identities || []).slice())
    }))));
  }

  function shouldInclude(description, isRoot) {
    return Boolean(isRoot || (description && (description.structuralKind || description.componentType)));
  }

  function createNode(description, parentIdentity, depth) {
    return {
      identity: description.identity,
      pageId: description.pageId,
      parentIdentity: parentIdentity || null,
      depth: depth,
      structuralKind: description.structuralKind,
      templateRole: description.templateRole || null,
      frameworkRole: description.frameworkRole || null,
      framework: description.framework || null,
      tagName: description.tagName || null,
      classes: description.classes || [],
      componentType: description.componentType,
      role: description.role,
      cardinality: description.cardinality,
      capabilities: description.capabilities || [],
      children: []
    };
  }

  function collect(component, context, parentNode, depth, state, isRoot) {
    if (!component || !identities || typeof identities.describe !== 'function') return;

    const description = identities.describe(component, {
      page: context.page,
      pageId: context.pageId,
      isRoot: Boolean(isRoot)
    });
    const included = shouldInclude(description, isRoot);
    let currentParent = parentNode;
    let currentDepth = depth;

    if (included) {
      const node = createNode(description, parentNode ? parentNode.identity : null, depth);
      if (parentNode) parentNode.children.push(node);
      else state.roots.push(node);
      state.nodes.push(node);
      currentParent = node;
      currentDepth = depth + 1;
    }

    childrenOf(component).forEach(child => {
      collect(child, context, currentParent, currentDepth, state, false);
    });
  }

  function summarize(nodes, key) {
    const groups = new Map();
    nodes.forEach(node => {
      const value = node[key];
      if (!value) return;
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(node.identity);
    });
    return freezeSummary(Array.from(groups.entries()).map(entry => ({
      [key]: entry[0],
      count: entry[1].length,
      identities: entry[1].filter(Boolean)
    })));
  }

  function summarizeCardinality(nodes) {
    const groups = new Map();
    nodes.forEach(node => {
      if (!node.cardinality) return;
      const key = [node.cardinality.scope, node.role || '', node.componentType || ''].join(':');
      if (!groups.has(key)) {
        groups.set(key, {
          scope: node.cardinality.scope,
          role: node.role,
          componentType: node.componentType,
          min: node.cardinality.min,
          max: node.cardinality.max,
          identities: []
        });
      }
      groups.get(key).identities.push(node.identity);
    });
    return freezeSummary(Array.from(groups.values()).map(group => Object.assign({}, group, {
      count: group.identities.length,
      identities: group.identities.filter(Boolean)
    })));
  }

  function resolvePage(page) {
    const rootComponent = pageRoot(page);
    const currentPageId = identities && typeof identities.pageId === 'function'
      ? identities.pageId(page)
      : null;
    const state = { roots: [], nodes: [] };

    collect(rootComponent, { page: page, pageId: currentPageId }, null, 0, state, true);

    const frozenRoots = Object.freeze(state.roots.map(freezeNode));
    const flatNodes = [];
    function flatten(node) {
      flatNodes.push(node);
      node.children.forEach(flatten);
    }
    frozenRoots.forEach(flatten);
    const frozenNodes = Object.freeze(flatNodes);

    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      scope: 'page',
      pageId: currentPageId,
      roots: frozenRoots,
      nodes: frozenNodes,
      recognizedStructures: summarize(frozenNodes, 'structuralKind'),
      semanticAreas: summarize(frozenNodes, 'componentType'),
      roles: summarize(frozenNodes, 'role'),
      cardinality: summarizeCardinality(frozenNodes)
    });
  }

  function resolveProject(editor) {
    const pages = editor && editor.Pages && editor.Pages.getAll ? editor.Pages.getAll() : [];
    const resolvedPages = Object.freeze((pages || []).map(resolvePage));
    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      scope: 'project',
      pageCount: resolvedPages.length,
      pages: resolvedPages
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    resolvePage,
    resolveProject
  });
});
