(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./capability-catalog.js') : root.OluntirAnalyzerCapabilityCatalog
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerOirProject = api;
})(typeof window !== 'undefined' ? window : globalThis, function (catalog) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const GRAPH_NAMES = Object.freeze([
    'semantic', 'presentation', 'interaction', 'asset',
    'dependency', 'capability', 'validation'
  ]);

  function emptyGraph(name) {
    return { schemaVersion: SCHEMA_VERSION, name, nodes: [], edges: [] };
  }

  function create(metadata) {
    const source = metadata || {};
    if (!source.projectId) throw new Error('projectId is required.');
    const graphs = {};
    GRAPH_NAMES.forEach(name => { graphs[name] = emptyGraph(name); });
    return {
      schemaVersion: SCHEMA_VERSION,
      kind: 'oluntir-intermediate-representation',
      project: {
        id: String(source.projectId),
        name: String(source.name || source.projectId),
        analyzerVersion: String(source.analyzerVersion || '0.1.0'),
        createdAt: source.createdAt || null
      },
      policies: {
        readOnlyAnalysis: true,
        generatesHtml: false,
        modifiesSource: false,
        dependsOnGrapesJs: false,
        definesOluntirComponents: false
      },
      sourceInventory: [],
      evidence: [],
      graphs,
      vocabularies: { presentation: [], interaction: [] },
      diagnostics: []
    };
  }

  function addCapability(project, input) {
    const value = input || {};
    const capabilityId = String(value.capabilityId || '').trim().toLowerCase();
    if (!catalog.get(capabilityId)) throw new Error(`Unknown capability: ${capabilityId || '<empty>'}`);
    if (!catalog.isFrameworkNeutral(capabilityId)) throw new Error(`Capability is not framework-neutral: ${capabilityId}`);
    const evidenceIds = Array.isArray(value.evidenceIds) ? value.evidenceIds.slice() : [];
    const confidence = Number(value.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) throw new Error('confidence must be between 0 and 1.');
    const node = {
      id: `capability:${capabilityId}:${project.graphs.capability.nodes.length + 1}`,
      type: 'capability-observation',
      capabilityId,
      confidence,
      status: value.status || 'observed',
      evidenceIds,
      support: Object.assign({
        read: true, write: false, create: false, delete: false,
        reorder: false, export: false, roundtrip: false
      }, value.support || {})
    };
    project.graphs.capability.nodes.push(node);
    return node;
  }

  function addEvidence(project, evidence) {
    if (!evidence || !evidence.id) throw new Error('Valid evidence is required.');
    if (!project.evidence.some(item => item.id === evidence.id)) project.evidence.push(evidence);
    return evidence.id;
  }

  return Object.freeze({ SCHEMA_VERSION, GRAPH_NAMES, create, addCapability, addEvidence });
});
