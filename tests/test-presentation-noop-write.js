#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('editor/js/core/presentation-vocabulary.js', 'utf8');
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.OluntirPresentationApi;
assert(api, 'OluntirPresentationApi fehlt.');

let styleWrites = 0;
let attributeWrites = 0;
let style = { color: '#123456' };
let attrs = {
  style: 'color: #123456',
  'data-oluntir-presentation-color': '#123456'
};
const component = {
  getStyle() { return Object.assign({}, style); },
  setStyle(next) { styleWrites += 1; style = Object.assign({}, next); },
  addStyle(next) { styleWrites += 1; style = Object.assign({}, next); },
  getAttributes() { return Object.assign({}, attrs); },
  set(name, value) { if (name === 'attributes') { attributeWrites += 1; attrs = Object.assign({}, value); } },
  addAttributes(value) { attributeWrites += 1; attrs = Object.assign({}, attrs, value); }
};

const first = api.apply(component, { color: '#123456' }, { persistInline: true });
assert.strictEqual(first, false, 'Identische Präsentation darf nicht als Änderung gelten.');
assert.strictEqual(styleWrites, 0, 'Identische Präsentation darf keinen setStyle/addStyle-Schreibvorgang erzeugen.');
assert.strictEqual(attributeWrites, 0, 'Identische Präsentation darf keinen attributes-Schreibvorgang erzeugen.');

const second = api.apply(component, { color: '#654321' }, { persistInline: true });
assert.strictEqual(second, true, 'Echte Präsentationsänderung muss erkannt werden.');
assert.strictEqual(styleWrites, 1, 'Echte Präsentationsänderung muss genau einmal den Modellstil schreiben.');
assert.strictEqual(attributeWrites, 1, 'Echte Präsentationsänderung muss genau einmal die Markup-Attribute schreiben.');

console.log('PRESENTATION-NOOP-WRITE-TEST ERFOLGREICH');
