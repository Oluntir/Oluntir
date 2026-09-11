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

const source = makeComponent('section', {
  'data-oluntir-section-id': 'ol_source',
  'data-oluntir-repeat-id': 'repeat-hero',
  'data-oluntir-repeat-instance-id': 'inst-source',
  'data-oluntir-repeat-name': 'Hero1'
}, { oluntirRepeatSourceIdentity: 'ol_source' });
const target = makeComponent('section', {
  'data-oluntir-section-id': 'ol_target',
  'data-oluntir-repeat-id': 'repeat-hero',
  'data-oluntir-repeat-instance-id': 'inst-target'
}, { oluntirRepeatSourceIdentity: 'ol_source' });
const fakeFooterRepeat = makeComponent('section', {
  'data-oluntir-section-id': 'ol_footer_fake',
  'data-oluntir-repeat-id': 'repeat-footer-legacy'
});
const footer = makeComponent('footer', {}, {}, [fakeFooterRepeat]);
const pageA = makePage('page-a', [source, footer]);
const pageB = makePage('page-b', [target]);
const listeners = {};
const editor = {
  Pages: { getAll() { return [pageA, pageB]; }, getSelected() { return pageA; } },
  on(name, fn) { (listeners[name] ||= []).push(fn); },
  trigger() {}
};

global.OluntirPersistProjectSoon = () => {};
global.OluntirLogger = { info() {}, error() {} };
const repeat = require('../editor/js/core/repeat-engine-v2.js');
repeat.reset();
repeat.bind(editor);

assert.strictEqual(repeat.getDefinitions().length, 0, 'Ausgangslage muss fehlende Repeat-Metadaten simulieren.');
const report = repeat.recoverFromCurrentProjectMarkers({ source: 'test-existing-project' });
assert.strictEqual(report.recovered, true, 'Vorhandene Seitenmarker müssen eine verlorene Repeat-Familie rekonstruieren.');
assert.strictEqual(report.definitionsRecovered, 1, 'Genau eine echte Repeat-Familie muss rekonstruiert werden.');
assert.strictEqual(report.instancesRecovered, 2, 'Beide materialisierten Seitenvorkommen müssen als Instanzen rekonstruiert werden.');

const definition = repeat.getDefinitions()[0];
assert.strictEqual(definition.repeatKey, 'repeat-hero');
assert.strictEqual(definition.metadata.displayName, 'Hero1', 'Persistenter Repeat-Name muss für die Listenanzeige erhalten bleiben.');
assert.strictEqual(definition.metadata.centralLibraryMode, true);
assert.strictEqual(definition.source.pageId, 'page-a');
assert.strictEqual(definition.source.rootIdentity, 'ol_source');
assert.strictEqual(repeat.getInstances(definition.definitionId).length, 2);
assert.ok(!repeat.getDefinitions().some(item => item.repeatKey === 'repeat-footer-legacy'), 'Marker innerhalb Footer/Nav/Header dürfen nicht als Repeat-Bibliotheksfamilie rekonstruiert werden.');

const decorated = repeat.decorateProjectData({ pages: [] });
assert.strictEqual(decorated.oluntir.repeatEngine.definitions.length, 1, 'Rekonstruierter Zustand muss beim nächsten Speichern wieder persistent werden.');
assert.strictEqual(decorated.oluntir.repeatEngine.instances.length, 2);

console.log('REPEAT-PROJECT-MARKER-RECOVERY-TEST ERFOLGREICH');
