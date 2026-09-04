const fs = require('fs');
const gallery = fs.readFileSync('editor/js/features/gallery.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
function must(value, message) { if (!value) throw new Error(message); }
must(gallery.includes('pb-gallery-item" data-pb-gallery-item'), 'Gallery item wrapper marker missing');
must(gallery.includes("actions.set && actions.set({ removable: false"), 'Gallery action group is still separately removable');
must(gallery.includes("item.find('img, picture, .pb-gallery-trigger')"), 'Gallery visual children are not normalized as atomic item members');
must(gallery.includes("editorInstance.on('component:selected'"), 'Atomic gallery selection redirect missing');
must(gallery.includes('editorInstance.select(item)'), 'Gallery visual selection is not promoted to the item wrapper');
must(!gallery.includes("parent.components().remove(item)"), 'Legacy asynchronous second removal still pollutes undo/redo history');
must(gallery.includes('window.normalizeGalleryComponentModel'), 'Existing gallery normalization missing');
must(editor.includes("window.bindGalleryItemLifecycle(editor)"), 'Gallery lifecycle not bound to editor');
console.log('GALLERY-ITEM-LIFECYCLE-TEST ERFOLGREICH');
