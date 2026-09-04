'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sourcePackage = require('../core/source-package.js');
const { analyzeProject } = require('../core/project-analyzer.js');
const sourceComponentCatalog = require('../core/source-component-catalog.js');

const frameworks = {
  bootstrap4: '<section class="container"><div class="row"><div class="col-md-6 card"><div class="card-body">Bootstrap 4</div></div></div></section>',
  bootstrap5: '<section class="container"><div class="row g-3"><div class="col-md-6 card"><div class="card-body">Bootstrap 5</div></div></div></section>'
};

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-bootstrap-import-test-'));
const storage = path.join(root, 'frameworks');

try {
  const store = sourcePackage.createStore({ storageRoot: storage });
  const packageIds = new Set();
  for (const [frameworkId, markup] of Object.entries(frameworks)) {
    const source = path.join(root, 'sources', frameworkId);
    write(path.join(source, 'index.html'), markup);
    write(path.join(source, 'css', 'bootstrap.css'), `/* bootstrap@${frameworkId === 'bootstrap4' ? '4.6.2' : '5.3.8'} */ .container { width: 100%; }`);
    write(path.join(source, 'js', 'bootstrap.js'), '/* Bootstrap runtime is selected explicitly by the user. */');
    const manifest = store.importDirectory(source, { frameworkId, frameworkFamily: 'bootstrap', displayName: frameworkId, version: frameworkId === 'bootstrap4' ? '4.6.2' : '5.3.8' });
    const report = analyzeProject(source, { sourcePackageId: manifest.packageId, frameworkId, frameworkFamily: 'bootstrap', frameworkVersion: manifest.version });
    const catalog = sourceComponentCatalog.build(report, source, { packageId: manifest.packageId, frameworkId });
    assert.strictEqual(manifest.kind, 'oluntir-source-package');
    assert(!packageIds.has(manifest.packageId), `Paket-ID wurde doppelt vergeben: ${frameworkId}`);
    packageIds.add(manifest.packageId);
    assert(fs.existsSync(path.join(storage, frameworkId, 'sources', manifest.packageId, 'source-recovery.json')));
    assert(catalog.components.length > 0, `Keine quellengebundene Struktur erkannt: ${frameworkId}`);
    assert(catalog.components.some(component => component.html.includes(frameworkId === 'bootstrap4' ? 'Bootstrap 4' : 'Bootstrap 5')));
    assert(catalog.components.every(component => component.sourceBacked && component.mutationPolicy === 'user-insert-only'));
  }
  assert.strictEqual(packageIds.size, Object.keys(frameworks).length);
  assert.strictEqual(store.list().length, Object.keys(frameworks).length);
  console.log(`BOOTSTRAP-FRAMEWORK-IMPORT-TEST ERFOLGREICH (${packageIds.size} Bootstrap-Profile)`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
