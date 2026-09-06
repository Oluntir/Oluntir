(function (root, factory) {
  const identities = root && root.OluntirLayoutIdentities
    ? root.OluntirLayoutIdentities
    : (typeof module === 'object' && module.exports ? require('./layout-identities.js') : null);
  const api = factory(root, identities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatEngineV2 = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root, identities) {
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

  // Repeat-Definitionen und -Instanzen liegen außerhalb des GrapesJS-Modells.
  // Jede Zustandsänderung muss deshalb den gemeinsamen Oluntir-Projektsnapshot
  // anfordern, sonst kann der nächste normale GrapesJS-Autosave den Repeat-Zustand
  // ohne oluntir.repeatEngine überschreiben.
  function requestProjectPersistence() {
    if (root && typeof root.OluntirPersistProjectSoon === 'function') {
      root.OluntirPersistProjectSoon(0);
    }
    if (editor && typeof editor.trigger === 'function') {
      editor.trigger('oluntir:repeat:changed', { snapshot: snapshot() });
    }
  }

  function normalizeSource(source) {
    const input = source || {};
    return {
      pageId: text(input.pageId),
      rootIdentity: text(input.rootIdentity),
      relativeIdentityPath: unique(input.relativeIdentityPath),
      structuralKind: text(input.structuralKind) || null,
      tagName: text(input.tagName) || null
    };
  }

  function normalizeDefinition(input, existing) {
    const value = input || {};
    const previous = existing || {};
    const definitionId = text(value.definitionId || previous.definitionId) || createStableId('definition');
    const repeatKey = text(value.repeatKey || previous.repeatKey) || definitionId;
    return {
      definitionId: definitionId,
      correlationId: text(value.correlationId || previous.correlationId) || definitionId,
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
      correlationId: text(value.correlationId || previous.correlationId) || text(value.definitionId || previous.definitionId),
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
    requestProjectPersistence();
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

  function updateInstance(instanceId, changes) {
    const existing = state.instances.find(item => item.instanceId === text(instanceId));
    if (!existing) throw new Error('Repeat-Instanz nicht gefunden.');
    const instance = normalizeInstance(Object.assign({}, changes || {}, { instanceId: existing.instanceId, definitionId: existing.definitionId }), existing);
    assertValid(validateInstanceValue(instance));
    const next = clone(state);
    next.instances = next.instances.map(item => item.instanceId === existing.instanceId ? instance : item);
    commit(next);
    return getInstance(instance.instanceId);
  }

  function commitLibraryPublication(definitionId, libraryMetadata, instanceUpdates) {
    const id = text(definitionId);
    const existing = state.definitions.find(item => item.definitionId === id);
    if (!existing) throw new Error('Repeat-Definition nicht gefunden.');
    const next = clone(state);
    const definition = normalizeDefinition({
      definitionId: existing.definitionId,
      revision: existing.revision + 1,
      synchronizationPolicy: SYNC_POLICY.MANUAL,
      metadata: Object.assign({}, existing.metadata || {}, libraryMetadata || {}, {
        centralLibraryMode: true,
        manualSynchronizationExplicit: true
      })
    }, existing);
    assertValid(validateDefinitionValue(definition, next));
    next.definitions = next.definitions.map(item => item.definitionId === id ? definition : item);
    const updates = new Map((instanceUpdates || []).map(item => [text(item && item.instanceId), item || {}]));
    next.instances = next.instances.map(item => {
      const changes = updates.get(item.instanceId);
      if (!changes) return item;
      const updated = normalizeInstance(Object.assign({}, changes, { instanceId: item.instanceId, definitionId: item.definitionId }), item);
      assertValid(validateInstanceValue(updated, next));
      return updated;
    });
    commit(next);
    return freezeClone({ definition: getDefinition(id), instances: getInstances(id) });
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

  function isSharedLayoutDefinition(definition) {
    const metadata = definition && definition.metadata || {};
    return metadata.repeatType === 'shared-layout' || Boolean(metadata.regionRole);
  }

  function logInfo(message, data) {
    if (root && root.OluntirLogger && typeof root.OluntirLogger.info === 'function') {
      root.OluntirLogger.info('repeat', message, data || {});
    }
  }

  function repeatStateFromProjectData(projectData) {
    const data = projectData && typeof projectData === 'object' ? projectData : null;
    return data && data.oluntir && data.oluntir[PROJECT_STATE_KEY] ? data.oluntir[PROJECT_STATE_KEY] : null;
  }

  function shouldUpgradeImportedAutomatic(rawDefinition, normalizedDefinition) {
    if (!normalizedDefinition || isSharedLayoutDefinition(normalizedDefinition)) return false;
    const raw = rawDefinition || {};
    const metadata = raw.metadata || {};
    if (metadata.centralLibraryMode === true || metadata.manualSynchronizationExplicit === true) return false;
    const rawPolicy = text(raw.synchronizationPolicy);
    if (!rawPolicy) return true;
    if (rawPolicy !== SYNC_POLICY.MANUAL) return false;
    return Boolean(
      metadata.migratedFromSchemaVersion
      || metadata.unitIdRetainedAsSourceOnly
      || (Array.isArray(metadata.legacyTargetPageIds) && metadata.legacyTargetPageIds.length)
      || metadata.legacyMode
    );
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
        synchronizationPolicy: SYNC_POLICY.AUTOMATIC,
        metadata: {
          migratedFromSchemaVersion: Number(input.schemaVersion || LEGACY_SCHEMA_VERSION),
          legacySourceComponentId: text(legacy.sourceComponentId) || null,
          legacyMode: text(legacy.mode) || null,
          legacyTargetPageIds: unique(legacy.targetPageIds),
          legacyTargetPath: unique(legacy.targetPath),
          unitIdRetainedAsSourceOnly: true,
          automaticSynchronizationUpgraded: true
        }
      }));
    });
    return migrated;
  }

  const SOURCE_MAPPING_PROPERTY = 'oluntirRepeatSourceIdentity';

  function componentAttributes(component) {
    return component && typeof component.getAttributes === 'function' ? (component.getAttributes() || {}) : {};
  }

  function componentModelValue(component, name) {
    if (!component || typeof component.get !== 'function') return null;
    return component.get(name);
  }

  function ensureComponentAttribute(component, name, value) {
    if (!component || !name || !text(value) || typeof component.addAttributes !== 'function') return false;
    const attributes = componentAttributes(component);
    if (text(attributes[name]) === text(value)) return false;
    component.addAttributes({ [name]: text(value) });
    return true;
  }

  function repeatDisplayName(definition) {
    return text(definition && definition.metadata && definition.metadata.displayName);
  }

  function stampRepeatName(component, definition) {
    const name = repeatDisplayName(definition);
    return Boolean(name && ensureComponentAttribute(component, 'data-oluntir-repeat-name', name));
  }

  function stampSourceComponent(component, definition) {
    const repeatAttribute = identities && identities.ATTR && identities.ATTR.repeat;
    let changed = Boolean(repeatAttribute && definition && ensureComponentAttribute(component, repeatAttribute, definition.repeatKey));
    changed = stampRepeatName(component, definition) || changed;
    return changed;
  }

  function stampInstanceComponent(component, instance, definition) {
    if (!component || !instance || !definition) return false;
    let changed = false;
    changed = ensureComponentAttribute(component, 'data-oluntir-repeat-instance-id', instance.instanceId) || changed;
    const repeatAttribute = identities && identities.ATTR && identities.ATTR.repeat;
    if (repeatAttribute) changed = ensureComponentAttribute(component, repeatAttribute, definition.repeatKey) || changed;
    changed = stampRepeatName(component, definition) || changed;
    if (typeof component.set === 'function' && text(componentModelValue(component, SOURCE_MAPPING_PROPERTY)) !== text(definition.source && definition.source.rootIdentity)) {
      component.set(SOURCE_MAPPING_PROPERTY, text(definition.source && definition.source.rootIdentity), { silent: true });
      changed = true;
    }
    return changed;
  }

  function componentIdentity(component, page) {
    if (!component || !identities) return '';
    if (typeof identities.describe === 'function') {
      const description = identities.describe(component, { page: page });
      if (description && text(description.identity)) return text(description.identity);
    }
    const attributes = componentAttributes(component);
    const names = identities.ATTR ? Object.values(identities.ATTR) : [];
    for (const name of names) {
      if (name === (identities.ATTR && identities.ATTR.repeat)) continue;
      if (text(attributes[name])) return text(attributes[name]);
    }
    return '';
  }

  function editorPages() {
    return editor && editor.Pages && typeof editor.Pages.getAll === 'function' ? editor.Pages.getAll() : [];
  }

  function pageByIdentity(pageIdentity) {
    const target = text(pageIdentity);
    if (!target || !identities || typeof identities.pageId !== 'function') return null;
    return editorPages().find(page => text(identities.pageId(page)) === target) || null;
  }

  function pageComponents(page, predicate) {
    if (!page || !identities || typeof identities.walk !== 'function') return [];
    const rootComponent = page.getMainComponent && page.getMainComponent();
    const result = [];
    identities.walk(rootComponent, component => {
      if (!predicate || predicate(component)) result.push(component);
    }, true);
    return result;
  }

  function uniqueBindingCandidate(page, candidates) {
    const byIdentity = new Map();
    (candidates || []).forEach(component => {
      const identity = componentIdentity(component, page);
      if (identity && !byIdentity.has(identity)) byIdentity.set(identity, component);
    });
    return byIdentity.size === 1 ? { identity: Array.from(byIdentity.keys())[0], component: Array.from(byIdentity.values())[0] } : null;
  }

  function reconcileImportedBindings(imported) {
    const report = { sourceBindingsRepaired: 0, instanceBindingsRepaired: 0, instancesRecovered: 0, markersStamped: 0, unresolvedDefinitions: [], unresolvedInstances: [] };
    if (!imported || !editor || !identities || !editor.Pages) return report;
    if (typeof identities.ensureAll === 'function') identities.ensureAll(editor);
    const repeatAttribute = identities.ATTR && identities.ATTR.repeat;
    const definitionsById = new Map((imported.definitions || []).map(definition => [definition.definitionId, definition]));

    (imported.definitions || []).forEach(definition => {
      if (!definition || isSharedLayoutDefinition(definition)) return;
      const sourcePage = pageByIdentity(definition.source && definition.source.pageId);
      if (!sourcePage) {
        report.unresolvedDefinitions.push({ definitionId: definition.definitionId, reason: 'source-page-missing' });
        return;
      }
      let sourceComponent = identities.findById && identities.findById(sourcePage, definition.source.rootIdentity);
      if (!sourceComponent && repeatAttribute) {
        const candidate = uniqueBindingCandidate(sourcePage, pageComponents(sourcePage, component => text(componentAttributes(component)[repeatAttribute]) === text(definition.repeatKey)));
        if (candidate) {
          definition.source.rootIdentity = candidate.identity;
          sourceComponent = candidate.component;
          definition.metadata = Object.assign({}, definition.metadata || {}, {
            bindingCompatibilityRepaired: true,
            bindingCompatibilityRepairReason: 'source-repeat-marker'
          });
          report.sourceBindingsRepaired += 1;
        } else {
          report.unresolvedDefinitions.push({ definitionId: definition.definitionId, reason: 'source-root-missing' });
        }
      }
      if (sourceComponent && stampSourceComponent(sourceComponent, definition)) report.markersStamped += 1;
    });

    const occupied = new Set((imported.instances || []).map(instance => `${text(instance.pageId)}:${text(instance.rootIdentity)}`));
    (imported.instances || []).forEach(instance => {
      const definition = definitionsById.get(instance.definitionId);
      const page = pageByIdentity(instance.pageId);
      if (!definition || !page || isSharedLayoutDefinition(definition)) return;
      const existingInstanceRoot = identities.findById && identities.findById(page, instance.rootIdentity);
      if (existingInstanceRoot) {
        if (stampInstanceComponent(existingInstanceRoot, instance, definition)) report.markersStamped += 1;
        return;
      }
      const candidates = pageComponents(page, component => {
        const attributes = componentAttributes(component);
        if (text(attributes['data-oluntir-repeat-instance-id']) === text(instance.instanceId)) return true;
        if (text(componentModelValue(component, SOURCE_MAPPING_PROPERTY)) === text(definition.source.rootIdentity)) return true;
        return Boolean(repeatAttribute && text(attributes[repeatAttribute]) === text(definition.repeatKey));
      });
      const candidate = uniqueBindingCandidate(page, candidates);
      if (!candidate) {
        report.unresolvedInstances.push({ instanceId: instance.instanceId, definitionId: instance.definitionId, reason: 'instance-root-missing' });
        return;
      }
      occupied.delete(`${text(instance.pageId)}:${text(instance.rootIdentity)}`);
      instance.rootIdentity = candidate.identity;
      instance.metadata = Object.assign({}, instance.metadata || {}, {
        bindingCompatibilityRepaired: true,
        bindingCompatibilityRepairReason: 'explicit-correlation-marker'
      });
      occupied.add(`${text(instance.pageId)}:${candidate.identity}`);
      report.instanceBindingsRepaired += 1;
      if (stampInstanceComponent(candidate.component, instance, definition)) report.markersStamped += 1;
    });

    // Schema-2 imports did not yet have explicit instance records. Recover them
    // only when the old project itself still carries an unambiguous Oluntir
    // repeat/source marker on a declared legacy target page.
    (imported.definitions || []).forEach(definition => {
      if (!definition || isSharedLayoutDefinition(definition)) return;
      const metadata = definition.metadata || {};
      const targetPageIds = Array.isArray(metadata.legacyTargetPageIds) ? metadata.legacyTargetPageIds.map(text).filter(Boolean) : [];
      if (!targetPageIds.length) return;
      targetPageIds.forEach(targetPageId => {
        const page = pageByIdentity(targetPageId);
        if (!page || targetPageId === text(definition.source && definition.source.pageId)) return;
        const existingForPage = (imported.instances || []).filter(instance => instance.definitionId === definition.definitionId && text(instance.pageId) === targetPageId);
        const represented = new Set(existingForPage.map(instance => text(instance.rootIdentity)));
        const candidates = pageComponents(page, component => {
          const attributes = componentAttributes(component);
          if (text(componentModelValue(component, SOURCE_MAPPING_PROPERTY)) === text(definition.source.rootIdentity)) return true;
          return Boolean(repeatAttribute && text(attributes[repeatAttribute]) === text(definition.repeatKey));
        });
        candidates.forEach(component => {
          const identity = componentIdentity(component, page);
          const key = `${targetPageId}:${identity}`;
          if (!identity || represented.has(identity) || occupied.has(key)) return;
          const recovered = normalizeInstance({
            definitionId: definition.definitionId,
            correlationId: definition.correlationId || definition.definitionId,
            pageId: targetPageId,
            rootIdentity: identity,
            state: STATUS.ACTIVE,
            metadata: {
              recoveredFromLegacyMarker: true,
              sourceIdentity: definition.source.rootIdentity,
              mappingProperty: SOURCE_MAPPING_PROPERTY
            }
          });
          imported.instances.push(recovered);
          represented.add(identity);
          occupied.add(key);
          report.instancesRecovered += 1;
          if (stampInstanceComponent(component, recovered, definition)) report.markersStamped += 1;
        });
      });
    });

    // Re-evaluate automatic policy after any recovered instances were added.
    const linkedDefinitions = new Set((imported.instances || []).filter(item => item.state !== STATUS.DETACHED).map(item => item.definitionId));
    (imported.definitions || []).forEach(definition => {
      const metadata = definition.metadata || {};
      if (definition.synchronizationPolicy !== SYNC_POLICY.MANUAL || isSharedLayoutDefinition(definition)) return;
      if (metadata.manualSynchronizationExplicit === true || !linkedDefinitions.has(definition.definitionId)) return;
      definition.synchronizationPolicy = SYNC_POLICY.AUTOMATIC;
      definition.metadata = Object.assign({}, metadata, {
        automaticSynchronizationUpgraded: true,
        automaticSynchronizationUpgradeReason: metadata.automaticSynchronizationUpgradeReason || 'recovered-linked-instance'
      });
    });
    return report;
  }

  function normalizeImportedState(input) {
    if (!input || typeof input !== 'object') return emptyState();
    if (Number(input.schemaVersion || 0) < SCHEMA_VERSION) return migrateLegacyState(input);
    const imported = emptyState();
    imported.revision = Number(input.revision || 0);
    const canonicalBySource = new Map();
    const aliases = new Map();
    imported.definitions = (input.definitions || []).map(item => {
      const normalized = normalizeDefinition(item);
      if (shouldUpgradeImportedAutomatic(item, normalized)) {
        normalized.synchronizationPolicy = SYNC_POLICY.AUTOMATIC;
        normalized.metadata = Object.assign({}, normalized.metadata || {}, {
          automaticSynchronizationUpgraded: true,
          automaticSynchronizationUpgradeReason: text(item && item.synchronizationPolicy) ? 'legacy-manual-policy' : 'missing-policy'
        });
      }
      return normalized;
    }).filter(definition => {
      const source = definition.source || {};
      const key = `${source.pageId}:${source.rootIdentity}`;
      if (!source.pageId || !source.rootIdentity || !canonicalBySource.has(key)) {
        if (source.pageId && source.rootIdentity) canonicalBySource.set(key, definition.definitionId);
        return true;
      }
      aliases.set(definition.definitionId, canonicalBySource.get(key));
      return false;
    });
    imported.instances = (input.instances || []).map(item => {
      const normalized = normalizeInstance(item);
      if (aliases.has(normalized.definitionId)) normalized.definitionId = aliases.get(normalized.definitionId);
      return normalized;
    });

    // Older alpha projects could persist a user-created repeat definition with
    // policy=manual even though the product UI already treated linked instances
    // as bidirectional automatic repeats. If active instances still belong to
    // such a definition, upgrade only that imported user-facing contract. An
    // explicit developer opt-out remains possible through metadata.
    const definitionsWithInstances = new Set(imported.instances.filter(item => item.state !== STATUS.DETACHED).map(item => item.definitionId));
    imported.definitions.forEach(definition => {
      const metadata = definition.metadata || {};
      if (definition.synchronizationPolicy !== SYNC_POLICY.MANUAL) return;
      if (isSharedLayoutDefinition(definition)) return;
      if (metadata.manualSynchronizationExplicit === true) return;
      if (!definitionsWithInstances.has(definition.definitionId)) return;
      definition.synchronizationPolicy = SYNC_POLICY.AUTOMATIC;
      definition.metadata = Object.assign({}, metadata, {
        automaticSynchronizationUpgraded: true,
        automaticSynchronizationUpgradeReason: metadata.automaticSynchronizationUpgradeReason || 'linked-instance-import'
      });
    });

    imported.references = (input.references || []).map(item => normalizeReference(item));
    return imported;
  }

  function exportState() { return snapshot(); }

  function importState(input) {
    const imported = normalizeImportedState(input);
    const compatibility = reconcileImportedBindings(imported);
    const previous = state;
    state = imported;
    const validation = validateProject();
    if (!validation.valid) {
      state = previous;
      assertValid(validation.errors);
    }
    if ((compatibility.sourceBindingsRepaired || compatibility.instanceBindingsRepaired || compatibility.instancesRecovered || compatibility.markersStamped)
      && root && typeof root.OluntirPersistProjectSoon === 'function') {
      root.OluntirPersistProjectSoon(0);
    }
    const upgradedDefinitions = state.definitions.filter(item => item.metadata && item.metadata.automaticSynchronizationUpgraded);
    if (upgradedDefinitions.length || compatibility.sourceBindingsRepaired || compatibility.instanceBindingsRepaired || compatibility.instancesRecovered || compatibility.markersStamped || compatibility.unresolvedDefinitions.length || compatibility.unresolvedInstances.length) {
      logInfo('repeat.import-compatibility-upgraded', {
        upgradedDefinitions: upgradedDefinitions.length,
        definitionIds: upgradedDefinitions.map(item => item.definitionId),
        instanceCount: state.instances.length,
        sourceBindingsRepaired: compatibility.sourceBindingsRepaired,
        instanceBindingsRepaired: compatibility.instanceBindingsRepaired,
        instancesRecovered: compatibility.instancesRecovered,
        markersStamped: compatibility.markersStamped,
        unresolvedDefinitions: compatibility.unresolvedDefinitions,
        unresolvedInstances: compatibility.unresolvedInstances
      });
    }
    const result = snapshot();
    if (editor && typeof editor.trigger === 'function') {
      editor.trigger('oluntir:repeat:changed', { snapshot: result, imported: true });
    }
    return result;
  }

  function hydrateFromProjectData(projectData, options) {
    const repeatState = repeatStateFromProjectData(projectData);
    if (!repeatState) return freezeClone({ hydrated: false, reason: 'repeat-state-missing', snapshot: snapshot() });
    const hydrated = importState(repeatState);
    const source = text(options && options.source) || 'project-data';
    logInfo('repeat.project-state-hydrated', {
      source,
      schemaVersion: hydrated.schemaVersion,
      revision: hydrated.revision,
      definitionCount: hydrated.counts && hydrated.counts.definitions || 0,
      instanceCount: hydrated.counts && hydrated.counts.instances || 0,
      referenceCount: hydrated.counts && hydrated.counts.references || 0
    });
    return freezeClone({ hydrated: true, source, snapshot: hydrated });
  }

  function reconcileCurrentProjectBindings(options) {
    if (!editor || !identities || !state.definitions.length) return freezeClone({ reconciled: false, reason: 'no-repeat-state' });
    const working = clone(state);
    const report = reconcileImportedBindings(working);
    const changed = Boolean(report.sourceBindingsRepaired || report.instanceBindingsRepaired || report.instancesRecovered || report.markersStamped);
    const previous = state;
    state = working;
    const validation = validateProject();
    if (!validation.valid) {
      state = previous;
      assertValid(validation.errors);
    }
    if (changed && root && typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0);
    const source = text(options && options.source) || 'current-project-model';
    logInfo('repeat.project-bindings-reconciled', {
      source,
      changed,
      definitionCount: state.definitions.length,
      instanceCount: state.instances.length,
      sourceBindingsRepaired: report.sourceBindingsRepaired,
      instanceBindingsRepaired: report.instanceBindingsRepaired,
      instancesRecovered: report.instancesRecovered,
      markersStamped: report.markersStamped,
      unresolvedDefinitions: report.unresolvedDefinitions,
      unresolvedInstances: report.unresolvedInstances
    });
    if (editor && typeof editor.trigger === 'function') editor.trigger('oluntir:repeat:changed', { snapshot: snapshot(), reconciled: true });
    return freezeClone({ reconciled: true, changed, report, snapshot: snapshot() });
  }

  function componentTagName(component) {
    return text(component && typeof component.get === 'function' && (component.get('tagName') || component.get('type'))).toLowerCase();
  }

  function belongsToSharedLayout(component) {
    let current = component;
    while (current) {
      const tag = componentTagName(current);
      if (tag === 'header' || tag === 'nav' || tag === 'footer') return true;
      current = typeof current.parent === 'function' ? current.parent() : null;
    }
    return false;
  }

  function markerDisplayName(entries, index) {
    for (const entry of entries || []) {
      const attrs = componentAttributes(entry.component);
      const name = text(attrs['data-oluntir-repeat-name']);
      if (name) return name;
    }
    return `Wiederholbarer Bereich ${index + 1}`;
  }

  // 2.2.0-BETA-Kompatibilitaet: Repeat-Metadaten sind Oluntir-eigene
  // Projektmetadaten. Falls ein aelterer/zwischenzeitlich gespeicherter Stand
  // diese Metadaten verloren hat, bleiben auf den materialisierten Seiten die
  // stabilen Repeat-Familienmarker erhalten. Nur diese eindeutigen Marker werden
  // fuer eine Wiederherstellung verwendet; DOM-Positionen/CSS-Selektoren werden
  // niemals als Identitaet herangezogen.
  function recoverFromCurrentProjectMarkers(options) {
    if (!editor || !identities || !editor.Pages || typeof identities.walk !== 'function') {
      return freezeClone({ recovered: false, reason: 'editor-or-identities-unavailable', definitionsRecovered: 0, instancesRecovered: 0 });
    }
    if (typeof identities.ensureAll === 'function') identities.ensureAll(editor);
    const repeatAttribute = identities.ATTR && identities.ATTR.repeat;
    if (!repeatAttribute) return freezeClone({ recovered: false, reason: 'repeat-attribute-unavailable', definitionsRecovered: 0, instancesRecovered: 0 });

    const groups = new Map();
    editorPages().forEach(page => {
      const pid = text(identities.pageId && identities.pageId(page));
      if (!pid) return;
      pageComponents(page, component => {
        if (!component || belongsToSharedLayout(component)) return false;
        const attrs = componentAttributes(component);
        const explicitRepeatKey = text(attrs[repeatAttribute]);
        const instanceId = text(attrs['data-oluntir-repeat-instance-id']);
        const sourceIdentityMarker = text(componentModelValue(component, SOURCE_MAPPING_PROPERTY));
        // Older Alpha/Beta projects can contain a valid materialized Repeat root
        // whose data-oluntir-repeat-id marker was lost while the stable instance
        // marker and Oluntir source-correlation survived. This is still an
        // Oluntir-owned identity and therefore a safe recovery source. Descendant
        // source mappings are deliberately ignored unless the component is also
        // marked as a Repeat instance root.
        if (!explicitRepeatKey && !(instanceId && sourceIdentityMarker)) return false;
        const identity = componentIdentity(component, page);
        if (!identity) return false;
        const recoveredRepeatKey = explicitRepeatKey || `ol_repeat_recovered_${sourceIdentityMarker.replace(/[^a-zA-Z0-9_-]+/g, '_')}`;
        const familyKey = explicitRepeatKey ? `repeat:${explicitRepeatKey}` : `source:${sourceIdentityMarker}`;
        if (!groups.has(familyKey)) groups.set(familyKey, { repeatKey: recoveredRepeatKey, entries: [] });
        groups.get(familyKey).entries.push({
          repeatKey: recoveredRepeatKey,
          page,
          pageId: pid,
          component,
          identity,
          instanceId,
          displayName: text(attrs['data-oluntir-repeat-name']),
          sourceIdentityMarker
        });
        return false;
      });
    });

    if (!groups.size) return freezeClone({ recovered: false, reason: 'no-repeat-markers', definitionsRecovered: 0, instancesRecovered: 0 });

    const working = clone(state);
    const definitionsByKey = new Map((working.definitions || []).map(definition => [text(definition.repeatKey), definition]));
    const instancesByRoot = new Set((working.instances || []).map(instance => `${text(instance.pageId)}:${text(instance.rootIdentity)}`));
    const instanceIds = new Set((working.instances || []).map(instance => text(instance.instanceId)).filter(Boolean));
    let definitionsRecovered = 0;
    let instancesRecovered = 0;
    let markersStamped = 0;
    let generatedNameIndex = 0;

    Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([, group]) => {
      const repeatKey = text(group && group.repeatKey);
      const entries = group && Array.isArray(group.entries) ? group.entries : [];
      if (!repeatKey || !entries.length) return;
      let definition = definitionsByKey.get(repeatKey) || null;
      if (!definition) {
        const source = entries.find(entry => entry.sourceIdentityMarker && entry.sourceIdentityMarker === entry.identity) || entries[0];
        const displayName = markerDisplayName(entries, generatedNameIndex++);
        let definitionId = repeatKey;
        if ((working.definitions || []).some(item => text(item.definitionId) === definitionId)) definitionId = createStableId('definition');
        definition = normalizeDefinition({
          definitionId,
          correlationId: definitionId,
          repeatKey,
          source: {
            pageId: source.pageId,
            rootIdentity: source.identity,
            relativeIdentityPath: [],
            structuralKind: null,
            tagName: componentTagName(source.component) || null
          },
          scope: componentTagName(source.component) || 'structure',
          synchronizationPolicy: SYNC_POLICY.MANUAL,
          metadata: {
            repeatType: 'explicit-repeat',
            propagationPolicy: 'selected-pages',
            regionRole: null,
            displayName,
            centralLibraryMode: true,
            manualSynchronizationExplicit: true,
            recoveredFromPageMarkers: true,
            recoveredDisplayName: Boolean(entries.some(entry => entry.displayName)),
            recoveredAt: new Date().toISOString()
          }
        });
        const definitionErrors = validateDefinitionValue(definition, working);
        if (definitionErrors.length) return;
        working.definitions.push(definition);
        definitionsByKey.set(repeatKey, definition);
        definitionsRecovered += 1;
      }

      entries.forEach(entry => {
        const rootKey = `${entry.pageId}:${entry.identity}`;
        if (instancesByRoot.has(rootKey)) {
          const existing = (working.instances || []).find(instance => text(instance.pageId) === entry.pageId && text(instance.rootIdentity) === entry.identity && instance.definitionId === definition.definitionId);
          if (existing && stampInstanceComponent(entry.component, existing, definition)) markersStamped += 1;
          else if (stampSourceComponent(entry.component, definition)) markersStamped += 1;
          return;
        }
        let instanceId = entry.instanceId;
        if (!instanceId || instanceIds.has(instanceId)) instanceId = createStableId('instance');
        const recovered = normalizeInstance({
          instanceId,
          definitionId: definition.definitionId,
          correlationId: definition.correlationId || definition.definitionId,
          pageId: entry.pageId,
          rootIdentity: entry.identity,
          state: STATUS.ACTIVE,
          appliedRevision: Math.max(1, Number(definition.revision || 1)),
          metadata: {
            recoveredFromPageMarker: true,
            centralLibraryMode: true,
            sourceIdentity: definition.source.rootIdentity,
            mappingProperty: SOURCE_MAPPING_PROPERTY
          }
        });
        const instanceErrors = validateInstanceValue(recovered, working);
        if (instanceErrors.length) return;
        working.instances.push(recovered);
        instancesByRoot.add(rootKey);
        instanceIds.add(instanceId);
        instancesRecovered += 1;
        if (stampInstanceComponent(entry.component, recovered, definition)) markersStamped += 1;
      });
    });

    if (!definitionsRecovered && !instancesRecovered && !markersStamped) {
      return freezeClone({ recovered: false, reason: 'state-already-complete', definitionsRecovered: 0, instancesRecovered: 0, markersStamped: 0 });
    }

    const previous = state;
    state = working;
    const validation = validateProject();
    if (!validation.valid) {
      state = previous;
      return freezeClone({ recovered: false, reason: 'recovered-state-invalid', errors: validation.errors, definitionsRecovered: 0, instancesRecovered: 0, markersStamped: 0 });
    }
    if (definitionsRecovered || instancesRecovered) requestProjectPersistence();
    else if (markersStamped && root && typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0);
    const source = text(options && options.source) || 'current-project-markers';
    logInfo('repeat.project-marker-recovery', {
      source,
      familyCount: groups.size,
      definitionsRecovered,
      instancesRecovered,
      markersStamped,
      definitionCount: state.definitions.length,
      instanceCount: state.instances.length
    });
    return freezeClone({ recovered: true, source, familyCount: groups.size, definitionsRecovered, instancesRecovered, markersStamped, snapshot: snapshot() });
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
    // 2.2.0 BETA: Der zentrale Repeat-Arbeitsbereich ist eine rein temporäre
    // GrapesJS-Seite. Er darf niemals als echte Projektseite persistiert oder
    // exportiert werden. Der Draft selbst liegt im Oluntir-Repeat-Zustand.
    if (Array.isArray(data.pages)) {
      data.pages = data.pages.filter(page => {
        const id = text(page && page.id);
        const marker = text(page && page.oluntirInternalPage);
        return id !== 'oluntir-repeat-workspace' && marker !== 'repeat-workspace';
      });
    }
    data.oluntir = Object.assign({}, data.oluntir || {}, {
      repeatEngineSchemaVersion: SCHEMA_VERSION,
      repeatArchitecture: 'central-library-manual-publish',
      [PROJECT_STATE_KEY]: exportState()
    });
    return data;
  }

  function bind(nextEditor, options) {
    if (!nextEditor) return false;
    if (editor && editor !== nextEditor) editor = null;
    if (editor === nextEditor) return false;
    editor = nextEditor;

    // Der initiale Snapshot wird in editor.js vor grapesjs.init() aus dem lokalen
    // Projektspeicher gelesen. Das ist absichtlich die erste Hydrierungsquelle:
    // Repeat-Metadaten sind Oluntir-eigene Top-Level-Daten und können nach dem
    // GrapesJS-Autoload in editor.getProjectData() bereits fehlen.
    const initialProjectData = options && options.initialProjectData;
    if (initialProjectData) {
      hydrateFromProjectData(initialProjectData, { source: text(options && options.hydrationSource) || 'bind-initial-project-data' });
    }

    if (editor.on) {
      editor.on('load', function () {
        const data = editor.getProjectData ? editor.getProjectData() : null;
        if (repeatStateFromProjectData(data)) hydrateFromProjectData(data, { source: 'editor-load-project-data' });
        // Selbst wenn GrapesJS die Oluntir-Top-Level-Metadaten bereits verworfen
        // hat, liegt der Repeat-Zustand aus dem vor Init gesicherten Snapshot im
        // Speicher. Jetzt sind die Seiten/Komponenten sicher geladen und können
        // gegen stabile Oluntir-Marker neu gebunden werden.
        reconcileCurrentProjectBindings({ source: 'editor-load-current-model' });
        recoverFromCurrentProjectMarkers({ source: 'editor-load-current-model' });
      });
      editor.on('storage:load', function (data) {
        if (repeatStateFromProjectData(data)) hydrateFromProjectData(data, { source: 'storage-load' });
      });
    }

    // Für Editoren ohne Autoload bzw. für einen bereits vollständig geladenen
    // Editor bleibt getProjectData() ein zusätzlicher Fallback. Ein fehlendes
    // oluntir.repeatEngine darf den zuvor hydrierten Zustand niemals leeren.
    if (!initialProjectData && editor.getProjectData) {
      const current = editor.getProjectData();
      if (repeatStateFromProjectData(current)) hydrateFromProjectData(current, { source: 'bind-current-project-data' });
    }
    // Falls bind() nach dem nativen GrapesJS-load erfolgt, kann der load-Listener
    // bereits verpasst sein. Ein einmaliger deferred marker recovery ist daher die
    // zweite Session-Sicherung fuer bestehende Projekte.
    if (root && typeof root.setTimeout === 'function') {
      root.setTimeout(function () { recoverFromCurrentProjectMarkers({ source: 'bind-deferred-current-model' }); }, 0);
    }
    return true;
  }

  /* Compatibility bridge for 1.3.0 callers. It creates only a definition and never a target mutation. */
  function define(component, options) {
    if (!editor || !component || !identities) throw new Error('Repeat Engine V2 ist nicht gebunden.');
    identities.ensureAll(editor);
    const sourcePage = editor.Pages.getSelected();
    const description = identities.describe(component, { page: sourcePage });
    const sourcePageId = identities.pageId(sourcePage);
    const existing = state.definitions.find(item => item.source && item.source.pageId === sourcePageId && item.source.rootIdentity === description.identity);
    if (existing) {
      if (component.addAttributes) component.addAttributes({ [identities.ATTR.repeat]: existing.repeatKey });
      return getDefinition(existing.definitionId);
    }
    const attrs = component.getAttributes ? (component.getAttributes() || {}) : {};
    const repeatKey = text(options && options.repeatId) || text(attrs[identities.ATTR.repeat]) || createStableId('definition');
    if (component.addAttributes) component.addAttributes({ [identities.ATTR.repeat]: repeatKey });
    return createDefinition({
      definitionId: repeatKey,
      correlationId: repeatKey,
      repeatKey: repeatKey,
      source: { pageId: sourcePageId, rootIdentity: description.identity, relativeIdentityPath: [], structuralKind: description.structuralKind, tagName: description.tagName },
      scope: description.structuralKind || 'component',
      synchronizationPolicy: text(options && options.synchronizationPolicy) || SYNC_POLICY.AUTOMATIC,
      metadata: {
        compatibilityBridge: true,
        legacyMode: text(options && options.mode) || 'selected',
        repeatType: text(options && options.repeatType) || 'explicit-repeat',
        propagationPolicy: text(options && options.propagationPolicy) || 'selected-pages',
        regionRole: text(options && options.regionRole) || null
      }
    });
  }

  function apply(reference) {
    const runtime = root && root.OluntirRepeatSynchronizationRuntime;
    if (!editor || !runtime || typeof runtime.apply !== 'function') {
      const error = new Error('Repeat Synchronization Runtime ist nicht verfügbar.');
      error.code = 'REPEAT_SYNC_RUNTIME_MISSING';
      error.reference = text(reference) || null;
      throw error;
    }
    return runtime.apply(editor, reference);
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
    updateInstance: updateInstance,
    commitLibraryPublication: commitLibraryPublication,
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
    hydrateFromProjectData: hydrateFromProjectData,
    reconcileCurrentProjectBindings: reconcileCurrentProjectBindings,
    recoverFromCurrentProjectMarkers: recoverFromCurrentProjectMarkers,
    decorateProjectData: decorateProjectData,
    createStableId: createStableId,
    reset: reset
  });
});
