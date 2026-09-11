'use strict';
const fs = require('fs');
function must(condition, message) {
  if (!condition) { console.error('FAIL ' + message); process.exitCode = 1; }
  else console.log('PASS ' + message);
}
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const shared = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
must(editor.includes("editor.on('rte:enable'"), 'RTE start guard exists');
must(editor.includes("editor.on('rte:disable'"), 'RTE completion hook exists');
must(editor.includes('if (richTextEditingActive) return;'), 'automatic persistence is blocked during RTE');
must(!/type === 'text'[^\n]*persistCurrentProjectStateSoon/.test(editor), 'text component updates do not persist per keystroke');
must(shared.includes('isRichTextEditing()'), 'shared content checks active RTE');
must(/if \(applying \|\| (?:exportPreparing \|\| )?!enabled\(\) \|\| isRichTextEditing\(\)\) return;/.test(shared), 'shared propagation is blocked during RTE');
if (process.exitCode) process.exit(process.exitCode);
console.log('RTE-CURSOR-STABILITY-TEST ERFOLGREICH');
