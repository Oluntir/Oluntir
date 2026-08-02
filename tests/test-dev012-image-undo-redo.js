const fs = require('fs');
const assert = require('assert');

const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const textMedia = fs.readFileSync('editor/js/features/text-media-editor.js', 'utf8');
const quickEdit = fs.readFileSync('editor/js/features/quick-edit.js', 'utf8');
const linkEditor = fs.readFileSync('editor/js/features/link-editor.js', 'utf8');

assert(editor.includes('manager.undo();'), 'Undo command must use the native GrapesJS UndoManager');
assert(editor.includes('manager.redo();'), 'Redo command must use the native GrapesJS UndoManager');
assert(!editor.includes('window.OluntirDocumentApi.undo()'), 'Undo command must not bypass the native history path');
assert(!editor.includes("editor.on('undo redo'"), 'Global post-history persistence hook must stay removed');

assert(textMedia.includes("label: 'image.replace'"), 'Text-media image replacement is not tracked');
assert(textMedia.includes('OluntirDocumentApi.updateAttributes'), 'Text-media image replacement bypasses document API');
assert(quickEdit.includes("label:'image.attributes'"), 'Quick-edit image attributes are not tracked');
assert(linkEditor.includes('OluntirDocumentApi.updateAttributesBatch'), 'Gallery image replacement bypasses batch document API');
assert(linkEditor.includes("label: 'gallery.image.replace'"), 'Gallery replacement history label missing');
assert(linkEditor.includes("'data-stable-srcset-path'"), 'Responsive source path update missing');
assert(linkEditor.includes("'data-stable-download-path'"), 'Download path update missing');

console.log('DEV_012-IMAGE-UNDO-REDO-TEST ERFOLGREICH');
