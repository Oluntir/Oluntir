const fs = require('fs');
const assert = require('assert');
const documentApi = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
const targetUi = fs.readFileSync('editor/js/core/structure-insertion-target.js', 'utf8');
const css = fs.readFileSync('editor/css/editor.css', 'utf8');

assert(documentApi.includes("contextOnly = group.origin === 'shared-header' || group.origin === 'shared-footer'"), 'Header/footer context contract missing');
assert(documentApi.includes("slotKind: 'new-gallery-area'"), 'New gallery area slots missing');
assert(documentApi.includes('visualIndex: index + 1'), 'Inter-area visual order missing');
assert(targetUi.includes('NAVIGATION / HEADER'), 'Navigation orientation label missing');
assert(targetUi.includes('renderModel(model)'), 'Interleaved renderer missing');
assert(targetUi.includes('oluntir-gallery-area-arrow'), 'Left arrow marker missing');
assert(css.includes('.oluntir-gallery-area-insert-slot'), 'Gallery area slot styling missing');
assert(css.includes('.oluntir-context-layout-group'), 'Context-only header/footer styling missing');
console.log('INTER-CONTAINER-GALLERY-SLOTS-TEST ERFOLGREICH');
