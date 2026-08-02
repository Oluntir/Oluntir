const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('editor/js/core/export-readiness.js', 'utf8');
const root = {
  performance: { now: (() => { let n=0; return () => ++n; })() },
  setTimeout,
  requestAnimationFrame: cb => cb(),
  document: { getElementById(){ return null; }, activeElement:null },
  OluntirRuntimeActions: { emit(){ return Promise.resolve(); }, getEngine(){ return null; } },
  OluntirIsRichTextEditing(){ return false; },
  OluntirSharedContentManager: {
    async prepareForExport(){ return { committed:true, commitToken:3 }; },
    verifyExportCommit(token){ return token === 3; },
    getDiagnostics(){ return { pendingFlush:false }; }
  },
  OluntirAssetReadiness: {
    async prepareForExport(){ return { committed:true, commitToken:9, pendingOperations:0 }; },
    verifyExportCommit(token){ return token === 9; }
  },
  async OluntirPersistProjectNow(){},
  OluntirExportSnapshot: { async create(){ return Object.freeze({ snapshotId:'asset-snapshot', pages:Object.freeze([{id:'p',name:'P',html:''}]), assets:Object.freeze([]), css:'' }); } }
};
const context = { window: root, globalThis: root, module:{exports:{}}, console, setTimeout, Promise, Date, Object, Array, Map, Number, Boolean, String, Error };
vm.runInNewContext(source, context, { filename:'export-readiness.js' });
const api = root.OluntirExportReadiness;
const editor = { Pages:{ getSelected(){ return {}; }, getAll(){ return [{}]; } } };
(async () => {
  const result = await api.prepare(editor, { mode:'zip' });
  assert.strictEqual(result.snapshotId, 'asset-snapshot');
  console.log('EXPORT-READINESS-ASSET-COMMIT-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
