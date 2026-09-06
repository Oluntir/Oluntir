#!/usr/bin/env node
'use strict';

const assert = require('assert');

// shared-content-manager.js is browser-oriented. This test only exercises its
// event binding and debounce boundary, so a very small browser shell is enough.
global.window = global;
global.document = {};
global.OluntirIsRichTextEditing = () => false;
global.OluntirLogger = { info() {}, error() {} };
global.OluntirIncludes = {
  getState() {
    return { enabled: true, regions: { header: '<header></header>', navigation: '<nav></nav>', footer: '<footer></footer>' } };
  }
};

let repeatMutationActive = true;
let suppressedCount = 0;
const suppressedTypes = [];
global.OluntirRepeatLibraryManager = {
  isProjectMutationActive() { return repeatMutationActive; },
  noteSharedStructuralEventSuppressed(eventName) {
    suppressedCount += 1;
    suppressedTypes.push(eventName);
    return true;
  }
};

let timerId = 0;
let scheduledCount = 0;
global.setTimeout = function () { scheduledCount += 1; return ++timerId; };
global.clearTimeout = function () {};

const listeners = Object.create(null);
const page = { getId() { return 'page-a'; } };
const editor = {
  Pages: { getSelected() { return page; } },
  on(name, handler) { (listeners[name] ||= []).push(handler); }
};

require('../editor/js/core/shared-content-manager.js');
const shared = global.OluntirSharedContentManager;
assert.ok(shared && typeof shared.bind === 'function', 'Shared Content Manager konnte nicht geladen werden.');
shared.bind(editor);

assert.ok(listeners['component:add'] && listeners['component:add'].length === 1, 'component:add-Listener fehlt.');
assert.ok(listeners['component:remove'] && listeners['component:remove'].length === 1, 'component:remove-Listener fehlt.');
assert.ok(listeners['component:update'] && listeners['component:update'].length === 1, 'component:update-Listener fehlt.');

// During an Oluntir-controlled Repeat project mutation, structural GrapesJS
// events must not start the Shared Content debounce at all.
listeners['component:add'][0]({});
listeners['component:remove'][0]({});
assert.strictEqual(scheduledCount, 0, 'Repeat-Publish Add/Remove darf keinen Shared-Content-Flush terminieren.');
assert.strictEqual(suppressedCount, 2, 'Beide strukturellen Repeat-Ereignisse müssen gezählt werden.');
assert.deepStrictEqual(suppressedTypes, ['component:add', 'component:remove']);

// Normal structural user changes remain protected by the global Shared Content
// safety net once the Repeat transaction has ended.
repeatMutationActive = false;
listeners['component:add'][0]({});
assert.strictEqual(scheduledCount, 1, 'Normales component:add muss weiterhin einen Shared-Content-Flush terminieren.');

// A real shared component update is never filtered by the Repeat structural
// guard. This protects direct header/nav/footer editing even if a delayed update
// happens around a Repeat transaction boundary.
repeatMutationActive = true;
const footer = {
  get(key) { return key === 'tagName' ? 'footer' : ''; },
  parent() { return null; },
  components() { return { models: [] }; }
};
listeners['component:update'][0](footer);
assert.strictEqual(scheduledCount, 2, 'Direktes Footer/Nav/Header-Update darf nicht durch den Repeat-Strukturguard unterdrückt werden.');

console.log('REPEAT-SHARED-CONTENT-TRANSACTION-ISOLATION-TEST ERFOLGREICH');
