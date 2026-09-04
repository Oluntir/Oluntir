'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sourcePackage = require('../core/source-package.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-source-runtime-test-'));
try {
  const source = path.join(root, 'source');
  fs.mkdirSync(path.join(source, 'css'), { recursive: true });
  fs.mkdirSync(path.join(source, 'js'), { recursive: true });
  fs.writeFileSync(path.join(source, 'index.html'), '<section class="card">Runtime</section>');
  fs.writeFileSync(path.join(source, 'css', 'debug.css'), '.card{display:block}');
  fs.writeFileSync(path.join(source, 'css', 'release.css'), '.card{display:block}');
  fs.writeFileSync(path.join(source, 'js', 'debug.js'), 'window.debug=true;');
  fs.writeFileSync(path.join(source, 'js', 'release.js'), 'window.release=true;');
  fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({
    oluntirRuntime: {
      enabledStyles: ['css/release.css'],
      enabledScripts: [],
      recommendedScripts: ['js/release.js']
    }
  }));
  const store = sourcePackage.createStore({ storageRoot: path.join(root, 'frameworks') });
  const manifest = store.importDirectory(source, { frameworkId: 'runtime-test', displayName: 'Runtime Test' });
  assert.deepStrictEqual(manifest.runtime.enabledStyles, ['css/release.css']);
  assert.deepStrictEqual(manifest.runtime.enabledScripts, []);
  assert.deepStrictEqual(manifest.runtime.recommendedScripts, ['js/release.js']);
  assert(manifest.runtime.availableStyles.includes('css/debug.css'));
  assert(manifest.runtime.availableScripts.includes('js/debug.js'));
  console.log('SOURCE-RUNTIME-SELECTION-TEST ERFOLGREICH');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
