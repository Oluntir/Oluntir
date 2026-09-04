(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./capability-catalog.js') : root.OluntirAnalyzerCapabilityCatalog
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirFrameworkKnowledgeCompiler = api;
})(typeof window !== 'undefined' ? window : globalThis, function (catalog) {
  'use strict';

  const COMPILER_VERSION = '0.1.0';

  function assertProject(project) {
    if (!project || project.kind !== 'oluntir-intermediate-representation') {
      throw new Error('A valid OIR project is required.');
    }
    if (!project.policies || project.policies.readOnlyAnalysis !== true) {
      throw new Error('Only read-only OIR projects can be compiled.');
    }
  }

  function compile(project, options) {
    assertProject(project);
    const config = options || {};
    const framework = Object.assign({ id: 'unknown', version: null }, config.framework || {});
    const capabilities = project.graphs.capability.nodes.map(node => ({
      id: node.capabilityId,
      confidence: node.confidence,
      status: node.status,
      support: Object.assign({}, node.support),
      evidenceIds: node.evidenceIds.slice()
    }));

    capabilities.forEach(item => {
      if (!catalog.get(item.id) || !catalog.isFrameworkNeutral(item.id)) {
        throw new Error(`Invalid compiled capability: ${item.id}`);
      }
    });

    return Object.freeze({
      manifestVersion: 1,
      packageKind: 'oluntir-framework-knowledge',
      compiler: Object.freeze({ name: 'Oluntir Framework Knowledge Compiler', version: COMPILER_VERSION }),
      framework: Object.freeze({ id: String(framework.id), version: framework.version == null ? null : String(framework.version) }),
      sourceProjectId: project.project.id,
      policies: Object.freeze({
        declarativeOnly: true,
        executableEditorCode: false,
        generatesFrameworkComponents: false,
        generatesOluntirComponents: false,
        requiresGrapesJs: false
      }),
      capabilities: Object.freeze(capabilities),
      presentationVocabulary: Object.freeze(project.vocabularies.presentation.slice()),
      interactionVocabulary: Object.freeze(project.vocabularies.interaction.slice()),
      validation: Object.freeze({ diagnostics: project.diagnostics.slice() })
    });
  }

  return Object.freeze({ COMPILER_VERSION, compile });
});
