'use strict';

const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '..');
const runtimePath = path.join(root, 'editor/js/core/template-runtime.js');
delete require.cache[require.resolve(runtimePath)];
const runtime = require(runtimePath);

async function run() {
  // The distribution registry is intentionally empty. Runtime behavior is tested
  // with an in-memory fixture so no synthetic user template has to ship in
  // templates/.
  const registry = {
    schemaVersion: 1,
    templates: [
      { id: 'fixture-template', name: 'Fixture Template', folder: 'fixture-template', entry: 'template.js', enabled: true }
    ]
  };

  const loadScript = async (url) => {
    if (url !== 'templates/fixture-template/template.js') throw new Error(`missing: ${url}`);
    runtime.define({
      id: 'fixture-template',
      label: 'Fixture Template',
      version: '1.0.0',
      baseFramework: 'bs4',
      basePath: 'templates/fixture-template/',
      styles: ['css/template.css'],
      components: [{ id: 'hero', label: 'Hero', content: '<section>Fixture Hero</section>' }]
    });
  };

  const result = await runtime.loadRegistry(registry, { loadScript });
  assert.deepStrictEqual(result.loaded, ['fixture-template']);
  assert.strictEqual(result.missing.length, 0);

  const profiles = runtime.extendProfiles({
    bs4: {
      id: 'bs4', label: 'Bootstrap 4', canvasStyles: ['frameworks/bootstrap4/css/bootstrap.min.css'],
      canvasScripts: ['frameworks/bootstrap4/js/bootstrap.bundle.min.js'], exportAssets: { css: ['frameworks/bootstrap4/css/bootstrap.min.css'], js: ['frameworks/bootstrap4/js/bootstrap.bundle.min.js'] }
    },
    bs5: {
      id: 'bs5', label: 'Bootstrap 5', canvasStyles: [], canvasScripts: [], exportAssets: { css: [], js: [] }
    }
  });
  assert.ok(profiles['template-fixture-template'], 'Statisches Template muss als eigenes Profil verfügbar sein.');
  assert.strictEqual(profiles['template-fixture-template'].baseFramework, 'bs4');
  assert.ok(profiles['template-fixture-template'].canvasStyles.includes('templates/fixture-template/css/template.css'));

  const blocks = [];
  const connected = runtime.connect({ BlockManager: { add(id, options) { blocks.push({ id, options }); } } }, profiles['template-fixture-template']);
  assert.strictEqual(connected.connected, true);
  assert.strictEqual(connected.added, 1);
  assert.strictEqual(blocks[0].id, 'template-fixture-template-hero');
  assert.ok(blocks[0].options.content.includes('Fixture Hero'));

  const missingRegistry = {
    schemaVersion: 1,
    templates: registry.templates.concat([{ id: 'manually-deleted', name: 'Manuell gelöscht', folder: 'manually-deleted', entry: 'template.js', enabled: true }])
  };
  const missingResult = await runtime.loadRegistry(missingRegistry, { loadScript });
  assert.ok(missingResult.loaded.includes('fixture-template'));
  assert.strictEqual(missingResult.missing.length, 1);
  assert.strictEqual(missingResult.missing[0].id, 'manually-deleted');

  console.log('TEMPLATE-RUNTIME-REGISTRY-TEST ERFOLGREICH');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
