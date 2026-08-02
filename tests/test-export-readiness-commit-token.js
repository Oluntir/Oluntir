const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const sharedSource = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
const readinessSource = fs.readFileSync('editor/js/core/export-readiness.js', 'utf8');
const snapshotSource = fs.readFileSync('editor/js/core/export-snapshot.js', 'utf8');

assert.ok(sharedSource.includes('commitToken = ++exportCommitSequence'), 'Export commit token generation missing');
assert.ok(sharedSource.includes('verifyExportCommit'), 'Export commit verification API missing');
assert.ok(snapshotSource.includes('shared.prepareForExport(selected)'), 'Export snapshot must perform the explicit shared-content commit');
assert.ok(!readinessSource.includes('EXPORT_READINESS_PENDING:shared-content-flush'), 'Readiness must not block on the generic shared-content debounce');

const listeners = {};
const buttons = new Map(['btn-export-folder','btn-export-zip','btn-export-tar'].map(id => [id, { disabled:false, title:'', textContent:'', setAttribute(){}, removeAttribute(){} }]));
const root = {
  performance: { now: (() => { let n = 0; return () => ++n; })() },
  setTimeout,
  clearTimeout,
  requestAnimationFrame: cb => setTimeout(cb, 0),
  document: { getElementById: id => buttons.get(id) || null, activeElement: null },
  OluntirIsRichTextEditing: () => false,
  OluntirPersistProjectNow: async () => {},
  OluntirRuntimeActions: { emit: async () => null, getEngine: () => null },
  OluntirSharedContentManager: {
    async prepareForExport(){ return { committed:true, pendingFlush:false, commitToken:7 }; },
    verifyExportCommit(token){ return token === 7; },
    getDiagnostics(){ return { pendingFlush:true }; }
  },
  OluntirExportSnapshot: { async create(){ return Object.freeze({ snapshotId:'commit-token-snapshot', pages:Object.freeze([{id:'index',name:'Index',html:''}]), assets:Object.freeze([]), css:'', sharedCommitToken:7 }); } }
};
const context = { window: root, globalThis: root, module: { exports:{} }, exports:{}, console, setTimeout, clearTimeout };
vm.runInNewContext(readinessSource, context, { filename:'export-readiness.js' });
const api = root.OluntirExportReadiness;
const page = { getId: () => 'index' };
const editor = { Pages: { getSelected: () => page, getAll: () => [page] } };

(async () => {
  const result = await api.prepare(editor, { mode:'folder' });
  assert.strictEqual(result.snapshotId, 'commit-token-snapshot', 'Snapshot creation must permit export independently of a technical debounce');
  api.release();
  console.log('EXPORT-READINESS-COMMIT-TOKEN-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
