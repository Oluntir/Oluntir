'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
let discoverCalls = 0;
const localStorage = { getItem() { return null; }, setItem() {} };
const context = {
  window: {
    OluntirTemplateRuntime: { extendProfiles(profiles) { return profiles; } },
    OluntirTemplateRuntimeReady: Promise.resolve({ loaded: [], missing: [] }),
    OluntirSourcePackageBridge: {
      extendProfiles(profiles) { return profiles; },
      async discover() { discoverCalls += 1; return []; }
    }
  },
  localStorage,
  location: { protocol: 'file:' },
  console
};
context.window.window = context.window;
context.window.localStorage = localStorage;
context.window.location = context.location;
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'editor/js/core/framework.js'), 'utf8'), context, { filename: 'framework.js' });

context.window.OluntirFrameworkReady.then(() => {
  assert.strictEqual(discoverCalls, 0, 'Direkter index.html-Start darf keinen API-/Source-Package-Discovery-Aufruf benötigen.');
  assert.ok(context.window.PAGEBUILDER_FRAMEWORKS.bs4);
  assert.ok(context.window.PAGEBUILDER_FRAMEWORKS.bs5);
  console.log('TEMPLATE-RUNTIME-FILE-START-TEST ERFOLGREICH');
}).catch(error => {
  console.error(error);
  process.exit(1);
});
