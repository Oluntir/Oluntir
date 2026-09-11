'use strict';

const assert = require('assert');
const manager = require('../templates/template-manager.js');

class FakeFileHandle {
  constructor(name, root) { this.name = name; this.kind = 'file'; this.root = root; }
  async getFile() { return { text: async () => String(this.root.files[this.name] || '') }; }
}

class FakeRoot {
  constructor(name, marker) {
    this.name = name;
    this.kind = 'directory';
    this.files = {};
    if (marker) this.files['template-root.json'] = JSON.stringify(marker);
  }
  async getFileHandle(name) {
    if (!(name in this.files)) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
    return new FakeFileHandle(name, this);
  }
}

(async function () {
  const good = new FakeRoot('templates', { schemaVersion: 1, role: 'oluntir-template-root', runtimeContract: '2.3.0' });
  const marker = await manager.validateTemplatesRoot(good);
  assert.strictEqual(marker.role, 'oluntir-template-root');

  await assert.rejects(
    () => manager.validateTemplatesRoot(new FakeRoot('templates', null)),
    /template-root\.json fehlt/
  );

  await assert.rejects(
    () => manager.validateTemplatesRoot(new FakeRoot('wrong', { schemaVersion: 1, role: 'oluntir-template-root' })),
    /Ordner „templates“/
  );

  console.log('TEMPLATE-MANAGER-ROOT-VALIDATION-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
