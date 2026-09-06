'use strict';

const assert = require('assert');
const repeat = require('../editor/js/core/repeat-engine-v2.js');

repeat.reset();
const imported = repeat.importState({
  schemaVersion: 3,
  definitions: [{
    definitionId: 'def-existing-v18',
    repeatKey: 'repeat-existing-v18',
    synchronizationPolicy: 'manual',
    source: { pageId: 'page-source', rootIdentity: 'ol_section_source', relativeIdentityPath: [] },
    metadata: {
      migratedFromSchemaVersion: 2,
      unitIdRetainedAsSourceOnly: true,
      legacyMode: 'context'
    }
  }],
  instances: [{
    instanceId: 'inst-existing-v18',
    definitionId: 'def-existing-v18',
    pageId: 'page-target',
    rootIdentity: 'ol_section_target'
  }]
});

assert.strictEqual(imported.definitions[0].synchronizationPolicy, 'automatic', 'Migrierte v18-Definition muss beim Import automatisch synchronisierbar werden.');

function component(identity, parent) {
  return {
    getAttributes() { return { 'data-oluntir-section-id': identity }; },
    parent() { return parent || null; }
  };
}

const sourceRoot = component('ol_section_source', null);
const sourceChild = component('ol_component_child', sourceRoot);
const sourcePage = { id: 'page-source' };
const targetPage = { id: 'page-target' };

global.OluntirRepeatEngineV2 = repeat;
global.OluntirLayoutIdentities = {
  ATTR: {
    page: 'data-oluntir-page-id',
    section: 'data-oluntir-section-id',
    component: 'data-oluntir-component-id'
  },
  pageId(page) { return page && page.id; },
  findById(page, identity) {
    if (page === sourcePage && identity === 'ol_section_source') return sourceRoot;
    return null;
  }
};

const handlers = new Map();
const editor = {
  Pages: {
    getSelected() { return sourcePage; },
    getAll() { return [sourcePage, targetPage]; }
  },
  on(name, handler) { handlers.set(name, handler); }
};

const auto = require('../editor/js/core/repeat-auto-synchronization.js');
auto.bind(editor, { delayMs: 25 });
const bindings = auto._sourceDefinitionsFor(sourceChild);
assert.strictEqual(bindings.length, 1, 'Eine Änderung innerhalb der migrierten v18-Quelle muss wieder einen Auto-Sync-Binding erzeugen.');
assert.strictEqual(bindings[0].definitionId, 'def-existing-v18');
assert.strictEqual(bindings[0].synchronizationPolicy, 'automatic');

console.log('REPEAT-EXISTING-PROJECT-AUTO-UPGRADE-TEST ERFOLGREICH');
