'use strict';
const assert = require('assert');
const fs = require('fs');

const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');

assert(
  editor.includes("editor.Panels.removeButton('options', 'gjs-open-import-webpage')"),
  'Der redundante GrapesJS-Import-Button muss aus der Options-Leiste entfernt werden.'
);
assert(
  editor.includes("id: 'pb-ui-toolbar-export-folder'"),
  'Der Oluntir-Ordnerexport rechts in der Werkzeugleiste muss erhalten bleiben.'
);
assert(
  editor.includes("action: () => document.getElementById('btn-export-folder').click()"),
  'Der verbleibende Ordnerexport muss weiterhin auf den echten Oluntir-Export verweisen.'
);

console.log('TOOLBAR-REDUNDANT-IMPORT-REMOVED-TEST ERFOLGREICH');
