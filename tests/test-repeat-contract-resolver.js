const assert = require('assert');

function collection(items) {
  return {
    models: items,
    forEach(callback) { items.forEach(callback); },
    map(callback) { return items.map(callback); }
  };
}

function identityAttribute(tagName, classes) {
  if (tagName === 'body') return 'data-oluntir-page-id';
  if (tagName === 'section') return 'data-oluntir-section-id';
  if ((classes || []).includes('row')) return 'data-oluntir-row-id';
  return 'data-oluntir-component-id';
}

function component(identity, tagName, children = [], classes = []) {
  return {
    getAttributes() { return { [identityAttribute(tagName, classes)]: identity }; },
    get(key) {
      if (key === 'tagName') return tagName;
      if (key === 'type') return '';
      return null;
    },
    getClasses() { return classes; },
    components() { return collection(children); }
  };
}

function page(id, root) {
  return {
    get(key) { return key === 'oluntirPageId' ? id : null; },
    getMainComponent() { return root; }
  };
}

const sectionChild = component('ol_row_source', 'div', [], ['row']);
const sourceSection = component('ol_section_source', 'section', [sectionChild]);
const sourceRoot = component('ol_page_home', 'body', [sourceSection]);
const targetSection = component('ol_section_contact', 'section', []);
const targetRoot = component('ol_page_contact', 'body', [targetSection]);
const home = page('page-home', sourceRoot);
const contact = page('page-contact', targetRoot);
const editor = { Pages: { getAll() { return [home, contact]; } } };

global.OluntirLayoutIdentities = require('../editor/js/core/layout-identities.js');
global.OluntirSemanticDictionary = require('../editor/js/core/semantic-dictionary.js');
global.OluntirIdentityResolver = require('../editor/js/core/identity-resolver.js');
global.OluntirContextResolver = require('../editor/js/core/context-resolver.js');
global.OluntirStructureResolver = require('../editor/js/core/structure-resolver.js');
global.OluntirRelationshipResolver = require('../editor/js/core/relationship-resolver.js');
const repeat = require('../editor/js/core/repeat-engine-v2.js');
global.OluntirRepeatEngineV2 = repeat;
const resolver = require('../editor/js/core/repeat-contract-resolver.js');

repeat.reset();
const definition = repeat.createDefinition({
  repeatKey: 'section-repeat',
  source: {
    pageId: 'page-home',
    rootIdentity: 'ol_section_source',
    relativeIdentityPath: ['ol_row_source']
  },
  scope: 'section'
});
const instance = repeat.createInstance(definition.definitionId, {
  pageId: 'page-contact',
  rootIdentity: 'ol_section_contact'
});

const snapshotBefore = JSON.stringify(repeat.snapshot());
const resolved = resolver.resolveProject(editor);
assert.strictEqual(resolved.valid, true);
assert.strictEqual(resolved.definitionCount, 1);
assert.strictEqual(resolved.instanceCount, 1);
assert.strictEqual(resolved.resolvedDefinitionCount, 1);
assert.strictEqual(resolved.definitions[0].source.status, resolver.BINDING_STATUS.RESOLVED);
assert.strictEqual(resolved.definitions[0].source.terminalNode.identity, 'ol_row_source');
assert.strictEqual(resolved.definitions[0].instances[0].instance.instanceId, instance.instanceId);
assert.strictEqual(resolved.definitions[0].instances[0].binding.status, resolver.BINDING_STATUS.RESOLVED);
assert.ok(Object.isFrozen(resolved));
assert.strictEqual(JSON.stringify(repeat.snapshot()), snapshotBefore, 'Resolver must not mutate repeat state.');

repeat.updateDefinition(definition.definitionId, {
  source: {
    pageId: 'page-home',
    rootIdentity: 'ol_section_source',
    relativeIdentityPath: ['missing-child']
  }
});
const invalid = resolver.resolveDefinition(editor, definition.definitionId);
assert.strictEqual(invalid.resolved, false);
assert.strictEqual(invalid.source.status, resolver.BINDING_STATUS.INVALID_PATH);
assert.strictEqual(invalid.issues[0].code, 'REPEAT_BINDING_PATH_INVALID');

console.log('Repeat Contract Resolver DEV_002: OK');
