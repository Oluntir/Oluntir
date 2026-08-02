'use strict';
const assert = require('assert');

function component(identity, parent) {
  return {
    _parent: parent || null,
    getAttributes() { return { 'data-oluntir-component-id': identity }; },
    parent() { return this._parent; }
  };
}

const listeners = {};
const sourceRoot = component('source-root');
const sourceChild = component('source-child', sourceRoot);
const targetRoot = component('target-root');
const page = { id: 'page-source', get() { return 'page-source'; }, getMainComponent() { return sourceRoot; } };
const editor = {
  on(name, fn) { (listeners[name] ||= []).push(fn); },
  Pages: { getSelected() { return page; } }
};
const calls = [];
let busy = false;
const fakeEngine = {
  defineAction() {}, registerHandler(type) { return 'handler:' + type; },
  async dispatch(action) {
    calls.push(action.type);
    let value = true;
    if (action.type === 'repeat.plan') value = { schemaVersion: 1, type: 'repeat-targeted-sync-plan', valid: true, blocked: false, operations: [{ operationId: 'one' }] };
    if (action.type === 'repeat.prepare-sync') value = { schemaVersion: 1, ready: true };
    if (action.type === 'repeat.sync') { busy = true; value = { status: 'executed' }; busy = false; }
    return { results: [{ value }] };
  }
};

global.OluntirLayoutIdentities = {
  ATTR: { component: 'data-oluntir-component-id' },
  pageId() { return 'page-source'; },
  findById(_page, id) { return id === 'source-root' ? sourceRoot : id === 'target-root' ? targetRoot : null; }
};
global.OluntirRepeatEngineV2 = {
  SYNC_POLICY: { AUTOMATIC: 'automatic' },
  getDefinitions() { return [
    { definitionId: 'def-a', synchronizationPolicy: 'automatic', source: { pageId: 'page-source', rootIdentity: 'source-root' } },
    { definitionId: 'def-manual', synchronizationPolicy: 'manual', source: { pageId: 'page-source', rootIdentity: 'source-root' } }
  ]; }
};
global.OluntirRuntimeActions = { ensure() { return fakeEngine; } };
global.OluntirRepeatActionContracts = {
  ACTION_TYPE: { MARK_DIRTY:'repeat.mark-dirty', PLAN:'repeat.plan', PREPARE_SYNC:'repeat.prepare-sync', SYNC:'repeat.sync' },
  registerReadOnlyHandlers() { return true; },
  createAction(type, payload, metadata) { return { type, payload, metadata }; }
};
global.OluntirRepeatSynchronizationRuntime = { isBusy() { return busy; } };
global.OluntirLogger = { info() {}, error() {} };

const auto = require('../editor/js/core/repeat-auto-synchronization.js');
assert.strictEqual(auto.bind(editor, { delayMs: 25 }), true);
for (let i = 0; i < 20; i++) listeners['component:update'].forEach(fn => fn(sourceChild));
setTimeout(async () => {
  await auto.flush();
  assert.deepStrictEqual(calls, ['repeat.mark-dirty','repeat.plan','repeat.prepare-sync','repeat.sync']);
  const before = calls.length;
  busy = true;
  listeners['component:update'].forEach(fn => fn(sourceChild));
  busy = false;
  await auto.flush();
  assert.strictEqual(calls.length, before, 'sync-owned events must be ignored');
  assert.strictEqual(auto.getDiagnostics().dirtyCount, 0);
  console.log('REPEAT-AUTO-SYNCHRONIZATION-TEST ERFOLGREICH');
}, 40);
