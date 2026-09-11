(function (root, factory) {
  const identities = root && root.OluntirLayoutIdentities ? root.OluntirLayoutIdentities : (typeof module === 'object' && module.exports ? require('./layout-identities.js') : null);
  const api = factory(identities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatSyncAccessAdapter = api;
})(typeof window !== 'undefined' ? window : globalThis, function (identities) {
  'use strict';

  const SCHEMA_VERSION = 2;
  const SOURCE_IDENTITY_PROPERTY = 'oluntirRepeatSourceIdentity';
  const INTERNAL_ATTRIBUTES = new Set([
    'data-oluntir-page-id', 'data-oluntir-section-id', 'data-oluntir-row-id',
    'data-oluntir-slot-id', 'data-oluntir-component-id', 'data-oluntir-repeat-id',
    'data-oluntir-repeat-instance-id'
  ]);
  const EDITOR_INTERACTION_KEYS = new Set([
    'editable', 'stylable', 'draggable', 'droppable', 'removable', 'copyable'
  ]);

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function text(value) { return value == null ? '' : String(value).trim(); }
  function children(component) {
    if (!component || typeof component.components !== 'function') return [];
    const collection = component.components();
    return collection && Array.isArray(collection.models) ? collection.models : (Array.isArray(collection) ? collection : []);
  }
  function collectionOf(component) { return component && typeof component.components === 'function' ? component.components() : null; }
  function pageById(editor, pageId) {
    if (!editor || !editor.Pages || typeof editor.Pages.getAll !== 'function') return null;
    return editor.Pages.getAll().find(page => identities && identities.pageId(page) === text(pageId)) || null;
  }
  function componentByIdentity(editor, pageId, identity) {
    const page = pageById(editor, pageId);
    return page && identities && typeof identities.findById === 'function' ? identities.findById(page, text(identity)) : null;
  }
  function attrs(component) { return component && component.getAttributes ? clone(component.getAttributes() || {}) : {}; }
  function modelValue(component, key) { return component && typeof component.get === 'function' ? component.get(key) : undefined; }
  function snapshot(component) {
    if (!component) return null;
    const model = component.toJSON ? clone(component.toJSON()) : {};
    model.attributes = attrs(component);
    model.components = children(component).map(snapshot);
    const mappedSource = text(modelValue(component, SOURCE_IDENTITY_PROPERTY));
    if (mappedSource) model[SOURCE_IDENTITY_PROPERTY] = mappedSource;
    return model;
  }
  function semanticSnapshot(value) {
    if (!value) return null;
    const output = clone(value);
    if (output.attributes) Object.keys(output.attributes).forEach(name => { if (INTERNAL_ATTRIBUTES.has(name)) delete output.attributes[name]; });
    output.components = (output.components || []).map(semanticSnapshot);
    delete output.id;
    delete output.cid;
    delete output[SOURCE_IDENTITY_PROPERTY];
    return output;
  }
  function sourceIdentity(value) {
    // Inserted Repeat instances keep the canonical source identity as model
    // metadata. It must win over the fresh structural identity generated for
    // the target page, otherwise reverse synchronization cannot address the
    // original source component.
    const mapped = text(value && value[SOURCE_IDENTITY_PROPERTY]);
    if (mapped) return mapped;
    const attributes = value && value.attributes ? value.attributes : {};
    for (const name of INTERNAL_ATTRIBUTES) {
      if (text(attributes[name])) return text(attributes[name]);
    }
    return '';
  }
  function setSourceMapping(component, sourceId) {
    if (!component || typeof component.set !== 'function' || !text(sourceId)) return;
    component.set(SOURCE_IDENTITY_PROPERTY, text(sourceId), { silent: true });
  }
  function clearSourceMapping(component) {
    if (!component) return;
    if (typeof component.unset === 'function') component.unset(SOURCE_IDENTITY_PROPERTY, { silent: true });
    else if (typeof component.set === 'function') component.set(SOURCE_IDENTITY_PROPERTY, null, { silent: true });
  }
  function setAttributesPreservingIdentity(component, sourceAttributes) {
    const current = attrs(component);
    const next = {};
    Object.keys(sourceAttributes || {}).forEach(name => { if (!INTERNAL_ATTRIBUTES.has(name)) next[name] = sourceAttributes[name]; });
    Object.keys(current).forEach(name => { if (INTERNAL_ATTRIBUTES.has(name)) next[name] = current[name]; });
    if (typeof component.setAttributes === 'function') component.setAttributes(next);
    else if (typeof component.addAttributes === 'function') component.addAttributes(next);
  }
  function setAttributesExact(component, value) {
    if (typeof component.setAttributes === 'function') component.setAttributes(clone(value || {}));
    else if (typeof component.addAttributes === 'function') component.addAttributes(clone(value || {}));
  }
  function applyScalar(component, source, exactAttributes) {
    if (!component || !source) return;
    if (exactAttributes) setAttributesExact(component, source.attributes || {});
    else setAttributesPreservingIdentity(component, source.attributes || {});
    ['tagName', 'type', 'content', 'style', 'script', 'script-export', 'traits'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(source, key) && typeof component.set === 'function') component.set(key, clone(source[key]));
    });
    if (Object.prototype.hasOwnProperty.call(source, SOURCE_IDENTITY_PROPERTY)) setSourceMapping(component, source[SOURCE_IDENTITY_PROPERTY]);
    else if (exactAttributes) clearSourceMapping(component);
  }
  function tagCompatible(source, target) {
    if (!source || !target) return false;
    const sourceTag = text(source.tagName).toLowerCase();
    const targetTag = text(target.tagName).toLowerCase();
    return !(sourceTag && targetTag && sourceTag !== targetTag);
  }
  function topologyCompatible(source, target) {
    if (!tagCompatible(source, target)) return false;
    const sourceChildren = source.components || [];
    const targetChildren = target.components || [];
    if (sourceChildren.length !== targetChildren.length) return false;
    for (let index = 0; index < sourceChildren.length; index += 1) {
      if (!topologyCompatible(sourceChildren[index], targetChildren[index])) return false;
    }
    return true;
  }
  function error(code, message, details) {
    const failure = new Error(message);
    failure.code = code;
    if (details) failure.details = details;
    return failure;
  }
  function validateSourceTree(source) {
    const seen = new Set();
    function walk(node, path) {
      const identity = sourceIdentity(node);
      if (!identity) throw error('REPEAT_SYNC_SOURCE_IDENTITY_MISSING', 'Eine Quellkomponente besitzt keine stabile Oluntir-Identität.', { path });
      if (seen.has(identity)) throw error('REPEAT_SYNC_SOURCE_IDENTITY_DUPLICATE', 'Eine Quellidentität ist innerhalb der Repeat-Struktur mehrfach vorhanden.', { identity, path });
      seen.add(identity);
      (node.components || []).forEach((child, index) => walk(child, path.concat(index)));
    }
    walk(source, []);
    return true;
  }
  function validateTargetMappings(target) {
    const seen = new Set();
    function walk(node, path) {
      const mapping = text(node && node[SOURCE_IDENTITY_PROPERTY]);
      if (mapping && seen.has(mapping)) throw error('REPEAT_SYNC_TARGET_MAPPING_DUPLICATE', 'Eine Quellidentität ist im Ziel mehrfach zugeordnet.', { identity: mapping, path });
      if (mapping) seen.add(mapping);
      (node.components || []).forEach((child, index) => walk(child, path.concat(index)));
    }
    walk(target, []);
    return true;
  }
  function cleanDefinition(source) {
    const output = clone(source || {});
    const identity = sourceIdentity(output);
    if (output.attributes) Object.keys(output.attributes).forEach(name => { if (INTERNAL_ATTRIBUTES.has(name)) delete output.attributes[name]; });
    delete output.id;
    delete output.cid;
    // Editor-Sperren gehoeren nicht zum semantischen Repeat-Inhalt. Sie werden
    // auf materialisierten Seiteninstanzen separat durch den Library-Manager
    // gesetzt und duerfen weder zentrale Drafts noch spaetere Publikationen
    // dauerhaft uneditierbar machen.
    EDITOR_INTERACTION_KEYS.forEach(key => { delete output[key]; });
    output[SOURCE_IDENTITY_PROPERTY] = identity;
    output.components = (output.components || []).map(cleanDefinition);
    return output;
  }
  function assignFreshIdentities(component) {
    if (!component || !identities || typeof identities.classify !== 'function' || typeof identities.createId !== 'function') return;
    const kind = identities.classify(component, false) || 'component';
    const attribute = identities.ATTR && identities.ATTR[kind];
    if (attribute && typeof component.addAttributes === 'function') component.addAttributes({ [attribute]: identities.createId(kind) });
    children(component).forEach(assignFreshIdentities);
  }
  function addChild(parent, definition, at) {
    const collection = collectionOf(parent);
    let created = null;
    if (collection && typeof collection.add === 'function') created = collection.add(clone(definition), { at });
    else if (parent && typeof parent.append === 'function') {
      const result = parent.append(clone(definition), { at });
      created = Array.isArray(result) ? result[0] : (result && result.models ? result.models[0] : result);
    }
    if (!created) throw error('REPEAT_SYNC_CHILD_ADD_UNSUPPORTED', 'Die Zielkomponente unterstützt das gezielte Hinzufügen von Kindern nicht.', { at });
    assignFreshIdentities(created);
    return created;
  }
  function removeChild(parent, child) {
    if (child && typeof child.remove === 'function') { child.remove(); return; }
    const collection = collectionOf(parent);
    if (collection && typeof collection.remove === 'function') { collection.remove(child); return; }
    throw error('REPEAT_SYNC_CHILD_REMOVE_UNSUPPORTED', 'Die Zielkomponente unterstützt das gezielte Entfernen von Kindern nicht.');
  }
  function moveChild(parent, child, at) {
    const list = children(parent);
    const current = list.indexOf(child);
    if (current === at) return;
    if (child && typeof child.move === 'function') { child.move(parent, { at }); return; }
    const collection = collectionOf(parent);
    if (collection && Array.isArray(collection.models)) {
      collection.models.splice(current, 1);
      collection.models.splice(at, 0, child);
      return;
    }
    throw error('REPEAT_SYNC_CHILD_MOVE_UNSUPPORTED', 'Die Zielkomponente unterstützt das gezielte Verschieben von Kindern nicht.', { from: current, to: at });
  }
  function chooseUnmappedTarget(sourceChild, available, preferredIndex) {
    const compatible = available.filter(item => tagCompatible(sourceChild, snapshot(item)));
    if (!compatible.length) return null;
    const atIndex = compatible.find(item => children(item.parent ? item.parent() : null).indexOf(item) === preferredIndex);
    return atIndex || compatible[0];
  }
  function reconcileRecursive(component, source) {
    if (!tagCompatible(source, snapshot(component))) throw error('REPEAT_SYNC_TAG_MISMATCH', 'Quell- und Zielkomponente besitzen nicht kompatible Tags.');
    const sourceId = sourceIdentity(source);
    setSourceMapping(component, sourceId);
    applyScalar(component, source, false);

    const sourceChildren = source.components || [];
    const targetChildren = children(component).slice();
    const mapped = new Map();
    const unmapped = [];
    targetChildren.forEach(child => {
      const mapping = text(modelValue(child, SOURCE_IDENTITY_PROPERTY));
      if (mapping) {
        if (mapped.has(mapping)) throw error('REPEAT_SYNC_TARGET_MAPPING_DUPLICATE', 'Eine Quellidentität ist im Ziel mehrfach zugeordnet.', { identity: mapping });
        mapped.set(mapping, child);
      } else unmapped.push(child);
    });

    // A source page has no Repeat mapping metadata on its original tree. For
    // reverse synchronization, match canonical source identities directly so
    // the source children are updated instead of being duplicated.
    const structural = new Map();
    targetChildren.forEach(child => {
      const identity = sourceIdentity(snapshot(child));
      if (identity && !structural.has(identity)) structural.set(identity, child);
    });

    const used = new Set();
    const ordered = [];
    sourceChildren.forEach((sourceChild, index) => {
      const identity = sourceIdentity(sourceChild);
      let targetChild = mapped.get(identity) || structural.get(identity) || null;
      if (targetChild && !tagCompatible(sourceChild, snapshot(targetChild))) throw error('REPEAT_SYNC_MAPPED_TAG_MISMATCH', 'Eine bestehende Identity-Zuordnung besitzt einen inkompatiblen Komponententyp.', { identity });
      if (!targetChild) {
        const candidates = unmapped.filter(item => !used.has(item));
        targetChild = chooseUnmappedTarget(sourceChild, candidates, index);
      }
      if (!targetChild) targetChild = addChild(component, cleanDefinition(sourceChild), index);
      setSourceMapping(targetChild, identity);
      used.add(targetChild);
      ordered.push(targetChild);
      reconcileRecursive(targetChild, sourceChild);
    });

    targetChildren.forEach(child => { if (!used.has(child)) removeChild(component, child); });
    ordered.forEach((child, index) => moveChild(component, child, index));
  }
  function replaceChildrenExact(component, definitions) {
    children(component).slice().forEach(child => removeChild(component, child));
    (definitions || []).forEach((definition, index) => addChildExact(component, definition, index));
  }
  function addChildExact(parent, definition, at) {
    const collection = collectionOf(parent);
    let created = null;
    if (collection && typeof collection.add === 'function') created = collection.add(clone(definition), { at });
    else if (parent && typeof parent.append === 'function') {
      const result = parent.append(clone(definition), { at });
      created = Array.isArray(result) ? result[0] : (result && result.models ? result.models[0] : result);
    }
    if (!created) throw error('REPEAT_SYNC_CHILD_ADD_UNSUPPORTED', 'Rollback-Kind konnte nicht wiederhergestellt werden.', { at });
    return created;
  }
  function restoreCompatibleRecursive(component, rollback) {
    applyScalar(component, rollback, true);
    const targetChildren = children(component);
    const rollbackChildren = rollback.components || [];
    rollbackChildren.forEach((child, index) => restoreCompatibleRecursive(targetChildren[index], child));
  }
  function restoreExact(component, rollback) {
    if (!component || !rollback) return;
    if (topologyCompatible(rollback, snapshot(component))) {
      restoreCompatibleRecursive(component, rollback);
      return;
    }
    applyScalar(component, rollback, true);
    replaceChildrenExact(component, rollback.components || []);
  }
  function create(editor) {
    if (!editor) throw new Error('Editor is required.');
    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      readSource(operation) {
        const component = componentByIdentity(editor, operation.sourcePageId, operation.sourceIdentity);
        if (!component) { const failure = new Error('Repeat source not found.'); failure.code = 'REPEAT_SYNC_SOURCE_MISSING'; throw failure; }
        return snapshot(component);
      },
      readTarget(operation) {
        const component = componentByIdentity(editor, operation.targetPageId, operation.targetIdentity);
        if (!component) { const failure = new Error('Repeat target not found.'); failure.code = 'REPEAT_SYNC_TARGET_MISSING'; throw failure; }
        return snapshot(component);
      },
      fingerprint(value) {
        const input = JSON.stringify(semanticSnapshot(value));
        let hash = 2166136261;
        for (let i = 0; i < input.length; i += 1) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619); }
        return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
      },
      compare(source, target) { return JSON.stringify(semanticSnapshot(source)) === JSON.stringify(semanticSnapshot(target)); },
      captureRollback(target) { return clone(target); },
      validateWrite(_operation, source, target) {
        if (!tagCompatible(source, target)) throw error('REPEAT_SYNC_ROOT_TAG_MISMATCH', 'Quell- und Zielwurzel besitzen nicht kompatible Tags.');
        validateSourceTree(source);
        validateTargetMappings(target);
        return true;
      },
      writeTarget(operation, source) {
        const component = componentByIdentity(editor, operation.targetPageId, operation.targetIdentity);
        if (!component) { const failure = new Error('Repeat target not found.'); failure.code = 'REPEAT_SYNC_TARGET_MISSING'; throw failure; }
        validateSourceTree(source);
        validateTargetMappings(snapshot(component));
        reconcileRecursive(component, source);
        return snapshot(component);
      },
      restoreTarget(operation, rollbackToken) {
        const component = componentByIdentity(editor, operation.targetPageId, operation.targetIdentity);
        if (!component) { const failure = new Error('Repeat rollback target not found.'); failure.code = 'REPEAT_SYNC_TARGET_MISSING'; throw failure; }
        restoreExact(component, rollbackToken);
        return snapshot(component);
      },
      readByIdentity(pageId, identity) {
        const component = componentByIdentity(editor, pageId, identity);
        if (!component) { const failure = new Error('Repeat component not found.'); failure.code = 'REPEAT_SYNC_TARGET_MISSING'; throw failure; }
        return snapshot(component);
      },
      writeSnapshot(pageId, identity, sourceSnapshot) {
        const component = componentByIdentity(editor, pageId, identity);
        if (!component) { const failure = new Error('Repeat target not found.'); failure.code = 'REPEAT_SYNC_TARGET_MISSING'; throw failure; }
        validateSourceTree(sourceSnapshot);
        validateTargetMappings(snapshot(component));
        reconcileRecursive(component, sourceSnapshot);
        return snapshot(component);
      },
      restoreByIdentity(pageId, identity, rollbackToken) {
        const component = componentByIdentity(editor, pageId, identity);
        if (!component) { const failure = new Error('Repeat rollback target not found.'); failure.code = 'REPEAT_SYNC_TARGET_MISSING'; throw failure; }
        restoreExact(component, rollbackToken);
        return snapshot(component);
      }
    });
  }
  return Object.freeze({
    SCHEMA_VERSION,
    SOURCE_IDENTITY_PROPERTY,
    create,
    snapshot,
    semanticSnapshot,
    sourceIdentity,
    topologyCompatible,
    tagCompatible,
    validateSourceTree,
    cleanDefinition
  });
});
