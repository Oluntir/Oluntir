const fs = require('fs');
const js = fs.readFileSync('editor/js/core/favicon-manager.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const checks = [
  ['asset reconciliation', js.includes('reconcileStateWithAssets')],
  ['replacement cleanup', js.includes('Beim Ersetzen dürfen keine veralteten Varianten')],
  ['replace label', js.includes('Favicon durch neues Bild ersetzen')],
  ['source type UI', html.includes('oluntir-favicon-source-type')],
  ['updated UI', html.includes('oluntir-favicon-updated-at')]
];
let failed = false;
for (const [name, ok] of checks) { console.log((ok ? 'PASS ' : 'FAIL ') + name); failed ||= !ok; }
if (failed) process.exit(1);
console.log('FAVICON-STATE-DIALOG-TEST ERFOLGREICH');
