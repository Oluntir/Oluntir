const assert = require('assert');

const buttons = new Map(['btn-export-folder','btn-export-zip','btn-export-tar'].map(id => [id, {
  id, disabled:false, title:'original', textContent:id, attrs:{},
  setAttribute(name,value){this.attrs[name]=value;}, removeAttribute(name){delete this.attrs[name];}
}]));

global.window = global;
global.document = {
  activeElement: null,
  getElementById(id){ return buttons.get(id) || null; }
};
global.requestAnimationFrame = cb => setTimeout(cb, 0);
global.performance = { now: (() => { let n = 0; return () => ++n; })() };

let rteActive = true;
let committed = 0;
let exportPrepared = 0;
let persisted = 0;
let emitted = [];
const editor = {
  once(name, cb){ if (name === 'rte:disable') this._disable = cb; },
  RichTextEditor: { disable(){ rteActive = false; if (editor._disable) editor._disable(); } },
  Canvas: { getDocument(){ return { activeElement:{ blur(){} } }; } },
  Pages: { getSelected(){ return { id:'page-a' }; }, getAll(){ return [{ id:'page-a' }]; } }
};
global.OluntirIsRichTextEditing = () => rteActive;
global.OluntirSharedContentManager = {
  async prepareForExport(){ exportPrepared++; committed++; return { committed:true, pendingFlush:false }; },
  getDiagnostics(){ return { pendingFlush:false }; }
};
global.OluntirPersistProjectNow = async () => { persisted++; };
const metrics = { dispatched:0, completed:0, failed:0, cancelled:0 };
global.OluntirRuntimeActions = {
  emit(type){ emitted.push(type); metrics.dispatched++; metrics.completed++; return Promise.resolve(true); },
  getEngine(){ return { getState(){ return { processing:false, queueLength:0 }; }, getMetrics(){ return metrics; } }; }
};


global.OluntirExportSnapshot = {
  async create(){
    await global.OluntirSharedContentManager.prepareForExport();
    await global.OluntirPersistProjectNow();
    return Object.freeze({ snapshotId:'snapshot-1', pages:Object.freeze([{id:'page-a',name:'A',html:'<main></main>'}]), assets:Object.freeze([]), css:'' });
  }
};

const readiness = require('../editor/js/core/export-readiness.js');
(async () => {
  const prepared = await readiness.prepare(editor, { mode:'zip' });
  assert.strictEqual(prepared.snapshotId, 'snapshot-1');
  assert.strictEqual(rteActive, false);
  assert.strictEqual(committed, 1);
  assert.strictEqual(exportPrepared, 1);
  assert.strictEqual(persisted, 1);
  assert.deepStrictEqual(emitted.slice(0,2), ['export.prepare','export.ready']);
  buttons.forEach(button => assert.strictEqual(button.disabled, true));
  readiness.release();
  buttons.forEach(button => assert.strictEqual(button.disabled, false));
  assert.strictEqual(readiness.verify(editor, prepared).ready, true);
  console.log('EXPORT-READINESS-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
