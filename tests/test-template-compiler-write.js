'use strict';

const assert = require('assert');
const vm = require('vm');
const JSZip = require('../plugins/editor/jszip/jszip.min.js');
const compiler = require('../templates/template-compiler.js');
const manager = require('../templates/template-manager.js');
const runtime = require('../editor/js/core/template-runtime.js');

class FakeFileHandle {
  constructor(name, directory) { this.kind = 'file'; this.name = name; this.directory = directory; }
  async getFile() { const value = this.directory.files[this.name]; return { text: async () => typeof value === 'string' ? value : Buffer.from(value || []).toString('utf8') }; }
  async createWritable() {
    let value = null;
    return {
      write: async data => { value = typeof data === 'string' ? data : Buffer.from(data); },
      close: async () => { this.directory.files[this.name] = value == null ? '' : value; }
    };
  }
}
class FakeDirectoryHandle {
  constructor(name) { this.kind = 'directory'; this.name = name; this.files = {}; this.directories = new Map(); }
  async getDirectoryHandle(name, options) {
    if (!this.directories.has(name)) {
      if (!(options && options.create)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
      this.directories.set(name, new FakeDirectoryHandle(name));
    }
    return this.directories.get(name);
  }
  async getFileHandle(name, options) {
    if (!(name in this.files) && !(options && options.create)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
    if (!(name in this.files)) this.files[name] = '';
    return new FakeFileHandle(name, this);
  }
  async removeEntry(name) { if (this.directories.has(name)) { this.directories.delete(name); return; } if (name in this.files) { delete this.files[name]; return; } const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
  async *entries() { for (const pair of this.directories.entries()) yield pair; }
}

(async function () {
  const zip = new JSZip();
  zip.file('site/index.html', '<html><head><link rel="stylesheet" href="bootstrap.min.css"><link rel="stylesheet" href="theme.css"></head><body><section class="hero"><h1>Compiled Hero</h1></section><section class="map"><iframe src="https://maps.example.test/embed" style="width:100%;height:360px"></iframe></section></body></html>');
  zip.file('site/bootstrap.min.css', '/*! Bootstrap v5.3.8 */ .container{width:100%}');
  zip.file('site/theme.css', '.hero{padding:4rem}');
  const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: 'nodebuffer' }));
  const compiled = await compiler.compileZip(loaded, { name: 'Static Import' });

  const root = new FakeDirectoryHandle('templates');
  root.directories.set('editions', new FakeDirectoryHandle('editions'));
  const initialRegistry = { schemaVersion: 1, templates: [] };
  const result = await compiler.writeCompilation(root, initialRegistry, compiled, manager);
  assert.strictEqual(result.folder, 'static-import');
  assert.ok(root.directories.has('static-import'));
  const dir = root.directories.get('static-import');
  assert.ok(dir.files['template.json']);
  assert.ok(dir.files['template.js']);
  assert.ok(dir.files['components.json']);
  assert.ok(dir.files['analysis.json']);
  assert.ok(dir.files['assets.json']);
  assert.ok(dir.files['embed-isolation.json']);
  assert.ok(dir.files['embed-runtime.js']);
  assert.ok(dir.files['behavior-manifest.json']);
  assert.ok(dir.files['dependencies.json']);
  assert.ok(dir.files['runtime-plan.json']);
  assert.ok(dir.files['javascript-activation-plan.json']);
  const activationPlan = JSON.parse(String(dir.files['javascript-activation-plan.json']));
  assert.strictEqual(activationPlan.kind, 'oluntir-template-javascript-activation-plan');
  assert.ok(root.files['registry.json'].includes('static-import'));
  assert.ok(root.files['registry.js'].includes('static-import'));
  assert.ok(dir.directories.get('source').files['theme.css']);

  const context = { window: { OluntirTemplateRuntime: runtime }, console };
  context.globalThis = context.window;
  vm.createContext(context);
  vm.runInContext(String(dir.files['template.js']), context);
  const definition = runtime.getDefinition('static-import');
  assert.ok(definition, 'Kompiliertes template.js muss von der statischen Runtime geladen werden können.');
  assert.strictEqual(definition.baseFramework, 'bs5');
  assert.ok(definition.styles.includes('source/theme.css'));
  assert.ok(definition.components.length >= 1);
  assert.ok(definition.scripts.includes('embed-runtime.js'));

  console.log('TEMPLATE-COMPILER-WRITE-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
