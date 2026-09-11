'use strict';
const assert = require('assert');

global.OluntirPersistProjectSoon = () => {};
const engine = require('../editor/js/core/repeat-engine-v2.js');
engine.reset();

const definition = engine.createDefinition({
  definitionId: 'def-library',
  repeatKey: 'repeat-library',
  source: { pageId: 'page-a', rootIdentity: 'root-a', relativeIdentityPath: [] },
  scope: 'section',
  synchronizationPolicy: 'manual',
  metadata: { displayName: 'Kartenliste', centralLibraryMode: true, manualSynchronizationExplicit: true }
});
const a = engine.createInstance(definition.definitionId, { instanceId:'inst-a', pageId:'page-a', rootIdentity:'root-a', appliedRevision:1 });
const b = engine.createInstance(definition.definitionId, { instanceId:'inst-b', pageId:'page-b', rootIdentity:'root-b', appliedRevision:1 });

const sourceSnapshot = { tagName:'section', attributes:{class:'cards'}, oluntirRepeatSourceIdentity:'root-a', components:[] };
const result = engine.commitLibraryPublication(definition.definitionId, {
  libraryPublishedSnapshot: sourceSnapshot,
  libraryDraftSnapshot: sourceSnapshot,
  libraryPublishedRevision: 2,
  libraryDraftRevision: 2,
  libraryDirty: false
}, [
  { instanceId:a.instanceId, appliedRevision:2, appliedFingerprint:'abc' },
  { instanceId:b.instanceId, appliedRevision:2, appliedFingerprint:'abc' }
]);

assert.strictEqual(result.definition.synchronizationPolicy, 'manual');
assert.strictEqual(result.definition.metadata.centralLibraryMode, true);
assert.strictEqual(result.definition.metadata.manualSynchronizationExplicit, true);
assert.strictEqual(result.definition.metadata.libraryPublishedRevision, 2);
assert.strictEqual(result.instances.length, 2);
assert.ok(result.instances.every(item => item.appliedRevision === 2));

const decorated = engine.decorateProjectData({
  pages: [
    { id:'page-a', name:'A' },
    { id:'oluntir-repeat-workspace', oluntirInternalPage:'repeat-workspace' },
    { id:'page-b', name:'B' }
  ]
});
assert.deepStrictEqual(decorated.pages.map(page => page.id), ['page-a','page-b']);
assert.strictEqual(decorated.oluntir.repeatArchitecture, 'central-library-manual-publish');
assert.strictEqual(decorated.oluntir.repeatEngine.definitions[0].metadata.libraryPublishedRevision, 2);

console.log('REPEAT-CENTRAL-LIBRARY-CONTRACT-TEST ERFOLGREICH');
