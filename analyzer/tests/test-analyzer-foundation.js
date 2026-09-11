'use strict';

const assert = require('assert');
const catalog = require('../core/capability-catalog.js');
const evidenceStore = require('../core/evidence-store.js');
const oir = require('../core/oir-project.js');
const compiler = require('../core/knowledge-compiler.js');
const contract = require('../contracts/platform-contract.json');

assert.equal(contract.boundaries.oluntirComponentGeneration, false);
assert.equal(contract.boundaries.frameworkComponentReplacement, false);
assert.equal(contract.boundaries.declarativeKnowledgeOutput, true);
assert.equal(catalog.get('media.image-collection').domain, 'content');
assert.equal(catalog.isFrameworkNeutral('media.image-collection'), true);
assert.equal(catalog.isFrameworkNeutral('bootstrap.gallery'), false);
assert.equal(catalog.FORBIDDEN_COMPONENT_IDS.includes('oluntir-gallery'), true);

const store = evidenceStore.create();
const evidence = store.add({
  kind: 'source-location',
  source: { file: 'index.html', line: 10 },
  payload: { selector: '.gallery' }
});

const project = oir.create({ projectId: 'fixture-template', name: 'Fixture Template', createdAt: '2026-08-04T00:00:00Z' });
oir.addEvidence(project, evidence);
oir.addCapability(project, {
  capabilityId: 'media.image-collection',
  confidence: 0.91,
  evidenceIds: [evidence.id],
  support: { read: true, reorder: true }
});

assert.deepEqual(Object.keys(project.graphs), contract.requiredGraphs);
assert.equal(project.policies.definesOluntirComponents, false);
assert.equal(project.graphs.capability.nodes[0].support.write, false);
assert.equal(project.graphs.capability.nodes[0].support.reorder, true);

const knowledge = compiler.compile(project, { framework: { id: 'bootstrap', version: '5' } });
assert.equal(knowledge.packageKind, 'oluntir-framework-knowledge');
assert.equal(knowledge.policies.generatesOluntirComponents, false);
assert.equal(knowledge.policies.requiresGrapesJs, false);
assert.equal(knowledge.capabilities[0].id, 'media.image-collection');
assert.throws(() => oir.addCapability(project, { capabilityId: 'bootstrap.gallery', confidence: 1 }), /Unknown capability/);
assert.throws(() => store.add({ kind: 'guess', source: {} }), /Unsupported evidence kind/);

console.log('ANALYZER-FOUNDATION-TEST ERFOLGREICH');
