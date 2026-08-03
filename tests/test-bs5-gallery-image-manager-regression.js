const fs = require('fs');
function must(value, message) { if (!value) throw new Error(message); }
const link = fs.readFileSync('editor/js/features/link-editor.js', 'utf8');
const adapter = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');
must(link.includes("target.closest('[data-oluntir-gallery-item], [data-pb-gallery-item], .pb-gallery-item')"), 'BS5 image double-click does not resolve the sibling gallery trigger.');
must(link.includes("item.querySelector('a[data-oluntir-gallery-image]"), 'BS5 gallery trigger lookup is missing.');
must(link.includes('openGalleryAssetManager(editor, component)'), 'Resolved BS5 trigger is not routed to the image manager.');
must(link.includes("doc.addEventListener('click', openFromCanvasEvent, true)"), 'Second-click fallback for GrapesJS canvas is missing.');
must(link.includes("editor.on('canvas:frame:load'"), 'Canvas reload rebinding is missing.');
must(adapter.includes("const isGalleryItem = itemClasses.includes('pb-gallery-item')"), 'Toolbar image manager does not resolve a gallery item selected through its image.');
must(adapter.includes("'a[data-oluntir-gallery-image]'"), 'Toolbar image manager lacks neutral gallery trigger lookup.');
console.log('BS5-GALLERY-IMAGE-MANAGER-REGRESSION-TEST ERFOLGREICH');
