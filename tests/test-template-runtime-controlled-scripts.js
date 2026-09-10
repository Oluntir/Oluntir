'use strict';

const assert = require('assert');
const runtime = require('../editor/js/core/template-runtime.js');

(function () {
  runtime.define({
    id: 'controlled-runtime-test',
    label: 'Controlled Runtime Test',
    version: '1.0.0',
    baseFramework: 'bs4',
    basePath: 'templates/controlled-runtime-test/',
    styles: ['source/theme.css'],
    scripts: ['source/vendor/plugin.js', 'source/app.js'],
    components: [{ id: 'hero', label: 'Hero', content: '<section class="hero">Hero</section>' }]
  });

  const profiles = runtime.extendProfiles({
    bs4: {
      id: 'bs4',
      label: 'Bootstrap 4',
      canvasStyles: ['frameworks/bootstrap4/css/bootstrap.min.css'],
      canvasScripts: ['plugins/site/js/jquery-3.4.1.min.js', 'frameworks/bootstrap4/js/bootstrap.bundle.min.js'],
      exportAssets: {
        css: ['frameworks/bootstrap4/css/bootstrap.min.css'],
        js: ['plugins/site/js/jquery-3.4.1.min.js', 'frameworks/bootstrap4/js/bootstrap.bundle.min.js']
      }
    },
    bs5: { id: 'bs5', label: 'Bootstrap 5', canvasStyles: [], canvasScripts: [], exportAssets: { css: [], js: [] } }
  });

  const profile = profiles['template-controlled-runtime-test'];
  assert(profile, 'Kompiliertes Templateprofil fehlt.');
  assert.deepStrictEqual(profile.canvasScripts, [
    'plugins/site/js/jquery-3.4.1.min.js',
    'frameworks/bootstrap4/js/bootstrap.bundle.min.js'
  ], 'Der editierbare Canvas darf ausschließlich die vertrauenswürdige Bootstrap-Basis ausführen.');
  assert.deepStrictEqual(profile.templateRuntime.previewScripts, [
    'templates/controlled-runtime-test/source/vendor/plugin.js',
    'templates/controlled-runtime-test/source/app.js'
  ], 'Kontrollierte Template-Skripte müssen für eine isolierte Preview verfügbar bleiben.');
  assert.deepStrictEqual(profile.exportAssets.js, [
    'plugins/site/js/jquery-3.4.1.min.js',
    'frameworks/bootstrap4/js/bootstrap.bundle.min.js',
    'templates/controlled-runtime-test/source/vendor/plugin.js',
    'templates/controlled-runtime-test/source/app.js'
  ], 'Der Export muss die kontrollierte Script-Reihenfolge weiterhin vollständig enthalten.');
  assert.strictEqual(profile.templateRuntime.executionMode, 'preview-export-only', 'Template-JavaScript muss explizit aus dem Editiermodus isoliert sein.');

  console.log('TEMPLATE-RUNTIME-CONTROLLED-SCRIPTS-TEST ERFOLGREICH');
})();
