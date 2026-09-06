(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatFoundationReadiness = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const RELEASE = '2.0.1-alpha';

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freeze(value[key]); });
    return Object.freeze(value);
  }
  function frozen(value) { return freeze(clone(value)); }
  function item(name, available, details) {
    return { name: name, available: available === true, details: details || null };
  }

  function contract(name, api, requiredFunctions, details) {
    const available = !!api;
    const missing = available
      ? requiredFunctions.filter(function (key) { return typeof api[key] !== 'function'; })
      : requiredFunctions.slice();
    return {
      name: name,
      available: available,
      valid: available && missing.length === 0,
      requiredFunctions: requiredFunctions.slice(),
      missingFunctions: missing,
      details: details || null
    };
  }

  function contractSnapshot() {
    const resolver = root && root.OluntirRepeatContractResolver;
    const graph = root && root.OluntirRepeatDependencyGraph;
    const actions = root && root.OluntirRepeatActionContracts;
    const sync = root && root.OluntirTargetedSynchronizationService;
    const contracts = [
      contract('resolver-extensions', resolver, ['resolveProject', 'resolveDefinition'], {
        schemaVersion: resolver && resolver.SCHEMA_VERSION || null
      }),
      contract('dependency-graph-model', graph, ['buildProject'], {
        schemaVersion: graph && graph.SCHEMA_VERSION || null
      }),
      contract('action-contracts', actions, ['createAction', 'registerReadOnlyHandlers'], {
        schemaVersion: actions && actions.SCHEMA_VERSION || null,
        mutationAllowed: true
      }),
      contract('targeted-synchronization-service', sync, ['create', 'validatePlan', 'validateAccessAdapter'], {
        schemaVersion: sync && sync.SCHEMA_VERSION || null,
        executionEnabled: true,
        mutationAllowed: true
      })
    ];
    return frozen({
      schemaVersion: SCHEMA_VERSION,
      required: contracts.map(function (entry) { return entry.name; }),
      contracts: contracts,
      valid: contracts.every(function (entry) { return entry.valid; }),
      executionEnabled: true,
      mutationPerformed: false
    });
  }

  function dependencySnapshot() {
    const repeat = root && root.OluntirRepeatEngineV2;
    const resolver = root && root.OluntirRepeatContractResolver;
    const graph = root && root.OluntirRepeatDependencyGraph;
    const actions = root && root.OluntirRepeatActionContracts;
    const sync = root && root.OluntirTargetedSynchronizationService;
    const identities = root && root.OluntirLayoutIdentities;
    return [
      item('identity-contracts', !!identities, identities && { schemaVersion: identities.SCHEMA_VERSION || null }),
      item('repeat-data-model', !!repeat, repeat && { schemaVersion: repeat.SCHEMA_VERSION, defaultPolicy: repeat.SYNC_POLICY && repeat.SYNC_POLICY.MANUAL }),
      item('repeat-resolver', !!resolver, resolver && { schemaVersion: resolver.SCHEMA_VERSION || null }),
      item('dependency-graph', !!graph, graph && { schemaVersion: graph.SCHEMA_VERSION || null }),
      item('action-contracts', !!actions, actions && { schemaVersion: actions.SCHEMA_VERSION, types: actions.ACTION_TYPE }),
      item('targeted-sync-service', !!sync, sync && { schemaVersion: sync.SCHEMA_VERSION, executionEnabled: true })
    ];
  }

  function audit(editor) {
    const dependencies = dependencySnapshot();
    const contracts = contractSnapshot();
    const issues = [];
    dependencies.forEach(function (entry) {
      if (!entry.available) issues.push({ code: 'REPEAT_FOUNDATION_DEPENDENCY_MISSING', dependency: entry.name });
    });
    contracts.contracts.forEach(function (entry) {
      if (!entry.valid) issues.push({
        code: 'REPEAT_CONTRACT_INVALID',
        contract: entry.name,
        missingFunctions: entry.missingFunctions.slice()
      });
    });

    const repeat = root && root.OluntirRepeatEngineV2;
    const resolver = root && root.OluntirRepeatContractResolver;
    const graphApi = root && root.OluntirRepeatDependencyGraph;
    let state = null;
    let validation = null;
    let resolution = null;
    let graph = null;

    if (repeat && typeof repeat.snapshot === 'function') state = repeat.snapshot();
    if (repeat && typeof repeat.validateProject === 'function') {
      validation = repeat.validateProject();
      (validation && validation.errors || []).forEach(function (entry) { issues.push(clone(entry)); });
    }
    if (editor && resolver && typeof resolver.resolveProject === 'function') {
      resolution = resolver.resolveProject(editor);
      (resolution && resolution.issues || []).forEach(function (entry) { issues.push(clone(entry)); });
    }
    if (editor && graphApi && typeof graphApi.buildProject === 'function') {
      graph = graphApi.buildProject(editor).snapshot();
      (graph && graph.issues || []).forEach(function (entry) { issues.push(clone(entry)); });
    }

    const readiness = {
      schemaVersion: SCHEMA_VERSION,
      release: RELEASE,
      mode: 'productive-repeat',
      productiveSynchronizationEnabled: contracts.valid,
      visibleRepeatUiEnabled: contracts.valid,
      automaticSynchronizationEnabled: contracts.valid,
      mutationPerformed: false,
      contracts: contracts,
      dependencies: dependencies,
      state: state,
      validation: validation,
      resolution: resolution,
      graph: graph,
      issues: issues,
      readyForFirstImplementation: dependencies.every(function (entry) { return entry.available; }) && contracts.valid && issues.length === 0
    };
    return frozen(readiness);
  }

  function assertFoundation(editor) {
    const result = audit(editor);
    if (!result.readyForFirstImplementation) {
      const error = new Error('Repeat Foundation ist nicht vollständig bereit.');
      error.code = 'REPEAT_FOUNDATION_NOT_READY';
      error.audit = result;
      throw error;
    }
    return result;
  }

  return Object.freeze({ SCHEMA_VERSION: SCHEMA_VERSION, RELEASE: RELEASE, audit: audit, assertFoundation: assertFoundation, dependencySnapshot: dependencySnapshot, contractSnapshot: contractSnapshot });
});
