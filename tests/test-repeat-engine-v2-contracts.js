const assert = require('assert');
const repeat = require('../editor/js/core/repeat-engine-v2.js');

repeat.reset();
assert.strictEqual(repeat.SCHEMA_VERSION, 3);

const definition = repeat.createDefinition({
  repeatKey: 'global-navigation',
  source: { pageId: 'page-home', rootIdentity: 'ol_section_source', relativeIdentityPath: ['ol_row_source'] },
  scope: 'section'
});
assert.ok(definition.definitionId.startsWith('ol_repeat_def_'));
assert.strictEqual(definition.source.rootIdentity, 'ol_section_source');
assert.ok(Object.isFrozen(definition));

const firstInstance = repeat.createInstance(definition.definitionId, {
  pageId: 'page-contact',
  rootIdentity: 'ol_section_contact'
});
assert.ok(firstInstance.instanceId.startsWith('ol_repeat_inst_'));
assert.notStrictEqual(firstInstance.rootIdentity, definition.source.rootIdentity);
assert.strictEqual(repeat.validateProject().valid, true);

assert.throws(() => repeat.createInstance(definition.definitionId, {
  pageId: 'page-contact',
  rootIdentity: 'ol_section_contact'
}), error => error.code === 'REPEAT_INSTANCE_ROOT_COLLISION');

assert.throws(() => repeat.createInstance(definition.definitionId, {
  pageId: 'page-other',
  rootIdentity: definition.source.rootIdentity
}), error => error.code === 'REPEAT_SOURCE_IDENTITY_REUSED');

const exported = repeat.exportState();
assert.strictEqual(exported.counts.definitions, 1);
assert.strictEqual(exported.counts.instances, 1);
assert.throws(() => { exported.definitions.push({}); }, TypeError);

repeat.reset();
repeat.importState(exported);
assert.strictEqual(repeat.getDefinition(definition.definitionId).repeatKey, 'global-navigation');
assert.strictEqual(repeat.getInstance(firstInstance.instanceId).rootIdentity, 'ol_section_contact');

repeat.reset();
const migrated = repeat.importState({
  schemaVersion: 2,
  definitions: [{
    repeatId: 'ol_repeat_legacy',
    sourcePageId: 'page-old',
    sourceComponentId: 'ol_component_old',
    unitId: 'ol_section_old',
    unitKind: 'section',
    targetPageIds: ['page-target'],
    targetPath: ['ol_section_target'],
    mode: 'context'
  }]
});
assert.strictEqual(migrated.definitions.length, 1);
assert.strictEqual(migrated.instances.length, 0);
assert.strictEqual(migrated.definitions[0].source.rootIdentity, 'ol_section_old');
assert.strictEqual(migrated.definitions[0].metadata.unitIdRetainedAsSourceOnly, true);
assert.deepStrictEqual(migrated.definitions[0].metadata.legacyTargetPageIds, ['page-target']);

assert.throws(() => repeat.apply('ol_repeat_legacy'), error => error.code === 'REPEAT_SYNC_RUNTIME_NOT_BOUND');

const projectData = repeat.decorateProjectData({ pages: [] });
assert.strictEqual(projectData.oluntir.repeatEngineSchemaVersion, 3);
assert.strictEqual(projectData.oluntir.repeatEngine.schemaVersion, 3);

console.log('Repeat Engine V2 contracts: OK');
