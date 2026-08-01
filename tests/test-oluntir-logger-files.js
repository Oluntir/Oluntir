'use strict';
const assert = require('assert');
const logger = require('../editor/js/core/oluntir-logger.js');
class FileHandle {
  constructor(store, name) { this.store = store; this.name = name; }
  async getFile() { const value = this.store.get(this.name) || ''; return { size: Buffer.byteLength(value), arrayBuffer: async () => Buffer.from(value) }; }
  async createWritable() {
    const self = this; let position = 0; let content = self.store.get(self.name) || '';
    return { seek: async p => { position = p; }, write: async data => { const text = Buffer.isBuffer(data) ? data.toString() : data instanceof ArrayBuffer ? Buffer.from(data).toString() : String(data); content = content.slice(0, position) + text + content.slice(position + text.length); position += text.length; }, close: async () => self.store.set(self.name, content), abort: async () => {} };
  }
}
class DirectoryHandle {
  constructor(store) { this.store = store; this.children = new Map(); }
  async getDirectoryHandle(name) { if (!this.children.has(name)) this.children.set(name, new DirectoryHandle(this.store)); return this.children.get(name); }
  async getFileHandle(name) { return new FileHandle(this.store, name); }
}
(async () => {
  const store = new Map(); const root = new DirectoryHandle(store);
  logger.clear(); logger.authorizeDirectory(root, 'logs', 'trace'); logger.clear(); logger.configure({ level: 'trace', enabled: true });
  logger.info('action', 'file-write-test', { ok: true });
  const result = await logger.flush();
  assert.strictEqual(result.written, 1);
  assert.ok((store.get('action.log') || '').includes('file-write-test'));
  console.log('OLUNTIR-LOGGER-FILE-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
