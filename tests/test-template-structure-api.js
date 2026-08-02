const assert = require('assert');
const api = require('../editor/js/core/template-structure-api.js');

const attrs = 'data-pb-gallery data-pb-gallery-viewer="lightbox"';
const items = '<div class="col-12">Bild</div>';
const direct = api.createGalleryStructure({ mode: 'existing-layout', framework: { id: 'bs5' }, galleryAttributes: attrs, itemsHtml: items });
assert(direct.startsWith('<div class="row g-4 pb-gallery"'));
assert(!direct.includes('<section'));
assert(direct.includes(items));

const normal = api.createGalleryStructure({ mode: 'new-area', width: 'container', framework: { id: 'bs4' }, galleryAttributes: attrs, itemsHtml: items });
assert(normal.includes('<section class="space-ptb py-5 pb-gallery-section" data-oluntir-layout-area="gallery">'));
assert(normal.includes('<div class="container">'));
assert(normal.includes('<div class="row pb-gallery"'));

const fluid = api.createGalleryStructure({ mode: 'new-area', width: 'container-fluid', framework: { id: 'bs5' }, galleryAttributes: attrs, itemsHtml: items });
assert(fluid.includes('<div class="container-fluid px-3 px-lg-4">'));
assert(fluid.includes('<div class="row g-4 pb-gallery"'));
console.log('TEMPLATE-STRUCTURE-CREATION-TEST ERFOLGREICH');
