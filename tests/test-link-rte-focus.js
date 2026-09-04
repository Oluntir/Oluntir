'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../editor/js/features/link-editor.js'), 'utf8');

assert(source.includes('Linkziel, target, rel und Download bleiben über die Link-Schaltfläche'), 'Die getrennte Linkbearbeitung ist nicht dokumentiert.');
assert(!source.includes('doc.addEventListener(\'dblclick\''), 'Der Link-Editor darf den RTE-Doppelklick nicht mehr abfangen.');
assert(source.includes('openLinkDialog(editor, selected);'), 'Der Linkdialog muss weiterhin über die Toolbar erreichbar sein.');
assert(source.includes('openGalleryAssetManager(editor, selected);'), 'Der Galerie-Linkdialog muss weiterhin über die Toolbar erreichbar sein.');

console.log('LINK-RTE-FOCUS-TEST ERFOLGREICH');
