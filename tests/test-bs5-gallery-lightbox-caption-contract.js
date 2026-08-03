const fs = require('fs');
function must(value, message) { if (!value) throw new Error(message); }
const runtime = fs.readFileSync('assets/js/oluntir-image-lightbox.js', 'utf8');
const bs5 = fs.readFileSync('assets/js/pagebuilder-bs5-gallery.js', 'utf8');
const quick = fs.readFileSync('editor/js/features/quick-edit.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
must(runtime.includes('lightboxImageForTarget'), 'Gallery overlay is not proxied to the universal image lightbox.');
must(runtime.includes("item.querySelector('img[data-oluntir-lightbox=\"true\"]')"), 'Enabled gallery image lookup is missing.');
must(bs5.includes("item.querySelector('img[data-oluntir-lightbox=\"true\"]')"), 'BS5 gallery runtime does not yield to image lightbox.');
must(quick.includes("next['data-caption'] = label"), 'Gallery caption is not synchronized from alt/title.');
must(quick.includes('Bildbezeichnung anzeigen'), 'Quick editor still exposes filename wording.');
must(editor.includes('OluntirImageLightboxApi.bindEditorPreview(editor)'), 'Preview lightbox binding is not initialized.');
console.log('BS5-GALLERY-LIGHTBOX-CAPTION-CONTRACT ERFOLGREICH');
