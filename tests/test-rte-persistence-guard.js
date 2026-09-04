'use strict';

const assert = require('assert');
const fs = require('fs');
const source = fs.readFileSync(require('path').join(__dirname, '../editor/js/core/editor.js'), 'utf8');

const storeStart = source.indexOf("editor.on('storage:store', () => {");
const storeEnd = source.indexOf('\n  });', storeStart);
assert(storeStart >= 0 && storeEnd > storeStart, 'storage:store-Handler wurde nicht gefunden.');
const handler = source.slice(storeStart, storeEnd);
const guard = "window.OluntirIsRichTextEditing()";
const guardIndex = handler.indexOf(guard);
const snapshotIndex = handler.indexOf('writeCurrentProjectSnapshotSynchronously();');

assert(guardIndex >= 0, 'Der storage:store-Handler prüft keine aktive RTE-Sitzung.');
assert(snapshotIndex >= 0 && guardIndex < snapshotIndex, 'Der RTE-Schutz muss vor dem Modell-Snapshot greifen.');
assert(handler.includes('return;'), 'Bei aktiver RTE muss der Metadaten-Snapshot übersprungen werden.');

console.log('RTE-PERSISTENCE-GUARD-TEST ERFOLGREICH');
