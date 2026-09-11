const fs = require('fs');
const gallery = fs.readFileSync('editor/js/features/gallery.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
function must(value, message) { if (!value) throw new Error(message); }
must(gallery.includes('pb-gallery-item" data-pb-gallery-item'), 'Gallery item wrapper marker missing');
must(gallery.includes("actions.set && actions.set({ removable: false"), 'Gallery action group is still separately removable');
must(gallery.includes("item.find('img, picture, .pb-gallery-trigger')"), 'Gallery visual children are not normalized as atomic item members');
must(gallery.includes('selectable: true, hoverable: true'), 'Gallery visuals must remain directly selectable for image editing');
must(!gallery.includes('editorInstance.select(item)'), 'Gallery visual selection must not be redirected to the wrapper');
must(!gallery.includes("parent.components().remove(item)"), 'Legacy asynchronous second removal still pollutes undo/redo history');
must(gallery.includes('const explicitTarget = options && options.component;'), 'Gallery delete wrapper ignores explicit toolbar target');
must(gallery.includes('noStop: true'), 'Gallery delete wrapper must remain a one-shot command in GrapesJS strict mode');
must(!gallery.includes('stop(ed, sender, options)'), 'Gallery delete wrapper must not turn component-delete into a persistent active command');
must(gallery.includes('window.normalizeGalleryComponentModel'), 'Existing gallery normalization missing');
must(editor.includes("window.bindGalleryItemLifecycle(editor)"), 'Gallery lifecycle not bound to editor');
console.log('GALLERY-ITEM-LIFECYCLE-TEST ERFOLGREICH');
