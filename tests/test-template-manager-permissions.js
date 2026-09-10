'use strict';

const assert = require('assert');
const manager = require('../templates/template-manager.js');

class FakeFileHandle {
  constructor(name, root) { this.kind = 'file'; this.name = name; this.root = root; }
  async getFile() { return { text: async () => String(this.root.files[this.name] || '') }; }
  async createWritable() {
    let data = '';
    return {
      write: async value => { data += String(value); },
      close: async () => { this.root.files[this.name] = data; }
    };
  }
}

class FakeRoot {
  constructor(permission) {
    this.kind = 'directory';
    this.name = 'templates';
    this.permission = permission || 'prompt';
    this.files = {
      'registry.json': JSON.stringify({ schemaVersion: 1, templates: [{ id: 'demo', name: 'Demo', folder: 'demo', entry: 'template.js' }] })
    };
    this.requestCount = 0;
  }
  async queryPermission(options) { assert.strictEqual(options.mode, 'readwrite'); return this.permission; }
  async requestPermission(options) { assert.strictEqual(options.mode, 'readwrite'); this.requestCount += 1; this.permission = 'granted'; return this.permission; }
  async getFileHandle(name, options) {
    if (!(name in this.files) && !(options && options.create)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
    if (!(name in this.files)) this.files[name] = '';
    return new FakeFileHandle(name, this);
  }
  async removeEntry(name) {
    if (!(name in this.files)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
    delete this.files[name];
  }
}

(async function () {
  const root = new FakeRoot('prompt');
  await manager.ensureReadWritePermission(root);
  assert.strictEqual(root.requestCount, 1, 'Schreibfreigabe muss bei prompt explizit angefordert werden.');
  await manager.verifyWritableRoot(root);
  assert.ok(!Object.keys(root.files).some(name => name.startsWith('.oluntir-write-test-')), 'Schreibprobe muss nach erfolgreicher Prüfung wieder entfernt werden.');

  const registry = await manager.readRegistry(root, { schemaVersion: 1, templates: [] });
  assert.strictEqual(registry.templates.length, 1, 'Registry muss nach Ordnerwahl direkt vom Datenträger gelesen werden.');
  assert.strictEqual(registry.templates[0].id, 'demo');

  const denied = new FakeRoot('denied');
  await assert.rejects(() => manager.ensureReadWritePermission(denied), /Schreibzugriff/);

  console.log('TEMPLATE-MANAGER-PERMISSIONS-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
