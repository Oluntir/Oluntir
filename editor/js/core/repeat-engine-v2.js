(function (root, factory) {
  const identities = root && root.OluntirLayoutIdentities
    ? root.OluntirLayoutIdentities
    : (typeof module === 'object' && module.exports ? require('./layout-identities.js') : null);
  const api = factory(identities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatEngineV2 = api;
})(typeof window !== 'undefined' ? window : globalThis, function (identities) {
  'use strict';

  const SCHEMA_VERSION = 3;
  const LEGACY_SCHEMA_VERSION = 2;
  const PROJECT_STATE_KEY = 'repeatEngine';
  const STATUS = Object.freeze({ ACTIVE: 'active', DETACHED: 'detached', INVALID: 'invalid' });
  const SYNC_POLICY = Object.freeze({ AUTOMATIC: 'automatic', MANUAL: 'manual' });
  const REFERENCE_POLICY = Object.freeze({ ALLOW: 'allow', DENY: 'deny' });

  let editor = null;
  let state = emptyState();

  function emptyState() {
    return { schemaVersion: SCHEMA_VERSION, revision: 0, definitions: [], instances: [], references: [] };
  }

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function freezeClone(value) {
    function deepFreeze(item) {
      if (!item || typeof item !== 'object' || Object.isFrozen(item)) return item;
      Object.keys(item).forEach(key => deepFreeze(item[key]));
      return Object.freeze(item);
    }
    return deepFreeze(clone(value));
  }

  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
      const random = Math.random() * 16 | 0;
      return (character === 'x' ? random : (random & 3 | 8)).toString(16);
    });
  }

  function createStableId(kind) {
    const prefixes = { definition: 'ol_repeat_def_', instance: 'ol_repeat_inst_', reference: 'ol_repeat_ref_' };
    return (prefixes[kind] || 'ol_repeat_') + uuid();
  }

  function text(value) { return value === null || value === undefined ? '' : String(value).trim(); }
  function unique(values) { return Array.from(new Set((values || []).map(text).filter(Boolean))); }
  function nowRevision() { return state.revision + 1; }

  function normalizeSource(source) {
    const input = source || {};
    return {
      pageId: text(input.pageId),
      rootIdentity: text(input.rootIdentity),
      relativeIdentityPath: unique(input.relativeIdentityPath)
    };
  }

  function normalizeDefinition(input, existing) {
    const value = input || {};
    const previous = existing || {};
    const definitionId = text(value.definitionId || previous.definitionId) || createStableId('definition');
    const repeatKey = text(value.repeatKey || previous.repeatKey) || definitionId;
    return {
      definitionId: definitionId,
      repeatKey: repeatKey,
      source: normalizeSource(value.source || previous.source),
      scope: text(value.scope || previous.scope) || 'structure',
      synchronizationPolicy: text(value.synchronizationPolicy || previous.synchronizationPolicy) || SYNC_POLICY.MANUAL,
      referencePolicy: text(value.referencePolicy || previous.referencePolicy) || REFERENCE_POLICY.ALLOW,
      schemaVersion: SCHEMA_VERSION,
      revision: Number(value.revision || previous.revision || 1),
      metadata: clone(value.metadata || previous.metadata || {})
    };
  }

  function normalizeInstance(input, existing) {
    const value = input || {};
    const previous = existing || {};
    return {
      instanceId: text(value.instanceId || previous.instanceId) || createStableId('instance'),
      definitionId: text(value.definitionId || previous.definitionId),
      pageId: text(value.pageId || previous.pageId),
      rootIdentity: text(value.rootIdentity || previous.rootIdentity),
      parentInstanceId: text(value.parentInstanceId || previous.parentInstanceId) || null,
      state: text(value.state || previous.state) || STATUS.ACTIVE,
      appliedRevision: Number(value.appliedRevision || previous.appliedRevision || 0),
      appliedFingerprint: text(value.appliedFingerprint || previous.appliedFingerprint) || null,
      schemaVersion: SCHEMA_VERSION,
      metadata: clone(value.metadata || previous.metadata || {})
    };
  }

  function normalizeReference(input, existing) {
    const value = input || {};
    const previous = existing || {};
    return {
      referenceId: text(value.referenceId || previous.referenceId) || createStableId('reference'),
      ownerDefinitionId: text(value.ownerDefinitionId || previous.ownerDefinitionId),
      targetDefinitionId: text(value.targetDefinitionId || previous.targetDefinitionId),
      ownerIdentity: text(value.ownerIdentity || previous.ownerIdentity),
      mode: text(value.mode || previous.mode) || 'embed',
      schemaVersion: SCHEMA_VERSION,
      metadata: clone(value.metadata || previous.metadata || {})
    };
  }

  function validationError(code, message, path, details) {
    return { severity: 'error', code: code, message: message, path: path || null, details: clone(details || null) };
  }

  function validateDefinitionValue(definition, currentState) {
    const errors = [];
    const all = currentState || state;
    if (!definition.definitionId) errors.push(validationError('REPEAT_DEFINITION_ID_REQUIRED', 'definitionId ist erforderlich.', 'definitionId'));
    if (!definition.repeatKey) errors.push(validationError('REPEAT_KEY_REQUIRED', 'repeatKey ist erforderlich.', 'repeatKey'));
    if (!definition.source.pageId) errors.push(validationError('REPEAT_SOURCE_PAGE_REQUIRED', 'source.pageId ist erforderlich.', 'source.pageId'));
    if (!definition.source.rootIdentity) errors.push(validationError('REPEAT_SOURCE_IDENTITY_REQUIRED', 'source.rootIdentity ist erforderlich.', 'source.rootIdentity'));
    if (!Object.values(SYNC_POLICY).includes(definition.synchronizationPolicy)) errors.push(validationError('REPEAT_SYNC_POLICY_INVALID', 'Unbekannte synchronizationPolicy.', 'synchronizationPolicy'));
    if (!Object.values(REFERENCE_POLICY).includes(definition.referencePolicy)) errors.push(validationError('REPEAT_REFERENCE_POLICY_INVALID', 'Unbekannte referencePolicy.', 'referencePolicy'));
    if (all.definitions.some(item => item.definitionId !== definition.definitionId && item.repeatKey === definition.repeatKey)) errors.push(validationError('REPEAT_KEY_DUPLICATE', 'repeatKey muss projektweit eindeutig sein.', 'repeatKey'));
    return errors;
  }

  function validateInstanceValue(instance, currentState) {
    const errors = [];
    const all = currentState || state;
    if (!instance.instanceId) errors.push(validationError('REPEAT_INSTANCE_ID_REQUIRED', 'instanceId ist erforderlich.', 'instanceId'));
    if (!instance.definitionId) errors.push(validationError('REPEAT_INSTANCE_DEFINITION_REQUIRED', 'definitionId ist erforderlich.', 'definitionId'));
    if (!instance.pageId) errors.push(validationError('REPEAT_INSTANCE_PAGE_REQUIRED', 'pageId ist erforderlich.', 'pageId'));
    if (!instance.rootIdentity) errors.push(validationError('REPEAT_INSTANCE_ROOT_REQUIRED', 'rootIdentity ist erforderlich.', 'rootIdentity'));
    if (!Object.values(STATUS).includes(instance.state)) errors.push(validationError('REPEAT_INSTANCE_STATE_INVALID', 'Unbekannter Instanzstatus.', 'state'));
    if (instance.definitionId && !all.definitions.some(item => item.definitionId === instance.definitionId)) errors.push(validationError('REPEAT_INSTANCE_DEFINITION_MISSING', 'Die referenzierte Repeat-Definition existiert nicht.', 'definitionId'));
    if (instance.parentInstanceId && !all.instances.some(item => item.instanceId === instance.parentInstanceId)) errors.push(validationError('REPEAT_PARENT_INSTANCE_MISSING', 'Die übergeordnete Repeat-Instanz existiert nicht.', 'parentInstanceId'));
    if (instance.parentInstanceId === instance.instanceId) errors.push(validationError('REPEAT_PARENT_SELF_REFERENCE', 'Eine Instanz darf nicht ihr eigener Parent sein.', 'parentInstanceId'));
    if (all.instances.some(item => item.instanceId !== instance.instanceId && item.pageId === instance.pageId && item.rootIdentity === instance.rootIdentity)) errors.push(validationError('REPEAT_INSTANCE_ROOT_COLLISION', 'Eine strukturelle Identität darf auf einer Seite nur einer Repeat-Instanz zugeordnet sein.', 'rootIdentity'));
    const definition = all.definitions.find(item => item.definitionId === instance.definitionId);
    if (definition && definition.source.rootIdentity === instance.rootIdentity && definition.source.pageId !== instance.pageId) {
      errors.push(validationError('REPEAT_SOURCE_IDENTITY_REUSED', 'Eine Zielinstanz darf die Quellidentität nicht übernehmen. Für jede Instanz ist eine eigene rootIdentity erforderlich.', 'rootIdentity'));
    }
    return errors;
  }

  function validateReferenceValue(reference, currentState) {
    const errors = [];
    const all = currentState || state;
    if (!reference.referenceId) errors.push(validationError('REPEAT_REFERENCE_ID_REQUIRED', 'referenceId ist erforderlich.', 'referenceId'));
    if (!reference.ownerDefinitionId) errors.push(validationError('REPEAT_REFERENCE_OWNER_REQUIRED', 'ownerDefinitionId ist erforderlich.', 'ownerDefinitionId'));
    if (!reference.targetDefinitionId) errors.push(validationError('REPEAT_REFERENCE_TARGET_REQUIRED', 'targetDefinitionId ist erforderlich.', 'targetDefinitionId'));
    if (reference.ownerDefinitionId === reference.targetDefinitionId) errors.push(validationError('REPEAT_REFERENCE_SELF', 'Eine Definition darf sich nicht selbst referenzieren.', 'targetDefinitionId'));
    if (reference.ownerDefinitionId && !all.definitions.some(item => item.definitionId === reference.ownerDefinitionId)) errors.push(validationError('REPEAT_REFERENCE_OWNER_MISSING', 'Die besitzende Definition existiert nicht.', 'ownerDefinitionId'));
    if (reference.targetDefinitionId && !all.definitions.some(item => item.definitionId === reference.targetDefinitionId)) errors.push(validationError('REPEAT_REFERENCE_TARGET_MISSING', 'Die Zieldefinition existiert nicht.', 'targetDefinitionId'));
    return errors;
  }

  function assertValid(errors) {
    if (!errors.length) return;
    const error = new Error(errors.map(item => item.message).join(' '));
    error.code = errors[0].code;
    error.validation = freezeClone(errors);
    throw error;
  }

  function commit(nextState) {
    state = {
      schemaVersion: SCHEMA_VERSION,
      revision: nowRevision(),
      definitions: clone(nextState.definitions || []),
      instances: clone(nextState.instances || []),
      references: clone(nextState.references || [])
    };
    return snapshot();
  }

  function createDefinition(input) {
    const definition = normalizeDefinition(input);
    assertValid(validateDefinitionValue(definition));
    const next = clone(state);
    next.definitions.push(definition);
    commit(next);
    return getDefinition(definition.definitionId);
  }

  function updateDefinition(definitionId, changes) {
    const existing = state.definitions.find(item => item.definitionId === text(definitionId));
    if (!existing) throw new Error('Repeat-Definition nicht gefunden.');
    const definition = normalizeDefinition(Object.assign({}, changes || {}, { definitionId: existing.definitionId, revision: existing.revision + 1 }), existing);
    assertValid(validateDefinitionValue(definition));
    const next = clone(state);
    next.definitions = next.definitions.map(item => item.definitionId === existing.definitionId ? definition : item);
    commit(next);
    return getDefinition(definition.definitionId);
  }

  function removeDefinition(definitionId) {
    const id = text(definitionId);
    if (!state.definitions.some(item => item.definitionId === id)) return false;
    const next = clone(state);
    next.definitions = next.definitions.filter(item => item.definitionId !== id);
    next.instances = next.instances.filter(item => item.definitionId !== id);
    next.references = next.references.filter(item => item.ownerDefinitionId !== id && item.targetDefinitionId !== id);
    commit(next);
    return true;
  }

  function createInstance(definitionId, target) {
    const instance = normalizeInstance(Object.assign({}, target || {}, { definitionId: definitionId }));
    assertValid(validateInstanceValue(instance));
    const next = clone(state);
    next.instances.push(instance);
    commit(next);
    return getInstance(instance.instanceId);
  }

  function removeInstance(instanceId) {
    const id = text(instanceId);
    if (!state.instances.some(item => item.instanceId === id)) return false;
    const next = clone(state);
    next.instances = next.instances.filter(item => item.instanceId !== id && item.parentInstanceId !== id);
    commit(next);
    return true;
  }

  function createReference(input) {
    const reference = normalizeReference(input);
    assertValid(validateReferenceValue(reference));
    const next = clone(state);
    next.references.push(reference);
    commit(next);
    return freezeClone(reference);
  }

  function removeReference(referenceId) {
    const id = text(referenceId);
    if (!state.references.some(item => item.referenceId === id)) return false;
    const next = clone(state);
    next.references = next.references.filter(item => item.referenceId !== id);
    commit(next);
    return true;
  }

  function getDefinition(definitionId) { return freezeClone(state.definitions.find(item => item.definitionId === text(definitionId)) || null); }
  function getInstance(instanceId) { return freezeClone(state.instances.find(item => item.instanceId === text(instanceId)) || null); }
  function getDefinitions() { return freezeClone(state.definitions); }
  function getInstances(definitionId) {
    const id = text(definitionId);
    return freezeClone(id ? state.instances.filter(item => item.definitionId === id) : state.instances);
  }
  function getReferences(definitionId) {
    const id = text(definitionId);
    return freezeClone(id ? state.references.filter(item => item.ownerDefinitionId === id || item.targetDefinitionId === id) : state.references);
  }

  function validateDefinition(definitionId) {
    const definition = state.definitions.find(item => item.definitionId === text(definitionId));
    if (!definition) return freezeClone({ valid: false, errors: [validationError('REPEAT_DEFINITION_MISSING', 'Repeat-Definition nicht gefunden.')] });
    const errors = validateDefinitionValue(definition).concat(state.instances.filter(item => item.definitionId === definition.definitionId).flatMap(item => validateInstanceValue(item)));
    return freezeClone({ valid: errors.length === 0, errors: errors });
  }

  function validateProject() {
    let errors = [];
    state.definitions.forEach(item => { errors = errors.concat(validateDefinitionValue(item)); });
    state.instances.forEach(item => { errors = errors.concat(validateInstanceValue(item)); });
    state.references.forEach(item => { errors = errors.concat(validateReferenceValue(item)); });
    return freezeClone({ valid: errors.length === 0, errors: errors, schemaVersion: SCHEMA_VERSION, revision: state.revision });
  }

  function migrateLegacyState(input) {
    const definitions = Array.isArray(input && input.definitions) ? input.definitions : [];
    const migrated = emptyState();
    definitions.forEach(function (legacy) {
      const definitionId = text(legacy.definitionId || legacy.repeatId) || createStableId('definition');
      migrated.definitions.push(normalizeDefinition({
        definitionId: definitionId,
        repeatKey: text(legacy.repeatId) || definitionId,
        source: {
          pageId: legacy.sourcePageId,
          rootIdentity: legacy.unitId || legacy.sourceComponentId,
          relativeIdentityPath: []
        },
        scope: legacy.unitKind || 'structure',
        metadata: {
          migratedFromSchemaVersion: Number(input.schemaVersion || LEGACY_SCHEMA_VERSION),
          legacySourceComponentId: text(legacy.sourceComponentId) || null,
          legacyMode: text(legacy.mode) || null,
          legacyTargetPageIds: unique(legacy.targetPageIds),
          legacyTargetPath: unique(legacy.targetPath),
          unitIdRetainedAsSourceOnly: true
        }
      }));
    });
    return migrated;
  }

  function normalizeImportedState(input) {
    if (!input || typeof input !== 'object') return emptyState();
    if (Number(input.schemaVersion || 0) < SCHEMA_VERSION) return migrateLegacyState(input);
    const imported = emptyState();
    imported.revision = Number(input.revision || 0);
    imported.definitions = (input.definitions || []).map(item => normalizeDefinition(item));
    imported.instances = (input.instances || []).map(item => normalizeInstance(item));
    imported.references = (input.references || []).map(item => normalizeReference(item));
    return imported;
  }

  function exportState() { return snapshot(); }

  function importState(input) {
    const imported = normalizeImportedState(input);
    const previous = state;
    state = imported;
    const validation = validateProject();
    if (!validation.valid) {
      state = previous;
      assertValid(validation.errors);
    }
    return snapshot();
  }

  function snapshot() {
    return freezeClone({
      schemaVersion: SCHEMA_VERSION,
      revision: state.revision,
      definitions: state.definitions,
      instances: state.instances,
      references: state.references,
      counts: { definitions: state.definitions.length, instances: state.instances.length, references: state.references.length }
    });
  }

  function decorateProjectData(projectData) {
    const data = projectData || {};
    data.oluntir = Object.assign({}, data.oluntir || {}, {
      repeatEngineSchemaVersion: SCHEMA_VERSION,
      [PROJECT_STATE_KEY]: exportState()
    });
    return data;
  }

  function bind(nextEditor) {
    if (!nextEditor || editor === nextEditor) return;
    editor = nextEditor;
    if (editor.on) editor.on('load', function () {
      const data = editor.getProjectData ? editor.getProjectData() : null;
      if (data && data.oluntir && data.oluntir[PROJECT_STATE_KEY]) importState(data.oluntir[PROJECT_STATE_KEY]);
    });
  }

  /* Compatibility bridge for 1.3.0 callers. It creates only a definition and never a target mutation. */
  function define(component, options) {
    if (!editor || !component || !identities) throw new Error('Repeat Engine V2 ist nicht gebunden.');
    identities.ensureAll(editor);
    const sourcePage = editor.Pages.getSelected();
    const description = identities.describe(component, { page: sourcePage });
    const attrs = component.getAttributes ? (component.getAttributes() || {}) : {};
    const repeatKey = text(options && options.repeatId) || text(attrs[identities.ATTR.repeat]) || createStableId('definition');
    if (component.addAttributes) component.addAttributes({ [identities.ATTR.repeat]: repeatKey });
    return createDefinition({
      definitionId: repeatKey,
      repeatKey: repeatKey,
      source: { pageId: identities.pageId(sourcePage), rootIdentity: description.identity, relativeIdentityPath: [] },
      scope: description.structuralKind || 'component',
      metadata: { compatibilityBridge: true, legacyMode: text(options && options.mode) || 'selected' }
    });
  }

  function apply(reference) {
    const error = new Error('Produktive Repeat-Synchronisation ist in Oluntir 1.3.1 bewusst deaktiviert.');
    error.code = 'REPEAT_SYNC_NOT_AVAILABLE_IN_1_3_1';
    error.reference = text(reference) || null;
    throw error;
  }

  function reset() { state = emptyState(); return snapshot(); }

  return Object.freeze({
    SCHEMA_VERSION: SCHEMA_VERSION,
    LEGACY_SCHEMA_VERSION: LEGACY_SCHEMA_VERSION,
    STATUS: STATUS,
    SYNC_POLICY: SYNC_POLICY,
    REFERENCE_POLICY: REFERENCE_POLICY,
    bind: bind,
    define: define,
    apply: apply,
    createDefinition: createDefinition,
    updateDefinition: updateDefinition,
    removeDefinition: removeDefinition,
    createInstance: createInstance,
    removeInstance: removeInstance,
    createReference: createReference,
    removeReference: removeReference,
    getDefinition: getDefinition,
    getInstance: getInstance,
    getDefinitions: getDefinitions,
    getInstances: getInstances,
    getReferences: getReferences,
    validateDefinition: validateDefinition,
    validateProject: validateProject,
    snapshot: snapshot,
    exportState: exportState,
    importState: importState,
    decorateProjectData: decorateProjectData,
    createStableId: createStableId,
    reset: reset
  });
});
