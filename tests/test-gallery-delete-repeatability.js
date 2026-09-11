#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, '..', 'editor/js/features/gallery.js'), 'utf8');
const handlers = {};

function component(id, tagName) {
  return {
    getId() { return id; },
    get(name) {
      if (name === 'tagName') return tagName;
      if (name === 'removable') return true;
      return undefined;
    },
    getClasses() { return []; },
    getAttributes() { return {}; },
    parent() { return null; }
  };
}

const first = component('first-section', 'section');
const second = component('second-footer', 'footer');
let selected = first;

const nativeDelete = {
  noStop: true,
  run(ed, sender, options) {
    const target = options && options.component ? options.component : ed.getSelected();
    return target ? [target] : [];
  }
};

const commandsMap = { 'core:component-delete': nativeDelete };
const active = {};
const Commands = {
  get(id) { return commandsMap[id] || null; },
  remove(id) { delete active[id]; delete commandsMap[id]; },
  add(id, command) {
    if (!command.stop && command.noStop !== false) command.noStop = true;
    commandsMap[id] = command;
  },
  run(id, options) {
    const command = commandsMap[id];
    if (!command || typeof command.run !== 'function') return undefined;
    // GrapesJS 0.23.2 strict command semantics: a stateful command cannot be
    // run again while active. One-shot commands (noStop) never become active.
    if (active[id]) return undefined;
    const result = command.run(editor, editor, options || {});
    if (!command.noStop) active[id] = result;
    return result;
  }
};

const editor = {
  Commands,
  Pages: { getAll() { return []; } },
  UndoManager: null,
  on(name, handler) { (handlers[name] || (handlers[name] = [])).push(handler); },
  getSelected() { return selected; },
  select(value) { selected = value || null; }
};

const context = {
  window: {
    requestAnimationFrame(fn) { return typeof fn === 'function' ? fn() : 0; }
  },
  document: {},
  console,
  localStorage: { getItem() { return null; }, setItem() {} },
  alert() {},
  confirm() { return true; },
  setTimeout,
  clearTimeout,
  Promise,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Math,
  JSON,
  Date
};
context.window.window = context.window;
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'gallery.js' });

assert.strictEqual(typeof context.window.bindGalleryItemLifecycle, 'function', 'Gallery lifecycle binding missing.');
context.window.bindGalleryItemLifecycle(editor);

const wrappedDelete = Commands.get('core:component-delete');
assert.ok(wrappedDelete, 'Wrapped component-delete command missing.');
assert.strictEqual(wrappedDelete.noStop, true, 'Wrapped component-delete must remain one-shot.');

const firstResult = Commands.run('core:component-delete', { component: first });
assert.ok(Array.isArray(firstResult) && firstResult[0] === first, 'First delete did not reach native delete command.');

selected = second;
const secondResult = Commands.run('core:component-delete', { component: second });
assert.ok(Array.isArray(secondResult) && secondResult[0] === second, 'Second consecutive delete was blocked by stale command state.');

console.log('GALLERY-DELETE-REPEATABILITY-TEST ERFOLGREICH');
