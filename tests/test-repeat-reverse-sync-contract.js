'use strict';
const assert = require('assert');

const repeat = require('../editor/js/core/repeat-engine-v2.js');
global.OluntirRepeatEngineV2 = repeat;
let resolvedProject = null;
global.OluntirRepeatContractResolver = { resolveProject() { return resolvedProject; } };
global.OluntirRepeatDependencyGraph = {
  buildProject() {
    return {
      snapshot() { return { valid: true, cycleCount: 0, issues: [] }; },
      resolveImpact() { return { root: true, affectedDefinitions: ['definition-1'], affectedInstances: ['instance-1', 'instance-2'], affectedPages: ['page-source', 'page-target', 'page-third'] }; }
    };
  }
};
global.OluntirTargetedSynchronizationService = { validatePlan() { return { valid: true, issues: [] }; } };
global.OluntirActionEngine = {};

const contracts = require('../editor/js/core/repeat-action-contracts.js');
repeat.reset();
const definition = repeat.createDefinition({
  definitionId: 'definition-1',
  repeatKey: 'cards',
  source: { pageId: 'page-source', rootIdentity: 'source-root', relativeIdentityPath: [] },
  synchronizationPolicy: repeat.SYNC_POLICY.AUTOMATIC
});
const instance = repeat.createInstance(definition.definitionId, { pageId: 'page-target', rootIdentity: 'target-root' });
const sibling = repeat.createInstance(definition.definitionId, { pageId: 'page-third', rootIdentity: 'third-root' });

resolvedProject = {
  valid: true,
  issues: [],
  definitions: [{
    definition,
    source: definition.source,
    instances: [{ instance }, { instance: sibling }]
  }]
};

const plan = contracts.createPlan({}, {
  reference: definition.definitionId,
  definitionId: definition.definitionId,
  direction: 'instance-to-linked',
  sourceInstanceId: instance.instanceId
});

assert.strictEqual(plan.valid, true);
assert.strictEqual(plan.direction, 'instance-to-linked');
assert.strictEqual(plan.sourceInstanceId, instance.instanceId);
assert.strictEqual(plan.operations.length, 2, 'Reverse synchronization must target source and sibling instances.');
assert.ok(plan.operations.every(operation => operation.direction === 'instance-to-linked'));
assert.ok(plan.operations.some(operation => operation.targetRole === 'definition-source' && operation.targetPageId === 'page-source'));
assert.ok(plan.operations.some(operation => operation.targetRole === 'instance' && operation.targetPageId === 'page-third'));
assert.ok(plan.operations.every(operation => operation.sourcePageId === 'page-target' && operation.sourceIdentity === 'target-root'));

console.log('REPEAT-REVERSE-SYNC-CONTRACT-TEST ERFOLGREICH');
