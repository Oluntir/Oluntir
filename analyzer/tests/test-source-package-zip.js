'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sourcePackage = require('../core/source-package.js');
const sourcePackageSource = fs.readFileSync(path.join(__dirname, '../core/source-package.js'), 'utf8');

assert(sourcePackageSource.includes('OLUNTIR_ARCHIVE_PATH'));
assert(sourcePackageSource.includes('OLUNTIR_ARCHIVE_TARGET'));
assert(!sourcePackageSource.includes('Expand-Archive -LiteralPath $args[0]'));

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-source-zip-test-'));
try {
  const source = path.join(root, 'source');
  fs.mkdirSync(path.join(source, 'css'), { recursive: true });
  fs.writeFileSync(path.join(source, 'index.html'), '<section class="card"><h1>ZIP Source</h1></section>');
  fs.writeFileSync(path.join(source, 'css', 'framework.css'), '.card{display:block}');
  const archive = path.join(root, 'source.zip');
  execFileSync('zip', ['-qr', archive, '.'], { cwd: source });
  const storage = path.join(root, 'frameworks');
  const manifest = sourcePackage.createStore({ storageRoot: storage }).importArchive(archive, {
    frameworkId: 'zip-framework', displayName: 'ZIP Framework', version: '1.0.0', license: 'MIT'
  });
  assert.strictEqual(manifest.sourceFormat, 'zip');
  assert(fs.existsSync(path.join(storage, 'zip-framework', 'sources', manifest.packageId, 'source', 'index.html')));
  assert(fs.existsSync(path.join(storage, 'zip-framework', 'sources', manifest.packageId, 'source-recovery.json')));
  console.log('SOURCE-PACKAGE-ZIP-TEST ERFOLGREICH');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
