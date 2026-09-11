'use strict';

const assert = require('assert');
const matrix = require('../editor/js/core/translation-matrix.js');

assert.equal(matrix.SCHEMA_VERSION, 1);
assert.equal(matrix.readOnly, true);
assert.equal(matrix.mutationEnabled, false);
assert.equal(matrix.CANONICAL_TERMS.row.id, 'row');
assert.equal(matrix.CANONICAL_TERMS.mainContent.id, 'main-content');

const rule = matrix.createRule({
  ruleId: 'bootstrap5.layout.row',
  semanticId: 'row',
  category: 'layout',
  frameworkFamily: 'bootstrap',
  frameworkId: 'bs5',
  versionRange: '5.x',
  direction: 'bidirectional',
  detect: [{ kind: 'class', value: 'row' }],
  emit: [{ kind: 'output-class', value: 'row' }],
  capabilities: ['responsive-layout'],
  confidence: 1,
  reversible: true,
  lossy: false,
  provenance: { source: 'contract-fixture' }
});

assert.equal(rule.ruleId, 'bootstrap5.layout.row');
assert.equal(Object.isFrozen(rule), true);
assert.equal(Object.isFrozen(rule.detect), true);
assert.throws(() => matrix.createRule({
  ruleId: 'invalid',
  semanticId: 'not-a-canonical-term',
  category: 'layout',
  frameworkFamily: 'bootstrap',
  frameworkId: 'bs5',
  detect: [{ kind: 'class', value: 'x' }],
  emit: [{ kind: 'output-class', value: 'x' }]
}), error => error.code === 'OLUNTIR_TRANSLATION_MATRIX_INVALID_RULE');

const registry = matrix.createRegistry([{
  id: 'bs5',
  family: 'bootstrap',
  version: '5.3.8',
  rules: [rule]
}]);

assert.equal(registry.getProfile('BS5').version, '5.3.8');
assert.equal(registry.findRules({ frameworkId: 'bs5', semanticId: 'row' }).length, 1);
assert.equal(registry.findRules({ frameworkId: 'bs5', semanticId: 'row' })[0].ruleId, 'bootstrap5.layout.row');
assert.equal(registry.mutationEnabled, false);
assert.equal(Object.isFrozen(registry), true);
assert.equal(Object.isFrozen(registry.profiles), true);

const snapshot = registry.snapshot();
assert.equal(snapshot.readOnly, true);
assert.equal(snapshot.mutationEnabled, false);
assert.equal(snapshot.profileCount, 1);

console.log('TRANSLATION-MATRIX-CONTRACT-TEST ERFOLGREICH');
