'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const JSZip = require('../plugins/editor/jszip/jszip.min.js');
const compiler = require('../templates/template-compiler.js');
const planner = require('../templates/javascript-runtime-planner.js');

(async function () {
  const zip = new JSZip();
  const root = zip.folder('UniversalRuntimePlan');
  root.file('index.html', `<!doctype html><html><head><link rel="stylesheet" href="bootstrap.css"></head><body>
    <section class="stellar-zone"><div class="stellar-card" data-speed="4">Card</div></section>
    <script src="jquery.js"></script><script src="bootstrap.js"></script><script src="nebula.js"></script><script src="app.js"></script>
  </body></html>`);
  root.file('bootstrap.css', '/*! Bootstrap v4.6.2 */');
  root.file('jquery.js', '/*! jQuery JavaScript Library v3.6.4 */ jQuery.fn={};');
  root.file('bootstrap.js', '/*! Bootstrap v4.6.2 */ (function($){ })(jQuery);');
  root.file('nebula.js', '(function($){ $.fn.nebulaFlux=function(){return this;}; })(jQuery);');
  root.file('app.js', `
    $('.stellar-card').nebulaFlux({ speed: $('.stellar-card').data('speed') });
    $(window).on('scroll', function(){});
    fetch('/should-not-auto-run');
  `);

  const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: 'nodebuffer' }));
  const compiled = await compiler.compileZip(loaded, { name: 'Universal Runtime Example' });
  const plan = compiled.runtimePlan;

  assert.strictEqual(plan.kind, 'oluntir-template-javascript-runtime-plan');
  assert.strictEqual(plan.policy.sourceExecution, false);
  assert.strictEqual(plan.policy.automaticActivation, false);
  assert.strictEqual(plan.policy.templateScriptsEnabled, false);
  assert.strictEqual(plan.summary.executionEnabled, 0);
  assert.strictEqual(plan.summary.bindings,
    plan.summary.section + plan.summary.global + plan.summary.helper + plan.summary.unresolved,
    'Jede Behavior-Bindung muss genau einer Runtime-Klasse angehören.');

  const section = plan.behaviors.section.find(item => item.plugin === 'nebulaFlux');
  assert(section, 'Unbekanntes Plugin muss als Section-Verhalten klassifiziert werden, wenn sein Selector einer Section zugeordnet ist.');
  assert(section.runtimeFamilyIds.length > 0);
  assert.strictEqual(section.executionEnabled, false);

  assert(plan.behaviors.global.some(item => item.event === 'scroll'), 'Globales Scroll-Verhalten muss als global erkannt werden.');
  assert(plan.behaviors.unresolved.some(item => item.kind === 'network' && item.blocked), 'Netzwerk-Seiteneffekte müssen bis zu einer expliziten Runtime-Policy blockiert bleiben.');

  const nebulaIndex = plan.scripts.ordered.findIndex(item => item.script === 'nebula.js');
  const appIndex = plan.scripts.ordered.findIndex(item => item.script === 'app.js');
  assert(nebulaIndex >= 0 && appIndex >= 0 && nebulaIndex < appIndex, 'Plugin-Provider muss im Runtime-Plan vor dem konsumierenden Custom-JS liegen.');
  assert(plan.scripts.ordered.some(item => item.library === 'bootstrap' && item.disposition === 'base-framework-overlap'));
  assert(plan.scripts.ordered.some(item => item.library === 'jquery' && item.disposition === 'base-runtime-overlap'));
  assert(plan.behaviors.dependency.some(item => item.script === 'nebula.js' && item.disposition === 'template-runtime-candidate'));

  assert.strictEqual(compiled.definition.scripts.length, 0, 'Step 4b darf noch keine Template-Skripte aktivieren.');
  assert.strictEqual(compiled.manifest.runtime.runtimePlan, 'runtime-plan.json');

  const plannerSource = fs.readFileSync(path.join(__dirname, '..', 'templates', 'javascript-runtime-planner.js'), 'utf8');
  ['WB0D9X15X', 'POTENZA', 'my-shuffle-container', 'popup-single'].forEach(token => {
    assert(!plannerSource.includes(token), `Runtime-Planer darf keine Corpus-spezifische Konstante enthalten: ${token}`);
  });

  // Direct planner contract: unknown BS5 constructor remains generic.
  const syntheticManifest = {
    kind: 'oluntir-template-javascript-behavior-manifest',
    framework: { baseFramework: 'bs5', version: '5.3.8' },
    bindings: [{ bindingId: 'b1', script: 'app.mjs', kind: 'constructor', behavior: 'plugin-interaction', plugin: 'GalaxyThing', selector: '.galaxy', pages: ['index.html'], regionIds: ['r1'], familyIds: ['f1'], confidence: 0.95, source: { offset: 10 } }],
    scripts: [{ path: 'app.mjs', runtimePath: 'source/app.mjs', sourceKind: 'file', scope: 'primary', role: 'template-custom', inline: false, module: true, library: null }],
    dependencyGraph: { edges: [], loadOrders: [{ document: 'index.html', scripts: ['app.mjs'] }] }
  };
  const genericPlan = planner.plan(syntheticManifest, { primaryDocuments: ['index.html'] });
  assert.strictEqual(genericPlan.behaviors.section[0].plugin, 'GalaxyThing');
  assert.strictEqual(genericPlan.summary.executionEnabled, 0);

  console.log('TEMPLATE-JAVASCRIPT-RUNTIME-PLANNER-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
