'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const JSZip = require('../plugins/editor/jszip/jszip.min.js');
const compiler = require('../templates/template-compiler.js');
const activationPlanner = require('../templates/javascript-activation-planner.js');

(async function () {
  // Generic BS4 corpus with an unknown jQuery plugin. No template-specific rule
  // may be required to activate the provider + custom script.
  const zip = new JSZip();
  const root = zip.folder('UniversalActivation');
  root.file('index.html', `<!doctype html><html><head><link rel="stylesheet" href="bootstrap.css"></head><body>
    <section class="nebula-zone"><div class="nebula-card">A</div></section>
    <script src="jquery.js"></script><script src="bootstrap.js"></script><script src="nebula.js"></script><script src="app.js"></script>
  </body></html>`);
  root.file('bootstrap.css', '/*! Bootstrap v4.6.2 */');
  root.file('jquery.js', '/*! jQuery JavaScript Library v3.6.4 */ jQuery.fn={};');
  root.file('bootstrap.js', '/*! Bootstrap v4.6.2 */');
  root.file('nebula.js', '(function($){ $.fn.nebulaFlux=function(){return this;}; })(jQuery);');
  root.file('app.js', "$('.nebula-card').nebulaFlux(); $(window).on('resize', function(){});");
  const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: 'nodebuffer' }));
  const compiled = await compiler.compileZip(loaded, { name: 'Universal Activation Example' });
  const plan = compiled.activationPlan;

  assert.strictEqual(plan.kind, 'oluntir-template-javascript-activation-plan');
  assert.strictEqual(plan.policy.automaticActivation, 'policy-gated');
  assert.strictEqual(plan.policy.executionScope, 'grapesjs-canvas');
  assert.strictEqual(plan.policy.coreMutation, false);
  assert.strictEqual(plan.policy.externalScriptsEnabled, false);
  assert.strictEqual(plan.policy.inlineScriptsEnabled, false);
  assert.strictEqual(plan.policy.highRiskTemplateCustomScriptsEnabled, false);
  assert(plan.execution.enabledRuntimePaths.includes('source/nebula.js'), 'Unbekannter lokaler Plugin-Provider muss als benötigte Abhängigkeit aktiviert werden.');
  assert(plan.execution.enabledRuntimePaths.includes('source/app.js'), 'Policy-freigegebenes Custom-JS muss für die Canvas-Runtime aktiviert werden.');
  assert(!plan.execution.enabledRuntimePaths.includes('source/jquery.js'), 'BS4-jQuery darf nicht doppelt geladen werden.');
  assert(!plan.execution.enabledRuntimePaths.includes('source/bootstrap.js'), 'Bootstrap darf nicht doppelt geladen werden.');
  assert(plan.execution.baseProvided.some(item => item.library === 'jquery'));
  assert.deepStrictEqual(compiled.definition.scripts, plan.execution.enabledRuntimePaths, 'Kompiliertes Template muss exakt den kontrollierten Aktivierungsplan verwenden.');
  assert.strictEqual(compiled.manifest.runtime.javascriptActivation, 'controlled-policy');
  assert.strictEqual(compiled.manifest.runtime.activationPlan, 'javascript-activation-plan.json');

  // A custom script with network side effects must not be auto-enabled, and its
  // dependencies must not be pulled in merely because they exist in the archive.
  const riskyZip = new JSZip();
  riskyZip.file('index.html', `<!doctype html><html><head><link rel="stylesheet" href="bootstrap.css"></head><body>
    <section class="safe-zone"><div class="safe-card">A</div></section>
    <script src="bootstrap.js"></script><script src="plugin.js"></script><script src="app.js"></script>
  </body></html>`);
  riskyZip.file('bootstrap.css', '/*! Bootstrap v5.3.8 */');
  riskyZip.file('bootstrap.js', '/*! Bootstrap v5.3.8 */');
  riskyZip.file('plugin.js', 'window.CosmicThing=function(){};');
  riskyZip.file('app.js', "new CosmicThing('.safe-card'); fetch('/remote-data');");
  const riskyLoaded = await JSZip.loadAsync(await riskyZip.generateAsync({ type: 'nodebuffer' }));
  const risky = await compiler.compileZip(riskyLoaded, { name: 'Risky Example' });
  assert.strictEqual(risky.activationPlan.summary.enabledCustomScripts, 0, 'Custom-JS mit Netzwerk-Seiteneffekt darf nicht automatisch aktiviert werden.');
  assert.strictEqual(risky.definition.scripts.length, 0, 'Ohne freigegebenes Custom-JS dürfen dessen Vendor-Abhängigkeiten nicht aktiviert werden.');
  assert(risky.activationPlan.execution.blocked.some(item => item.script === 'app.js' && item.reasons.includes('network-capability-in-template-custom-script')));

  // Generic BS5 + unknown jQuery plugin: jQuery is not provided by the BS5 base,
  // therefore the local runtime must be included before the plugin and custom JS.
  const bs5Zip = new JSZip();
  bs5Zip.file('index.html', `<!doctype html><html><head><link rel="stylesheet" href="bootstrap.css"></head><body>
    <section class="orbit"><div class="orbit-card">A</div></section>
    <script src="jquery.js"></script><script src="bootstrap.js"></script><script src="orbit.js"></script><script src="app.js"></script>
  </body></html>`);
  bs5Zip.file('bootstrap.css', '/*! Bootstrap v5.3.8 */');
  bs5Zip.file('jquery.js', '/*! jQuery JavaScript Library v3.7.1 */ jQuery.fn={};');
  bs5Zip.file('bootstrap.js', '/*! Bootstrap v5.3.8 */');
  bs5Zip.file('orbit.js', '(function($){ $.fn.orbitGlow=function(){return this;}; })(jQuery);');
  bs5Zip.file('app.js', "$('.orbit-card').orbitGlow();");
  const bs5Loaded = await JSZip.loadAsync(await bs5Zip.generateAsync({ type: 'nodebuffer' }));
  const bs5 = await compiler.compileZip(bs5Loaded, { name: 'BS5 jQuery Plugin' });
  const enabled = bs5.activationPlan.execution.enabledScripts.map(item => item.script);
  const jqIndex = enabled.indexOf('jquery.js');
  const pluginIndex = enabled.indexOf('orbit.js');
  const appIndex = enabled.indexOf('app.js');
  assert(jqIndex >= 0 && pluginIndex > jqIndex && appIndex > pluginIndex, 'BS5 muss eine benötigte lokale jQuery-Runtime vor unbekanntem jQuery-Plugin und Custom-JS laden.');
  assert(!enabled.includes('bootstrap.js'), 'BS5-Bootstrap darf nicht doppelt aktiviert werden.');

  const source = fs.readFileSync(path.join(__dirname, '..', 'templates', 'javascript-activation-planner.js'), 'utf8');
  ['WB0D9X15X', 'POTENZA', 'my-shuffle-container', 'popup-single', 'nebulaFlux', 'orbitGlow'].forEach(token => {
    assert(!source.includes(token), `Aktivierungsplaner darf keine Corpus-spezifische Konstante enthalten: ${token}`);
  });

  console.log('TEMPLATE-JAVASCRIPT-ACTIVATION-PLANNER-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
