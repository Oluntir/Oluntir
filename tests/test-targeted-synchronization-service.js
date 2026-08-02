const assert = require('assert');
const api = require('../editor/js/core/targeted-synchronization-service.js');

const plan = {
  schemaVersion: 1,
  type: 'repeat-targeted-sync-plan',
  valid: true,
  blocked: false,
  cycleCount: 0,
  operations: [
    {
      operationId: 'repeat-sync:instance-a',
      definitionId: 'definition-a',
      instanceId: 'instance-a',
      sourcePageId: 'page-home',
      sourceIdentity: 'source-a',
      targetPageId: 'page-contact',
      targetIdentity: 'target-a',
      status: 'planned'
    },
    {
      operationId: 'repeat-sync:instance-b',
      definitionId: 'definition-a',
      instanceId: 'instance-b',
      sourcePageId: 'page-home',
      sourceIdentity: 'source-a',
      targetPageId: 'page-about',
      targetIdentity: 'target-b',
      status: 'planned'
    }
  ],
  issues: [],
  mutationPerformed: false
};

const sources = { 'repeat-sync:instance-a': { title: 'A' }, 'repeat-sync:instance-b': { title: 'A' } };
const targets = { 'repeat-sync:instance-a': { title: 'old' }, 'repeat-sync:instance-b': { title: 'A' } };
const adapter = {
  readSource(operation) { return sources[operation.operationId]; },
  readTarget(operation) { return targets[operation.operationId]; },
  captureRollback(target) { return { previous: target }; }
};

assert.strictEqual(api.validatePlan(plan).valid, true);
assert.strictEqual(api.validateAccessAdapter(adapter).valid, true);
const service = api.create({ maxTransactions: 10 });
const result = service.dryRun(plan, adapter);
assert.strictEqual(result.status, api.STATUS.DRY_RUN_COMPLETED);
assert.strictEqual(result.operationCounts.changed, 1);
assert.strictEqual(result.operationCounts.unchanged, 1);
assert.strictEqual(result.mutationPerformed, false);
assert.strictEqual(result.executionEnabled, false);
assert.ok(Object.isFrozen(result));
assert.ok(result.operations[0].rollbackToken);
assert.strictEqual(service.getState().activeLockCount, 0);
const committed = service.commit(result.transactionId);
assert.strictEqual(committed.status, api.STATUS.COMMITTED);
assert.strictEqual(committed.mutationPerformed, false);
const writeTargets = JSON.parse(JSON.stringify(targets));
const writeAdapter = Object.assign({}, adapter, {
  readTarget(operation) { return writeTargets[operation.operationId]; },
  writeTarget(operation, source) { writeTargets[operation.operationId] = JSON.parse(JSON.stringify(source)); },
  restoreTarget(operation, rollback) { writeTargets[operation.operationId] = JSON.parse(JSON.stringify(rollback.previous)); }
});
const executed = service.execute(plan, writeAdapter);
assert.strictEqual(executed.status, api.STATUS.BLOCKED);
assert.strictEqual(executed.executionEnabled, false);
assert.strictEqual(executed.mutationPerformed, false);
assert.ok(executed.issues.some(item => item.code === 'TARGETED_SYNC_EXECUTION_DISABLED_1_3_1'));
assert.deepStrictEqual(writeTargets, targets);

const blocker = api.create();
const prepared = blocker.prepare(plan, adapter);
const locked = blocker.prepare(plan, adapter);
assert.strictEqual(prepared.status, api.STATUS.PREPARED);
assert.strictEqual(locked.status, api.STATUS.BLOCKED);
assert.ok(locked.issues.some(item => item.code === 'TARGETED_SYNC_TARGET_LOCKED'));
const rolledBack = blocker.rollback(prepared.transactionId, 'test');
assert.strictEqual(rolledBack.status, api.STATUS.ROLLED_BACK);
assert.strictEqual(blocker.getState().activeLockCount, 0);

const invalid = service.dryRun(Object.assign({}, plan, { cycleCount: 1 }), adapter);
assert.strictEqual(invalid.status, api.STATUS.BLOCKED);
assert.ok(invalid.issues.some(item => item.code === 'TARGETED_SYNC_PLAN_CYCLE'));
console.log('Targeted Synchronization Service DEV_005: OK');
