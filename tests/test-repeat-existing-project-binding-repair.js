'use strict';

const assert = require('assert');
const repeat = require('../editor/js/core/repeat-engine-v2.js');

function makeComponent(tagName, attributes, modelValues, children) {
  const attrs = Object.assign({}, attributes || {});
  const values = Object.assign({ tagName: tagName, type: '' }, modelValues || {});
  const childList = children || [];
  let parentRef = null;
  const component = {
    get(name) { return values[name]; },
    set(name, value) { values[name] = value; },
    getAttributes() { return Object.assign({}, attrs); },
    addAttributes(next) { Object.assign(attrs, next || {}); },
    getClasses() { return []; },
    components() { return { models: childList }; },
    parent() { return parentRef; },
    _setParent(parent) { parentRef = parent; }
  };
  childList.forEach(child => child._setParent(component));
  return component;
}

const sourceSection = makeComponent('section', {
  'data-oluntir-section-id': 'ol_section_source_current',
  'data-oluntir-repeat-id': 'repeat-existing'
});
const sourceBody = makeComponent('body', { 'data-oluntir-page-id': 'page-source' }, {}, [sourceSection]);
const targetSection = makeComponent('section', {
  'data-oluntir-section-id': 'ol_section_target_current'
}, { oluntirRepeatSourceIdentity: 'ol_section_source_current' });
const targetBody = makeComponent('body', { 'data-oluntir-page-id': 'page-target' }, {}, [targetSection]);

function makePage(id, root) {
  const values = { oluntirPageId: id };
  return {
    get(name) { return values[name]; },
    set(name, value) { values[name] = value; },
    getMainComponent() { return root; }
  };
}

const sourcePage = makePage('page-source', sourceBody);
const targetPage = makePage('page-target', targetBody);
const editor = {
  Pages: {
    getAll() { return [sourcePage, targetPage]; },
    getSelected() { return sourcePage; }
  },
  on() {},
  trigger() {}
};

repeat.reset();
repeat.bind(editor);
const imported = repeat.importState({
  schemaVersion: 3,
  definitions: [{
    definitionId: 'def-existing',
    repeatKey: 'repeat-existing',
    synchronizationPolicy: 'manual',
    source: { pageId: 'page-source', rootIdentity: 'ol_section_source_stale', relativeIdentityPath: [] },
    metadata: { migratedFromSchemaVersion: 2, unitIdRetainedAsSourceOnly: true }
  }],
  instances: [{
    instanceId: 'inst-existing',
    definitionId: 'def-existing',
    pageId: 'page-target',
    rootIdentity: 'ol_section_target_stale',
    state: 'active'
  }]
});

assert.strictEqual(imported.definitions[0].source.rootIdentity, 'ol_section_source_current', 'Die Quellenbindung muss über den vorhandenen Repeat-Marker auf die aktuelle stabile ID repariert werden.');
assert.strictEqual(imported.instances[0].rootIdentity, 'ol_section_target_current', 'Die Instanzbindung muss über oluntirRepeatSourceIdentity auf die aktuelle stabile ID repariert werden.');
assert.strictEqual(imported.definitions[0].synchronizationPolicy, 'automatic');
assert.strictEqual(imported.definitions[0].metadata.bindingCompatibilityRepaired, true);
assert.strictEqual(imported.instances[0].metadata.bindingCompatibilityRepaired, true);

repeat.reset();
const recoveredLegacy = repeat.importState({
  schemaVersion: 2,
  definitions: [{
    repeatId: 'repeat-existing',
    sourcePageId: 'page-source',
    unitId: 'ol_section_source_current',
    sourceComponentId: 'ol_section_source_current',
    unitKind: 'section',
    targetPageIds: ['page-target'],
    targetPath: ['legacy-path'],
    mode: 'context'
  }]
});
assert.strictEqual(recoveredLegacy.definitions[0].synchronizationPolicy, 'automatic');
assert.strictEqual(recoveredLegacy.instances.length, 1, 'Eine alte Schema-2-Instanz muss ausschließlich über den vorhandenen Oluntir-Quellmarker rekonstruiert werden.');
assert.strictEqual(recoveredLegacy.instances[0].pageId, 'page-target');
assert.strictEqual(recoveredLegacy.instances[0].rootIdentity, 'ol_section_target_current');
assert.strictEqual(recoveredLegacy.instances[0].metadata.recoveredFromLegacyMarker, true);

console.log('REPEAT-EXISTING-PROJECT-BINDING-REPAIR-TEST ERFOLGREICH');
