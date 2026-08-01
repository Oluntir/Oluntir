(function (root, factory) {
  const relationships = root && root.OluntirRelationshipResolver
    ? root.OluntirRelationshipResolver
    : (typeof module === 'object' && module.exports ? require('./relationship-resolver.js') : null);
  const structures = root && root.OluntirStructureResolver
    ? root.OluntirStructureResolver
    : (typeof module === 'object' && module.exports ? require('./structure-resolver.js') : null);
  const api = factory(relationships, structures);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirDependencyGraph = api;
})(typeof window !== 'undefined' ? window : globalThis, function (relationships, structures) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const STATUS = Object.freeze({ CLEAN: 'clean', DIRTY: 'dirty' });

  function freezeArray(values) {
    return Object.freeze((values || []).slice());
  }

  function freezeNode(node) {
    return Object.freeze({
      id: node.id,
      type: node.type,
      subtype: node.subtype || null,
      pageId: node.pageId || null,
      identity: node.identity || null,
      label: node.label || null,
      status: node.status,
      reasons: freezeArray(node.reasons)
    });
  }

  function freezeEdge(edge) {
    return Object.freeze({ from: edge.from, to: edge.to, type: edge.type });
  }

  function nodeId(type, value) {
    return ['oldep', type, value || 'anonymous'].join(':');
  }

  function exportNodeId(pageId) {
    return nodeId('export', pageId);
  }

  function systemNodeId(name) {
    return nodeId('system', name);
  }

  function sharedKey(node) {
    if (!node) return null;
    if (node.componentType === 'navigation' || node.role === 'navigation') return 'navigation';
    if (node.role === 'header' || node.componentType === 'header') return 'header';
    if (node.role === 'footer' || node.componentType === 'footer') return 'footer';
    return null;
  }

  class ProjectDependencyGraph {
    constructor(editor) {
      this.editor = editor || null;
      this.nodes = new Map();
      this.edges = new Map();
      this.reverseEdges = new Map();
      this.identityIndex = new Map();
      this.built = false;
      this.buildProject(editor);
    }

    addNode(input) {
      if (!input || !input.id) return null;
      const existing = this.nodes.get(input.id);
      if (existing) return existing;
      const node = {
        id: input.id,
        type: input.type,
        subtype: input.subtype || null,
        pageId: input.pageId || null,
        identity: input.identity || null,
        label: input.label || null,
        status: STATUS.CLEAN,
        reasons: []
      };
      this.nodes.set(node.id, node);
      if (node.identity) {
        if (!this.identityIndex.has(node.identity)) this.identityIndex.set(node.identity, new Set());
        this.identityIndex.get(node.identity).add(node.id);
      }
      return node;
    }

    addEdge(from, to, type) {
      if (!from || !to || !this.nodes.has(from) || !this.nodes.has(to)) return;
      const key = [from, to, type || 'depends-on'].join('|');
      if (this.edges.has(key)) return;
      const edge = { from: from, to: to, type: type || 'depends-on' };
      this.edges.set(key, edge);
      if (!this.reverseEdges.has(from)) this.reverseEdges.set(from, new Set());
      this.reverseEdges.get(from).add(to);
    }

    resetGraph() {
      this.nodes.clear();
      this.edges.clear();
      this.reverseEdges.clear();
      this.identityIndex.clear();
      this.built = false;
    }

    buildProject(editor) {
      if (!relationships || typeof relationships.resolveProject !== 'function') {
        throw new Error('OluntirRelationshipResolver is required.');
      }
      if (!structures || typeof structures.resolveProject !== 'function') {
        throw new Error('OluntirStructureResolver is required.');
      }

      this.editor = editor || this.editor;
      this.resetGraph();
      const structureProject = structures.resolveProject(this.editor);
      const relationshipProject = relationships.resolveProject(this.editor);
      const relationshipPages = new Map(relationshipProject.pages.map(page => [page.pageId, page]));

      const validatorId = systemNodeId('semantic-validator');
      const repeatId = systemNodeId('repeat-engine');
      const sharedId = systemNodeId('shared-content');
      this.addNode({ id: validatorId, type: 'system', subtype: 'validator', label: 'Semantic Validator' });
      this.addNode({ id: repeatId, type: 'system', subtype: 'repeat', label: 'Repeat Engine' });
      this.addNode({ id: sharedId, type: 'system', subtype: 'shared-content', label: 'Shared Content' });

      structureProject.pages.forEach(page => {
        const pageNodeId = nodeId('page', page.pageId);
        const pageExportId = exportNodeId(page.pageId);
        this.addNode({ id: pageNodeId, type: 'page', pageId: page.pageId, identity: page.pageId, label: page.pageId });
        this.addNode({ id: pageExportId, type: 'export', pageId: page.pageId, label: page.pageId });
        this.addEdge(pageNodeId, pageExportId, 'produces');
        this.addEdge(pageNodeId, validatorId, 'validated-by');

        page.nodes.forEach(item => {
          if (!item.identity) return;
          const componentId = nodeId('component', item.identity);
          this.addNode({
            id: componentId,
            type: 'component',
            subtype: item.componentType || item.structuralKind || null,
            pageId: page.pageId,
            identity: item.identity,
            label: item.role || item.componentType || item.structuralKind
          });
          this.addEdge(componentId, pageNodeId, 'contained-by');

          const key = sharedKey(item);
          if (key) {
            const sharedNodeId = nodeId('shared', key);
            this.addNode({ id: sharedNodeId, type: 'shared', subtype: key, identity: 'shared:' + key, label: key });
            this.addEdge(componentId, sharedNodeId, 'represents');
            this.addEdge(sharedNodeId, pageNodeId, 'used-by');
            this.addEdge(sharedNodeId, sharedId, 'managed-by');
          }
        });

        const resolvedRelationships = relationshipPages.get(page.pageId);
        (resolvedRelationships ? resolvedRelationships.relationships : []).forEach(item => {
          const relationshipId = nodeId('relationship', item.id);
          this.addNode({
            id: relationshipId,
            type: 'relationship',
            subtype: item.type,
            pageId: page.pageId,
            identity: item.id,
            label: item.type
          });
          this.addEdge(relationshipId, pageNodeId, 'belongs-to');
          this.addEdge(relationshipId, validatorId, 'validated-by');
          this.addEdge(relationshipId, repeatId, 'consumed-by');
          this.addEdge(relationshipId, pageExportId, 'exported-by');

          [item.ownerIdentity].concat(item.members.map(member => member.identity)).filter(Boolean).forEach(identity => {
            const componentId = nodeId('component', identity);
            if (this.nodes.has(componentId)) this.addEdge(componentId, relationshipId, 'participates-in');
          });
        });
      });

      this.built = true;
      return this.snapshot();
    }

    resolveNodeIds(reference) {
      if (!reference) return [];
      if (this.nodes.has(reference)) return [reference];
      return this.identityIndex.has(reference) ? Array.from(this.identityIndex.get(reference)) : [];
    }

    markDirty(reference, reason) {
      const roots = this.resolveNodeIds(reference);
      const queue = roots.slice();
      const visited = new Set();
      const dirtyReason = String(reason || 'dependency-changed');

      while (queue.length) {
        const id = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        const node = this.nodes.get(id);
        if (!node) continue;
        node.status = STATUS.DIRTY;
        if (!node.reasons.includes(dirtyReason)) node.reasons.push(dirtyReason);
        const dependents = this.reverseEdges.get(id);
        if (dependents) dependents.forEach(dependentId => queue.push(dependentId));
      }
      return this.resolve();
    }

    resolve() {
      const dirtyNodes = Array.from(this.nodes.values()).filter(node => node.status === STATUS.DIRTY).map(freezeNode);
      return Object.freeze({
        schemaVersion: SCHEMA_VERSION,
        dirtyCount: dirtyNodes.length,
        dirtyNodes: Object.freeze(dirtyNodes)
      });
    }

    getDirtyNodes() {
      return this.resolve().dirtyNodes;
    }

    clear(reference) {
      const ids = reference ? this.resolveNodeIds(reference) : Array.from(this.nodes.keys());
      ids.forEach(id => {
        const node = this.nodes.get(id);
        if (!node) return;
        node.status = STATUS.CLEAN;
        node.reasons = [];
      });
      return this.resolve();
    }

    snapshot() {
      const nodes = Object.freeze(Array.from(this.nodes.values()).map(freezeNode));
      const edges = Object.freeze(Array.from(this.edges.values()).map(freezeEdge));
      return Object.freeze({
        schemaVersion: SCHEMA_VERSION,
        scope: 'project',
        built: this.built,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodes: nodes,
        edges: edges
      });
    }
  }

  function buildProject(editor) {
    return new ProjectDependencyGraph(editor);
  }

  return Object.freeze({
    SCHEMA_VERSION,
    STATUS,
    ProjectDependencyGraph,
    buildProject
  });
});
