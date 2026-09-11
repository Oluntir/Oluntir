'use strict';
const assert = require('assert');
const grapesjs = require('../vendor/grapesjs/0.23.2/grapes.min.js');
const adapter = require('../editor/js/core/repeat-sync-access-adapter.js');

const locked = {
  tagName: 'section',
  editable: false,
  stylable: false,
  draggable: false,
  droppable: false,
  removable: false,
  copyable: false,
  attributes: { 'data-oluntir-section-id': 'repeat-root' },
  components: [{
    type: 'text', tagName: 'div', content: 'Zentral editierbarer Text',
    editable: false, stylable: false, draggable: false, droppable: false,
    removable: false, copyable: false,
    attributes: { 'data-oluntir-component-id': 'repeat-text' }, components: []
  }]
};

const clean = adapter.cleanDefinition(locked);
const editor = grapesjs.init({ headless: true, storageManager: false });
const root = editor.addComponents(clean)[0];
const text = root.components().models[0];

assert.strictEqual(root.get('selectable'), true, 'Zentraler Repeat-Root muss in GrapesJS selektierbar sein.');
assert.strictEqual(root.get('stylable'), true, 'Zentraler Repeat-Root muss stylable sein.');
assert.strictEqual(root.get('draggable'), true, 'Zentraler Repeat-Root muss GrapesJS-Drag-Steuerung erhalten.');
assert.strictEqual(root.get('removable'), true, 'Zentraler Repeat-Root muss normale GrapesJS-Komponentensteuerungen erhalten.');
assert.strictEqual(root.get('copyable'), true, 'Zentraler Repeat-Root muss kopierbar sein.');
assert.strictEqual(text.get('selectable'), true, 'Text im zentralen Repeat-Canvas muss selektierbar sein.');
assert.strictEqual(text.get('editable'), true, 'Text im zentralen Repeat-Canvas muss RTE-editierbar sein.');
assert.strictEqual(text.get('stylable'), true, 'Text im zentralen Repeat-Canvas muss stylable sein.');
assert.strictEqual(text.get('removable'), true, 'Text muss normale GrapesJS-Komponentensteuerungen erhalten.');

console.log('REPEAT-CENTRAL-WORKSPACE-EDITABILITY-TEST ERFOLGREICH');
