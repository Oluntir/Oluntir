'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const resolver = require('../editor/js/core/translation-resolver.js');
const materialization = require('../editor/js/core/translation-materialization-plan.js');

const html = fs.readFileSync(path.join(__dirname, 'fixtures/bootstrap5-source.html'), 'utf8');
const compiled = resolver.compileSource({ html }, { frameworkId: 'bs5' });
const prepared = materialization.build(compiled.plan, { targetRef: 'abstract-target-1' });

assert.equal(prepared.valid, true);
assert.equal(prepared.status, 'prepared');
assert.equal(prepared.readOnly, true);
assert.equal(prepared.mutationEnabled, false);
assert.equal(prepared.requiresMutationGate, true);
assert.equal(prepared.operationCount > 0, true);
assert.equal(prepared.operations.every(operation => operation.requiresMutationGate === true), true);
assert.equal(prepared.operations.every(operation => operation.targetRef === 'abstract-target-1'), true);
assert.equal(Object.isFrozen(prepared), true);

const blocked = materialization.build({ valid: true, readOnly: true, mutationEnabled: true, entries: [] });
assert.equal(blocked.valid, false);
assert.equal(blocked.issues[0].code, 'PLAN_MUTATION_FLAG_FORBIDDEN');

console.log('TRANSLATION-MATERIALIZATION-PLAN-TEST ERFOLGREICH');
