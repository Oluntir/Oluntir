const assert = require('assert');

global.OluntirLayoutIdentities = { SCHEMA_VERSION: 1 };
global.OluntirRepeatEngineV2 = require('../editor/js/core/repeat-engine-v2.js');
global.OluntirRepeatContractResolver = require('../editor/js/core/repeat-contract-resolver.js');
global.OluntirRepeatDependencyGraph = require('../editor/js/core/repeat-dependency-graph.js');
global.OluntirTargetedSynchronizationService = require('../editor/js/core/targeted-synchronization-service.js');
global.OluntirRepeatActionContracts = require('../editor/js/core/repeat-action-contracts.js');
const readiness = require('../editor/js/core/repeat-foundation-readiness.js');

const deps = readiness.dependencySnapshot();
assert.strictEqual(deps.length, 6);
assert.ok(deps.every(item => item.available), 'all foundation dependencies must be available');

const contracts = readiness.contractSnapshot();
assert.strictEqual(contracts.valid, true);
assert.deepStrictEqual(contracts.required, [
  'resolver-extensions',
  'dependency-graph-model',
  'action-contracts',
  'targeted-synchronization-service'
]);
assert.ok(contracts.contracts.every(item => item.valid), 'all required contract APIs must be available');
assert.strictEqual(contracts.executionEnabled, true);
assert.strictEqual(contracts.mutationPerformed, false);

const originalResolver = global.OluntirRepeatContractResolver;
global.OluntirRepeatContractResolver = { SCHEMA_VERSION: 1, resolveProject() {} };
const invalidContracts = readiness.contractSnapshot();
assert.strictEqual(invalidContracts.valid, false);
assert.ok(invalidContracts.contracts.find(item => item.name === 'resolver-extensions').missingFunctions.includes('resolveDefinition'));
global.OluntirRepeatContractResolver = originalResolver;

const definition = global.OluntirRepeatEngineV2.createDefinition({
  repeatKey: 'foundation-test',
  source: { pageId: 'page-a', rootIdentity: 'ol_section_a', relativeIdentityPath: [] },
  synchronizationPolicy: 'manual'
});
assert.strictEqual(definition.synchronizationPolicy, 'manual');

assert.throws(
  () => global.OluntirRepeatEngineV2.apply(definition.definitionId),
  error => error && error.code === 'REPEAT_SYNC_RUNTIME_MISSING'
);

const service = global.OluntirTargetedSynchronizationService.create();
const blocked = service.execute({ schemaVersion: 1, type: 'repeat-targeted-sync-plan', valid: true, blocked: false, cycleCount: 0, operations: [{}] }, {});
assert.strictEqual(blocked.executionEnabled, true);
assert.strictEqual(blocked.mutationPerformed, false);
assert.strictEqual(blocked.status, 'blocked');

const audit = readiness.audit(null);
assert.strictEqual(audit.mode, 'central-library-manual-publish');
assert.strictEqual(audit.productiveSynchronizationEnabled, true);
assert.strictEqual(audit.visibleRepeatUiEnabled, true);
assert.strictEqual(audit.automaticSynchronizationEnabled, false);
assert.strictEqual(audit.mutationPerformed, false);
assert.strictEqual(audit.contracts.valid, true);
assert.strictEqual(audit.contracts.executionEnabled, true);
assert.strictEqual(audit.contracts.mutationPerformed, false);

const index = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('repeat-foundation-readiness.js'));
assert.ok(index.includes('repeat-synchronization-runtime.js'));
assert.ok(index.includes('repeat-auto-synchronization.js'));
assert.ok(!index.includes('oluntir-diagnostics-repeat-sync'));

console.log('OLUNTIR-1.3.1-REPEAT-FOUNDATION-READINESS-TEST ERFOLGREICH');
