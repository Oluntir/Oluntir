'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { analyzeProject } = require('../core/project-analyzer.js');
const behaviorMatrix = require('../core/javascript-behavior-matrix.js');
const behaviorResolver = require('../core/javascript-behavior-resolver.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-javascript-behavior-test-'));
try {
  fs.mkdirSync(path.join(root, 'js'), { recursive: true });
  fs.mkdirSync(path.join(root, 'css'), { recursive: true });
  fs.writeFileSync(path.join(root, 'index.html'), '<button data-bs-toggle="collapse" data-bs-target="#menu">Menü</button><div id="menu" class="accordion collapse">Inhalt</div>');
  fs.writeFileSync(path.join(root, 'css', 'framework.css'), '.accordion { display: block; }');
  fs.writeFileSync(path.join(root, 'js', 'behavior.js'), `
    const button = document.querySelector('[data-bs-toggle="collapse"]');
    button.addEventListener('click', () => document.querySelector('#menu').classList.toggle('show'));
    new MutationObserver(() => {}).observe(document.body, { childList: true });
    fetch('/data.json');
  `);

  const report = analyzeProject(root, { sourcePackageId: 'behavior-test-package', frameworkId: 'test-framework' });
  const manifest = report.behaviors;
  const plan = report.behaviorPlan;
  assert.strictEqual(manifest.kind, 'oluntir-javascript-behavior-manifest');
  assert.strictEqual(manifest.sourcePackageId, 'behavior-test-package');
  assert.deepStrictEqual(manifest.scripts.enabledByDefault, []);
  assert.strictEqual(manifest.policy.sourceExecution, false);
  assert.strictEqual(manifest.policy.documentMutation, false);
  assert.strictEqual(plan.kind, 'oluntir-javascript-behavior-plan');
  assert.strictEqual(plan.policy.runtimeActivation, false);
  assert.strictEqual(plan.policy.documentMutation, false);
  assert(behaviorMatrix.validate(plan).valid);
  assert(behaviorResolver.validate(report.behaviorResolution).valid);
  assert(report.behaviorResolution.entries.some(item => item.status === 'profile-required'));
  assert(manifest.scripts.available.includes('js/behavior.js'));
  assert(manifest.behaviors.some(item => item.behaviorType === 'interaction.accordion-toggle'));
  assert(manifest.behaviors.some(item => item.behaviorType === 'runtime.event-listener'));
  assert(manifest.behaviors.some(item => item.behaviorType === 'runtime.dom-observer'));
  assert(manifest.behaviors.some(item => item.behaviorType === 'runtime.network-request'));
  assert(manifest.behaviors.every(item => item.activation.allowed === false && item.runtime.defaultEnabled === false));
  const network = manifest.behaviors.find(item => item.behaviorType === 'runtime.network-request');
  assert(network.evidence.some(item => item.value === '/data.json'));
  assert(plan.entries.some(item => item.semanticId === 'interaction.accordion.toggle' && item.activation.allowed === false));

  const bootstrapManifest = {
    kind: 'oluntir-javascript-behavior-manifest', schemaVersion: 1, sourcePackageId: 'bootstrap-test', frameworkId: 'bootstrap',
    scripts: { available: ['jquery-3.4.1.min.js', 'bootstrap.bundle.min.js'], enabledByDefault: [], activation: 'explicit-selection-only' },
    styles: { available: ['bootstrap.min.css'], resolution: 'deferred-to-behavior-matrix' },
    behaviors: [{
      behaviorId: 'source-behavior:accordion-test', behaviorType: 'interaction.accordion-toggle',
      evidence: [{ kind: 'markup:interaction.accordion-toggle', value: 'data-toggle="collapse"', source: { file: 'index.html', offset: 0, line: 1, column: 1 } }],
      runtime: { scriptFiles: [], defaultEnabled: false }, dependencies: { styleFiles: [] }
    }]
  };
  const bootstrapPlan = behaviorMatrix.compile(bootstrapManifest, { frameworkId: 'bs4', version: '4.6.2' });
  const bootstrapResolution = behaviorResolver.resolve(bootstrapPlan, bootstrapManifest, { frameworkId: 'bs4', version: '4.6.2' });
  const bootstrapEntry = bootstrapResolution.entries[0];
  assert.strictEqual(bootstrapEntry.status, 'resolved');
  assert.strictEqual(bootstrapEntry.implementation.adapterId, 'bootstrap4.collapse');
  assert.strictEqual(bootstrapEntry.activation.allowed, false);
  assert(behaviorResolver.validate(bootstrapResolution).valid);
  assert.strictEqual(behaviorResolver.selectProfile({ frameworkId: 'bootstrap4', version: '5.3.8' }, bootstrapManifest), null);
  assert(behaviorResolver.profiles().every(profile => profile.dependencies.scriptGroups.every(group => group.every(pattern => pattern instanceof RegExp))));
  console.log(`JAVASCRIPT-BEHAVIOR-TEST ERFOLGREICH (${manifest.behaviors.length} Evidenzen)`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
