'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const values = new Map();
const localStorage = { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)) };
const context = { window: {}, localStorage, URLSearchParams, location: { search: '', protocol: 'http:', origin: 'http://127.0.0.1:51544' }, fetch: async () => ({ ok: true, json: async () => ({ packages: [] }) }) };
vm.runInNewContext(fs.readFileSync('editor/js/core/source-package-bridge.js', 'utf8'), context);
const bridge = context.window.OluntirSourcePackageBridge;
assert.strictEqual(bridge.isEditorSupported({ frameworkId: 'other-framework' }), false);
assert.strictEqual(bridge.isEditorSupported({ frameworkId: 'bootstrap5' }), true);
const manifest = {
  kind: 'oluntir-source-package', packageId: 'bootstrap5-demo-a1b2c3', frameworkId: 'bootstrap5',
  displayName: 'Bootstrap 5 Demo', version: '5.3.8', entrypoints: { styles: ['css/bootstrap.css'], scripts: ['js/bootstrap.js'] }
};
bridge.register(manifest);
const profiles = bridge.extendProfiles({});
assert(profiles['source-bootstrap5-demo-a1b2c3']);
assert.strictEqual(profiles['source-bootstrap5-demo-a1b2c3'].canvasStyles[0], 'http://127.0.0.1:51544/api/source-packages/bootstrap5-demo-a1b2c3/files/css/bootstrap.css');
assert.strictEqual(profiles['source-bootstrap5-demo-a1b2c3'].canvasScripts.length, 0);
assert.strictEqual(profiles['source-bootstrap5-demo-a1b2c3'].runtime.enabledScripts.length, 0);
assert.strictEqual(typeof bridge.loadSourceProfile, 'function');
const enabledProfile = bridge.toFrameworkProfile(manifest, { enabledScripts: ['js/bootstrap.js', 'js/not-available.js'] });
assert.strictEqual(JSON.stringify(enabledProfile.canvasScripts), JSON.stringify(['http://127.0.0.1:51544/api/source-packages/bootstrap5-demo-a1b2c3/files/js/bootstrap.js']));
assert.strictEqual(Object.prototype.hasOwnProperty.call(profiles['source-bootstrap5-demo-a1b2c3'], 'unitId'), false);
assert.strictEqual(bridge.fileUrl(manifest, 'img/logo.svg', { session: 'local-test' }), 'http://127.0.0.1:51544/api/source-packages/bootstrap5-demo-a1b2c3/files/img/logo.svg?session=local-test');
const selectedManifest = Object.assign({}, manifest, { runtime: { enabledStyles: ['css/selected.css'], enabledScripts: [] }, entrypoints: { styles: ['css/debug.css', 'css/selected.css'], scripts: ['js/bootstrap.js'] } });
const selectedProfile = bridge.toFrameworkProfile(selectedManifest);
assert.deepStrictEqual(selectedProfile.runtime.enabledStyles, ['css/selected.css']);
assert.deepStrictEqual(selectedProfile.canvasStyles, ['http://127.0.0.1:51544/api/source-packages/bootstrap5-demo-a1b2c3/files/css/selected.css']);

(async () => {
  const added = [];
  const result = await bridge.registerSourceBlocks({ BlockManager: { get: () => null, add: (id, value) => added.push({ id, value }) } }, {
    kind: 'oluntir-source-package', packageId: 'bootstrap5-demo-a1b2c3', frameworkId: 'bootstrap5', displayName: 'Bootstrap 5 Demo',
    components: [{ componentId: 'source-component:hero', label: 'Hero', html: '<section class="hero"><img src="img/logo.svg">Hero</section>', assetReferences: [{ original: 'img/logo.svg', sourcePath: 'img/logo.svg' }], source: { document: 'index.html' } }]
  });
  assert.strictEqual(result.added, 1);
  assert.strictEqual(added[0].value.content, '<section class="hero"><img src="http://127.0.0.1:51544/api/source-packages/bootstrap5-demo-a1b2c3/files/img/logo.svg">Hero</section>');
  assert.strictEqual(added[0].value.category, 'Source · Bootstrap 5 Demo');
  console.log('SOURCE-PACKAGE-BRIDGE-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exitCode = 1; });
