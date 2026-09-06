'use strict';
const assert = require('assert');

function makeComponent(tagName, attributes, modelValues, children) {
  const attrs = Object.assign({}, attributes || {});
  const values = Object.assign({ tagName, type: '' }, modelValues || {});
  const childList = children || [];
  let parentRef = null;
  const component = {
    get(name) { return values[name]; },
    set(name, value) { values[name] = value; },
    getAttributes() { return Object.assign({}, attrs); },
    addAttributes(next) { Object.assign(attrs, next || {}); },
    components() { return { models: childList }; },
    parent() { return parentRef; },
    _setParent(parent) { parentRef = parent; }
  };
  childList.forEach(child => child._setParent(component));
  return component;
}

function makePage(id, children) {
  const body = makeComponent('body', { 'data-oluntir-page-id': id }, {}, children);
  const values = { oluntirPageId: id };
  return {
    id,
    get(name) { return values[name] || (name === 'id' ? id : undefined); },
    set(name, value) { values[name] = value; },
    getMainComponent() { return body; }
  };
}

// Simulates an older persisted project where data-oluntir-repeat-id disappeared,
// but the stable Repeat instance marker + source correlation survived.
const source = makeComponent('section', {
  'data-oluntir-section-id': 'ol_source',
  'data-oluntir-repeat-instance-id': 'inst-source',
  'data-oluntir-repeat-name': 'Kartenliste'
}, { oluntirRepeatSourceIdentity: 'ol_source' });
const target = makeComponent('section', {
  'data-oluntir-section-id': 'ol_target',
  'data-oluntir-repeat-instance-id': 'inst-target'
}, { oluntirRepeatSourceIdentity: 'ol_source' });
const pageA = makePage('page-a', [source]);
const pageB = makePage('page-b', [target]);
const editor = {
  Pages: { getAll() { return [pageA, pageB]; }, getSelected() { return pageA; } },
  on() {},
  trigger() {}
};

global.OluntirPersistProjectSoon = () => {};
global.OluntirLogger = { info() {}, error() {} };
const repeat = require('../editor/js/core/repeat-engine-v2.js');
repeat.reset();
repeat.bind(editor);

// Legacy shared-layout definitions may still exist in older projects. They must
// not block recovery of user-created explicit Repeat families.
repeat.createDefinition({
  definitionId: 'legacy-footer-def',
  repeatKey: 'legacy-footer-repeat',
  source: { pageId: 'page-a', rootIdentity: 'legacy-footer-root', relativeIdentityPath: [] },
  scope: 'section',
  synchronizationPolicy: 'manual',
  metadata: { repeatType: 'shared-layout', regionRole: 'footer' }
});

const report = repeat.recoverFromCurrentProjectMarkers({ source: 'test-fallback-instance-source-correlation' });
assert.strictEqual(report.recovered, true, 'Instance/source correlation must recover the explicit Repeat family even without repeat-id.');
assert.strictEqual(report.definitionsRecovered, 1, 'Exactly one user Repeat family must be recovered beside the legacy shared-layout definition.');
assert.strictEqual(report.instancesRecovered, 2, 'Both materialized roots must be recovered as family instances.');

const explicit = repeat.getDefinitions().find(item => !(item.metadata && (item.metadata.repeatType === 'shared-layout' || item.metadata.regionRole)));
assert.ok(explicit, 'Recovered explicit Repeat family must exist.');
assert.strictEqual(explicit.metadata.displayName, 'Kartenliste', 'Persisted human-readable name must survive fallback recovery.');
assert.strictEqual(explicit.source.pageId, 'page-a');
assert.strictEqual(explicit.source.rootIdentity, 'ol_source');
assert.strictEqual(repeat.getInstances(explicit.definitionId).length, 2);
assert.ok(source.getAttributes()['data-oluntir-repeat-id'], 'Recovery must restamp the missing family marker on source root.');
assert.strictEqual(source.getAttributes()['data-oluntir-repeat-id'], target.getAttributes()['data-oluntir-repeat-id'], 'Recovered instances must receive one stable family marker.');

console.log('REPEAT-PROJECT-MARKER-FALLBACK-RECOVERY-TEST ERFOLGREICH');
