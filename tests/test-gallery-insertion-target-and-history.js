const fs = require('fs');
const gallery = fs.readFileSync('editor/js/features/gallery.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
function must(value, message) { if (!value) throw new Error(message); }
must(gallery.includes('function chooseGalleryInsertionTarget'), 'Explicit gallery insertion target adapter missing');
must(gallery.includes('OluntirStructureInsertionTarget.choose'), 'Reusable structure insertion service not used');
must(gallery.includes('Einfügeposition der Galerie'), 'Gallery insertion dialog title missing');
must(gallery.includes('const insertionTarget = await chooseGalleryInsertionTarget(editor)'), 'Gallery does not require target confirmation before processing');
must(!gallery.includes('Am Seitenende einfügen'), 'Legacy page-end insertion option still present');
must(gallery.includes("undoManager.skip(normalize)"), 'Gallery normalization must not pollute or clear redo history');
must(editor.includes("commands.add('oluntir:undo'"), 'Explicit undo command missing');
must(editor.includes("commands.add('oluntir:redo'"), 'Explicit redo command missing');
must(editor.includes("undoButton.set('command', 'oluntir:undo')"), 'Undo toolbar button not rebound');
must(editor.includes("redoButton.set('command', 'oluntir:redo')"), 'Redo toolbar button not rebound');
must(editor.includes('scheduleHistoryRefresh'), 'Deferred history refresh missing');
must(!editor.includes("redoButton.set('disabled', !canRedo)"), 'Redo button must not remain disabled before GrapesJS finalizes its stack');
console.log('GALLERY-INSERTION-TARGET-AND-HISTORY-TEST ERFOLGREICH');
