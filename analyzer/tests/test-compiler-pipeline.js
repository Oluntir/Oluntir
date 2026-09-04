'use strict';

const assert = require('assert');
const path = require('path');
const pipeline = require('../core/compiler-pipeline.js');

const result = pipeline.compileProject(path.join(__dirname, 'fixtures/demo-template'));
assert.strictEqual(result.oir.kind, 'oluntir-intermediate-representation');
assert.strictEqual(result.oir.policies.readOnlyAnalysis, true);
assert.strictEqual(result.oir.policies.modifiesSource, false);
assert.strictEqual(result.oir.policies.dependsOnGrapesJs, false);
assert(result.oir.sourceInventory.length === 1);
assert(result.oir.evidence.length > 0);
assert(result.oir.graphs.capability.nodes.some(node => node.capabilityId === 'navigation'));
assert(result.oir.graphs.interaction.nodes.some(node => node.capabilityId === 'interaction.carousel'));
assert(result.oir.vocabularies.interaction.some(item => item.id === 'interaction.carousel'));
assert.strictEqual(result.knowledge.packageKind, 'oluntir-framework-knowledge');
assert.strictEqual(result.knowledge.policies.declarativeOnly, true);
assert.strictEqual(result.knowledge.policies.generatesOluntirComponents, false);
assert.strictEqual(result.framework.id, 'bootstrap5');
console.log('COMPILER-PIPELINE-TEST ERFOLGREICH');
