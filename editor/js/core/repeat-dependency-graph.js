(function (root, factory) {
  const repeatEngine = root && root.OluntirRepeatEngineV2
    ? root.OluntirRepeatEngineV2
    : (typeof module === 'object' && module.exports ? require('./repeat-engine-v2.js') : null);
  const resolver = root && root.OluntirRepeatContractResolver
    ? root.OluntirRepeatContractResolver
    : (typeof module === 'object' && module.exports ? require('./repeat-contract-resolver.js') : null);
  const api = factory(repeatEngine, resolver);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatDependencyGraph = api;
})(typeof window !== 'undefined' ? window : globalThis, function (repeatEngine, resolver) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const NODE_TYPE = Object.freeze({
    DEFINITION: 'definition', SOURCE: 'source', INSTANCE: 'instance', REFERENCE: 'reference', PAGE: 'page', SYSTEM: 'system'
  });
  const EDGE_TYPE = Object.freeze({
    DEFINES_SOURCE: 'defines-source', HAS_INSTANCE: 'has-instance', LOCATED_ON: 'located-on',
    REFERENCES: 'references', PARENT_OF: 'parent-of', AFFECTS: 'affects', CONSUMED_BY: 'consumed-by'
  });

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freeze(value[key]); });
    return Object.freeze(value);
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function id(type, value) { return ['olrepeatdep', type, value].join(':'); }
  function issue(code, message, details) { return freeze({ severity: 'error', code: code, message: message, details: details || null }); }

  class RepeatDependencyGraph {
    constructor(editor) {
      this.editor = editor || null;
      this.nodes = new Map();
      this.edges = [];
      this.outgoing = new Map();
      this.incoming = new Map();
      this.issues = [];
      this.buildProject(editor);
    }

    addNode(node) {
      if (!node || !node.id) return null;
      if (!this.nodes.has(node.id)) this.nodes.set(node.id, Object.assign({}, node));
      return this.nodes.get(node.id);
    }

    addEdge(from, to, type, metadata) {
      if (!from || !to || !this.nodes.has(from) || !this.nodes.has(to)) return;
      if (this.edges.some(function (edge) { return edge.from === from && edge.to === to && edge.type === type; })) return;
      const edge = { from: from, to: to, type: type, metadata: metadata || null };
      this.edges.push(edge);
      if (!this.outgoing.has(from)) this.outgoing.set(from, []);
      if (!this.incoming.has(to)) this.incoming.set(to, []);
      this.outgoing.get(from).push(edge);
      this.incoming.get(to).push(edge);
    }

    buildProject(editor) {
      if (!repeatEngine || typeof repeatEngine.snapshot !== 'function') throw new Error('OluntirRepeatEngineV2 is required.');
      if (!resolver || typeof resolver.resolveProject !== 'function') throw new Error('OluntirRepeatContractResolver is required.');
      this.editor = editor || this.editor;
      this.nodes.clear(); this.edges = []; this.outgoing.clear(); this.incoming.clear(); this.issues = [];

      const state = repeatEngine.snapshot();
      const resolved = resolver.resolveProject(this.editor);
      const repeatSystem = id(NODE_TYPE.SYSTEM, 'repeat-engine');
      const syncSystem = id(NODE_TYPE.SYSTEM, 'targeted-sync');
      const exportSystem = id(NODE_TYPE.SYSTEM, 'export');
      this.addNode({ id: repeatSystem, type: NODE_TYPE.SYSTEM, key: 'repeat-engine' });
      this.addNode({ id: syncSystem, type: NODE_TYPE.SYSTEM, key: 'targeted-sync' });
      this.addNode({ id: exportSystem, type: NODE_TYPE.SYSTEM, key: 'export' });

      const pages = new Set();
      function pageNodeId(pageId) { return id(NODE_TYPE.PAGE, pageId); }
      function ensurePage(graph, pageId) {
        if (!pageId || pages.has(pageId)) return;
        pages.add(pageId);
        graph.addNode({ id: pageNodeId(pageId), type: NODE_TYPE.PAGE, pageId: pageId });
      }

      state.definitions.forEach(definition => {
        const definitionNode = id(NODE_TYPE.DEFINITION, definition.definitionId);
        const sourceNode = id(NODE_TYPE.SOURCE, definition.definitionId);
        ensurePage(this, definition.source.pageId);
        this.addNode({ id: definitionNode, type: NODE_TYPE.DEFINITION, definitionId: definition.definitionId, repeatKey: definition.repeatKey });
        this.addNode({ id: sourceNode, type: NODE_TYPE.SOURCE, definitionId: definition.definitionId, pageId: definition.source.pageId, identity: definition.source.rootIdentity });
        this.addEdge(definitionNode, sourceNode, EDGE_TYPE.DEFINES_SOURCE);
        this.addEdge(sourceNode, pageNodeId(definition.source.pageId), EDGE_TYPE.LOCATED_ON);
        this.addEdge(definitionNode, repeatSystem, EDGE_TYPE.CONSUMED_BY);
        this.addEdge(definitionNode, syncSystem, EDGE_TYPE.CONSUMED_BY);
      });

      state.instances.forEach(instance => {
        const instanceNode = id(NODE_TYPE.INSTANCE, instance.instanceId);
        const definitionNode = id(NODE_TYPE.DEFINITION, instance.definitionId);
        ensurePage(this, instance.pageId);
        this.addNode({ id: instanceNode, type: NODE_TYPE.INSTANCE, instanceId: instance.instanceId, definitionId: instance.definitionId, pageId: instance.pageId, identity: instance.rootIdentity, state: instance.state });
        if (this.nodes.has(definitionNode)) this.addEdge(definitionNode, instanceNode, EDGE_TYPE.HAS_INSTANCE);
        this.addEdge(instanceNode, pageNodeId(instance.pageId), EDGE_TYPE.LOCATED_ON);
        this.addEdge(instanceNode, exportSystem, EDGE_TYPE.AFFECTS);
        if (instance.parentInstanceId) {
          const parentNode = id(NODE_TYPE.INSTANCE, instance.parentInstanceId);
          if (this.nodes.has(parentNode)) this.addEdge(parentNode, instanceNode, EDGE_TYPE.PARENT_OF);
        }
      });

      state.references.forEach(reference => {
        const referenceNode = id(NODE_TYPE.REFERENCE, reference.referenceId);
        const ownerNode = id(NODE_TYPE.DEFINITION, reference.ownerDefinitionId);
        const targetNode = id(NODE_TYPE.DEFINITION, reference.targetDefinitionId);
        this.addNode({ id: referenceNode, type: NODE_TYPE.REFERENCE, referenceId: reference.referenceId, ownerDefinitionId: reference.ownerDefinitionId, targetDefinitionId: reference.targetDefinitionId, mode: reference.mode });
        if (this.nodes.has(ownerNode)) this.addEdge(ownerNode, referenceNode, EDGE_TYPE.REFERENCES);
        if (this.nodes.has(targetNode)) this.addEdge(referenceNode, targetNode, EDGE_TYPE.REFERENCES);
      });

      (resolved.issues || []).forEach(item => this.issues.push(freeze(clone(item))));
      this.detectCycles().forEach(cycle => this.issues.push(issue('REPEAT_DEPENDENCY_CYCLE', 'Zyklische Repeat-Abhängigkeit erkannt.', { path: cycle })));
      return this.snapshot();
    }

    resolveNode(reference) {
      if (!reference) return null;
      if (this.nodes.has(reference)) return reference;
      const nodes = Array.from(this.nodes.values());
      const typed = nodes.find(node => node.type === NODE_TYPE.DEFINITION && node.definitionId === reference)
        || nodes.find(node => node.type === NODE_TYPE.INSTANCE && node.instanceId === reference)
        || nodes.find(node => node.type === NODE_TYPE.REFERENCE && node.referenceId === reference);
      if (typed) return typed.id;
      const identityMatches = nodes.filter(node => node.identity === reference);
      return identityMatches.length === 1 ? identityMatches[0].id : null;
    }

    resolveImpact(reference) {
      const rootId = this.resolveNode(reference);
      if (!rootId) return freeze({ root: null, affectedNodeCount: 0, affectedNodes: [], affectedPages: [], affectedInstances: [], affectedDefinitions: [] });
      const queue = [rootId];
      const visited = new Set();
      while (queue.length) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        (this.outgoing.get(current) || []).forEach(edge => queue.push(edge.to));
        (this.incoming.get(current) || []).filter(edge => edge.type === EDGE_TYPE.REFERENCES).forEach(edge => queue.push(edge.from));
      }
      const affectedNodes = Array.from(visited).map(nodeId => clone(this.nodes.get(nodeId)));
      return freeze({
        root: rootId,
        affectedNodeCount: affectedNodes.length,
        affectedNodes: affectedNodes,
        affectedPages: Array.from(new Set(affectedNodes.filter(node => node.pageId).map(node => node.pageId))),
        affectedInstances: affectedNodes.filter(node => node.type === NODE_TYPE.INSTANCE).map(node => node.instanceId),
        affectedDefinitions: affectedNodes.filter(node => node.type === NODE_TYPE.DEFINITION).map(node => node.definitionId)
      });
    }

    detectCycles() {
      const definitionAdjacency = new Map();
      this.nodes.forEach(node => { if (node.type === NODE_TYPE.DEFINITION) definitionAdjacency.set(node.id, []); });
      this.nodes.forEach(node => {
        if (node.type !== NODE_TYPE.REFERENCE) return;
        const owner = (this.incoming.get(node.id) || []).find(edge => edge.type === EDGE_TYPE.REFERENCES);
        const target = (this.outgoing.get(node.id) || []).find(edge => edge.type === EDGE_TYPE.REFERENCES);
        if (owner && target && definitionAdjacency.has(owner.from)) definitionAdjacency.get(owner.from).push(target.to);
      });
      const cycles = [];
      const visiting = new Set();
      const visited = new Set();
      const stack = [];
      function walk(nodeId) {
        if (visiting.has(nodeId)) {
          const start = stack.indexOf(nodeId);
          cycles.push(stack.slice(start).concat(nodeId));
          return;
        }
        if (visited.has(nodeId)) return;
        visiting.add(nodeId); stack.push(nodeId);
        (definitionAdjacency.get(nodeId) || []).forEach(walk);
        stack.pop(); visiting.delete(nodeId); visited.add(nodeId);
      }
      definitionAdjacency.forEach((_, nodeId) => walk(nodeId));
      return freeze(cycles.map(cycle => cycle.slice()));
    }

    snapshot() {
      const nodes = Array.from(this.nodes.values()).map(clone);
      const edges = this.edges.map(clone);
      return freeze({
        schemaVersion: SCHEMA_VERSION,
        scope: 'repeat-project',
        valid: this.issues.length === 0,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        cycleCount: this.detectCycles().length,
        nodes: nodes,
        edges: edges,
        issues: this.issues.map(clone)
      });
    }
  }

  function buildProject(editor) { return new RepeatDependencyGraph(editor); }

  return Object.freeze({ SCHEMA_VERSION, NODE_TYPE, EDGE_TYPE, RepeatDependencyGraph, buildProject });
});
