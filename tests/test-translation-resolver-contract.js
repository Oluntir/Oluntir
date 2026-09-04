'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const resolver = require('../editor/js/core/translation-resolver.js');

const html = fs.readFileSync(path.join(__dirname, 'fixtures/bootstrap5-source.html'), 'utf8');
const compiled = resolver.compileSource({ html }, { frameworkId: 'bs5' });

assert.equal(compiled.valid, true);
assert.equal(compiled.readOnly, true);
assert.equal(compiled.mutationEnabled, false);
assert.equal(compiled.plan.status, 'compiled');
assert.equal(compiled.plan.entryCount, compiled.analysis.recognizedRuleCount);
assert.equal(compiled.plan.implementableEntryCount > 0, true);

const resolved = resolver.resolve({
  frameworkId: 'bs5',
  semanticId: 'row',
  analysis: compiled.analysis
});
assert.equal(resolved.status, 'resolved');
assert.equal(resolved.selected.ruleId, 'bs5.row.row');

const ambiguous = resolver.resolve({ frameworkId: 'bs5', semanticId: 'navigation' });
assert.equal(ambiguous.status, 'ambiguous');
assert.equal(ambiguous.selected, null);

assert.equal(Object.isFrozen(compiled), true);
assert.equal(Object.isFrozen(compiled.plan), true);
assert.equal(Object.isFrozen(resolver), true);

console.log('TRANSLATION-RESOLVER-CONTRACT-TEST ERFOLGREICH');
