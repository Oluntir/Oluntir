const fs = require('fs');
function must(value, message) { if (!value) throw new Error(message); }
const gallery = fs.readFileSync('editor/js/features/gallery.js', 'utf8');
const blocks = fs.readFileSync('editor/js/features/blocks-bs5.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
must(gallery.includes('async function startFrameworkGalleryWorkflow'), 'Common gallery workflow missing');
must(gallery.includes('chooseGalleryViewerOptions()'), 'Gallery appearance selection missing');
must(gallery.includes('chooseGalleryFiles(input'), 'File selection must occur after configuration');
must(gallery.includes("editorInstance.on('block:drag:stop'"), 'Framework block drop bridge missing');
must(gallery.includes("data-oluntir-gallery-launcher"), 'Framework gallery launcher marker missing');
must(blocks.includes("data-oluntir-gallery-launcher=\"bs5\""), 'BS5 gallery still inserts dummy gallery markup');
must(!blocks.includes("add('bs5-gallery-classic', 'Bildergalerie BS5', 'BS5 · Galerie', window.buildBootstrap5ClassicGalleryHtml())"), 'BS5 gallery still inserts placeholder images directly');
must(!editor.includes("startFrameworkGalleryWorkflow(editor, { source: 'toolbar'"), 'Removed toolbar gallery workflow is still present');
must(gallery.includes("cfg.source !== 'framework-block'"), 'Framework-only workflow guard missing');
console.log('FRAMEWORK-GALLERY-WIZARD-TEST ERFOLGREICH');
