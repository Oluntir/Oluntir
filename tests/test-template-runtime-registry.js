'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const runtimePath = path.join(root, 'editor/js/core/template-runtime.js');
delete require.cache[require.resolve(runtimePath)];
const runtime = require(runtimePath);
const registry = JSON.parse(fs.readFileSync(path.join(root, 'templates/registry.json'), 'utf8'));

async function run() {
  const loadScript = async (url) => {
    const target = path.join(root, url.replace(/\//g, path.sep));
    if (!fs.existsSync(target)) throw new Error(`missing: ${url}`);
    const context = { window: { OluntirTemplateRuntime: runtime }, console };
    context.globalThis = context.window;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(target, 'utf8'), context, { filename: target });
  };

  const result = await runtime.loadRegistry(registry, { loadScript });
  assert.deepStrictEqual(result.loaded, ['runtime-test']);
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
  assert.ok(profiles['template-runtime-test'], 'Statisches Template muss als eigenes Profil verfügbar sein.');
  assert.strictEqual(profiles['template-runtime-test'].baseFramework, 'bs4');
  assert.ok(profiles['template-runtime-test'].canvasStyles.includes('templates/runtime-test/css/template.css'));

  const blocks = [];
  const connected = runtime.connect({ BlockManager: { add(id, options) { blocks.push({ id, options }); } } }, profiles['template-runtime-test']);
  assert.strictEqual(connected.connected, true);
  assert.strictEqual(connected.added, 1);
  assert.strictEqual(blocks[0].id, 'template-runtime-test-hero');
  assert.ok(blocks[0].options.content.includes('Oluntir 2.3.0 Template Runtime'));

  const missingRegistry = {
    schemaVersion: 1,
    templates: registry.templates.concat([{ id: 'manually-deleted', name: 'Manuell gelöscht', folder: 'manually-deleted', entry: 'template.js', enabled: true }])
  };
  const missingResult = await runtime.loadRegistry(missingRegistry, { loadScript });
  assert.ok(missingResult.loaded.includes('runtime-test'));
  assert.strictEqual(missingResult.missing.length, 1);
  assert.strictEqual(missingResult.missing[0].id, 'manually-deleted');

  console.log('TEMPLATE-RUNTIME-REGISTRY-TEST ERFOLGREICH');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
