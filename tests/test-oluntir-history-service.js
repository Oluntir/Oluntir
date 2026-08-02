const fs = require('fs');
const vm = require('vm');
const path = require('path');
function must(value, message) { if (!value) throw new Error(message); }

class Model {
  constructor() { this.values = {}; this.previousValues = {}; this.listeners = {}; }
  get(key) { return this.values[key]; }
  previous(key) { return this.previousValues[key]; }
  set(key, value) {
    this.previousValues[key] = this.values[key];
    this.values[key] = value;
    (this.listeners['change:' + key] || []).forEach(callback => callback(this));
    (this.listeners.change || []).forEach(callback => callback(this));
  }
  on(name, callback) { (this.listeners[name] ||= []).push(callback); }
}

const model = new Model();
const undo = [];
const redo = [];
let skipping = false;
let managerReplay = false;
const manager = {
  add(tracked) {
    tracked.on('change:oluntirHistoryCursor', (changed) => {
      if (skipping || managerReplay) return;
      undo.push({ before: changed.previous('oluntirHistoryCursor') || 0, after: changed.get('oluntirHistoryCursor') || 0 });
      redo.length = 0;
    });
  },
  skip(callback) { skipping = true; try { return callback(); } finally { skipping = false; } },
  hasUndo() { return undo.length > 0; },
  hasRedo() { return redo.length > 0; },
  undo() { const entry = undo.pop(); if (!entry) return; redo.push(entry); skipping = true; model.set('oluntirHistoryCursor', entry.before); skipping = false; },
  redo() { const entry = redo.pop(); if (!entry) return; undo.push(entry); skipping = true; model.set('oluntirHistoryCursor', entry.after); skipping = false; }
};
// During real GrapesJS undo/redo model change events still fire while history recording
// itself is suppressed. Recreate that behavior explicitly.
manager.undo = function () { const entry = undo.pop(); if (!entry) return; redo.push(entry); managerReplay = true; try { model.set('oluntirHistoryCursor', entry.before); } finally { managerReplay = false; } };
manager.redo = function () { const entry = redo.pop(); if (!entry) return; undo.push(entry); managerReplay = true; try { model.set('oluntirHistoryCursor', entry.after); } finally { managerReplay = false; } };

const editor = { UndoManager: manager, getModel() { return model; }, trigger() {} };
const ctx = { console, globalThis: null }; ctx.globalThis = ctx;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../editor/js/core/oluntir-history-service.js'), 'utf8'), ctx);
ctx.OluntirHistoryService.bind(editor);
let value = 0;
ctx.OluntirHistoryService.execute('test', { apply() { value = 1; }, undo() { value = 0; }, redo() { value = 1; } });
must(value === 1, 'operation not applied');
must(ctx.OluntirHistoryService.canUndo(), 'undo marker missing');
ctx.OluntirHistoryService.undo();
must(value === 0, 'custom undo not replayed');
must(ctx.OluntirHistoryService.canRedo(), 'redo marker missing');
ctx.OluntirHistoryService.redo();
must(value === 1, 'custom redo not replayed');
console.log('OLUNTIR-HISTORY-SERVICE-TEST ERFOLGREICH');
