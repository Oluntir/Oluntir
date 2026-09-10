'use strict';

const assert = require('assert');
const manager = require('../templates/template-manager.js');

class FakeFileHandle {
  constructor(name, files, parent) { this.kind = 'file'; this.name = name; this.files = files; this.parent = parent; }
  async getFile() { return { text: async () => String(this.files[this.name] || '') }; }
  async createWritable() {
    let buffer = '';
    return {
      write: async value => { buffer += String(value); },
      close: async () => { this.files[this.name] = buffer; }
    };
  }
}

class FakeDirectoryHandle {
  constructor(name) { this.kind = 'directory'; this.name = name; this.files = {}; this.directories = new Map(); }
  addDirectory(name, files) { const dir = new FakeDirectoryHandle(name); Object.assign(dir.files, files || {}); this.directories.set(name, dir); return dir; }
  async getDirectoryHandle(name) { if (!this.directories.has(name)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; } return this.directories.get(name); }
  async getFileHandle(name, options) {
    if (!(name in this.files) && !(options && options.create)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
    if (!(name in this.files)) this.files[name] = '';
    return new FakeFileHandle(name, this.files, this);
  }
  async removeEntry(name) { if (this.directories.has(name)) { this.directories.delete(name); return; } if (name in this.files) { delete this.files[name]; return; } const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
  async *entries() { for (const pair of this.directories.entries()) yield pair; }
}

(async function () {
  const root = new FakeDirectoryHandle('templates');
  root.addDirectory('editions', {});
  root.addDirectory('runtime-test', {
    'template.json': JSON.stringify({ schemaVersion: 1, id: 'runtime-test', name: 'Runtime Test', baseFramework: 'bs4', entry: 'template.js' }),
    'template.js': 'window.RUNTIME_TEST = true;'
  });
  root.addDirectory('manual-copy', {
    'template.json': JSON.stringify({ schemaVersion: 1, id: 'manual-copy', name: 'Manuell kopiert', baseFramework: 'bs5', entry: 'template.js' }),
    'template.js': 'window.MANUAL_COPY = true;'
  });

  let registry = { schemaVersion: 1, templates: [
    { id: 'runtime-test', name: 'Runtime Test', folder: 'runtime-test', entry: 'template.js', enabled: true },
    { id: 'deleted-template', name: 'Gelöscht', folder: 'deleted-template', entry: 'template.js', enabled: true }
  ] };

  let inspection = await manager.inspect(root, registry);
  assert.strictEqual(inspection.registered.find(x => x.entry.id === 'runtime-test').status, 'ready');
  assert.strictEqual(inspection.registered.find(x => x.entry.id === 'deleted-template').status, 'missing-folder');
  assert.strictEqual(inspection.unregistered.length, 1);
  assert.strictEqual(inspection.unregistered[0].entry.id, 'manual-copy');

  registry = await manager.removeTemplate(root, registry, 'deleted-template', { deleteFolder: false });
  assert.ok(!registry.templates.some(x => x.id === 'deleted-template'));
  assert.ok(root.directories.has('runtime-test'));
  assert.ok(root.directories.has('editions'));

  registry = await manager.registerTemplate(root, registry, inspection.unregistered[0].entry);
  assert.ok(registry.templates.some(x => x.id === 'manual-copy'));
  assert.ok(root.files['registry.json'].includes('manual-copy'));
  assert.ok(root.files['registry.js'].includes('window.OLUNTIR_TEMPLATE_REGISTRY'));

  registry = await manager.removeTemplate(root, registry, 'runtime-test', { deleteFolder: true });
  assert.ok(!root.directories.has('runtime-test'));
  assert.ok(root.directories.has('editions'));
  assert.ok(root.directories.has('manual-copy'));
  assert.ok(!registry.templates.some(x => x.id === 'runtime-test'));

  console.log('TEMPLATE-MANAGER-REGISTRY-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
