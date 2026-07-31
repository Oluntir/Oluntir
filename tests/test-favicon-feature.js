'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manager = read('editor/js/core/favicon-manager.js');
const editor = read('editor/js/core/editor.js');
const exporter = read('editor/js/core/export.js');
const index = read('index.html');
const checks = [
  ['manager API', /OluntirFavicon\s*=/.test(manager)],
  ['seven generated outputs', (manager.match(/path: 'images\//g) || []).length === 7],
  ['ICO generation', /pngToIcoBlob/.test(manager)],
  ['project metadata', /favicon:\s*clone\(state\)/.test(manager)],
  ['secondary toolbar button', /pb-ui-toolbar-favicon/.test(editor)],
  ['modal exists', /oluntir-favicon-modal/.test(index)],
  ['export head links', /getHeadHtml/.test(exporter)],
  ['export files', /getExportEntries/.test(exporter)],
  ['no active canvas page selection regression', !/^\s*editor\.Pages\.select\(page\);/m.test(exporter)]
];
let failed = false;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);
console.log('FAVICON-FEATURE-TEST ERFOLGREICH');
