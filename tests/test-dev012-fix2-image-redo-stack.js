const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const editor = fs.readFileSync(path.join(root, 'editor/js/core/editor.js'), 'utf8');
function assert(value, message) { if (!value) throw new Error(message); }
assert(editor.includes('cancelPendingProjectPersist();'), 'Undo und Redo müssen ausstehende Bild-Persistierung vor dem History-Lauf abbrechen.');
assert(editor.includes('oluntirHistoryReplayActive = true;'), 'History-Replay muss während Undo/Redo markiert werden.');
assert(editor.includes('if (oluntirHistoryReplayActive || projectCommitRunning'), 'Bild-Updates aus Undo/Redo dürfen keine normale Modellpersistierung starten.');
assert(editor.includes('persistHistoryReplayStateSoon();'), 'Undo/Redo müssen anschließend nicht-mutierend persistiert werden.');
assert(editor.includes('writeHistoryReplaySnapshotSynchronously'), 'Der History-Zustand muss ohne Canvas-Commit gespeichert werden.');
assert(editor.includes('await editor.store();\n        writeHistoryReplaySnapshotSynchronously();'), 'History-Persistierung darf nur Store und Snapshot ausführen.');
assert(!/persistHistoryReplayStateSoon[\s\S]{0,1200}commitCurrentCanvasStateToModel\(\)/.test(editor), 'History-Persistierung darf keine modellverändernde Normalisierung aufrufen.');
console.log('DEV_012-FIX2-IMAGE-REDO-STACK-TEST ERFOLGREICH');
