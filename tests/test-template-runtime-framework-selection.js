'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const runtimePath = path.join(root, 'editor/js/core/template-runtime.js');
delete require.cache[require.resolve(runtimePath)];
const runtime = require(runtimePath);
runtime.define({
  id: 'runtime-test-selection',
  label: 'Runtime Selection Test',
  version: '1.0.0',
  baseFramework: 'bs4',
  basePath: 'templates/runtime-test/',
  styles: ['css/template.css'],
  components: [{ id: 'hero', label: 'Hero', content: '<section>Hero</section>' }]
});

const storage = new Map([['pagebuilder-framework', 'template-runtime-test-selection']]);
const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); }
};

const context = {
  window: {
    OluntirTemplateRuntime: runtime,
    OluntirTemplateRuntimeReady: Promise.resolve({ loaded: ['runtime-test-selection'], missing: [] })
  },
  localStorage,
  console
};
context.window.window = context.window;
context.window.localStorage = localStorage;
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'editor/js/core/framework.js'), 'utf8'), context, { filename: 'framework.js' });

context.window.OluntirFrameworkReady.then(() => {
  assert.ok(context.window.PAGEBUILDER_FRAMEWORKS.bs4);
  assert.ok(context.window.PAGEBUILDER_FRAMEWORKS.bs5);
  assert.ok(context.window.PAGEBUILDER_FRAMEWORKS['template-runtime-test-selection']);
  assert.strictEqual(context.window.PAGEBUILDER_FRAMEWORK.id, 'template-runtime-test-selection');
  assert.strictEqual(context.window.PAGEBUILDER_FRAMEWORK.baseFramework, 'bs4');
  console.log('TEMPLATE-RUNTIME-FRAMEWORK-SELECTION-TEST ERFOLGREICH');
}).catch(error => {
  console.error(error);
  process.exit(1);
});
