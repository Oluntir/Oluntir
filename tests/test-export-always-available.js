const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('editor/js/core/includes.js', 'utf8');
const listeners = {};
const storage = new Map();
const windowObject = {
  PAGEBUILDER_FRAMEWORK: { id: 'bs4' },
  dispatchEvent() {},
  addEventListener() {},
  OluntirEditor: null
};
const documentObject = {
  addEventListener(name, handler) { listeners[name] = handler; },
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return { innerHTML: '', content: { firstElementChild: null } }; }
};
const context = {
  console,
  window: windowObject,
  document: documentObject,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; }
};
vm.runInNewContext(source, context);
const includes = windowObject.OluntirIncludes;
assert(includes, 'OluntirIncludes API must be available');

includes.initializeProject(true);
const result = includes.validateExport('ssi');
assert.strictEqual(result.ok, true, 'An empty reusable-region project must remain exportable');
assert.deepStrictEqual(Array.from(result.errors), [], 'Export validation must not return blocking errors');
assert(result.warnings.includes('Header ist leer.'), 'Empty header must be reported as a warning');
assert(result.warnings.includes('Navigation ist leer.'), 'Empty navigation must be reported as a warning');
assert(result.warnings.includes('Footer ist leer.'), 'Empty footer must be reported as a warning');

const exportSource = fs.readFileSync('editor/js/core/export.js', 'utf8');
assert(!exportSource.includes('Der Export wurde wegen fehlerhafter sich inhaltlich wiederholender Elemente und Bereiche abgebrochen'), 'Export must no longer contain the blocking reusable-region error');
assert(exportSource.includes('Exporthinweise (Export wird fortgesetzt)'), 'Export must explicitly continue after diagnostics');

console.log('EXPORT-ALWAYS-AVAILABLE-TEST ERFOLGREICH');
