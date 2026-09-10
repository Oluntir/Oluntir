'use strict';

const assert = require('assert');
const JSZip = require('../plugins/editor/jszip/jszip.min.js');
const compiler = require('../templates/template-compiler.js');

(async function () {
  const zip = new JSZip();
  const root = zip.folder('DemoPackage');
  root.file('template/index.html', `<!doctype html><html><head>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/custom-theme.css">
  </head><body>
    <header class="site-header"><nav class="navbar"><div class="dropdown"><a class="dropdown-item">A</a><a class="dropdown-item">B</a></div></nav></header>
    <section class="hero"><div class="container"><h1>Hero Test</h1><img src="images/hero.jpg"></div></section>
    <section class="map"><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4" style="width:100%;height:420px"></iframe></section>
    <footer class="site-footer"><div class="container">Footer</div></footer>
    <script src="js/bootstrap.min.js"></script><script src="js/custom.js"></script>
  </body></html>`);
  root.file('template/about.html', `<!doctype html><html><head>
    <link rel="stylesheet" href="css/bootstrap.min.css"><link rel="stylesheet" href="css/custom-theme.css">
  </head><body><header class="site-header"><nav class="navbar"></nav></header><section class="about"><div class="container"><h2>About us</h2></div></section><footer class="site-footer">Footer</footer><script src="js/bootstrap.min.js"></script><script src="js/custom.js"></script></body></html>`);
  root.file('template/css/bootstrap.min.css', '/*! Bootstrap v4.4.1 */ .container{width:100%}.row{display:flex}');
  root.file('template/css/custom-theme.css', '.hero{background:url(../images/hero.jpg)} .site-footer{padding:2rem}');
  root.file('template/js/bootstrap.min.js', '/*! Bootstrap v4.4.1 */');
  root.file('template/js/custom.js', 'window.DEMO_CUSTOM=true;');
  root.file('template/images/hero.jpg', Buffer.from([1,2,3,4]));
  root.file('documentation/index.html', '<html><head><link rel="stylesheet" href="css/bootstrap.min.css"></head><body><h1>Documentation</h1></body></html>');
  root.file('documentation/css/bootstrap.min.css', '/*! Bootstrap v3.3.7 */');

  const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: 'nodebuffer' }));
  const compiled = await compiler.compileZip(loaded, { name: 'Agency Demo' });

  assert.strictEqual(compiled.id, 'agency-demo');
  assert.strictEqual(compiled.analysis.framework.baseFramework, 'bs4');
  assert.strictEqual(compiled.analysis.framework.version, '4.4.1');
  assert.strictEqual(compiled.manifest.analysis.primaryHtmlCount, 2);
  assert.strictEqual(compiled.manifest.analysis.auxiliaryHtmlCount, 1);
  assert.ok(compiled.definition.styles.includes('source/template/css/custom-theme.css'));
  assert.ok(!compiled.definition.styles.some(value => /bootstrap\.min\.css$/i.test(value)), 'Bootstrap-CSS darf nicht doppelt als Template-CSS geladen werden.');
  assert.deepStrictEqual(compiled.definition.scripts, ['embed-runtime.js'], 'Ohne freigegebenes Template-JS darf nur die interne Embed-Restore-Runtime vorbereitet werden.');
  assert.ok(compiled.analysis.scripts.detected.includes('source/template/js/custom.js'));

  assert.strictEqual(compiled.behaviorManifest.kind, 'oluntir-template-javascript-behavior-manifest');
  assert.strictEqual(compiled.behaviorManifest.policy.sourceExecution, false, 'Step 4b darf fremdes JavaScript nicht ausführen.');
  assert.strictEqual(compiled.runtimePlan.kind, 'oluntir-template-javascript-runtime-plan');
  assert.strictEqual(compiled.runtimePlan.summary.executionEnabled, 0);
  assert.ok(compiled.manifest.runtime.runtimePlan === 'runtime-plan.json');
  assert.strictEqual(compiled.activationPlan.kind, 'oluntir-template-javascript-activation-plan');
  assert.strictEqual(compiled.manifest.runtime.activationPlan, 'javascript-activation-plan.json');
  assert.strictEqual(compiled.manifest.runtime.javascriptActivation, 'controlled-policy');
  assert.ok(compiled.manifest.analysis.javascript, 'JavaScript-Zusammenfassung fehlt im Template-Manifest.');
  assert.ok(compiled.components.some(component => component.category === 'Template · Navigation / Header'));
  assert.ok(compiled.components.some(component => component.category === 'Template · Footer'));
  assert.ok(!compiled.components.some(component => /dropdown item/i.test(component.label)), 'Framework-Unterfragmente dürfen nicht als Top-Level-Baustein auftauchen.');
  const hero = compiled.components.find(component => /Hero Test/i.test(component.label));
  assert.ok(hero, 'Hero-Baustein wurde nicht semantisch erkannt.');
  assert.ok(hero.content.includes('templates/agency-demo/source/template/images/hero.jpg'), 'Lokale Asset-Pfade müssen auf den statischen Template-Ordner umgeschrieben werden.');
  const mapComponent = compiled.components.find(component => component.content.includes('openstreetmap.org'));
  assert.ok(mapComponent, 'Map-/Embed-Bereich wurde nicht als Komponente gefunden.');
  assert.ok(mapComponent.content.includes('data-oluntir-embed-isolated="1"'), 'Externe Embeds müssen im Editiermodus isoliert werden.');
  assert.ok(/src="data:image\/svg\+xml/i.test(mapComponent.content), 'Embed muss einen skalierenden SVG-Platzhalter verwenden.');
  assert.strictEqual(compiled.embedIsolation.count, 1, 'Embed-Isolation muss im Compiler-Manifest gezählt werden.');
  assert.deepStrictEqual(compiled.manifest.runtime.internalRuntimeScripts, ['embed-runtime.js']);
  assert.strictEqual(compiled.definition.scripts[0], 'embed-runtime.js', 'Restore-Runtime muss vor Template-JavaScript eingeplant werden.');

  console.log('TEMPLATE-COMPILER-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
