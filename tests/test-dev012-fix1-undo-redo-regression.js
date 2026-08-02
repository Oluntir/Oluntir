const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const editor = fs.readFileSync(path.join(root, 'editor/js/core/editor.js'), 'utf8');
const gallery = fs.readFileSync(path.join(root, 'editor/js/features/gallery.js'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'editor/integrations/grapesjs/grapesjs-adapter.js'), 'utf8');
const structure = fs.readFileSync(path.join(root, 'editor/js/core/structure-insertion-target.js'), 'utf8');
function assert(value, message) { if (!value) throw new Error(message); }
assert(editor.includes('manager.undo();'), 'Undo muss direkt den nativen GrapesJS-UndoManager verwenden.');
assert(editor.includes('manager.redo();'), 'Redo muss direkt den nativen GrapesJS-UndoManager verwenden.');
assert(!editor.includes('window.OluntirDocumentApi.undo()'), 'Toolbar-Undo darf nicht mehr über die zusätzliche Dokument-API vermittelt werden.');
assert(!editor.includes("editor.on('undo redo'"), 'Der globale Undo-/Redo-Nachpersistierungshandler muss entfernt sein.');
assert(!gallery.includes('DEV_011 DIAG'), 'Galerie darf keine DEV_011-Diagnoseausgabe enthalten.');
assert(!adapter.includes('DEV_011 DIAG'), 'Adapter darf keine DEV_011-Diagnoseausgabe enthalten.');
assert(!structure.includes('DEV_011 DIAG'), 'Dialog darf keine DEV_011-Diagnoseausgabe enthalten.');
console.log('DEV_012-FIX1-UNDO-REDO-REGRESSION-TEST ERFOLGREICH');
