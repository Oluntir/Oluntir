(function (root, factory) {
  const actionApi = root && root.OluntirActionEngine ? root.OluntirActionEngine : (typeof module === 'object' && module.exports ? require('./semantic-action-engine.js') : null);
  const repeat = root && root.OluntirRepeatEngineV2 ? root.OluntirRepeatEngineV2 : (typeof module === 'object' && module.exports ? require('./repeat-engine-v2.js') : null);
  const resolver = root && root.OluntirRepeatContractResolver ? root.OluntirRepeatContractResolver : (typeof module === 'object' && module.exports ? require('./repeat-contract-resolver.js') : null);
  const graphApi = root && root.OluntirRepeatDependencyGraph ? root.OluntirRepeatDependencyGraph : (typeof module === 'object' && module.exports ? require('./repeat-dependency-graph.js') : null);
  const syncApi = root && root.OluntirTargetedSynchronizationService ? root.OluntirTargetedSynchronizationService : (typeof module === 'object' && module.exports ? require('./targeted-synchronization-service.js') : null);
  const api = factory(actionApi, repeat, resolver, graphApi, syncApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatActionContracts = api;
})(typeof window !== 'undefined' ? window : globalThis, function (actionApi, repeat, resolver, graphApi, syncApi) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const PLAN_SCHEMA_VERSION = 1;
  const ACTION_TYPE = Object.freeze({
    ANALYZE: 'repeat.analyze',
    VALIDATE: 'repeat.validate',
    MARK_DIRTY: 'repeat.mark-dirty',
    PLAN: 'repeat.plan',
    PREPARE_SYNC: 'repeat.prepare-sync',
    SYNC: 'repeat.sync'
  });
  const ACTION_PHASE = Object.freeze({
    [ACTION_TYPE.ANALYZE]: 'structure',
    [ACTION_TYPE.VALIDATE]: 'validate',
    [ACTION_TYPE.MARK_DIRTY]: 'depend',
    [ACTION_TYPE.PLAN]: 'depend',
    [ACTION_TYPE.PREPARE_SYNC]: 'finalize',
    [ACTION_TYPE.SYNC]: 'execute'
  });
  const CONTRACTS = Object.freeze([
    { type: ACTION_TYPE.ANALYZE, version: 1, category: 'repeat', priority: 30, batchable: true, cancellable: true },
    { type: ACTION_TYPE.VALIDATE, version: 1, category: 'repeat', priority: 40, batchable: true, cancellable: true },
    { type: ACTION_TYPE.MARK_DIRTY, version: 1, category: 'repeat', priority: 45, batchable: true, cancellable: true },
    { type: ACTION_TYPE.PLAN, version: 1, category: 'repeat', priority: 50, batchable: true, cancellable: true },
    { type: ACTION_TYPE.PREPARE_SYNC, version: 1, category: 'repeat', priority: 60, batchable: false, cancellable: true },
    { type: ACTION_TYPE.SYNC, version: 1, category: 'repeat', priority: 70, batchable: false, cancellable: true }
  ].map(Object.freeze));

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.keys(value).forEach(k => deepFreeze(value[k])); return Object.freeze(value); }
  function frozen(value) { return deepFreeze(clone(value)); }
  function text(value) { return value == null ? '' : String(value).trim(); }
  function requireDependencies() {
    if (!actionApi || typeof actionApi.create !== 'function') throw new Error('OluntirActionEngine is required.');
    if (!repeat || typeof repeat.snapshot !== 'function') throw new Error('OluntirRepeatEngineV2 is required.');
    if (!resolver || typeof resolver.resolveProject !== 'function') throw new Error('OluntirRepeatContractResolver is required.');
    if (!graphApi || typeof graphApi.buildProject !== 'function') throw new Error('OluntirRepeatDependencyGraph is required.');
    if (!syncApi || typeof syncApi.validatePlan !== 'function') throw new Error('OluntirTargetedSynchronizationService is required.');
  }
  function payloadValid(type, payload) {
    const value = payload || {};
    if (type === ACTION_TYPE.MARK_DIRTY || type === ACTION_TYPE.PLAN) return !!text(value.reference || value.definitionId || value.instanceId || value.identity);
    if (type === ACTION_TYPE.SYNC) return !!(value.plan || text(value.reference || value.definitionId || value.instanceId || value.identity));
    if (type === ACTION_TYPE.PREPARE_SYNC) return !!(value.plan && value.plan.schemaVersion === PLAN_SCHEMA_VERSION);
    return typeof value === 'object';
  }
  function defineContracts(engine) {
    requireDependencies();
    if (!engine || typeof engine.defineAction !== 'function') throw new Error('Semantic Action Engine instance is required.');
    CONTRACTS.forEach(contract => engine.defineAction(Object.assign({}, contract, { payloadValidator: payload => payloadValid(contract.type, payload) })));
    return frozen({ schemaVersion: SCHEMA_VERSION, actionTypes: CONTRACTS.map(item => item.type) });
  }
  function referenceFrom(payload) { const value = payload || {}; return text(value.reference || value.definitionId || value.instanceId || value.identity); }
  function analyze(editor, payload) {
    const definitionId = text(payload && payload.definitionId);
    return definitionId ? resolver.resolveDefinition(editor, definitionId) : resolver.resolveProject(editor);
  }
  function validate(editor, payload) {
    const resolved = analyze(editor, payload);
    const graph = graphApi.buildProject(editor).snapshot();
    const issues = [].concat(resolved && resolved.issues || [], graph.issues || []);
    return frozen({ schemaVersion: SCHEMA_VERSION, valid: !!(resolved && resolved.valid !== false && graph.valid), definitionId: text(payload && payload.definitionId) || null, resolver: resolved, graph: graph, issues: issues });
  }
  function markDirty(editor, payload) {
    const reference = referenceFrom(payload);
    const graph = graphApi.buildProject(editor);
    const impact = graph.resolveImpact(reference);
    return frozen({ schemaVersion: SCHEMA_VERSION, status: impact.root ? 'identified' : 'unresolved', reference: reference, reason: text(payload && payload.reason) || 'repeat-change', impact: impact, mutationPerformed: false });
  }
  function createPlan(editor, payload) {
    const reference = referenceFrom(payload);
    const graph = graphApi.buildProject(editor);
    const snapshot = graph.snapshot();
    const impact = graph.resolveImpact(reference);
    const resolved = resolver.resolveProject(editor);
    const instanceIds = new Set(impact.affectedInstances || []);
    const operations = [];
    (resolved.definitions || []).forEach(item => {
      (item.instances || []).forEach(entry => {
        const instance = entry.instance;
        if (!instanceIds.has(instance.instanceId)) return;
        operations.push({
          operationId: 'repeat-sync:' + instance.instanceId,
          definitionId: instance.definitionId,
          instanceId: instance.instanceId,
          sourcePageId: item.source && item.source.pageId || null,
          sourceIdentity: item.source && item.source.rootIdentity || null,
          targetPageId: instance.pageId,
          targetIdentity: instance.rootIdentity,
          status: 'planned'
        });
      });
    });
    operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
    return frozen({
      schemaVersion: PLAN_SCHEMA_VERSION,
      type: 'repeat-targeted-sync-plan',
      reference: reference,
      valid: !!impact.root && snapshot.valid && resolved.valid,
      blocked: !impact.root || !snapshot.valid || !resolved.valid,
      cycleCount: snapshot.cycleCount,
      affectedPages: impact.affectedPages || [],
      affectedDefinitions: impact.affectedDefinitions || [],
      affectedInstances: impact.affectedInstances || [],
      operations: operations,
      issues: [].concat(snapshot.issues || [], resolved.issues || [], impact.root ? [] : [{ code: 'REPEAT_ACTION_REFERENCE_UNRESOLVED', message: 'Repeat-Referenz konnte nicht aufgelöst werden.' }]),
      mutationPerformed: false
    });
  }
  function prepareSync(_editor, payload) {
    const plan = payload.plan;
    const validation = syncApi.validatePlan(plan);
    const issues = [].concat(plan && plan.issues || [], validation.issues || []);
    return frozen({
      schemaVersion: SCHEMA_VERSION,
      serviceSchemaVersion: syncApi.SCHEMA_VERSION,
      planSchemaVersion: plan && plan.schemaVersion,
      ready: validation.valid === true && issues.length === 0,
      operationCount: plan && plan.operations ? plan.operations.length : 0,
      operations: plan && plan.operations || [],
      issues: issues,
      mutationPerformed: false,
      applyEnabled: false,
      executionEnabled: false
    });
  }
  function registerReadOnlyHandlers(engine, editorProvider) {
    defineContracts(engine);
    const getEditor = typeof editorProvider === 'function' ? editorProvider : () => editorProvider;
    const handlers = [];
    function add(type, fn) {
      handlers.push(engine.registerHandler(type, context => fn(getEditor(), context.action.payload || {}), { id: 'repeat-contract:' + type, phase: ACTION_PHASE[type], priority: 50 }));
    }
    add(ACTION_TYPE.ANALYZE, analyze);
    add(ACTION_TYPE.VALIDATE, validate);
    add(ACTION_TYPE.MARK_DIRTY, markDirty);
    add(ACTION_TYPE.PLAN, createPlan);
    add(ACTION_TYPE.PREPARE_SYNC, prepareSync);
    add(ACTION_TYPE.SYNC, (_editor, payload) => frozen({
      schemaVersion: SCHEMA_VERSION,
      type: ACTION_TYPE.SYNC,
      status: 'not-available',
      code: 'REPEAT_SYNC_NOT_AVAILABLE_IN_1_3_1',
      reference: referenceFrom(payload) || null,
      mutationPerformed: false,
      executionEnabled: false
    }));
    return frozen({ schemaVersion: SCHEMA_VERSION, handlerIds: handlers });
  }
  function createAction(type, payload, metadata) {
    if (!CONTRACTS.some(item => item.type === type)) throw new Error('Unknown Repeat action type: ' + type);
    if (!payloadValid(type, payload || {})) throw new Error('Invalid payload for Repeat action: ' + type);
    return frozen({ type: type, payload: payload || {}, metadata: Object.assign({ contractSchemaVersion: SCHEMA_VERSION }, metadata || {}) });
  }

  return Object.freeze({ SCHEMA_VERSION, PLAN_SCHEMA_VERSION, ACTION_TYPE, ACTION_PHASE, CONTRACTS, defineContracts, registerReadOnlyHandlers, createAction, analyze, validate, markDirty, createPlan, prepareSync });
});
