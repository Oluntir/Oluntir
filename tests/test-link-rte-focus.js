'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../editor/js/features/link-editor.js'), 'utf8');

assert(source.includes('function openFromCanvasEvent(event)'), 'Die Canvas-Linkbehandlung wurde nicht gefunden.');
assert(source.includes("if (!component || !isGalleryLink(component)) return;"), 'Normale Nav-/Footer-Links werden nicht vom RTE getrennt.');
assert(source.includes('event.preventDefault();'), 'Galerie-Links behalten ihren eigenen Schutz gegen Navigation.');
assert(source.includes('openLinkDialog(editor, selected);'), 'Der Linkdialog muss weiterhin über die Toolbar erreichbar sein.');
assert(source.includes('openGalleryAssetManager(editor, selected);'), 'Der Galerie-Dialog muss weiterhin über die Toolbar erreichbar sein.');

console.log('LINK-RTE-FOCUS-TEST ERFOLGREICH');
