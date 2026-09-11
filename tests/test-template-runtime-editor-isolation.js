
'use strict';

const assert = require('assert');
const runtime = require('../editor/js/core/template-runtime.js');

(function () {
  runtime.define({
    id: 'runtime-isolation-test',
    label: 'Runtime Isolation Test',
    version: '1.0.0',
    baseFramework: 'bs4',
    basePath: 'templates/runtime-isolation-test/',
    styles: ['source/theme.css'],
    scripts: ['source/vendor/carousel.js', 'source/custom.js'],
    components: [{ id: 'section', label: 'Section', content: '<section>Test</section>' }]
  });

  const profiles = runtime.extendProfiles({
    bs4: {
      id: 'bs4', canvasStyles: ['bs4.css'], canvasScripts: ['jquery.js', 'bootstrap.js'],
      exportAssets: { css: ['bs4.css'], js: ['jquery.js', 'bootstrap.js'] }
    },
    bs5: { id: 'bs5', canvasStyles: [], canvasScripts: [], exportAssets: { css: [], js: [] } }
  });
  const profile = profiles['template-runtime-isolation-test'];
  assert(profile, 'Templateprofil fehlt.');
  assert.deepStrictEqual(profile.canvasScripts, ['jquery.js', 'bootstrap.js'], 'Importierte Runtime darf den Editier-Canvas nicht verändern.');
  assert.deepStrictEqual(profile.templateRuntime.previewScripts, [
    'templates/runtime-isolation-test/source/vendor/carousel.js',
    'templates/runtime-isolation-test/source/custom.js'
  ], 'Preview-Skripte müssen separat erhalten bleiben.');
  assert.deepStrictEqual(profile.exportAssets.js, [
    'jquery.js', 'bootstrap.js',
    'templates/runtime-isolation-test/source/vendor/carousel.js',
    'templates/runtime-isolation-test/source/custom.js'
  ], 'Export darf die kontrollierte Runtime nicht verlieren.');
  console.log('TEMPLATE-RUNTIME-EDITOR-ISOLATION-TEST ERFOLGREICH');
})();
