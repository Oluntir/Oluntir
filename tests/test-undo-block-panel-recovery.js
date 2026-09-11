'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('editor/js/core/editor.js', 'utf8');

assert(source.includes("const OLUNTIR_VIEW_COMMANDS = Object.freeze(['open-sm', 'open-tm', 'open-layers', 'open-blocks'])"), 'Native GrapesJS-Views müssen gemeinsam normalisiert werden.');
assert(source.includes('function activeOluntirViewCommand(editorInstance)'));
assert(source.includes('function restoreOluntirViewPanel(editorInstance, preferredCommand, reason)'));
assert(source.includes("editorInstance.stopCommand(id, { force: true })"), 'Stale View-Commands müssen vor Wiederherstellung beendet werden.');
assert(source.includes("editorInstance.runCommand(desired, { force: true })"), 'Die vorher aktive View muss deterministisch neu geöffnet werden.');
assert(source.includes("restoreOluntirViewPanelSoon(editorInstance, activeViewBeforeReplay, 'undo')"), 'Undo muss die rechte GrapesJS-View wiederherstellen.');
assert(source.includes("restoreOluntirViewPanelSoon(editorInstance, activeViewBeforeReplay, 'redo')"), 'Redo muss die rechte GrapesJS-View wiederherstellen.');
assert(source.includes("editorInstance.on('run:open-blocks'"), 'Open Blocks muss nach Command-Start überwacht werden.');
assert(source.includes('editorInstance.BlockManager.render()'), 'BlockManager muss beim Öffnen explizit neu renderbar bleiben.');
assert(source.includes("window.OluntirRuntimeActions.emit('panel.view-restored'"), 'History/View-Recovery muss diagnostizierbar sein.');
assert(source.includes("window.OluntirRuntimeActions.emit('panel.blocks-opened'"), 'Open-Blocks-Erfolg muss im Action-Log sichtbar sein.');

// Execute the actual helper implementation from editor.js against a deliberately
// inconsistent GrapesJS-like view state: open-blocks command says active while
// the corresponding panel button has gone inactive after history replay.
const helperStart = source.indexOf("const OLUNTIR_VIEW_COMMANDS = Object.freeze(");
const helperEnd = source.indexOf('  function bindOluntirUndoRedo', helperStart);
assert(helperStart >= 0 && helperEnd > helperStart, 'View-Recovery-Helper müssen aus editor.js extrahierbar sein.');
const helperSource = source.slice(helperStart, helperEnd);

const emitted = [];
const context = {
  console,
  window: {
    setTimeout: fn => { fn(); return 1; },
    OluntirRuntimeActions: { emit: (name, payload) => emitted.push({ name, payload }) }
  }
};
vm.createContext(context);
vm.runInContext(`${helperSource}\nthis.__restore = restoreOluntirViewPanel; this.__active = activeOluntirViewCommand;`, context);

function button(active) {
  let state = !!active;
  return {
    get(key) { return key === 'active' ? state : undefined; },
    set(key, value) { if (key === 'active') state = !!value; },
    active() { return state; }
  };
}

const buttons = {
  'open-sm': button(false),
  'open-tm': button(false),
  'open-layers': button(false),
  'open-blocks': button(false)
};
const commandActive = new Set(['open-blocks']);
const stopped = [];
const run = [];
let renderCount = 0;
const fakeEditor = {
  Panels: { getButton(panel, id) { assert.strictEqual(panel, 'views'); return buttons[id] || null; } },
  Commands: { isActive(id) { return commandActive.has(id); } },
  stopCommand(id) { stopped.push(id); commandActive.delete(id); },
  runCommand(id) { run.push(id); commandActive.add(id); },
  BlockManager: { render() { renderCount += 1; } }
};

assert.strictEqual(context.__restore(fakeEditor, 'open-blocks', 'undo'), true);
assert.deepStrictEqual(stopped, ['open-blocks'], 'Der stale open-blocks-Command muss zuerst beendet werden.');
assert.deepStrictEqual(run, ['open-blocks'], 'Open Blocks muss anschließend deterministisch neu gestartet werden.');
assert.strictEqual(buttons['open-blocks'].active(), true, 'Der Open-Blocks-Button muss wieder aktiv sein.');
assert.strictEqual(renderCount, 1, 'Der BlockManager muss beim Recovery neu rendern.');
assert(emitted.some(entry => entry.name === 'panel.view-restored' && entry.payload.viewCommand === 'open-blocks'), 'Recovery muss diagnostizierbar sein.');

console.log('UNDO-BLOCK-PANEL-RECOVERY-TEST ERFOLGREICH');
