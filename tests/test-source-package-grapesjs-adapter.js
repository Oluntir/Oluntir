'use strict';

const assert = require('assert');
const adapter = require('../editor/js/core/source-package-grapesjs-adapter.js');

const manifest = { kind: 'oluntir-source-package', packageId: 'pkg-a', sourceHash: 'hash-a', frameworkId: 'bootstrap5', displayName: 'Bootstrap 5' };
const profile = {
  kind: 'oluntir-source-framework-profile', profileId: 'source-profile:pkg-a:hash-a',
  sourcePackageId: 'pkg-a', sourceHash: 'hash-a', metadata: { sourceBound: true, reusable: false }
};
const added = [];
const bridge = {
  loadSourceProfile: async () => profile,
  registerSourceBlocks: async () => { added.push(true); return { added: 2, skipped: 1 }; }
};

(async () => {
  const result = await adapter.connect({ BlockManager: {} }, manifest, { bridge });
  assert.strictEqual(result.connected, true);
  assert.strictEqual(result.blocks.added, 2);
  assert.strictEqual(result.mutationPerformed, false);
  assert.strictEqual(result.executionEnabled, false);
  assert.strictEqual(result.policy.sourceOfTruth, 'source-package');
  assert.strictEqual(result.policy.insertion, 'user-insert-only');
  assert.strictEqual(added.length, 1);
  const analysisOnly = await adapter.connect({ BlockManager: {} }, Object.assign({}, manifest, { frameworkId: 'other-framework' }), { bridge });
  assert.strictEqual(analysisOnly.connected, false);
  assert(analysisOnly.issues.some(item => item.code === 'GRAPESJS_SOURCE_FRAMEWORK_ANALYSIS_ONLY'));
  const blocked = await adapter.connect({ BlockManager: {} }, manifest, { bridge, sourceProfile: Object.assign({}, profile, { sourceHash: 'other' }) });
  assert.strictEqual(blocked.connected, false);
  assert(blocked.issues.some(item => item.code === 'GRAPESJS_SOURCE_PROFILE_HASH_MISMATCH'));
  console.log('SOURCE-PACKAGE-GRAPESJS-ADAPTER-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exitCode = 1; });
