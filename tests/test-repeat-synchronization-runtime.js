const assert = require('assert');
const syncApi = require('../editor/js/core/targeted-synchronization-service.js');
const source = { title: 'Neu' };
let target = { title: 'Alt' };
global.OluntirRepeatActionContracts = {
  createPlan(_editor, payload) {
    return { schemaVersion:1, type:'repeat-targeted-sync-plan', reference:payload.reference, valid:true, blocked:false, cycleCount:0, issues:[], operations:[{ operationId:'repeat-sync:i1', definitionId:'d1', instanceId:'i1', sourcePageId:'p1', sourceIdentity:'s1', targetPageId:'p2', targetIdentity:'t1' }] };
  }
};
global.OluntirTargetedSynchronizationService = syncApi;
global.OluntirRepeatSyncAccessAdapter = {
  create() { return {
    readSource(){ return source; }, readTarget(){ return target; },
    writeTarget(_op, value){ target = JSON.parse(JSON.stringify(value)); },
    restoreTarget(_op, value){ target = JSON.parse(JSON.stringify(value)); },
    captureRollback(value){ return JSON.parse(JSON.stringify(value)); }
  }; }
};
const runtime = require('../editor/js/core/repeat-synchronization-runtime.js');
assert.strictEqual(runtime.getState().executionEnabled, false);
const result = runtime.apply({}, 'd1');
assert.strictEqual(result.status, syncApi.STATUS.BLOCKED);
assert.strictEqual(result.valid, false);
assert.strictEqual(result.mutationPerformed, false);
assert.strictEqual(result.executionEnabled, false);
assert.deepStrictEqual(target, { title: 'Alt' });
assert(result.issues.some(issue => issue.code === 'TARGETED_SYNC_EXECUTION_DISABLED_1_3_1'));
assert.strictEqual(runtime.getState().executionEnabled, false);
console.log('Repeat Synchronization Runtime Foundation Lock: OK');
