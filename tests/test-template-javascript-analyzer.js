'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const JSZip = require('../plugins/editor/jszip/jszip.min.js');
const compiler = require('../templates/template-compiler.js');
const analyzer = require('../templates/javascript-analyzer.js');

(async function () {
  // Corpus A: arbitrary Bootstrap 4 template + completely unknown jQuery plugin.
  const zip = new JSZip();
  const root = zip.folder('AnyTheme');
  root.file('site/index.html', `<!doctype html><html><head>
    <link rel="stylesheet" href="css/bootstrap.css"><link rel="stylesheet" href="css/theme.css">
  </head><body>
    <section class="x-feature-zone"><div class="x-nebula-card">One</div><div class="x-nebula-card">Two</div></section>
    <script src="js/jquery.js"></script><script src="js/bootstrap.js"></script><script src="vendor/nebula.js"></script><script src="js/app.js"></script>
  </body></html>`);
  root.file('site/about.html', `<!doctype html><html><head><link rel="stylesheet" href="css/bootstrap.css"><link rel="stylesheet" href="css/theme.css"></head><body>
    <section class="x-feature-zone"><div class="x-nebula-card">About</div></section>
    <script src="js/jquery.js"></script><script src="js/bootstrap.js"></script><script src="vendor/nebula.js"></script><script src="js/app.js"></script>
  </body></html>`);
  root.file('site/css/bootstrap.css', '/*! Bootstrap v4.6.2 */ .container{width:100%}');
  root.file('site/css/theme.css', '.x-feature-zone{padding:2rem}');
  root.file('site/js/jquery.js', '/*! jQuery JavaScript Library v3.6.4 */ jQuery.fn={};');
  root.file('site/js/bootstrap.js', '/*! Bootstrap v4.6.2 */ (function($,Popper){ /* bootstrap */ })(jQuery,Popper);');
  root.file('site/vendor/nebula.js', `(function($){ $.fn.nebulaFlux = function(options){ return this.each(function(){}); }; })(jQuery);`);
  root.file('site/js/app.js', `
    document.addEventListener('DOMContentLoaded', function(){
      $('.x-nebula-card').nebulaFlux({ speed: 200 });
      document.querySelector('.x-feature-zone').addEventListener('click', function(){});
    });
  `);
  root.file('documentation/index.html', '<html><body><script src="doc.js"></script></body></html>');
  root.file('documentation/doc.js', 'window.DOCUMENTATION_ONLY = true;');

  const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: 'nodebuffer' }));
  const compiled = await compiler.compileZip(loaded, { name: 'Arbitrary Theme Alpha' });
  const manifest = compiled.behaviorManifest;

  assert.strictEqual(manifest.kind, 'oluntir-template-javascript-behavior-manifest');
  assert.strictEqual(manifest.policy.sourceExecution, false);
  assert.strictEqual(manifest.framework.baseFramework, 'bs4');
  assert(manifest.scripts.some(script => script.path === 'site/js/app.js' && script.role === 'template-custom'));
  assert(manifest.scripts.some(script => script.path === 'site/vendor/nebula.js' && script.providers.some(provider => provider.symbol === 'jquery.fn.nebulaFlux')));
  assert(!manifest.scripts.some(script => script.path === 'documentation/doc.js' && script.scope === 'primary'), 'Dokumentations-JS darf nicht Teil des Primärkorpus sein.');

  const unknownBinding = manifest.bindings.find(binding => binding.script === 'site/js/app.js' && binding.plugin === 'nebulaFlux');
  assert(unknownBinding, 'Unbekannter jQuery-Pluginaufruf muss generisch erkannt werden.');
  assert.strictEqual(unknownBinding.selector, '.x-nebula-card');
  assert(unknownBinding.pages.includes('site/index.html'));
  assert(unknownBinding.familyIds.length > 0, 'DOM-Selector muss mit einer semantischen HTML-Familie verknüpft werden.');
  assert(manifest.dependencyGraph.edges.some(edge => edge.from === 'site/vendor/nebula.js' && edge.to === 'site/js/app.js' && edge.kind === 'plugin-provider' && edge.detail === 'nebulaFlux'));
  assert(compiled.definition.scripts.includes('source/site/vendor/nebula.js'), 'Step 4c muss einen benötigten unbekannten Plugin-Provider kontrolliert aktivieren.');
  assert(compiled.definition.scripts.includes('source/site/js/app.js'), 'Step 4c muss freigegebenes Custom-JS kontrolliert aktivieren.');
  assert(!compiled.definition.scripts.includes('source/site/js/jquery.js'), 'BS4-jQuery darf nicht doppelt geladen werden.');
  assert(!compiled.definition.scripts.includes('source/site/js/bootstrap.js'), 'Bootstrap darf nicht doppelt geladen werden.');

  // Corpus B: Bootstrap 5 + unknown global constructor + ES module import.
  const files = [
    { path: 'index.html', content: `<html><head><link rel="stylesheet" href="bootstrap.css"></head><body><section class="quasar-shell"><div class="quasar-item"></div></section><script src="bootstrap.js"></script><script src="mystery-widget.js"></script><script type="module" src="main.mjs"></script></body></html>` },
    { path: 'bootstrap.css', content: '/*! Bootstrap v5.3.8 */' },
    { path: 'bootstrap.js', content: '/*! Bootstrap v5.3.8 */ bootstrap.Modal=function(){};' },
    { path: 'mystery-widget.js', content: 'window.MysteryWidget = function(selector, options){ this.selector=selector; };' },
    { path: 'main.mjs', content: `import './helpers.js'; const widget = new MysteryWidget('.quasar-shell', { active: true });` },
    { path: 'helpers.js', content: `export function noop(){ return document.querySelector('.quasar-item'); }` }
  ];
  const compiledB = compiler.compileFiles(files, { name: 'Arbitrary Theme Beta' });
  const manifestB = compiledB.behaviorManifest;
  assert.strictEqual(manifestB.framework.baseFramework, 'bs5');
  const ctor = manifestB.bindings.find(binding => binding.plugin === 'MysteryWidget' && binding.selector === '.quasar-shell');
  assert(ctor && ctor.familyIds.length, 'Unbekannter globaler Konstruktor muss erkannt und an HTML gebunden werden.');
  assert(manifestB.dependencyGraph.edges.some(edge => edge.from === 'mystery-widget.js' && edge.to === 'main.mjs' && edge.kind === 'global-provider'));
  assert(manifestB.dependencyGraph.edges.some(edge => edge.from === 'helpers.js' && edge.to === 'main.mjs' && edge.kind === 'explicit-import'));
  assert(!compiledB.definition.scripts.includes('source/main.mjs'), 'ES-Module bleiben in Step 4c bewusst von der automatischen Aktivierung ausgeschlossen.');

  // Anti-overfitting contract: productive analyzer must not know our real test corpus.
  const analyzerSource = fs.readFileSync(path.join(__dirname, '..', 'templates', 'javascript-analyzer.js'), 'utf8');
  ['WB0D9X15X', 'POTENZA', 'Bulky', 'popup-single', 'my-shuffle-container'].forEach(token => {
    assert(!analyzerSource.includes(token), `Produktiver Analyzer darf keine Corpus-spezifische Konstante enthalten: ${token}`);
  });

  console.log('TEMPLATE-JAVASCRIPT-ANALYZER-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
