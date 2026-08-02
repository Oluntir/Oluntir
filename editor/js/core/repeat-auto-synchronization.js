(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatAutoSynchronization = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const DEFAULT_DELAY_MS = 140;
  const STATUS = Object.freeze({ IDLE: 'idle', COLLECTING: 'collecting', PLANNING: 'planning', SYNCHRONIZING: 'synchronizing', SETTLING: 'settling', FAILED: 'failed' });
  let editor = null;
  let bound = false;
  let handlersRegistered = false;
  let delayMs = DEFAULT_DELAY_MS;
  const dirty = new Map();
  const timers = new Map();
  const runs = new Map();

  function dep(name) { return root && root[name]; }
  function text(value) { return value == null ? '' : String(value).trim(); }
  function now() { return new Date().toISOString(); }
  function freeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.keys(value).forEach(k => freeze(value[k])); return Object.freeze(value); }
  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function attrs(component) { return component && component.getAttributes ? (component.getAttributes() || {}) : {}; }

  function identityOf(component) {
    const identities = dep('OluntirLayoutIdentities');
    const names = identities && identities.ATTR ? Object.values(identities.ATTR) : [];
    const values = attrs(component);
    for (const name of names) if (text(values[name])) return text(values[name]);
    return '';
  }

  function parentOf(component) {
    if (!component) return null;
    if (typeof component.parent === 'function') return component.parent();
    return component.parent || null;
  }

  function isWithin(component, rootComponent, rootIdentity) {
    let current = component;
    const visited = new Set();
    while (current && !visited.has(current)) {
      if (current === rootComponent || identityOf(current) === rootIdentity) return true;
      visited.add(current);
      current = parentOf(current);
    }
    return false;
  }

  function selectedPageId() {
    const identities = dep('OluntirLayoutIdentities');
    const page = editor && editor.Pages && editor.Pages.getSelected ? editor.Pages.getSelected() : null;
    return identities && identities.pageId ? text(identities.pageId(page)) : text(page && page.id);
  }

  function sourceDefinitionsFor(component) {
    const repeat = dep('OluntirRepeatEngineV2');
    const identities = dep('OluntirLayoutIdentities');
    if (!repeat || !identities || !editor || !editor.Pages) return [];
    const pageId = selectedPageId();
    if (!pageId) return [];
    const page = editor.Pages.getSelected ? editor.Pages.getSelected() : null;
    return (repeat.getDefinitions ? repeat.getDefinitions() : []).filter(definition => {
      if (!definition || definition.synchronizationPolicy !== repeat.SYNC_POLICY.AUTOMATIC) return false;
      if (!definition.source || text(definition.source.pageId) !== pageId) return false;
      const rootIdentity = text(definition.source.rootIdentity);
      if (!rootIdentity) return false;
      const sourceRoot = identities.findById ? identities.findById(page, rootIdentity) : null;
      return identityOf(component) === rootIdentity || isWithin(component, sourceRoot, rootIdentity);
    });
  }

  function runtimeBusy() {
    const runtime = dep('OluntirRepeatSynchronizationRuntime');
    return !!(runtime && typeof runtime.isBusy === 'function' && runtime.isBusy());
  }

  function logger(level, message, data) {
    const log = dep('OluntirLogger');
    if (log && typeof log[level] === 'function') log[level]('repeat', message, data || {});
  }

  function ensureHandlers() {
    if (handlersRegistered) return true;
    const runtimeActions = dep('OluntirRuntimeActions');
    const contracts = dep('OluntirRepeatActionContracts');
    const engine = runtimeActions && runtimeActions.ensure ? runtimeActions.ensure() : null;
    if (!engine || !contracts || typeof contracts.registerReadOnlyHandlers !== 'function') return false;
    contracts.registerReadOnlyHandlers(engine, () => editor);
    handlersRegistered = true;
    return true;
  }

  function actionValue(result, type) {
    if (!result || !Array.isArray(result.results)) return null;
    for (let index = result.results.length - 1; index >= 0; index -= 1) {
      const item = result.results[index];
      if (item && item.value && (!type || item.value.type === type || item.value.schemaVersion)) return item.value;
    }
    return null;
  }

  async function dispatch(type, payload) {
    const runtimeActions = dep('OluntirRuntimeActions');
    const contracts = dep('OluntirRepeatActionContracts');
    const engine = runtimeActions && runtimeActions.ensure ? runtimeActions.ensure() : null;
    if (!engine || !contracts) throw error('REPEAT_AUTO_ACTION_ENGINE_MISSING', 'Repeat Action Engine ist nicht verfügbar.');
    return engine.dispatch(contracts.createAction(type, payload || {}, { origin: 'repeat-auto-sync' }));
  }

  function error(code, message) { const value = new Error(message); value.code = code; return value; }

  async function process(definitionId) {
    if (runs.has(definitionId)) return runs.get(definitionId);
    const entry = dirty.get(definitionId);
    if (!entry) return null;
    const promise = (async () => {
      const contracts = dep('OluntirRepeatActionContracts');
      if (!ensureHandlers() || !contracts) throw error('REPEAT_AUTO_CONTRACTS_MISSING', 'Repeat Action Contracts sind nicht verfügbar.');
      entry.status = STATUS.PLANNING;
      entry.startedAt = now();
      await dispatch(contracts.ACTION_TYPE.MARK_DIRTY, { definitionId, reference: definitionId, reason: Array.from(entry.reasons).join(',') || 'source-change' });
      const planResult = await dispatch(contracts.ACTION_TYPE.PLAN, { definitionId, reference: definitionId });
      const plan = actionValue(planResult, 'repeat-targeted-sync-plan');
      if (!plan || plan.blocked || !plan.valid) throw error('REPEAT_AUTO_PLAN_BLOCKED', 'Automatischer Repeat-Synchronisationsplan ist blockiert.');
      const prepareResult = await dispatch(contracts.ACTION_TYPE.PREPARE_SYNC, { plan });
      const prepared = actionValue(prepareResult);
      if (!prepared || prepared.ready !== true) throw error('REPEAT_AUTO_PREPARE_BLOCKED', 'Automatische Repeat-Synchronisation ist nicht bereit.');
      entry.status = STATUS.SYNCHRONIZING;
      const syncResult = await dispatch(contracts.ACTION_TYPE.SYNC, { definitionId, reference: definitionId, plan });
      entry.status = STATUS.SETTLING;
      entry.lastResult = actionValue(syncResult) || syncResult;
      entry.completedAt = now();
      await new Promise(resolve => setTimeout(resolve, 0));
      dirty.delete(definitionId);
      logger('info', 'repeat.auto-sync.completed', { definitionId, reasons: Array.from(entry.reasons), eventCount: entry.eventCount });
      return entry.lastResult;
    })().catch(cause => {
      entry.status = STATUS.FAILED;
      entry.error = { code: cause && cause.code || 'REPEAT_AUTO_SYNC_FAILED', message: cause && cause.message || String(cause) };
      entry.completedAt = now();
      logger('error', 'repeat.auto-sync.failed', { definitionId, error: entry.error });
      return null;
    }).finally(() => runs.delete(definitionId));
    runs.set(definitionId, promise);
    return promise;
  }

  function schedule(definition, reason) {
    const definitionId = text(definition && definition.definitionId);
    if (!definitionId) return;
    let entry = dirty.get(definitionId);
    if (!entry) {
      entry = { definitionId, status: STATUS.COLLECTING, reasons: new Set(), eventCount: 0, firstChangedAt: now(), lastChangedAt: null, startedAt: null, completedAt: null, lastResult: null, error: null };
      dirty.set(definitionId, entry);
    }
    entry.status = STATUS.COLLECTING;
    entry.reasons.add(text(reason) || 'component-updated');
    entry.eventCount += 1;
    entry.lastChangedAt = now();
    if (timers.has(definitionId)) clearTimeout(timers.get(definitionId));
    timers.set(definitionId, setTimeout(() => {
      timers.delete(definitionId);
      process(definitionId);
    }, delayMs));
  }

  function onChange(reason) {
    return component => {
      if (!component || runtimeBusy()) return;
      sourceDefinitionsFor(component).forEach(definition => schedule(definition, reason));
    };
  }

  function bind(nextEditor, options) {
    if (!nextEditor || bound) return false;
    editor = nextEditor;
    delayMs = Math.max(25, Number(options && options.delayMs) || DEFAULT_DELAY_MS);
    ['component:update', 'component:styleUpdate'].forEach(name => editor.on(name, onChange(name)));
    editor.on('component:add', onChange('component:add'));
    editor.on('component:remove', onChange('component:remove'));
    bound = true;
    ensureHandlers();
    return true;
  }

  async function flush() {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    const ids = Array.from(dirty.keys());
    for (const id of ids) await process(id);
    await Promise.all(Array.from(runs.values()));
    return getDiagnostics();
  }

  function getDiagnostics() {
    return freeze({
      bound,
      delayMs,
      dirtyCount: dirty.size,
      runningCount: runs.size,
      definitions: Array.from(dirty.values()).map(entry => ({
        definitionId: entry.definitionId,
        status: entry.status,
        reasons: Array.from(entry.reasons),
        eventCount: entry.eventCount,
        firstChangedAt: entry.firstChangedAt,
        lastChangedAt: entry.lastChangedAt,
        startedAt: entry.startedAt,
        completedAt: entry.completedAt,
        error: clone(entry.error)
      }))
    });
  }

  function reset() {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear(); dirty.clear(); runs.clear(); handlersRegistered = false;
  }

  return Object.freeze({ STATUS, bind, flush, getDiagnostics, reset, _sourceDefinitionsFor: sourceDefinitionsFor, _schedule: schedule });
});
