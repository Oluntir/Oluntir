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
assert.strictEqual(definition.correlationId, definition.definitionId);
assert.strictEqual(definition.source.rootIdentity, 'ol_section_source');
assert.ok(Object.isFrozen(definition));

const firstInstance = repeat.createInstance(definition.definitionId, {
  pageId: 'page-contact',
  rootIdentity: 'ol_section_contact'
});
assert.ok(firstInstance.instanceId.startsWith('ol_repeat_inst_'));
assert.strictEqual(firstInstance.correlationId, definition.definitionId);
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
const duplicateState = repeat.importState({
  schemaVersion: 3,
  definitions: [
    { definitionId: 'def-a', repeatKey: 'same-source-a', source: { pageId: 'page-home', rootIdentity: 'ol_section_same' } },
    { definitionId: 'def-b', repeatKey: 'same-source-b', source: { pageId: 'page-home', rootIdentity: 'ol_section_same' } }
  ],
  instances: [{ instanceId: 'inst-b', definitionId: 'def-b', pageId: 'page-contact', rootIdentity: 'ol_section_target' }]
});
assert.strictEqual(duplicateState.definitions.length, 1);
assert.strictEqual(duplicateState.instances[0].definitionId, 'def-a');

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
assert.strictEqual(migrated.definitions[0].synchronizationPolicy, 'automatic');
assert.strictEqual(migrated.definitions[0].metadata.automaticSynchronizationUpgraded, true);

repeat.reset();
const migratedV18Project = repeat.importState({
  schemaVersion: 3,
  definitions: [{
    definitionId: 'def-v18-legacy',
    repeatKey: 'repeat-v18-legacy',
    synchronizationPolicy: 'manual',
    source: { pageId: 'page-source', rootIdentity: 'ol_section_source' },
    metadata: { migratedFromSchemaVersion: 2, unitIdRetainedAsSourceOnly: true, legacyMode: 'context' }
  }],
  instances: [{
    instanceId: 'inst-v18-legacy',
    definitionId: 'def-v18-legacy',
    pageId: 'page-target',
    rootIdentity: 'ol_section_instance'
  }]
});
assert.strictEqual(migratedV18Project.definitions[0].synchronizationPolicy, 'automatic');
assert.strictEqual(migratedV18Project.definitions[0].metadata.automaticSynchronizationUpgraded, true);
assert.strictEqual(migratedV18Project.instances.length, 1);

repeat.reset();
const explicitManual = repeat.importState({
  schemaVersion: 3,
  definitions: [{
    definitionId: 'def-explicit-manual',
    repeatKey: 'repeat-explicit-manual',
    synchronizationPolicy: 'manual',
    source: { pageId: 'page-source', rootIdentity: 'ol_section_manual' },
    metadata: { repeatType: 'explicit-repeat' }
  }],
  instances: []
});
assert.strictEqual(explicitManual.definitions[0].synchronizationPolicy, 'manual');

repeat.reset();
const linkedManual = repeat.importState({
  schemaVersion: 3,
  definitions: [{
    definitionId: 'def-linked-manual',
    repeatKey: 'repeat-linked-manual',
    synchronizationPolicy: 'manual',
    source: { pageId: 'page-source', rootIdentity: 'ol_section_linked' },
    metadata: { repeatType: 'explicit-repeat' }
  }],
  instances: [{
    instanceId: 'inst-linked-manual',
    definitionId: 'def-linked-manual',
    pageId: 'page-target',
    rootIdentity: 'ol_section_linked_instance'
  }]
});
assert.strictEqual(linkedManual.definitions[0].synchronizationPolicy, 'automatic');
assert.strictEqual(linkedManual.definitions[0].metadata.automaticSynchronizationUpgradeReason, 'linked-instance-import');

repeat.reset();
const explicitOptOut = repeat.importState({
  schemaVersion: 3,
  definitions: [{
    definitionId: 'def-linked-explicit-manual',
    repeatKey: 'repeat-linked-explicit-manual',
    synchronizationPolicy: 'manual',
    source: { pageId: 'page-source', rootIdentity: 'ol_section_linked_explicit' },
    metadata: { repeatType: 'explicit-repeat', manualSynchronizationExplicit: true }
  }],
  instances: [{
    instanceId: 'inst-linked-explicit-manual',
    definitionId: 'def-linked-explicit-manual',
    pageId: 'page-target',
    rootIdentity: 'ol_section_linked_explicit_instance'
  }]
});
assert.strictEqual(explicitOptOut.definitions[0].synchronizationPolicy, 'manual');

assert.throws(() => repeat.apply('ol_repeat_legacy'), error => error.code === 'REPEAT_SYNC_RUNTIME_MISSING');

const projectData = repeat.decorateProjectData({ pages: [] });
assert.strictEqual(projectData.oluntir.repeatEngineSchemaVersion, 3);
assert.strictEqual(projectData.oluntir.repeatEngine.schemaVersion, 3);

console.log('Repeat Engine V2 contracts: OK');
