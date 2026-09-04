(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatSynchronizationRuntime = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  let service = null;
  let status = 'idle';
  function dependency(name) { return root && root[name]; }
  function applyPlan(editor, plan) {
    const sync = dependency('OluntirTargetedSynchronizationService');
    const adapterApi = dependency('OluntirRepeatSyncAccessAdapter');
    if (!editor || !sync || !adapterApi) { const error = new Error('Repeat synchronization dependencies are missing.'); error.code = 'REPEAT_SYNC_DEPENDENCY_MISSING'; throw error; }
    if (!plan || !plan.valid || plan.blocked) { const error = new Error('Repeat synchronization plan is blocked.'); error.code = 'REPEAT_SYNC_PLAN_BLOCKED'; error.issues = plan && plan.issues || []; throw error; }
    service = service || sync.create();
    const adapter = adapterApi.create(editor);
    status = 'synchronizing';
    try { return service.execute(plan, adapter); }
    finally { status = 'settling'; setTimeout(function () { if (status === 'settling') status = 'idle'; }, 0); }
  }
  function apply(editor, reference) {
    const actions = dependency('OluntirRepeatActionContracts');
    if (!editor || !actions) { const error = new Error('Repeat synchronization dependencies are missing.'); error.code = 'REPEAT_SYNC_DEPENDENCY_MISSING'; throw error; }
    return applyPlan(editor, actions.createPlan(editor, { reference: reference }));
  }
  function getState() { return Object.assign({}, service ? service.getState() : { transactionCount: 0, activeLockCount: 0, executionEnabled: false }, { status: status }); }
  function isBusy() { return status === 'synchronizing' || status === 'settling'; }
  return Object.freeze({ apply, applyPlan, getState, isBusy });
});
