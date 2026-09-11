'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sourcePackage = require('../core/source-package.js');
const { analyzeProject } = require('../core/project-analyzer.js');
const sourceComponentCatalog = require('../core/source-component-catalog.js');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-source-package-test-'));
const source = path.join(root, 'source');
const storage = path.join(root, 'frameworks');
const restoredStorage = path.join(root, 'restored-frameworks');
write(path.join(source, 'css', 'framework.css'), '.component { display: block; }');
write(path.join(source, 'js', 'framework.js'), 'window.Framework = true;');
write(path.join(source, 'README.md'), 'source package');
write(path.join(source, 'img', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>');
write(path.join(source, 'index.html'), '<section><h2>Hero</h2><img src="img/logo.svg"><div class="card"><div class="card-body">Inhalt</div></div></section>');

try {
  const store = sourcePackage.createStore({ storageRoot: storage });
  const manifest = store.importDirectory(source, { frameworkId: 'test-framework', displayName: 'Test Framework', version: '1.0.0', license: 'MIT' });
  assert.strictEqual(manifest.kind, 'oluntir-source-package');
  assert.strictEqual(manifest.fileCount, 5);
  assert(fs.existsSync(path.join(storage, 'test-framework', 'sources', manifest.packageId, 'source-recovery.json')));
  assert.strictEqual(store.list().length, 1);
  assert(fs.existsSync(store.filePath(manifest.packageId, 'css/framework.css')));

  const recovery = JSON.parse(fs.readFileSync(path.join(storage, 'test-framework', 'sources', manifest.packageId, 'source-recovery.json'), 'utf8'));
  assert.strictEqual(recovery.encoding, 'gzip+base64');
  assert.strictEqual(recovery.files.length, 5);
  const catalog = sourceComponentCatalog.build(analyzeProject(source), source, { packageId: manifest.packageId, frameworkId: manifest.frameworkId });
  assert(catalog.components.length >= 2);
  assert(catalog.components.every(component => component.sourceBacked && component.mutationPolicy === 'user-insert-only'));
  assert(catalog.components.some(component => component.html.includes('card-body')));
  assert(catalog.components.some(component => component.assetReferences.some(reference => reference.sourcePath === 'img/logo.svg')));
  const restored = sourcePackage.createStore({ storageRoot: restoredStorage }).restore(path.join(storage, 'test-framework', 'sources', manifest.packageId, 'source-recovery.json'));
  assert.strictEqual(restored.sourceHash, manifest.sourceHash);
  assert(fs.existsSync(path.join(restoredStorage, 'test-framework', 'sources', restored.packageId, 'source', 'js', 'framework.js')));

  fs.rmSync(path.join(storage, 'test-framework', 'sources', manifest.packageId, 'source', 'js'), { recursive: true, force: true });
  const repaired = store.restore(path.join(storage, 'test-framework', 'sources', manifest.packageId, 'source-recovery.json'));
  assert(repaired.repairedAt);
  assert(fs.existsSync(path.join(storage, 'test-framework', 'sources', manifest.packageId, 'source', 'js', 'framework.js')));
  assert(fs.readdirSync(path.join(storage, 'test-framework', 'sources', manifest.packageId)).some(name => name.startsWith('source.damaged-')));

  const archive = path.join(root, 'test-framework.tar');
  execFileSync('tar', ['-cf', archive, '-C', source, '.']);
  const archived = sourcePackage.createStore({ storageRoot: path.join(root, 'archive-frameworks') }).importArchive(archive, { frameworkId: 'archive-framework', displayName: 'Archive Framework' });
  assert.strictEqual(archived.kind, 'oluntir-source-package');
  assert.strictEqual(archived.fileCount, 5);
  console.log('SOURCE-PACKAGE-TEST ERFOLGREICH');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
