#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, '..', 'editor/js/core/shared-content-manager.js'), 'utf8');
const handlers = {};
let capturedDeleteOptions = null;
const commandsMap = {
  'tlb-delete': { run() { throw new Error('native tlb-delete should have been replaced'); } },
  'core:component-delete': { run() {} }
};
const Commands = {
  get(id) { return commandsMap[id] || null; },
  add(id, command) { commandsMap[id] = command; },
  remove(id) { delete commandsMap[id]; }
};
function component(id, tagName) {
  return {
    getId() { return id; },
    get(name) {
      if (name === 'tagName') return tagName;
      if (name === 'removable') return true;
      return undefined;
    },
    parent() { return null; }
  };
}

const importedSection = component('template-section-hero', 'section');
let liveSelection = [importedSection];
const editor = {
  Commands,
  on(name, handler) { (handlers[name] || (handlers[name] = [])).push(handler); },
  getSelectedAll() { return liveSelection.slice(); },
  getSelected() { return liveSelection[0] || null; },
  runCommand(id, options) {
    if (id === 'core:component-delete') {
      capturedDeleteOptions = options;
      return true;
    }
    const command = Commands.get(id);
    return command && command.run ? command.run(this, null, options || {}) : false;
  },
  Pages: { getSelected() { return null; } }
};
const context = {
  window: {
    clearTimeout() {},
    setTimeout() { return 1; },
    OluntirIncludes: null
  },
  document: { createElement() { throw new Error('DOM parsing is not expected in toolbar target test'); } },
  console,
  Date
};
context.window.window = context.window;
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'shared-content-manager.js' });

context.window.OluntirSharedContentManager.bind(editor);
assert.ok(Commands.get('tlb-delete'), 'tlb-delete wurde nicht registriert.');

// Importierte, verschachtelte Template-Strukturen können durch RTE/embed-Handler
// die Live-Selektion verlieren, nachdem die blaue Toolbar bereits erzeugt wurde.
(handlers['component:selected'] || []).forEach(handler => handler(importedSection));
liveSelection = [];
(handlers['toolbar:run:before'] || []).forEach(handler => handler({ event: { type: 'click' } }));
const result = commandsMap['tlb-delete'].run(editor, null, { event: { type: 'click' } });

assert.strictEqual(result, true, 'Delete wurde nach Verlust der Live-Selektion nicht ausgeführt.');
assert.ok(capturedDeleteOptions, 'core:component-delete erhielt keine Optionen.');
assert.strictEqual(capturedDeleteOptions.component, importedSection, 'Das importierte Template-Element wurde nicht als Toolbar-Ziel beibehalten.');
assert.strictEqual(capturedDeleteOptions.oluntirToolbarTarget, true, 'Stabiler Toolbar-Zielvertrag fehlt.');
assert.strictEqual(capturedDeleteOptions.oluntirToolbarTargetSource, 'toolbar-snapshot', 'Der gespeicherte Toolbar-Besitzer wurde nicht verwendet.');

console.log('TEMPLATE-TOOLBAR-DELETE-SELECTION-LOSS-TEST ERFOLGREICH');
